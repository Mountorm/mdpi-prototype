# PRD: Keyword Detection 统一化

**版本**: 1.0  
**日期**: 2026-03-17  
**状态**: 草稿

---

## 背景与问题

Detection Assistant 当前存在多个独立的 keyword 检测项，分散在不同 section 下，各自维护独立的关键词列表、检测逻辑和展示方式：

| 检测项 | 所在位置 | 当前问题 |
|---|---|---|
| Problematic Phrase（含 Commercial Interests、Harmful Topics、Template Phrase、AI Generated Phrases、Tortured Phrase 等） | Manuscript | 多个子类型混在一个 item 里，无法独立管理 |
| Sensitive Words | Review Report | 与 Manuscript 的 phrase 检测逻辑重复，但独立维护 |
| Author Affiliation Potential Interest | Author | 本质也是关键词匹配，但走了完全不同的数据路径 |
| Zero Font Attacks | Manuscript | 特殊字符检测，属于 keyword 的变体 |

这导致：
- 运营人员需要在多处维护关键词，容易遗漏和不一致
- 前端展示逻辑各自为政，代码重复
- 新增一个关键词类型需要同时改后端逻辑、前端配置、展示模板

---

## 目标

1. 建立统一的 keyword 库表，所有 phrase/keyword 类检测共用同一套数据源
2. 统一检测引擎：一次扫描，按 keyword 的 `category` 分组输出结果
3. 统一前端展示：Detection Assistant 页面所有 keyword 类 result 使用同一套渲染组件
4. 支持运营人员通过管理后台对关键词进行 CRUD，无需发版

---

## 核心概念

### Keyword Category（关键词分类）

每个 keyword 属于一个 category，category 决定：
- 检测到后归属到哪个 detection item
- 触发的严重程度（severity）
- 展示时的描述文案模板

当前需要覆盖的 category：

| category_key | 显示名 | 默认 severity | 适用范围 |
|---|---|---|---|
| `commercial_interest` | Potential Commercial Interests | warning | manuscript |
| `harmful_topic` | Harmful Topics | error | manuscript |
| `template_phrase` | Template Phrase | error | manuscript |
| `ai_generated` | AI Generated Phrases | warning | manuscript |
| `tortured_phrase` | error | error | manuscript |
| `salami_slicing` | Salami Slicing | error | manuscript |
| `coercive_citation` | Coercive Citation | error | manuscript |
| `ghostwriting` | Ghostwriting Indicator | warning | manuscript |
| `sensitive_word` | Sensitive Words | warning | review_report |
| `affiliation_interest` | Affiliation Potential Interest | warning | author |
| `zero_font` | Zero Font Attack | error | manuscript |
| `public_dataset` | Publicly Available Data Set | info | manuscript |

---

## 数据库表设计

### 表 1: `keyword_categories`

关键词分类主表，定义每种检测类型的元信息。

severity 字段表示该 category 的命中对所在 **item** 状态的影响权重。item 的最终 status 取其下所有命中 category 中 severity 最高的值（error > warning > info）。result block 本身不单独持有 severity，展示字色统一跟随 item status。

```sql
CREATE TABLE keyword_categories (
  id            SERIAL PRIMARY KEY,
  category_key  VARCHAR(64) NOT NULL UNIQUE,   -- 唯一标识，如 'ai_generated'
  display_name  VARCHAR(128) NOT NULL,          -- 前端展示名
  description   TEXT,                           -- 分类说明
  -- 命中后对 item status 的影响权重（item 取所有命中 category 的最高值）
  severity      ENUM('info','warning','error') NOT NULL DEFAULT 'warning',
  scope         ENUM('manuscript','review_report','author','any') NOT NULL DEFAULT 'manuscript',
  -- 检测到时的 result 文案模板，支持 {count} {keyword} 占位符
  result_template VARCHAR(256) NOT NULL DEFAULT '{display_name} detected',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 表 2: `keywords`

关键词条目表，每条记录是一个具体的关键词或短语。

```sql
CREATE TABLE keywords (
  id            SERIAL PRIMARY KEY,
  category_id   INT NOT NULL REFERENCES keyword_categories(id) ON DELETE CASCADE,
  keyword       VARCHAR(512) NOT NULL,          -- 关键词原文
  match_type    ENUM('exact','contains','regex','fuzzy') NOT NULL DEFAULT 'contains',
  case_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  language      VARCHAR(16) DEFAULT NULL,        -- NULL 表示不限语言，'en'/'zh' 等
  source        ENUM('manual','imported','ml_suggested') NOT NULL DEFAULT 'manual',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  note          TEXT,                            -- 运营备注，说明为何加入此词
  created_by    INT REFERENCES users(id),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (category_id, keyword)
);

CREATE INDEX idx_keywords_category ON keywords(category_id);
CREATE INDEX idx_keywords_active ON keywords(is_active);
```

### 表 3: `keyword_detection_results`

每次检测的命中记录，用于存储检测结果、支持历史追溯。

```sql
CREATE TABLE keyword_detection_results (
  id              SERIAL PRIMARY KEY,
  manuscript_id   INT NOT NULL,                  -- 关联稿件
  file_type       ENUM('manuscript','review_report','cover_letter') NOT NULL DEFAULT 'manuscript',
  category_id     INT NOT NULL REFERENCES keyword_categories(id),
  keyword_id      INT REFERENCES keywords(id),   -- NULL 表示 ML 检测，无对应词条
  matched_text    TEXT NOT NULL,                 -- 实际命中的文本片段
  context_snippet TEXT,                          -- 命中位置前后各 100 字的上下文
  position_start  INT,                           -- 字符偏移起始位置
  position_end    INT,                           -- 字符偏移结束位置
  section_hint    VARCHAR(64),                   -- 命中所在章节，如 'abstract'/'introduction'
  detected_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  detection_run_id VARCHAR(64),                  -- 同一次检测任务的批次 ID
  INDEX idx_kdr_manuscript (manuscript_id),
  INDEX idx_kdr_category (category_id),
  INDEX idx_kdr_run (detection_run_id)
);
```

### 表 4: `keyword_category_journal_overrides`

允许不同期刊对同一 category 设置不同的 severity 权重或开关，影响的是 item status 的计算结果，不影响 result block 的展示样式。

```sql
CREATE TABLE keyword_category_journal_overrides (
  id            SERIAL PRIMARY KEY,
  journal_id    INT NOT NULL,
  category_id   INT NOT NULL REFERENCES keyword_categories(id),
  -- 覆盖该 category 对 item status 的影响权重，NULL 表示继承全局配置
  severity      ENUM('info','warning','error') DEFAULT NULL,
  is_active     BOOLEAN DEFAULT NULL,                         -- NULL 表示继承全局
  UNIQUE (journal_id, category_id)
);
```

---

## 检测引擎统一化

### 当前架构（分散）

```
manuscript → [商业利益检测器] → result A
manuscript → [有害话题检测器] → result B
manuscript → [模板短语检测器] → result C
review_report → [敏感词检测器] → result D
```

### 目标架构（统一）

```
manuscript / review_report
    ↓
[统一 Keyword Scanner]
    ├── 加载 keywords 表（按 scope 过滤）
    ├── 执行匹配（exact / contains / regex / fuzzy）
    └── 按 category 分组命中结果
         ↓
[结果聚合器]
    ├── category: ai_generated → item: Problematic Phrase → result block
    ├── category: template_phrase → item: Problematic Phrase → result block
    ├── category: sensitive_word → item: Sensitive Words → result block
    └── ...
```

### API 响应结构

检测完成后，接口返回每个 item 的聚合结果。`item_status` 由后端计算（取所有命中 category 中 severity 最高值），前端直接使用，不在 result block 层面做二次判断。

```json
{
  "detection_item_id": "item-1-14",
  "item_status": "warning",
  "keyword_results": [
    {
      "category_key": "ai_generated",
      "category_display_name": "AI Generated Phrases",
      "result_text": "AI Generated Phrases detected",
      "hits": [
        {
          "keyword": "as is widely acknowledged",
          "matched_text": "as is widely acknowledged",
          "context_snippet": "...the results, as is widely acknowledged in the field, suggest...",
          "section_hint": "introduction",
          "position_start": 1042,
          "position_end": 1068
        }
      ]
    }
  ]
}
```

前端直接将 `keyword_results` 映射为 `results[]` 数组，每个 category 对应一个 result block，`hits` 对应 `details[]`。

---

## 前端展示统一化

### 当前问题

- Problematic Phrase 的 result block 和 Sensitive Words 的 result block 渲染逻辑相同，但分属不同 item，没有复用
- details 展示的是命中词本身，缺少上下文

### 目标

所有 keyword 类 result block 统一使用同一个 `KeywordResultBlock` 组件：

```
┌─────────────────────────────────────────┐
│ AI Generated Phrases detected           │  ← result_text（severity 决定字色）
│                                         │
│ ▼ Show Details (2)                      │  ← 展开按钮
│   ┌─────────────────────────────────┐   │
│   │ • "as is widely acknowledged"   │   │  ← matched_text
│   │   in Introduction               │   │  ← section_hint
│   │                                 │   │
│   │ • "in recent years there has    │   │
│   │   been increasing interest"     │   │
│   │   in Abstract                   │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

details 展开后每条显示：命中词 + 所在章节（section_hint），可选展示上下文片段（context_snippet）。

---

## 管理后台需求（运营侧）

需要一个 `/admin/keywords` 管理页面，支持：

1. 按 category 浏览所有关键词
2. 新增 / 编辑 / 停用关键词（不物理删除，保留历史检测记录关联）
3. 批量导入（CSV，格式：`keyword, category_key, match_type, language, note`）
4. 查看某个关键词的历史命中统计（命中次数、命中稿件数）
5. 期刊级别 override 配置（某期刊关闭某 category，或调整 severity）

---

## 实施优先级

| 阶段 | 内容 | 优先级 |
|---|---|---|
| P0 | 建库建表，迁移现有关键词数据 | 必须 |
| P0 | 统一检测引擎，输出标准 `keyword_results` 结构 | 必须 |
| P1 | 前端统一渲染，接入新 API 结构 | 高 |
| P1 | 管理后台 CRUD | 高 |
| P2 | 批量导入、命中统计 | 中 |
| P2 | 期刊级别 override | 中 |
| P3 | ML 建议词（ml_suggested source） | 低 |

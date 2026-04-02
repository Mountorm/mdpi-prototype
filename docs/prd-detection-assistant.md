# PRD: Detection Assistant

**版本**: 1.0
**日期**: 2026-03-31
**状态**: 草稿
**受众**: 前端、后端、产品

---

## 一、概述

Detection Assistant 是 SuSy 的稿件自动检测中心，负责对一篇稿件的各个维度（稿件内容、作者信息、审稿报告、伦理合规）执行自动化检查，并将结果以结构化方式呈现给编辑人员，支持逐项确认（Resolve）和重新检测（Re-detect）。

---

## 二、页面结构

```
┌─────────────────────────────────────────────────────────────┐
│ da-header（sticky, top: 0, h: 48px）                        │
│  Detection Assistant  |  nutrients-4224751  |  [Only Issues toggle]  [Re-detect All]  │
├─────────────────────────────────────────────────────────────┤
│ da-stats-bar（sticky, top: 48px）                           │
│  ✕ 5 Severe  ⚠ 3 Warning  ✓ 12 Passed  ✓ 2 Resolved  ████░ │
├──────────────────────────────────────┬──────────────────────┤
│ da-content（flex: 1）                │ da-nav（w: 180px）   │
│                                      │  SECTIONS            │
│  [Section: Manuscript]               │  Manuscript  ✕5 ⚠1  │
│    item: Scope                       │  Author      ✕3      │
│    item: Similar Title               │  Review Report       │
│    item: ...                         │  Ethicality  ✕1 ⚠2  │
│                                      │                      │
│  [Section: Author]                   │                      │
│    item: ...                         │                      │
│                                      │                      │
│  [Section: Ethicality]               │                      │
│    item: fileName_1.pdf（折叠行）    │                      │
│    item: fileName_2.pdf              │                      │
└──────────────────────────────────────┴──────────────────────┘
```

### 2.1 Header（`da-header`）

| 元素 | 说明 |
|---|---|
| 页面标题 | 固定文字 "Detection Assistant" |
| 稿件 ID | 当前稿件标识，如 `nutrients-4224751`，蓝色字体 |
| Only Issues 开关 | 开启后隐藏所有 `status: healthy` 且未 Resolved 的 item |
| Re-detect All 按钮 | 触发全量重新检测，按钮进入 loading 状态，完成后刷新所有 section 数据 |

### 2.2 Stats Bar（`da-stats-bar`）

展示全局检测概览，数字实时响应 item 状态变化：

| 指标 | 颜色 | 说明 |
|---|---|---|
| Severe | `#dc2626` 红 | `status: error` 且未 Resolved 的 item 数 |
| Warning | `#d97706` 橙黄 | `status: warning` 且未 Resolved 的 item 数 |
| Passed | `#16a34a` 绿 | `status: healthy` 的 item 数 |
| Resolved | `#9ca3af` 灰 | 已 Resolve 的 item 数（不区分原始 status） |

进度条（`da-progress-bar`）：四段颜色按比例展示，顺序为 Severe → Warning → Passed → Resolved。

### 2.3 右侧导航（`da-nav`）

- 固定在右侧，`position: sticky; top: 88px`（header 48px + stats-bar 40px）
- 每个 section 一行，显示 section 名称 + 问题数 badge
- 点击跳转到对应 section（`scrollIntoView`）
- **普通 section** badge：红色（error 数）、橙色（warning 数）、灰色（confirmed 数）
- **Ethicality section** badge：取该 section 下第一个文件的 severe/warning 总数

---

## 三、检测项（Item）交互规范

### 3.1 普通 Item

适用于 Manuscript、Author、Review Report 三个 section 下的所有检测项。

#### 状态与视觉

| `status` 值 | 左侧图标 | 图标颜色 | result 文字颜色 |
|---|---|---|---|
| `healthy` | `CheckCircle` | `text-green-500` | 默认 `#1e293b` |
| `warning` | `AlertTriangle` | `text-yellow-500` | `#d97706` |
| `error` | `XCircle` | `text-red-500` | `#dc2626` |
| confirmed（已 Resolve） | `UserCheck` | `text-gray-400` | `#6a7282` |

item 一旦被 Resolve，`status` 视觉上统一降级为 confirmed 样式，原始 status 不变（仅用于统计回滚）。

#### Result Block（`da-rb`）

每个 item 可包含一个或多个 result block，每个 block 结构：

```
┌──────────────────────────────────────────┐
│ [result 文字]                            │  ← 必填，颜色跟随 item status
│ ─────────────────────────────────────── │
│ [作者名] <作者邮箱>                      │  ← 可选，仅 Author section 的 item 有
│                                          │
│ ▼ Show Details (N)                       │  ← 可选，有 details 或 htmlContent 时显示
│   • 命中词 1                             │
│   • 命中词 2                             │
└──────────────────────────────────────────┘
```

Details 展开模式由 `detailsType` 控制：
- `list`（默认）：渲染 `details[]` 为无序列表
- `html`：渲染 `htmlContent` 字符串为 HTML（用于 Reference 检测的自定义排版）

#### Resolve 操作

点击 item 右上角 "Resolve" 按钮，弹出 Popover（`el-popover`，宽 340px，`placement: bottom-end`）：

```
┌──────────────────────────────────────┐
│ Resolve this check              [✕]  │
│ Select a reason:                     │
│                                      │
│ ○ Resolved with responsible person,  │
│   the detected problem will not      │
│   affect the paper processing        │
│                                      │
│ ○ Have solved the problems and it    │
│   can be continued                   │
│                                      │
│ ○ The detection is wrong             │
│                                      │
│              [Cancel]  [Resolve]     │
└──────────────────────────────────────┘
```

- 未选择 reason 时，Resolve 按钮禁用（`opacity: 0.45`）
- 确认后 item 进入 confirmed 状态，右上角按钮变为灰色 "Resolved"，底部显示操作人 + 时间 + reason
- 已 Resolved 的 item 再次点击可重新选择 reason（覆盖写入）

Resolve 后 item 底部展示：

```
✓ Current User  📅 Mar 31, 2026, 10:30 AM  [reason 文字]
```

### 3.2 Re-detect（单 Section）

每个 section 标题行右侧有 "Re-detect" 按钮，点击后该 section 进入 loading 状态（spinner 覆盖内容区），完成后刷新该 section 的所有 item 数据。

---

## 四、Ethicality Section 交互规范

Ethicality section 的每个 item 对应一个文件（如 `fileName_1.pdf`），采用可折叠行设计，与普通 item 结构不同。

### 4.1 文件行（折叠头）

```
┌──────────────────────────────────────────────────────────────┐
│ ▼/▶  fileName_1.pdf   ✕1  ⚠2          [View Report] [Download] [Resolve] │
└──────────────────────────────────────────────────────────────┘
```

- 点击行（除右侧按钮区域外）切换折叠/展开
- 默认：每个 section 中第一个文件展开，其余折叠
- 无问题时显示绿色 "No issues" 文字，有问题时显示红/橙 badge（数字）
- 右侧操作按钮：
  - **View Report**：蓝色边框按钮，跳转或弹出完整 ethicality 报告（待定）
  - **Download**：下载检测报告文件
  - **Resolve**：与普通 item 相同的 Popover 确认流程

### 4.2 展开内容 — Plan A（`ethicality` 字段）

展开后显示三行摘要信息：

**Authors 行**
```
Authors    ✕1  ⚠2
```
- 无问题：显示绿色 "No issues"
- 有问题：显示红/橙 badge（数字）

**References 行**
```
References    ⚠3
```
- 同上

**AI Writing 行**
```
AI Writing    [Manuscript donut]  [Report 1 donut]  [Report 2 donut]
```
- 每个 donut 为一个 `AiWritingDonut` 组件，展示 Human / Maybe AI / Likely AI 三段比例
- Manuscript 固定显示，Peer Review Reports 按数组长度动态渲染

### 4.3 展开内容 — Plan B（`ethicalityB` 字段）

Plan B 在 Plan A 的基础上，Authors 和 References 支持展开查看详情。

**Authors 行（可展开）**
```
Authors    ✕1  ⚠2
▼ Show Details
  Dr. John Smith <john.smith@example.com>
    [Card]  [Poor Topic Similarity]
  Prof. Li Wei <li.wei@example.com>
    [Poor Topic Similarity]
```

**References 行（可展开）**
```
References    ⚠2
▼ Show Details
  [1] Studies of the mechanism...  DOI: 10.1042/bj0870078
      [Out of scope]  [Out of context]
  [12] Reduced expression of citrate synthase...
       [Outdated]  [Corrected]
```

**AI Writing 行**：与 Plan A 相同，使用 `AiWritingDonut` 组件。

---

## 五、接口规范

### 5.1 通用检测接口

**获取检测结果**

```
GET /api/manuscripts/{manuscript_id}/detection
```

响应结构：

```json
{
  "manuscript_id": "nutrients-4224751",
  "sections": [
    {
      "id": "section-1",
      "title": "Manuscript",
      "description": "Manuscript-related automated checks",
      "items": [
        {
          "id": "item-1-1",
          "title": "Scope",
          "description": "Verifies whether the manuscript aligns with the journal's editorial scope.",
          "status": "warning",
          "results": [
            {
              "result": "Out of scope (if no pre-check decision, 1st decision is mandatory)",
              "author": null,
              "detailsType": "list",
              "details": [],
              "htmlContent": null
            }
          ],
          "confirmed": null
        }
      ]
    }
  ]
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | ✓ | item 唯一标识，格式 `item-{section}-{seq}` |
| `title` | string | ✓ | 检测项名称 |
| `description` | string | | 检测项说明，显示在标题下方 |
| `status` | `"healthy" \| "warning" \| "error"` | ✓ | 检测结果状态 |
| `results` | `ResultBlock[]` | ✓ | 结果块数组，healthy 时也需返回（含说明文字） |
| `confirmed` | `ConfirmedInfo \| null` | ✓ | Resolve 信息，未操作时为 null |

**ResultBlock 结构**

```typescript
interface ResultBlock {
  result: string                    // 结果描述文字，必填
  author?: {                        // 可选，Author section 的 item 使用
    name: string
    email?: string
  }
  detailsType?: 'list' | 'html'    // 默认 'list'
  details?: string[]               // list 模式：命中词列表
  htmlContent?: string             // html 模式：后端返回的自定义 HTML 字符串
}
```

**ConfirmedInfo 结构**

```typescript
interface ConfirmedInfo {
  user: string    // 操作人姓名
  time: string    // 操作时间，ISO 8601 格式
  note: string    // 选择的 reason 文字
}
```

---

**触发重新检测（全量）**

```
POST /api/manuscripts/{manuscript_id}/detection/rerun
```

响应：`202 Accepted`，前端轮询或通过 WebSocket 接收完成通知后刷新数据。

**触发重新检测（单 Section）**

```
POST /api/manuscripts/{manuscript_id}/detection/rerun/{section_id}
```

响应：`202 Accepted`。

---

**提交 Resolve**

```
POST /api/manuscripts/{manuscript_id}/detection/items/{item_id}/resolve
```

请求体：

```json
{
  "note": "The detection is wrong"
}
```

响应：

```json
{
  "confirmed": {
    "user": "editor@mdpi.com",
    "time": "2026-03-31T10:30:00Z",
    "note": "The detection is wrong"
  }
}
```

---

### 5.2 Ethicality 接口

Ethicality section 的数据结构与普通 section 不同，item 不含 `results[]`，而是包含 `ethicality` 或 `ethicalityB` 字段。

**Ethicality Plan A 数据结构**

```typescript
interface EthicalityItem {
  id: string
  title: string          // 文件名，如 "fileName_1.pdf"
  description: string
  status: 'healthy' | 'warning' | 'error'
  results: []            // 固定为空数组
  confirmed: ConfirmedInfo | null
  ethicality: {
    issues_summary: {
      authors: {
        warning_count: number
        severe_warning_count: number
      }
      references: {
        warning_count: number
        severe_warning_count: number
      }
      ai_writing: AiWritingScore
      peer_review_reports: AiWritingScore[]
    }
    references_html?: string | null   // 可选，有问题的 reference 列表 HTML
  }
}

interface AiWritingScore {
  human_proportion: number       // 0–1，人工写作比例
  maybe_ai_proportion: number    // 0–1，疑似 AI 比例
  likely_ai_proportion: number   // 0–1，高度疑似 AI 比例
  // 三者之和应为 1.0
}
```

**Ethicality Plan B 数据结构**

```typescript
interface EthicalityBItem {
  id: string
  title: string
  description: string
  status: 'healthy' | 'warning' | 'error'
  results: []
  confirmed: ConfirmedInfo | null
  ethicalityB: {
    authors: AuthorIssue[]
    references: ReferenceIssue[]
    ai_writing: AiWritingScoreB
  }
}

interface AuthorIssue {
  name: string
  email?: string
  issues: {
    level: 'severe' | 'warning'
    text: string               // 问题标签文字，如 "Card"、"Poor Topic Similarity"
  }[]
}

interface ReferenceIssue {
  index: string                // 引用编号，如 "[1]"
  title: string                // 引用标题
  doi?: string                 // DOI，不含 https://doi.org/ 前缀
  problems: {
    level: 'severe' | 'warning'
    text: string               // 问题标签文字，如 "Out of scope"、"Corrected"
  }[]
}

interface AiWritingScoreB {
  maybe_ai_proportion: number
  likely_ai_proportion: number
  // 注意：Plan B 不返回 human_proportion，由前端计算：1 - maybe - likely
  peer_review_reports: {
    maybe_ai_proportion: number
    likely_ai_proportion: number
  }[]
}
```

> **Plan A vs Plan B 说明**：两套结构目前并存，前端通过字段名（`ethicality` vs `ethicalityB`）区分渲染路径。后续统一后保留其中一套，接口版本升级时通知前端。

---

## 六、样式规范

Detection Assistant 使用独立 CSS 文件 `DetectionAssistant.css`，严格遵循 BEM 命名，前缀 `da-`。

### 6.1 状态颜色

| 状态 | 颜色值 | 用途 |
|---|---|---|
| error / severe | `#dc2626` | 图标、result 文字、badge 背景 `#fee2e2` |
| warning | `#d97706` | 图标、result 文字、badge 背景 `#fef3c7` |
| healthy / passed | `#16a34a` | 图标、"No issues" 文字 |
| confirmed / resolved | `#9ca3af` | 图标、result 文字、badge 背景 `#f5f5f5` |

### 6.2 核心 CSS 类速查

| 类名 | 说明 |
|---|---|
| `.da-layout` | 页面根容器，`flex-direction: column` |
| `.da-header` | 顶部信息栏，`sticky top: 0, h: 48px` |
| `.da-stats-bar` | 统计概览条，`sticky top: 48px` |
| `.da-body` | 主体区域，`flex-direction: row` |
| `.da-content` | 左侧检测内容区，`flex: 1` |
| `.da-nav` | 右侧 section 导航，`width: 180px, sticky top: 88px` |
| `.da-section` | 单个 section 容器 |
| `.da-section__head` | section 标题行 |
| `.da-item` | 单个检测项行 |
| `.da-item--error` | error 状态 item |
| `.da-item--warning` | warning 状态 item |
| `.da-item--healthy` | healthy 状态 item |
| `.da-item--confirmed` | confirmed 状态 item |
| `.da-item--eth` | Ethicality 专属 item（可折叠） |
| `.da-rb` | result block 容器 |
| `.da-rb__result` | result 文字 |
| `.da-rb__author` | 作者信息行 |
| `.da-rb__details-toggle` | 展开/收起按钮 |
| `.da-eth` | Ethicality 展开内容容器 |
| `.da-eth__row` | Ethicality 信息行（Authors / References / AI Writing） |
| `.da-eth__tag--error` | 红色问题数 badge |
| `.da-eth__tag--warning` | 橙色问题数 badge |
| `.da-eth__ok` | 绿色 "No issues" 文字 |
| `.da-confirm-btn` | Resolve 按钮 |
| `.da-confirm-btn--done` | 已 Resolved 状态的按钮 |
| `.da-cpop` | Resolve Popover 内容容器 |
| `.da-view-report-btn` | View Report 按钮（蓝色边框） |

### 6.3 AiWritingDonut 组件

`AiWritingDonut` 是独立组件，接收 `ai-writing` 和 `label` 两个 props：

```typescript
interface AiWritingDonutProps {
  aiWriting: {
    human_proportion?: number      // Plan A 有，Plan B 无（前端计算）
    maybe_ai_proportion: number
    likely_ai_proportion: number
  }
  label: string                    // 显示在 donut 下方，如 "Manuscript"、"Report 1"
}
```

颜色映射：
- Human：`#16a34a` 绿
- Maybe AI：`#f59e0b` 橙
- Likely AI：`#dc2626` 红

---

## 七、待确认事项

| # | 问题 | 当前处理 |
|---|---|---|
| 1 | View Report 按钮的目标页面/弹窗形式 | 暂时 `console.log`，待产品确认 |
| 2 | Re-detect 是同步还是异步（轮询 or WebSocket） | 当前 demo 用 `setTimeout` 模拟，待后端确认 |
| 3 | Ethicality Plan A / Plan B 最终保留哪套 | 两套并存，待确认后统一 |
| 4 | References 详情是否需要在 Plan A 中也支持展开 | 代码中有注释掉的展开逻辑，待确认 |
| 5 | Resolve 操作是否需要权限控制（角色限制） | 当前无权限判断 |
| 6 | 稿件 ID 是否从路由参数传入还是 props | 当前硬编码为 `nutrients-4224751` |

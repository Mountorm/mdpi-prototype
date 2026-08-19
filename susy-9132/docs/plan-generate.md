# AcE Checklist — Generate 页 Demo 开发计划

## Context
需求方要求将 AcE Checklist 做成 SuSy 中 Assistant Editor（AE）在 pre-check 阶段填写的工具。generate 页对应邮件 Version 1 里的 **Screen 1（AE 准备 pre-check）**：AE 选择期刊和稿件后，按该期刊启用的检查项逐项确认，最后生成一份给 Academic Editor（AcEd）审阅的 summary。

当前原型中 config 页已有检查项配置能力，但 generate 页（`src/views/GenerateView.vue`）仍是占位符；config 的 mock 数据也是旧的示例项，与需求邮件中的真实项不一致。因此本次需要：
1. 把 mock 数据改成邮件里的真实检查项，让 config 和 generate 共用同一套数据。
2. 完成 generate 页的交互与 UI：accordion 分组、逐项填写、自动 flag、校验、生成 summary。
3. 保持 demo 范围：generate 页内闭环，不跳转 /report。

## Requirements Summary
- 数据源：config 和 generate 共用 `src/mock/ace.js`。
- 检查项必须贴合需求邮件（共 11 条）：
  - **纯数字无 flag**：Word Count / Figures Count / Tables Count
  - **判断类（fine/not sure + comment）**：Journal Scope Match / Special Issue Scope Match / iThenticate / Out of scope / Retractions & Corrections / AI Generated Content / Article type / Image Manipulation Detection
  - **数-判混合类（AE 填数字，系统按区间自动出 flag）**：Unverifiable references
- Flag 仅两种：Passed（绿）、Warning（橙）。Issue Found 作为 Warning 的增强展示（带示例区）。
- Warning 必须填 comment；fine 可留 comment。
- Generate 后校验并展示只读 Summary Panel。
- UI 参考折叠列表：顶部操作栏 + Category 折叠分组 + 可展开 item 行。

## Implementation Plan

### 1. 统一 mock 数据：更新 `src/mock/ace.js`
保留现有字段语义：`id`, `category`, `title`, `description`, `required`, `flagRequired`, `flagMode`, `rule`, `inUse`。
为支持新需求，扩展 `rule` 模型以表达“区间分段”规则（用于 Unverifiable references）：

```js
// 单一阈值规则（保留）
{ type: 'numeric', subject: '...', operator: '<', value: 50, result: 'warning' }
{ type: 'boolean', condition: '...', result: 'warning' }

// 新增：区间分段规则
{
  type: 'segments',
  subject: 'Unverifiable references count',
  segments: [
    { min: 0, max: 2, result: 'passed' },      // 1-2 条：无 flag
    { min: 3, max: 5, result: 'warning' },     // 3-5 条：Warning
    { min: 6, max: null, result: 'warning' }   // >5 条：Warning + 示例区
  ],
  showExamplesWhen: { min: 6 }                 // 满足该区间时展开问题示例输入
}
```

具体检查项（全部 `inUse: true`）：

| id | category | title | required | flagRequired | flagMode | rule |
|---|---|---|---|---|---|---|
| 1 | Manuscript Metadata | Word Count | true | false | manual | null |
| 2 | Manuscript Metadata | Figures Count | true | false | manual | null |
| 3 | Manuscript Metadata | Tables Count | true | false | manual | null |
| 4 | Scope Match | Journal Scope Match | true | true | manual | null |
| 5 | Scope Match | Special Issue Scope Match | true | true | manual | null |
| 6 | Similarity Check | iThenticate | true | true | manual | null |
| 7 | Reference Analysis | Out of Scope References | true | true | manual | null |
| 8 | Reference Analysis | Retractions & Corrections | true | false | manual | null |
| 9 | Reference Analysis | Unverifiable References | true | true | auto | segments 规则 |
| 10 | Content Detection | AI Generated Content | false | true | manual | null |
| 11 | Content Detection | Image Manipulation Detection | false | true | manual | null |

`categories` 更新为：
- Manuscript Metadata
- Scope Match
- Similarity Check
- Reference Analysis
- Content Detection

`pilotJournals` 保留两个 mock 期刊，方便演示期刊选择。

### 2. 新增 generate 页：`src/views/GenerateView.vue`
#### 2.1 状态设计
- `selectedJournal`：当前选中的期刊名。
- `manuscriptId`：稿件 ID 输入。
- `answers`：Map<itemId, answerObject>，每个 answer 形状：
  ```js
  {
    status: 'passed' | 'warning' | null,   // 判断类
    comment: '',                           // 评论
    numberValue: number | null,            // 数字类 / Unverifiable 条数
    examples: ''                           // Unverifiable >5 的问题示例
  }
  ```
- `expandedCategories`：Set，控制 category 折叠。
- `expandedItems`：Set，控制 item 展开（默认全部展开，方便演示）。
- `summaryVisible`：是否显示底部 summary。
- `errors`：校验错误集合（itemId -> 错误信息）。

#### 2.2 计算属性
- `activeItems`：只渲染 `inUse === true` 的检查项（与 config 保持一致）。
- `itemsByCategory`：按 category 分组的 activeItems。
- `resolvedFlag(item)`：
  - 纯数字类 → null。
  - 判断类 → answer.status。
  - Unverifiable（segments 规则）→ 根据 `numberValue` 命中对应 segment 的 result；若 ≥6 则标记需要 examples。

#### 2.3 UI 结构
参考邮件截图的折叠列表：

```
┌─────────────────────────────────────────────────────────────┐
│ [Journal ▼]  [Manuscript ID ____]        [Reset] [Generate] │
├─────────────────────────────────────────────────────────────┤
│ ▼ Manuscript Metadata (3 items)                             │
│   ─ Word Count                    [1234]                    │
│   ─ Figures Count                 [5]                       │
│   ─ Tables Count                  [2]                       │
│ ▼ Scope Match (2 items)                                     │
│   ─ Journal Scope Match           (○ passed  ○ warning) [comment]
│   ─ Special Issue Scope Match     (○ passed  ○ warning) [comment]
│ ...                                                         │
│ ▼ Reference Analysis (3 items)                              │
│   ─ Unverifiable References       [count]  → Warning / Passed
│                                     [examples textarea if ≥6]│
├─────────────────────────────────────────────────────────────┤
│ 📋 Generated Summary                                        │
│   Passed: 6  Warning: 3                                     │
│   [展开 item 摘要]                                          │
└─────────────────────────────────────────────────────────────┘
```

- Category header 显示 item 数量，点击折叠/展开。
- Item row 默认展开；收起态显示标题和当前 badge。
- 判断类使用 radio group：`passed` / `warning`。Warning 时下方出现 comment textarea，标记 required。
- 数字类使用 `el-input-number`。
- Unverifiable 使用 `el-input-number`，右侧实时显示自动判定的 flag badge；当 count ≥ 6 时展开 examples textarea。
- iThenticate：百分比数字输入 + passed/warning radio + comment。

#### 2.4 校验逻辑（Generate 时触发）
- 数字类：若 `required` 且未填数字，报错。
- 判断类：若 `flagRequired` 且未选 status，报错。
- 所有 status === 'warning' 的项：comment 必填。
- Unverifiable：count 必填；count ≥ 6 时 examples 必填。
- 校验通过 → `summaryVisible = true`，滚动到 summary。
- 校验失败 → 用 `ElMessage` 提示，并在对应 item 旁显示错误信息。

#### 2.5 Summary Panel
- 列出所有 activeItems 的结果：
  - 数字类：显示数字值。
  - 判断类：显示 passed/warning badge + comment（只展示 warning 的 comment 或所有 comment）。
  - Unverifiable：显示 count + 自动 flag + examples（若 ≥6）。
- 顶部统计：Passed 数 / Warning 数 / 未判定数。
- 提供 `Back to form` / `Reset` 操作。

### 3. Config 页最小改动：`src/views/AceChecklist.vue`
由于 mock 数据已更新，AceChecklist.vue 的表格会直接渲染新项。需要确保：
1. Add/Edit 对话框支持 `rule.type === 'segments'` 的展示与编辑。
2. `flagSummary(item)` 函数对 `segments` 规则给出可读文本（例如：Unverifiable: 0-2 passed, 3-5 warning, >5 warning + examples）。
3. 分类下拉使用新的 categories。

实现：在 rule 配置区域增加一个条件分支 `form.rule.type === 'segments'`，渲染一个分段列表编辑器（min/max/result）。为保持 demo 简洁，可以只展示、不强制复杂编辑；默认项在 mock 里已经配好。

### 4. 样式复用
- 页面根容器使用 `.ace-checklist-root` 变量，或新建 `.generate-view-root` 但沿用主题色 `#0156ce`、字体等。
- 使用现有 `MdIcon.vue` 渲染 `expand_more`、`expand_less`、`check_circle`、`warning`、`error` 等图标（需要扩展 MdIcon 的 paths）。
- Passed badge 用绿 `#e7f4ec` / `#2f7d4f`；Warning badge 用橙 `#fff3e0` / `#e65100`。
- 复用 `ace-checklist.css` 中已有的 `.rule-result.passed/.warning` 颜色。

### 5. 图标扩展：`src/components/MdIcon.vue`
新增 paths：
- `expand_less`
- `check_circle`
- `warning`
- `error`
- `description`
- `visibility`（可选，用于 Preview）

### 6. 路由与布局
无需改动 `src/router/index.js`，generate 已挂载在 `ReportShell` 下，breadcrumb 会自动显示 "Generate Report"。

## Files to Modify
| File | Change |
|---|---|
| `src/mock/ace.js` | 重写 categories、checklistItems、pilotJournals，新增 segments 规则 |
| `src/views/GenerateView.vue` | 新建 AE 填表页：accordion、状态管理、自动 flag、校验、summary |
| `src/views/AceChecklist.vue` | 支持 segments 规则展示/编辑；更新 flagSummary |
| `src/components/MdIcon.vue` | 新增图标 paths |
| `src/styles/ace-checklist.css` 或 `<style scoped>` | generate 页专用样式 |

## Verification
1. 运行 `npm run dev`，访问 `http://localhost:5173`。
2. 点击 "Configuration"，确认检查项已更新为邮件里的 11 项，Reference Analysis 拆成 3 项。
3. 点击 "Generate Report"，进入 generate 页：
   - 选择期刊、输入稿件 ID。
   - 逐项填写：数字类、判断类、Unverifiable 条数。
   - 测试 warning 不填 comment 时 Generate 报错。
   - 测试 Unverifiable count=6 时展开 examples 输入且必填。
   - 所有必填通过 → 显示 Summary Panel，统计正确。
4. 测试 Reset 清空表单。
5. 确认 generate 页不跳转 /report（本次 demo 范围）。

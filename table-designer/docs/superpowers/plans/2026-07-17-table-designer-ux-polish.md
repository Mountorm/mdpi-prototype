# Table Designer 沟通向体验打磨 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有三栏样机上补齐字体与间距表达力，并打磨预览/交互/右侧讲解/断点提示，使工具更适合与设计/开发对齐观感。

**Architecture:** 状态仍集中在 `useTableDesign.js`；全局新增 `fontFamily`、`cellPaddingY`、`cellPaddingX`、`rowLineHeight`；预览通过 CSS 变量把观感参数打到表格；右侧 `MetaPanel` 改为「讲解结论优先、数字附注」；不引入导出或方案库。

**Tech Stack:** Vue 3 + Vite + Element Plus（现有）。本原型无单测框架，每任务以 `npm run build` + 手工验收清单验证。

**Spec:** `docs/superpowers/specs/2026-07-17-table-designer-ux-polish-design.md`

---

## File map

| 文件 | 职责 |
|---|---|
| `src/composables/useTableDesign.js` | 全局观感字段、字体选项常量、讲解结论 `briefing` 计算 |
| `src/components/ConfigPanel.vue` | 左侧：字体族、间距控件；文案偏沟通 |
| `src/components/PreviewPanel.vue` | 中间：应用字体/间距；交互边界；口语状态条 |
| `src/components/MetaPanel.vue` | 右侧：先结论后数字 |
| `src/App.vue` | 透传新字段；顶部提示改沟通向 |
| `src/styles.css` | 如需补充字体加载说明（Google Fonts 已在 index.html） |
| `index.html` | 按需增加 1～2 个可选字体链接 |

不做：导出、多方案保存、每列独立间距、新页面路由。

---

### Task 1: 扩展全局观感状态（字体 + 间距）

**Files:**
- Modify: `src/composables/useTableDesign.js`
- Modify: `index.html`（字体链接）

- [ ] **Step 1: 在 `useTableDesign.js` 顶部增加字体选项常量**

在 `BREAKPOINTS` 下方加入：

```js
export const FONT_OPTIONS = [
  {
    value: "'IBM Plex Sans', 'Segoe UI', sans-serif",
    label: 'IBM Plex Sans（默认）',
  },
  {
    value: "'Source Serif 4', Georgia, serif",
    label: 'Source Serif（衬线）',
  },
  {
    value: "'Roboto Mono', ui-monospace, monospace",
    label: 'Roboto Mono（等宽）',
  },
  {
    value: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    label: '系统默认',
  },
]
```

说明：选项克制为 4 个，服务「像不像」对比，不做成字体库。

- [ ] **Step 2: 扩展 `global` 默认值**

将 `global` 改为包含：

```js
const global = reactive({
  rows: 5,
  cols: 5,
  defaultWidth: 160,
  fixed: false,
  fontFamily: FONT_OPTIONS[0].value,
  fontSize: 13,
  cellPaddingY: 8,
  cellPaddingX: 10,
  rowLineHeight: 1.4,
  truncate: true,
  headerBold: true,
})
```

- [ ] **Step 3: 在 `index.html` 补充衬线/等宽字体**

在现有 Google Fonts link 中扩展为（或新增一条）：

```html
<link
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Roboto+Mono:wght@400;500&family=Source+Serif+4:wght@400;600&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 4: 构建验证**

Run: `npm run build`  
Expected: 构建成功，无报错。

- [ ] **Step 5: Commit**

```bash
git add table-designer/src/composables/useTableDesign.js table-designer/index.html
git commit -m "feat(table-designer): add font and spacing global state"
```

---

### Task 2: 左侧配置支持字体与间距

**Files:**
- Modify: `src/components/ConfigPanel.vue`
- Modify: `src/App.vue`（如需透传 `FONT_OPTIONS`；也可在 ConfigPanel 内直接 import）

- [ ] **Step 1: ConfigPanel 引入字体选项**

```js
import { FONT_OPTIONS } from '../composables/useTableDesign'
```

- [ ] **Step 2: 在「全局默认」表单中，于「默认字号」前插入字体族**

```vue
<el-form-item label="字体">
  <el-select v-model="global.fontFamily" placeholder="选择字体">
    <el-option
      v-for="opt in FONT_OPTIONS"
      :key="opt.label"
      :label="opt.label"
      :value="opt.value"
    />
  </el-select>
</el-form-item>
```

- [ ] **Step 3: 在字号后增加间距三控件**

```vue
<div class="grid-2">
  <el-form-item label="上下内边距 (px)">
    <el-input-number
      v-model="global.cellPaddingY"
      :min="2"
      :max="28"
      controls-position="right"
    />
  </el-form-item>
  <el-form-item label="左右内边距 (px)">
    <el-input-number
      v-model="global.cellPaddingX"
      :min="4"
      :max="40"
      controls-position="right"
    />
  </el-form-item>
</div>
<el-form-item label="行高">
  <el-slider
    v-model="global.rowLineHeight"
    :min="1.1"
    :max="2"
    :step="0.1"
    show-input
  />
</el-form-item>
```

- [ ] **Step 4: 调整左侧文案为沟通向**

- 面板标题旁 eyebrow 可保持；将 `h2` 旁说明或 `hint` 改为：「调字体与疏密，方便对齐观感」
- 「重置覆盖」文案保留

- [ ] **Step 5: 手工验收**

Run: `npm run dev`  
操作：改字体、改上下/左右 padding、拖行高 → 暂不要求预览已通（下一任务接通），但左侧控件可改且不报错。

- [ ] **Step 6: Commit**

```bash
git add table-designer/src/components/ConfigPanel.vue
git commit -m "feat(table-designer): expose font and spacing controls"
```

---

### Task 3: 预览应用字体与间距（观感对齐核心）

**Files:**
- Modify: `src/components/PreviewPanel.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: PreviewPanel 增加 `global` prop（或至少观感字段）**

```js
global: { type: Object, required: true },
```

App.vue 传入：`:global="global"`。

- [ ] **Step 2: 给 `.design-table` 绑定 CSS 变量**

```vue
<table
  class="design-table"
  :style="{
    ...(layout.overflow
      ? { width: layout.tableWidth + 'px' }
      : { width: '100%' }),
    fontFamily: global.fontFamily,
    '--cell-pad-y': global.cellPaddingY + 'px',
    '--cell-pad-x': global.cellPaddingX + 'px',
    '--row-lh': String(global.rowLineHeight),
  }"
>
```

- [ ] **Step 3: 更新单元格样式使用变量**

```css
.design-table th,
.design-table td {
  border: 1px solid var(--line);
  padding: var(--cell-pad-y, 8px) var(--cell-pad-x, 10px);
  vertical-align: top;
  background: #fff;
}

.cell {
  line-height: var(--row-lh, 1.4);
  word-break: break-word;
}
```

单列 `fontSize` 继续打在 th/td 的 inline style 上（已有）。

- [ ] **Step 4: 弱化「调试画布」感（预览真实感）**

- `frame-label` 保留但降低对比度，或改为更轻的 `预览区` 文案
- 表格外框保持干净；**禁止**在单元格内再次显示宽度等元数据（已满足则不动）

- [ ] **Step 5: 验收**

1. 切换衬线字体 → 表内文字立即变化  
2. 增大 `cellPaddingY` → 行明显变疏  
3. 行高调到 1.8 → 多行文本更松  
4. `npm run build` 通过  

- [ ] **Step 6: Commit**

```bash
git add table-designer/src/components/PreviewPanel.vue table-designer/src/App.vue
git commit -m "feat(table-designer): apply font and spacing in live preview"
```

---

### Task 4: 右侧改为「讲解结论优先」

**Files:**
- Modify: `src/composables/useTableDesign.js`
- Modify: `src/components/MetaPanel.vue`
- Modify: `src/App.vue`（如需传 `briefing`）

- [ ] **Step 1: 在 composable 增加 `briefing` computed**

```js
const briefing = computed(() => {
  const { overflow, containerWidth, tableWidth, flexCount, columns } = layout.value
  const avgPad = global.cellPaddingY
  const density =
    avgPad <= 6 ? '偏紧凑' : avgPad >= 14 ? '偏疏松' : '适中'

  const conclusions = []
  if (overflow) {
    conclusions.push({
      tone: 'warn',
      text: `当前宽度下表格会横向滚动（表宽 ${tableWidth}px > 容器 ${containerWidth}px）`,
    })
  } else {
    conclusions.push({
      tone: 'ok',
      text: `当前宽度下表格可完整落入容器（${containerWidth}px）`,
    })
  }
  conclusions.push({
    tone: 'neutral',
    text: `疏密观感：${density}（上下内边距 ${global.cellPaddingY}px · 行高 ${global.rowLineHeight}）`,
  })
  conclusions.push({
    tone: 'neutral',
    text: `字体：字号默认 ${global.fontSize}px；固定列 ${columns.length - flexCount} · 自适应列 ${flexCount}`,
  })

  return { conclusions, density }
})
```

并在 return 中导出 `briefing`。

- [ ] **Step 2: MetaPanel 顶部改为「讲解要点」**

```vue
<header class="panel-head">
  <div>
    <p class="eyebrow">Briefing</p>
    <h2>讲解要点</h2>
  </div>
</header>

<section class="block">
  <h3>先看结论</h3>
  <ul class="conclusions">
    <li
      v-for="(item, i) in briefing.conclusions"
      :key="i"
      :class="item.tone"
    >
      {{ item.text }}
    </li>
  </ul>
</section>
```

样式：`.conclusions .warn` 用既有 warn 色；`.ok` 用 accent。

- [ ] **Step 3: 原「概览」数字区降级为「数字附注」**

- 标题改为「数字附注」
- 保留：行×列、断点、容器宽、表宽、溢出  
- 可折叠或默认更紧凑（字体略小、间距略紧）
- 各列宽度列表保留在下方，标题改为「各列宽度（对齐时备用）」

- [ ] **Step 4: App 传入 briefing**

```vue
<MetaPanel
  :layout="layout"
  :global="global"
  :briefing="briefing"
  ...
/>
```

- [ ] **Step 5: 验收**

窄屏拖到出现溢出 → 右侧第一条结论变为「会横向滚动」口语句；密度随 padding 变化。

- [ ] **Step 6: Commit**

```bash
git add table-designer/src/composables/useTableDesign.js table-designer/src/components/MetaPanel.vue table-designer/src/App.vue
git commit -m "feat(table-designer): prioritize briefing conclusions in meta panel"
```

---

### Task 5: 交互顺手 + 断点口语提示

**Files:**
- Modify: `src/components/PreviewPanel.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: 工具条状态改为口语**

将「容器 / 表宽 / 横向滚动」芯片改为更适合讲解的句子，例如：

- 正常：`完整显示 · 容器 768px（平板）`
- 溢出：`需要左右滑动才能看完所有列`

保留滑块与断点按钮。

- [ ] **Step 2: 降低拖列宽与编辑误触**

在 `PreviewPanel.vue`：

1. 列宽手柄仅在 `th:hover` / `th.resizing` 时显示竖线（已有可加强）
2. `col-resize-handle` 的 `pointerdown` 保持 `stopPropagation`
3. 编辑中（`editingKey` 非空）时，禁用列宽拖拽开始：

```js
function onColumnResizeStart(index, e) {
  if (editingKey.value) return
  // ...existing
}
```

4. 单元格 `contenteditable` 在拖动手柄上不可选中（手柄已独立）

- [ ] **Step 3: 顶部提示改为沟通向**

`App.vue` top-note：

```text
调字体与间距看疏密，切断点讲响应式；右侧是讲解结论
```

- [ ] **Step 4: 验收清单（对照 spec 成功标准）**

1. 5 分钟路径：改字体 → 改间距 → 拖一列 → 切 1440/768/375 → 右侧结论可读  
2. 编辑单元格时不易误触列宽  
3. 预览内仍无宽度数字  
4. `npm run build` 通过  

- [ ] **Step 5: Commit**

```bash
git add table-designer/src/components/PreviewPanel.vue table-designer/src/App.vue
git commit -m "polish(table-designer): clearer briefing chips and safer resize/edit"
```

---

### Task 6: 规格状态回写与收尾自检

**Files:**
- Modify: `docs/superpowers/specs/2026-07-17-table-designer-ux-polish-design.md`

- [ ] **Step 1: 将规格状态改为已落地**

文首状态改为：`状态：已实现（沟通向体验打磨）`

- [ ] **Step 2: 对照 spec 自检**

| Spec 要求 | 对应任务 |
|---|---|
| 字体族 + 字号 | Task 1–3 |
| 全局间距（行高/内边距） | Task 1–3 |
| 预览真实感 | Task 3 |
| 交互顺手 | Task 5 |
| 右侧结论优先 | Task 4 |
| 断点可讲解 | Task 5 |
| 不做导出/方案库/列类型 | 全程未做 |

- [ ] **Step 3: Commit**

```bash
git add table-designer/docs/superpowers/specs/2026-07-17-table-designer-ux-polish-design.md
git commit -m "docs: mark table-designer UX polish spec as implemented"
```

---

## Self-review (plan vs spec)

1. **Spec coverage:** 字体、间距、四面体验、不做清单、成功标准验收步骤均有对应任务。  
2. **Placeholders:** 无 TBD；关键 UI/状态片段已写出。  
3. **Consistency:** `fontFamily` / `cellPaddingY` / `cellPaddingX` / `rowLineHeight` / `briefing` / `FONT_OPTIONS` 命名在各任务一致。  
4. **Scope:** 单计划可独立交付；未混入导出或多方案。

# SuSy Prototype — 设计与代码风格指南

> 本文档基于对项目全部源码的逐行阅读整理而成，用于指导后续所有 vibe coding，确保视觉与代码风格的严格一致性。

---

## 一、技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API, `<script setup>`) |
| 路由 | Vue Router 4（Hash 模式） |
| UI 组件库 | Element Plus 2.x |
| 图标库 | lucide-vue-next（功能图标）、Material Icons / Material Symbols Outlined（操作图标） |
| 样式方案 | Tailwind CSS 3 + 全局 CSS 变量 + scoped CSS |
| 构建工具 | Vite 5 |
| 包管理 | pnpm |

---

## 二、色彩系统

### 2.1 CSS 变量（全局 Token）

所有颜色必须优先使用以下 CSS 变量，禁止在组件中硬编码与这些变量语义重复的颜色值。

```css
--color-background: #f5f5f5;
--color-foreground: #1a1a1a;
--color-primary: #0066cc;
--color-secondary: #6b7280;
--color-accent: #10b981;
--color-border: #e5e7eb;
--color-muted: #f1f5f9;
--color-muted-foreground: #64748b;
--color-input: #e2e8f0;
--sidebar-width: 220px;
```

### 2.2 品牌主色

实际交互元素（按钮、链接、激活态、焦点环）统一使用品牌蓝：

```
主色：  #0156ce
悬停：  #014bb5
禁用：  #7aaee7
浅背景：#eef4ff
浅边框：#c7d7f5
```

### 2.3 语义色

| 语义 | 颜色 | 用途 |
|------|------|------|
| 标题/深色文字 | `#172b4d` | 面板标题、侧边栏分组标题、模态框标题 |
| 正文 | `#1e293b` / `#374151` | 表格内容、表单标签 |
| 次要文字 | `#626f86` / `#64748b` | 辅助说明、元信息 |
| 占位/禁用 | `#94a3b8` / `#9ca3af` | 空状态、禁用文字 |
| 成功 | `#16a34a` | 通过状态、正向指标 |
| 警告 | `#d97706` / `#f59e0b` | 警告状态 |
| 错误/严重 | `#dc2626` | 错误状态、危险操作 |
| 链接 | `#0156ce` / `#2563eb` | 可点击链接 |

### 2.4 状态 Badge 色

```
成功：bg #dcfce7 / text #16a34a
警告：bg #fef3c7 / text #d97706
错误：bg #fee2e2 / text #dc2626
信息：bg #dbeafe / text #1d4ed8
次要：bg #f3f4f6 / text #6b7280
```

---

## 三、排版

### 3.1 字体

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
-webkit-font-smoothing: antialiased;
```

### 3.2 字号规范

| 用途 | 字号 | 字重 |
|------|------|------|
| 面板标题（panel-title） | 16px | 600 |
| 侧边栏分组标题 | 14px | 600 |
| 侧边栏菜单项 | 14px | 400 |
| 表格表头 | 12px（text-xs） | 600（font-semibold） |
| 表格内容 | 12px（text-xs） | 400 |
| 表单标签 | 13–14px | 400 |
| 辅助说明/元信息 | 11–12px | 400 |
| 导航链接 | 13–14px（text-sm） | 500 |
| 模态框标题 | 18px | 700 |

---

## 四、布局结构

### 4.1 整体框架

```
Header（h-16 = 64px，固定顶部）
├── Sidebar（220px，可折叠）
└── main（flex-1 overflow-auto）
    ├── breadcrumb（px-4 py-2）
    └── RouterView（pb-4 px-4）
```

- 整体使用 `flex flex-col h-full`，内容区 `flex-1 overflow-auto`
- 侧边栏折叠时 `width: 0`，CSS transition 动画 0.3s ease-in-out
- 面包屑格式：`SuSy / 页面名称`

### 4.2 内容区间距

- 页面内容外边距：`px-4 pb-4`
- 面板之间间距：`mb-4`（16px）
- 面板内部 padding：`panel-body` 为 `1rem`

### 4.3 两列布局（ProcessManuscript 详情页）

- 左列（`.left-column`）：静态元数据（What it is）
- 右列（`.right-column`）：动态操作内容（What to do）
- 内部子区块使用 `.inner-section` 包裹，含 `.inner-section-header` 和 `.inner-section-body`

---

## 五、核心 UI 组件规范

### 5.1 Panel（面板）

面板是页面的基本容器单元，**不使用圆角**（`border-radius: 0`）。

```html
<div class="panel">
  <div class="panel-header">
    <span class="panel-title">标题</span>
    <!-- 右侧操作按钮 -->
  </div>
  <div class="panel-body">内容</div>
  <div class="panel-footer"><!-- 底部按钮组，居中 --></div>
</div>
```

关键样式：
- `panel-header`：高度 48px，`border-bottom: 1px solid #e5e7eb`，flex 左右对齐
- `panel-title`：`color: #172b4d; font-size: 16px; font-weight: 600`
- `panel-footer`：`justify-content: center; gap: 1rem`

### 5.2 Collapsible Panel（可折叠面板）

```html
<div class="collapsible-panel mb-4">
  <button @click="expanded = !expanded" class="collapsible-header w-full">
    <span class="panel-title">标题</span>
    <span :class="['material-icons transition-transform', { 'rotate-90': expanded }]"
      style="font-size: 20px;">chevron_right</span>
  </button>
  <div v-if="expanded" class="collapsible-body">内容</div>
</div>
```

- 折叠图标：Material Icons `chevron_right`，展开时旋转 90°
- 悬停背景：`#f9fafb`

### 5.3 DataTable（通用数据表格）

使用 `<DataTable>` 组件，通过 `columns` 和 `data` props 驱动。

```html
<DataTable
  :columns="columns"
  :data="data"
  :sort-key="sortKey"
  :sort-order="sortOrder"
  @sort-change="handleSortChange"
>
  <template #cell-title="{ row }">
    <a href="#" class="text-primary hover:underline">{{ row.title }}</a>
  </template>
  <template #empty>
    <div class="text-center py-12">
      <p class="text-gray-500 font-medium">No data available</p>
    </div>
  </template>
</DataTable>
```

表格样式规范：
- 外层容器：`table-shell`（白底，`border: 1px solid var(--color-border)`，无圆角）
- 表头：`bg-gray-50`，`text-xs font-semibold`，`py-2 px-2`
- 行：斑马纹（`table-striped`），悬停 `bg-gray-50`
- 单元格：`py-2 px-2 text-xs`
- 分页器：右对齐，`layout="total, sizes, prev, pager, next, jumper"`

### 5.4 Status Tabs（状态标签页）

不使用 Element Plus Tabs，使用自定义链接样式：

```html
<div class="status-tabs mb-4">
  <a
    v-for="tab in tabs" :key="tab.key"
    href="#"
    :class="['status-tab', { 'active': activeTab === tab.key }]"
    @click.prevent="activeTab = tab.key"
  >{{ tab.label }}</a>
</div>
```

样式：
- 默认：`color: #626f86; font-size: 13px; border-bottom: 2px solid transparent`
- 激活：`color: #0156ce; border-bottom-color: #0156ce; font-weight: 600`
- 悬停：`color: #0156ce`

### 5.5 Sidebar（侧边栏）

- 宽度：`var(--sidebar-width)` = 220px，背景白色
- 分组标题：`color: #172b4d; font-size: 14px; font-weight: 600`，可点击折叠
- 菜单项：`color: #626f86; font-size: 14px; padding: 0.5rem 0 0.5rem 0.6rem`
- 激活项：`background: #e6eefa; color: #0156ce; font-weight: 500; border-radius: 4px`
- 悬停：`background: #f8f9fd; border-radius: 4px`

### 5.6 Header（顶部导航）

- 高度：`h-16`（64px），背景白色，`border-bottom: 1px solid #e5e7eb`
- 导航链接悬停：底部 `border-b-2 border-[#1f6ad4]`，文字变 `#1f6ad4`
- 主操作按钮：`background: #0156ce`，悬停 `#014bb5`，白色文字

---

## 六、按钮规范

### 6.1 Element Plus 按钮（全局覆盖，勿重复定义）

| 类型 | 背景 | 边框 | 文字 |
|------|------|------|------|
| Primary | `#0156ce` | `#0156ce` | `#fff` |
| Primary 悬停 | `#014bb5` | `#014bb5` | `#fff` |
| Default | `#fff` | `#d1d5db` | `#374151` |
| Default 悬停 | `#f0f6ff` | `#0156ce` | `#0156ce` |
| Text/Link | transparent | transparent | `#0156ce` |

### 6.2 自定义主操作按钮

```css
background-color: #0156ce;
color: #fff;
border: none;
border-radius: 4–6px;
padding: 8px 20px;
font-size: 14px;
transition: background 0.2s;
/* 悬停 */
background-color: #014bb5;
```

### 6.3 自定义次要/边框按钮

```css
background: none;
border: 1px solid #d1d5db;
border-radius: 4px;
color: #374151;
font-size: 12–13px;
/* 悬停 */
background: #f3f4f6;
```

### 6.4 图标按钮

```css
display: inline-flex; align-items: center; justify-content: center;
width: 24px; height: 24px;
border: none; background: none; border-radius: 4px;
color: #94a3b8; transition: all 0.15s;
/* 悬停 */
background: #f1f5f9; color: #475569;
/* 危险悬停 */
background: #fee2e2; color: #dc2626;
```

---

## 七、表单规范

- 页面级筛选器：`label-position="right"`，CSS Grid 多列布局
- Dialog 内表单：`label-position="top"`
- 日期范围：`el-date-picker` type="daterange"，placeholder 为 "From date" / "To date"
- 数字范围：两个 `el-input-number`（`:controls="false"`）+ 分隔符 `-`
- 多选下拉：`el-select` + `multiple filterable`，placeholder 为 "Select Some Options"

### 7.1 InlineEditSelect（行内编辑）

用于详情页字段就地编辑：
- 显示态：文字 + Material Symbols `edit` 图标（`#626f86`，悬停 `#0156ce`）
- 编辑态：`el-select` + Material Symbols `save` 图标（`#0156ce`）

---

## 八、图标使用规范

### 8.1 Material Icons / Material Symbols Outlined

用于**操作类图标**（按钮内、行内操作）：

```html
<span class="material-icons" style="font-size: 20px;">menu</span>
<span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
<!-- 填充变体 -->
<span class="material-symbols-outlined"
  style="font-size: 18px; font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;">
  bookmark
</span>
```

常用：`edit`、`save`、`delete`、`add_notes`、`bookmark`、`description`、`upload`、`menu`、`menu_open`、`chevron_right`

### 8.2 lucide-vue-next

用于**功能性/状态类图标**（检测结果、状态指示、导航辅助）：

```vue
import { XCircle, AlertTriangle, CheckCircle, UserCheck, RefreshCcw,
         PencilLine, Trash2, ChevronDown, ChevronUp, Download, FileText } from 'lucide-vue-next'
```

常用：`XCircle`（错误）、`AlertTriangle`（警告）、`CheckCircle`（通过）、`UserCheck`（已确认）、`RefreshCcw`（重新检测）、`PencilLine`（编辑）、`Trash2`（删除）

---

## 九、Badge / Tag 规范

### 9.1 全局 Badge 类

```html
<span class="badge badge-success">Published</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-danger">Rejected</span>
<span class="badge badge-info">Under Review</span>
```

样式：`inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500`

### 9.2 检测状态 Tag（da- 前缀）

```html
<span class="da-eth__tag da-eth__tag--error">2</span>
<span class="da-eth__tag da-eth__tag--warning">3</span>
```

样式：`font-size: 12px; font-weight: 600; padding: 2px 7px; border-radius: 4px`

---

## 十、Detection Assistant 专属规范

Detection Assistant 有独立 CSS 文件（`DetectionAssistant.css`），严格使用 BEM 命名。

### 10.1 命名前缀 `da-`

- Block：`da-layout`、`da-header`、`da-stats-bar`、`da-section`、`da-item`
- Element：`da-item__body`、`da-item__title`、`da-item__actions`
- Modifier：`da-item--error`、`da-item--warning`、`da-item--healthy`、`da-item--confirmed`

### 10.2 状态颜色映射

| 状态 | 颜色 |
|------|------|
| error | `#dc2626`（红） |
| warning | `#d97706`（橙黄） |
| healthy | `#16a34a`（绿） |
| confirmed | `#9ca3af`（灰） |

### 10.3 布局结构

```
da-layout（flex column）
├── da-header（sticky top:0, h:48px）
├── da-stats-bar（sticky top:48px）
└── da-body（flex row）
    ├── da-content（flex:1）
    │   └── da-section → da-items → da-item
    └── da-nav（width:180px, sticky）
```

---

## 十一、弹窗（Dialog）规范

- 使用 Element Plus `el-dialog`
- 标准宽度：`width="500px"`，小型：`width="380px"`
- 必须设置 `:close-on-click-modal="false"`
- Dialog 内表单：`label-position="top"`
- Footer：Cancel（默认样式）+ 主操作（primary），右对齐

---

## 十二、Vue 组件代码规范

### 12.1 组件结构顺序

```vue
<template><!-- 模板 --></template>

<script setup>
// 1. import
// 2. defineProps / defineEmits
// 3. 响应式状态（ref / reactive / computed）
// 4. 方法
</script>

<style scoped>/* 组件私有样式 */</style>
```

### 12.2 Props 定义

```js
const props = defineProps({
  columns: { type: Array, required: true },
  pagination: { type: Boolean, default: true },
  defaultPageSize: { type: Number, default: 10 }
})
```

### 12.3 响应式状态

- 简单值：`ref()`
- 对象/表单：`reactive()`
- 派生值：`computed()`
- 禁止使用 Options API

### 12.4 事件命名

- kebab-case：`sort-change`、`page-change`、`toggle-sidebar`

### 12.5 样式优先级

1. Tailwind 工具类（布局、间距）
2. 全局 CSS 类（`.panel`、`.badge`、`.status-tab`）
3. `<style scoped>`（组件私有复杂样式）
4. 行内 `style`（仅用于动态值）

禁止在 scoped 样式中重复定义已有全局类的样式。

### 12.6 Tailwind 使用规范

- 布局/间距：直接用 Tailwind
- 颜色：优先用 CSS 变量映射类（`text-primary`、`bg-background`、`border-border-color`），其次用内置色（`text-gray-500`）
- 复杂组件样式：用 scoped CSS，不堆砌 Tailwind 类

---

## 十三、路由规范

- Hash 模式（`createWebHashHistory`）
- 每个路由必须配置 `meta.breadcrumb`
- 路由路径使用 kebab-case

```js
{ path: '/detection-assistant', component: DetectionAssistant, meta: { breadcrumb: 'Detection Assistant' } }
```

---

## 十四、数据结构规范

### 14.1 detection-config.js 检测项 results 结构

```js
{
  result: string,
  author?: { name: string, email: string },
  detailsType?: 'list' | 'html',  // 默认 'list'
  details?: string[],             // list 模式
  htmlContent?: string,           // html 模式（后端返回）
}
```

---

## 十五、禁止事项

1. 禁止使用 Options API
2. 禁止在组件内重复覆盖已在 `style.css` 中全局定义的 Element Plus 样式
3. 禁止对 Panel、Table 等主容器使用圆角（保持 `border-radius: 0`）
4. 禁止在行内 `style` 中写静态颜色值（应使用 CSS 变量或 Tailwind 类）
5. 禁止混用两套图标库于同一语义场景（操作图标用 Material，状态图标用 lucide）
6. 禁止在 Dialog 外的页面级表单使用 `label-position="top"`

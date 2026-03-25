# SuSy Prototype — 设计与代码风格指南

> 本文档基于对项目全部源码的逐行阅读整理而成，用于指导后续所有 vibe coding，确保视觉与代码风格的严格一致性。

---

## 一、技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API, `<script setup>`) |
| 路由 | Vue Router 4（History 模式） |
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
--sidebar-width: 260px;
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
Header（h-16 = 64px，position: fixed，left: 0，right: 0，z-index: 110）
Sidebar（260px，position: fixed，top: 64px，height: calc(100vh - 64px)，z-index: 100，可折叠至 48px）
main（margin-left 随 sidebar 宽度动态变化，margin-top: 64px，overflow-auto）
    ├── breadcrumb（px-4 py-2）
    ├── RouterView（pb-4 px-4）
    └── footer（黑色背景 #363638）
```

布局要点：
- Header `z-index: 110`，覆盖 Sidebar（`z-index: 100`），logo 在 Header 左侧
- Sidebar `position: fixed; top: 64px`，不再位于 Header 层级下
- `html, body` 设置 `overflow: hidden`，滚动只发生在 `<main>` 内
- main 容器用 `h-full overflow-hidden` 确保高度链完整，`<main>` 用 `flex-1 overflow-auto`
- sidebar 折叠时宽度 48px（保留，不完全隐藏），展开 260px，transition 0.3s
- 面包屑格式：`SuSy / 页面名称`

### 4.2 右侧浮动按钮组（`.common-right-button`）

固定在页面右下角，包含三个圆形按钮，从上到下：
- 滚动到顶部（`keyboard_arrow_up`）
- 微信二维码（`qr_code`，仅展示，无交互）
- 滚动到底部（`keyboard_arrow_down`）

```
position: fixed; right: 16px; bottom: 80px; z-index: 500
按钮：36×36px 圆形，白底，border: 1px solid #e5e7eb，box-shadow
hover：background #f0f4ff，color #0156ce，border-color #c7d7f5
```

滚动目标是 `<main>` 元素（`document.querySelector('main.flex-1')`），使用 `scrollTo({ behavior: 'smooth' })`。

### 4.3 内容区间距

- 页面内容外边距：`px-4 pb-4`
- 面板之间间距：`mb-4`（16px）
- 面板内部 padding：`panel-body` 为 `1rem`

### 4.4 两列布局（ProcessManuscript 详情页）

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
- 分页器：见 5.3.1

### 5.3.1 分页器规范（统一标准）

**所有列表页面的分页器必须使用以下统一写法，不得简化 layout。**

```html
<div class="data-table-pagination">
  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :page-sizes="pageSizes"
    :total="total"
    layout="total, sizes, prev, pager, next, jumper"
  />
</div>
```

对应 script 初始化：

```js
const currentPage = ref(1)
const pageSize    = ref(20)
const pageSizes   = [20, 50, 100]
```

**重置规则**：任何会改变列表内容的筛选条件变化（分类切换、搜索词、状态筛选等），必须通过 `watch` 将 `currentPage` 重置为 1，禁止在事件回调里零散重置：

```js
watch([selectedCategory, searchQuery, filterStatus], () => {
  currentPage.value = 1
})
```

全局样式已在 `DataTable.vue` 的 scoped CSS 中通过 `:deep(.el-pagination)` 定义，其他页面直接使用 `.data-table-pagination` 容器类即可，无需重复覆盖。

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

- 宽度：`var(--sidebar-width)` = 260px，折叠后 48px（保留宽度，不完全隐藏）
- `position: fixed; top: 64px; height: calc(100vh - 64px); z-index: 100`
- 背景色、文字色、hover/active 色均由主题对象通过 CSS 变量动态注入，支持 18 套主题切换
- 主题切换入口：footer 左侧 `palette` 图标按钮，点击弹出选择面板（展开状态下可见）
- 折叠状态：每个 group 显示首字母缩写，hover 时在右侧弹出 flyout 菜单（`<Teleport to="body">` + `z-index: 9999`，避免被 header 遮挡）
- footer 高度 48px，左侧 feedback 图标 + palette 图标，右侧折叠/展开按钮
- 滚动条：4px 细滚动条，`overflow-x: hidden` 防止展开动画期间出现横向滚动条
- 主题对象结构：`{ name, bg, border, groupTitle, itemText, iconColor, activeBg, activeText, hoverBg }`
- hover/active 样式通过 CSS 变量 `--sidebar-hover-bg` / `--sidebar-active-bg` 驱动，在 scoped CSS 的 `:hover` 伪类中使用

### 5.6 Header（顶部导航）

- 高度：`h-16`（64px），`position: fixed; top: 0; left: 0; right: 0; z-index: 110`
- 背景白色，`border-bottom: 1px solid #e5e7eb`
- 左侧显示 SuSy logo（`https://susy.mdpi.com/build/img/icon/SUSY_logo.svg?56d587c`，90×36px）
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

**项目中所有图标必须且只能使用 Google Material Icons / Material Symbols，禁止使用 FontAwesome、Ant Design Icons 或任何其他图标库。**

### 8.1 Material Icons（`material-icons`）

用于**操作类图标**（按钮内、行内操作、导航）：

```html
<span class="material-icons" style="font-size: 20px;">menu</span>
<span class="material-icons" style="font-size: 20px;">keyboard_arrow_up</span>
<span class="material-icons" style="font-size: 20px;">qr_code</span>
```

### 8.2 Material Symbols Outlined（`material-symbols-outlined`）

用于**功能性/状态类图标**，支持可变字体参数：

```html
<span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
<!-- 填充变体 -->
<span class="material-symbols-outlined"
  style="font-size: 18px; font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;">
  bookmark
</span>
```

全局默认变体（已在 `index.html` 中设置）：
```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

常用图标速查：
- 操作：`edit` `save` `delete` `add` `upload` `download` `search`
- 导航：`menu` `menu_open` `chevron_right` `keyboard_arrow_up` `keyboard_arrow_down`
- 状态：`check_circle` `error` `warning` `info`
- 其他：`feedback` `palette` `qr_code` `fingerprint` `privacy_tip` `flip_to_front` `flip_to_back`

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

- History 模式（`createWebHistory`），URL 无 `#` 前缀
- 生产部署需配置服务器 fallback（所有路径返回 `index.html`）
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
7. 禁止在 `html/body/#app` 上设置 `overflow: hidden`（会截断 main 的滚动），只在 `body` 上设置以阻止 body 级滚动条
8. Sidebar flyout 菜单必须使用 `<Teleport to="body">` 渲染，避免被父级层叠上下文（`z-index: 100`）限制而被 Header 遮挡
9. 禁止使用 FontAwesome、lucide-vue-next、Ant Design Icons 或任何非 Google Material 的图标库

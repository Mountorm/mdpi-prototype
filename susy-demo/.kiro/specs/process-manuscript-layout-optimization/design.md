# 设计文档

## 简介

本文档描述了 SUSY 稿件管理系统中 Process Manuscript 页面布局和内容组织优化的技术设计方案。本次优化的核心目标是：

1. **调整布局比例**：将左右列比例从 1:1 调整为黄金比例 0.618:0.382
2. **重组内容结构**：左列显示稿件本身信息，右列显示系统流程信息
3. **保持现有功能**：所有交互功能、样式和响应式行为保持不变

本设计采用最小侵入性原则，仅修改布局相关的 CSS Grid 配置和 HTML 结构，不改变组件逻辑、数据流或交互行为。

## 架构

### 系统架构

Process Manuscript 页面是一个独立的 Vue 3 组件，采用 Composition API 编写。该组件的架构层次如下：

```
ProcessManuscript.vue
├── Template Layer (模板层)
│   ├── Tab Navigation (标签导航)
│   ├── Manuscript Overview Panel (稿件概览面板)
│   └── Manuscript Information Panel (稿件信息面板)
│       ├── Two-Column Layout Container (两列布局容器)
│       │   ├── Left Column (左列 - 稿件信息)
│       │   │   ├── Manuscript Metadata Card (稿件元数据卡片)
│       │   │   ├── Authors Card (作者卡片)
│       │   │   └── Files Card (文件卡片)
│       │   └── Right Column (右列 - 系统信息)
│       │       ├── Status & Process Card (状态与流程卡片)
│       │       ├── People & Roles Card (人员与角色卡片)
│       │       ├── Review & Quality Check Card (审稿与质量检查卡片)
│       │       ├── Production & Publishing Card (生产与出版卡片)
│       │       ├── Preprint Publishing Card (预印本发布卡片)
│       │       └── Recent Activity Card (最近活动卡片)
├── Script Layer (脚本层)
│   ├── Reactive Data (响应式数据)
│   ├── Options Data (选项数据)
│   └── Event Handlers (事件处理器)
└── Style Layer (样式层)
    ├── Layout Styles (布局样式)
    ├── Component Styles (组件样式)
    └── Utility Styles (工具样式)
```

### 技术栈

- **框架**: Vue 3 (Composition API)
- **UI 库**: Element Plus
- **样式**: Tailwind CSS + Scoped CSS
- **布局**: CSS Grid
- **响应式**: Media Queries

### 设计原则

1. **最小修改原则**: 仅修改布局相关代码，不触及业务逻辑
2. **向后兼容原则**: 保持所有现有功能和交互行为
3. **响应式优先原则**: 确保在所有屏幕尺寸下都有良好体验
4. **可维护性原则**: 使用清晰的命名和结构化的代码组织

## 组件和接口

### 组件结构

#### 1. ProcessManuscript.vue (主组件)

**职责**: 
- 管理稿件数据状态
- 渲染两列布局结构
- 处理用户交互事件

**依赖组件**:
- `InlineEditSelect.vue`: 内联编辑选择器组件

**Props**: 无 (使用内部响应式数据)

**Emits**: 无 (使用内部事件处理)

#### 2. InlineEditSelect.vue (子组件)

**职责**:
- 提供内联编辑功能
- 支持下拉选择和搜索过滤

**Props**:
```typescript
interface Props {
  modelValue: string
  options: Array<{ label: string; value: string }>
  filterable?: boolean
  editAriaLabel?: string
  saveAriaLabel?: string
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'save', value: string): void
}
```

### 数据模型

#### Manuscript Data Model

```typescript
interface ManuscriptData {
  // A1: 稿件元数据 (18 fields)
  manuscriptId: string
  doi: string | null
  status: string
  title: string
  labels: string[]
  articleType: string
  bigReview: boolean
  registeredReportsStage: string | null
  journal: string
  section: string
  specialIssue: string | null
  topic: string | null
  proceedingName: string | null
  fileType: string
  numberOfPages: number
  manuscriptSource: string
  authorContributions: string | null
  manuscriptOwner: string | null
  
  // A2: 作者信息 (5 fields)
  submittingAuthor: string
  authors: string
  blockedEmployeeWarning: string | null
  membershipMismatch: boolean
  authorRoles: string | null
  
  // B1: 状态流程 (9 fields)
  rejectionReason: string | null
  pendingRejectionReason: string | null
  withdrawalReason: string | null
  submissionDate: string
  submissionDays: number
  majorRevisionCount: number
  acceptedDate: string | null
  publishedDate: string | null
  readyPublish: boolean
  
  // B2: 人员角色 (8 fields)
  assignedEditor: string | null
  proofreadEditorSendProof: boolean
  assignedProofreadingEditor: string | null
  assignedPreDate: string | null
  assignedEnglishEditor: string | null
  watchers: string
  topicOverseer: string | null
  guestEditors: string | null
  
  // B3: 审稿与质量检查 (19 fields)
  openPeerReview: boolean
  recruitingReviewers: boolean
  rebuttalUpload: boolean
  qcPassed: boolean
  qcComment: string | null
  fundingInformation: string | null
  dataAvailabilityStatement: string | null
  ccdcDepositionNumber: string | null
  conflictOfInterests: string | null
  publishedElsewhere: boolean
  ethicsIssues: boolean
  harmfulTopics: boolean
  controversialTopics: boolean
  countryWatchlists: boolean
  publiclyAvailableDatasets: boolean
  torturedPhraseDetection: boolean
  additionalManuscriptAttributes: string | null
  prePeerReviewCheck: boolean
  submissionDays: number
  
  // B4: 生产与出版 (6 fields)
  proofigFirst: string | null
  proofigAfterRevision: string | null
  layoutCheck: string | null
  acceptanceCertificate: string | null
  englishServicesStatus: string | null
  englishPreEditStatus: string | null
  
  // B5: 预印本发布 (4 fields)
  preprintsPosted: boolean
  preprintsEmailSent: string | null
  preprintsUploaded: boolean
  preprintsCTAUpload: string | null
  
  // 历史记录
  history: Array<{ date: string; text: string }>
}
```

### 接口定义

#### Event Handlers

```typescript
// 内联编辑保存处理
function handleInlineSave(field: string, value: string): void

// 状态徽章样式获取
function getStatusBadgeClass(status: string): string
```

## 数据模型

### 布局配置模型

```typescript
interface LayoutConfig {
  // 黄金比例配置
  goldenRatio: {
    left: number    // 0.618
    right: number   // 0.382
  }
  
  // 断点配置
  breakpoints: {
    mobile: number      // < 1400px
    desktop: number     // >= 1400px
  }
  
  // 间距配置
  spacing: {
    columnGap: string   // 1.5rem
    cardGap: string     // 1rem (mb-4)
  }
}
```

### CSS Grid 配置

```css
/* 当前配置 (1:1 比例) */
.two-column-layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 1400px) {
  .two-column-layout {
    grid-template-columns: 1fr 1fr;  /* 需要修改 */
  }
}

/* 新配置 (0.618:0.382 黄金比例) */
.two-column-layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 1400px) {
  .two-column-layout {
    grid-template-columns: 1.618fr 1fr;  /* 黄金比例 */
  }
}
```

**比例计算说明**:
- 黄金比例 φ ≈ 1.618
- 左列:右列 = φ:1 = 1.618:1
- 归一化后: 左列 = 1.618/(1.618+1) ≈ 0.618, 右列 = 1/(1.618+1) ≈ 0.382


## 错误处理

### 布局降级策略

当浏览器不支持 CSS Grid 或出现渲染问题时，系统应采用以下降级策略：

1. **CSS Grid 不支持**: 自动降级为单列布局
2. **视口过窄**: 在 < 1400px 时强制使用单列布局
3. **内容溢出**: 使用 `overflow-wrap: break-word` 防止内容溢出

### 数据验证

虽然本次优化主要涉及布局，但仍需确保数据完整性：

```typescript
// 数据验证示例
function validateManuscriptData(data: ManuscriptData): boolean {
  // 必填字段验证
  if (!data.manuscriptId || !data.title || !data.status) {
    console.error('Missing required fields')
    return false
  }
  
  // 数组字段验证
  if (!Array.isArray(data.labels) || !Array.isArray(data.history)) {
    console.error('Invalid array fields')
    return false
  }
  
  return true
}
```

### 错误边界

```vue
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.error('Component error:', err, info)
  // 可以在这里添加错误上报逻辑
  return false // 阻止错误继续传播
})
</script>
```

## 测试策略

### 单元测试

**测试目标**: 验证组件逻辑和数据处理

**测试用例**:

1. **数据渲染测试**
   - 验证所有字段正确渲染
   - 验证条件渲染逻辑 (v-if)
   - 验证列表渲染 (v-for)

2. **事件处理测试**
   - 验证 `handleInlineSave` 正确处理保存事件
   - 验证 `getStatusBadgeClass` 返回正确的样式类

3. **响应式数据测试**
   - 验证数据变更触发视图更新
   - 验证 v-model 双向绑定

**测试框架**: Vitest + Vue Test Utils

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProcessManuscript from './ProcessManuscript.vue'

describe('ProcessManuscript.vue', () => {
  it('renders manuscript data correctly', () => {
    const wrapper = mount(ProcessManuscript)
    expect(wrapper.find('.manuscript-title').text()).toBeTruthy()
  })
  
  it('applies correct status badge class', () => {
    const wrapper = mount(ProcessManuscript)
    const badge = wrapper.find('.badge')
    expect(badge.classes()).toContain('badge-info')
  })
})
```

### 集成测试

**测试目标**: 验证组件与子组件的交互

**测试用例**:

1. **InlineEditSelect 集成测试**
   - 验证内联编辑组件正确接收 props
   - 验证保存事件正确触发父组件处理器
   - 验证数据双向绑定

2. **Element Plus 组件集成测试**
   - 验证 el-button 点击事件
   - 验证 el-switch 切换功能

```typescript
describe('ProcessManuscript Integration', () => {
  it('handles inline edit save event', async () => {
    const wrapper = mount(ProcessManuscript)
    const inlineEdit = wrapper.findComponent(InlineEditSelect)
    
    await inlineEdit.vm.$emit('save', 'new-value')
    // 验证数据更新
  })
})
```

### 视觉回归测试

**测试目标**: 确保布局修改不影响视觉呈现

**测试用例**:

1. **布局比例测试**
   - 验证桌面端左右列宽度比例为 0.618:0.382
   - 验证移动端单列布局
   - 验证列间距为 1.5rem

2. **响应式测试**
   - 验证 1400px 断点切换
   - 验证不同视口尺寸下的布局

3. **样式一致性测试**
   - 验证卡片样式保持不变
   - 验证字体、颜色、间距保持不变

**测试工具**: Playwright + Percy

```typescript
import { test, expect } from '@playwright/test'

test('golden ratio layout on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/process-manuscript')
  
  const leftColumn = await page.locator('.left-column').boundingBox()
  const rightColumn = await page.locator('.right-column').boundingBox()
  
  const ratio = leftColumn.width / rightColumn.width
  expect(ratio).toBeCloseTo(1.618, 1)
})

test('single column layout on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/process-manuscript')
  
  const layout = await page.locator('.two-column-layout')
  const columns = await layout.locator('> div').count()
  
  // 验证列是否垂直堆叠
  const leftColumn = await page.locator('.left-column').boundingBox()
  const rightColumn = await page.locator('.right-column').boundingBox()
  
  expect(leftColumn.y).toBeLessThan(rightColumn.y)
})
```

### 可访问性测试

**测试目标**: 确保符合 WCAG 2.1 AA 标准

**测试用例**:

1. **键盘导航测试**
   - 验证所有交互元素可通过 Tab 键访问
   - 验证焦点顺序符合逻辑

2. **屏幕阅读器测试**
   - 验证 ARIA 标签正确设置
   - 验证语义化 HTML 结构

3. **颜色对比度测试**
   - 验证文本与背景对比度 >= 4.5:1
   - 验证状态指示器颜色可区分

**测试工具**: axe-core

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/process-manuscript')
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  
  expect(accessibilityScanResults.violations).toEqual([])
})
```

### 性能测试

**测试目标**: 确保布局修改不影响性能

**测试用例**:

1. **渲染性能测试**
   - 验证首次渲染时间 < 1s
   - 验证布局重排次数最小化

2. **内存使用测试**
   - 验证组件挂载后内存使用合理
   - 验证无内存泄漏

**测试工具**: Lighthouse + Chrome DevTools

```typescript
test('performance metrics', async ({ page }) => {
  await page.goto('/process-manuscript')
  
  const metrics = await page.evaluate(() => {
    const paint = performance.getEntriesByType('paint')
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')
    return {
      fcp: fcp?.startTime
    }
  })
  
  expect(metrics.fcp).toBeLessThan(1000) // < 1s
})
```

### 测试覆盖率目标

- **单元测试覆盖率**: >= 80%
- **集成测试覆盖率**: >= 70%
- **视觉回归测试**: 100% 关键页面
- **可访问性测试**: 0 violations
- **性能测试**: 符合 Core Web Vitals 标准


## 实现细节

### 修改清单

本次优化需要修改的文件：

1. **src/components/ProcessManuscript.vue**
   - 修改 HTML 结构（卡片重组）
   - 修改 CSS Grid 配置（黄金比例）
   - 保持 JavaScript 逻辑不变

### HTML 结构修改

#### 当前结构

```vue
<template>
  <div class="two-column-layout">
    <!-- 左列 -->
    <div class="left-column">
      <div class="inner-section">A1: 元数据</div>
      <div class="inner-section">A2: 作者</div>
      <div class="inner-section">A3: 文件</div>
    </div>
    
    <!-- 右列 -->
    <div class="right-column">
      <div class="inner-section">B1: 状态流程</div>
      <div class="inner-section">B2: 人员角色</div>
      <div class="inner-section">B3: 审稿检查</div>
      <div class="inner-section">B4: 生产出版</div>
      <div class="inner-section">B5: 预印本</div>
      <div class="inner-section">历史记录</div>
    </div>
  </div>
</template>
```

#### 修改说明

**无需修改 HTML 结构**，因为当前结构已经符合需求：
- 左列包含：稿件元数据、作者、文件（稿件本身信息）
- 右列包含：状态流程、人员角色、审稿检查、生产出版、预印本、历史记录（系统流程信息）

### CSS 样式修改

#### 修改 1: 调整 Grid 列比例

**文件**: `src/components/ProcessManuscript.vue` (style 部分)

**当前代码**:
```css
@media (min-width: 1400px) {
  .two-column-layout {
    grid-template-columns: 1fr 1fr;
  }
}
```

**修改后代码**:
```css
@media (min-width: 1400px) {
  .two-column-layout {
    grid-template-columns: 1.618fr 1fr;
  }
}
```

**修改原因**: 
- 将 1:1 比例改为黄金比例 1.618:1
- 左列占 61.8%，右列占 38.2%

#### 修改 2: 确保间距一致

**当前代码**:
```css
.two-column-layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}
```

**验证**: 间距已经是 1.5rem，符合需求，无需修改

#### 修改 3: 确保响应式断点

**当前代码**:
```css
@media (min-width: 1400px) {
  .two-column-layout {
    grid-template-columns: 1fr 1fr;
  }
}
```

**验证**: 断点已经是 1400px，符合需求，仅需修改列比例

### 完整的样式修改方案

```css
/* 两列布局 */
.two-column-layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

/* 桌面端：黄金比例布局 */
@media (min-width: 1400px) {
  .two-column-layout {
    grid-template-columns: 1.618fr 1fr;  /* 修改此行 */
  }
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
}
```

### 验证清单

修改完成后，需要验证以下内容：

#### 功能验证

- [ ] 所有字段正确显示
- [ ] 内联编辑功能正常工作
- [ ] 文件下载按钮正常工作
- [ ] 切换开关正常工作
- [ ] 所有按钮点击事件正常触发

#### 布局验证

- [ ] 桌面端（>= 1400px）左右列比例为 0.618:0.382
- [ ] 移动端（< 1400px）单列布局
- [ ] 列间距为 1.5rem
- [ ] 卡片间距为 1rem (mb-4)

#### 样式验证

- [ ] 卡片背景色保持 #f9fafb
- [ ] 卡片圆角保持 8px
- [ ] 卡片阴影保持不变
- [ ] 字体大小和颜色保持不变
- [ ] 徽章样式保持不变

#### 响应式验证

- [ ] 在 1399px 时显示单列
- [ ] 在 1400px 时显示两列
- [ ] 在 1920px 时布局正常
- [ ] 在 2560px 时布局正常

#### 可访问性验证

- [ ] 键盘导航正常
- [ ] 屏幕阅读器可正确读取
- [ ] ARIA 标签正确
- [ ] 颜色对比度符合标准

### 实现步骤

1. **备份当前文件**
   ```bash
   cp src/components/ProcessManuscript.vue src/components/ProcessManuscript.vue.backup
   ```

2. **修改 CSS Grid 配置**
   - 打开 `src/components/ProcessManuscript.vue`
   - 找到 `@media (min-width: 1400px)` 部分
   - 将 `grid-template-columns: 1fr 1fr;` 改为 `grid-template-columns: 1.618fr 1fr;`

3. **保存文件**

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **浏览器测试**
   - 打开 Process Manuscript 页面
   - 调整浏览器窗口大小，验证响应式行为
   - 测试所有交互功能

6. **使用开发者工具验证**
   ```javascript
   // 在浏览器控制台执行
   const leftColumn = document.querySelector('.left-column')
   const rightColumn = document.querySelector('.right-column')
   const leftWidth = leftColumn.offsetWidth
   const rightWidth = rightColumn.offsetWidth
   const ratio = leftWidth / rightWidth
   console.log('Ratio:', ratio) // 应该接近 1.618
   ```

7. **运行测试套件**
   ```bash
   npm run test
   npm run test:e2e
   ```

8. **视觉回归测试**
   ```bash
   npm run test:visual
   ```

9. **可访问性测试**
   ```bash
   npm run test:a11y
   ```

10. **提交代码**
    ```bash
    git add src/components/ProcessManuscript.vue
    git commit -m "feat: adjust Process Manuscript layout to golden ratio (0.618:0.382)"
    ```

### 回滚方案

如果修改后出现问题，可以快速回滚：

```bash
# 方案 1: 使用备份文件
cp src/components/ProcessManuscript.vue.backup src/components/ProcessManuscript.vue

# 方案 2: 使用 Git 回滚
git checkout HEAD -- src/components/ProcessManuscript.vue

# 方案 3: 手动修改
# 将 grid-template-columns: 1.618fr 1fr; 改回 grid-template-columns: 1fr 1fr;
```

### 性能影响分析

本次修改对性能的影响：

1. **渲染性能**: 无影响
   - 仅修改 CSS Grid 比例
   - 不增加 DOM 节点
   - 不增加 JavaScript 计算

2. **布局重排**: 最小影响
   - 仅在窗口调整大小时触发
   - CSS Grid 原生优化

3. **内存使用**: 无影响
   - 不增加组件实例
   - 不增加事件监听器

4. **包大小**: 无影响
   - 仅修改 CSS 数值
   - 不增加代码行数

### 浏览器兼容性

CSS Grid 浏览器支持情况：

- ✅ Chrome >= 57
- ✅ Firefox >= 52
- ✅ Safari >= 10.1
- ✅ Edge >= 16
- ❌ IE 11 (需要降级方案)

**降级方案** (如需支持 IE 11):

```css
.two-column-layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

/* 现代浏览器 */
@supports (display: grid) {
  @media (min-width: 1400px) {
    .two-column-layout {
      grid-template-columns: 1.618fr 1fr;
    }
  }
}

/* IE 11 降级 */
@media (min-width: 1400px) {
  .two-column-layout {
    display: flex;
    gap: 1.5rem;
  }
  
  .left-column {
    flex: 1.618;
  }
  
  .right-column {
    flex: 1;
  }
}
```

### 潜在风险和缓解措施

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 内容溢出 | 右列内容可能因宽度减小而溢出 | 中 | 添加 `overflow-wrap: break-word` |
| 视觉不平衡 | 用户可能不习惯新比例 | 低 | 提供用户反馈渠道 |
| 响应式断点问题 | 某些屏幕尺寸可能显示异常 | 低 | 全面测试常见分辨率 |
| 浏览器兼容性 | 旧浏览器可能不支持 | 低 | 提供降级方案 |

### 监控和度量

部署后需要监控的指标：

1. **用户行为指标**
   - 页面停留时间
   - 交互率
   - 跳出率

2. **性能指标**
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)

3. **错误监控**
   - JavaScript 错误率
   - 渲染错误率
   - 浏览器兼容性问题

4. **用户反馈**
   - 用户满意度调查
   - 支持工单数量
   - 功能使用率

### 文档更新

需要更新的文档：

1. **组件文档**
   - 更新布局说明
   - 添加黄金比例说明
   - 更新截图

2. **样式指南**
   - 记录新的布局比例
   - 更新设计规范

3. **变更日志**
   - 记录本次修改
   - 说明修改原因和影响

## 总结

本设计文档详细描述了 Process Manuscript 页面布局优化的技术方案。核心修改非常简单：

**唯一需要修改的代码**:
```css
/* 将此行 */
grid-template-columns: 1fr 1fr;

/* 改为 */
grid-template-columns: 1.618fr 1fr;
```

这个最小化的修改将实现以下目标：
1. ✅ 左右列比例调整为黄金比例 0.618:0.382
2. ✅ 保持所有现有功能和交互
3. ✅ 保持所有样式和视觉效果
4. ✅ 保持响应式行为

修改风险极低，影响范围明确，易于测试和回滚。


# AcE Generate 页——检测结果呈现设计

日期：2026-08-13
状态：已与用户逐项确认

## 背景

generate 页（AE Screen 1）当前所有检查项都是 AE 手动填写的：数字项填数字、判断项选 Fine/Not sure。真实系统中检测工具（Journal Finder、iThenticate、AI 检测、图像检测、引用分析等）会产出复杂结构的结果。本次重构目标：**将检测结果以原生形态呈现到 generate 页**，AE 的角色从"录入员"变为"验证者"。

## 核心原则（本次讨论确立）

1. **检测结果全部系统拉取**，AE 只查看，不需要手动录入/制造。
2. **判定与 comment 以 config 配置为准**，generate 页不硬编码任何判定逻辑。
3. **comment 对任何 item 都可添加**（可选）；flag 为 warning 时 comment 必填。
4. **自动判定的项，AE 可覆盖修改**判定结果。
5. 移除 Retractions & Corrections 检查项（该问题在更早流程处理，不流到 AcEd 阶段）。检查项由 12 项减为 **11 项**。

## 数据模型

### 模板与结果分离
- `src/mock/ace.js`：`checklistItems` 定义检查项**结构**（title、category、required、flag 配置、rule）。
- 新增 `src/mock/detectionResults.js`：按**稿件 ID** 关联的检测结果对象 `{ [manuscriptId]: { [itemId]: result } }`。不同稿件结果不同，贴近真实。

### 检测结果结构（按项）
| item | result 结构 |
|---|---|
| Word/Figures/Tables Count | `{ value: number }` |
| Journal / Special Issue Scope Match | `{ status: 'match' \| 'mismatch' \| 'processing' \| 'interface_error' \| 'response_error' }` |
| Article Type | `{ articleType: string }` |
| iThenticate | `{ percent: number, reportUrl: string }` |
| AI Generated Content | `{ green: number, yellow: number, red: number }`（合计 100） |
| Image Manipulation | `{ alert: boolean, reportUrl: string }` |
| Out of Scope References | `{ refs: Array<{ number: number, citation: string }> }` |
| Unverifiable References | `{ refs: Array<{ number: number, citation: string }>, risk: 'low'\|'medium'\|'high' }` |

### 判定逻辑（来自 config）
- **flag 两态**：Passed / Warning。
- **Journal/SI Scope**：result.status 为 match → Passed；其余（mismatch / processing / interface_error / response_error）→ Warning。
- **Unverifiable**：按 rule.segments 三段自动判定（1-2 passed / 3-5 warning / ≥6 warning）。
- **其余判断项**：config `flagMode: manual`，AE 手动选 Fine/Not sure。
- **自动判定的项 AE 可覆盖**：auto 项展示自动 flag，同时提供下拉允许 AE 改判。

## generate 页 UI（每项统一布局）

展开后分两区：
- **上半区：检测结果区（系统拉取，只读）**，按项类型渲染：
  - 数字：`[8,542]` 可编辑输入框
  - Scope：三态徽标（符合绿 / 不符合橙 / 处理中·接口错误·响应错误橙+具体状态文本）
  - Article Type：稿件类型文本
  - iThenticate：`24%` + `[View full report ↗]`
  - AI：同心圆三色占比 + 图例（绿/黄/红各标数值）
  - Image Manipulation：`⚠ Warning alert` + `[View report ↗]`
  - 引用类（Out of Scope / Unverifiable）：引用列表（`#编号 + 文献`，可收起），Unverifiable 列表即"问题示例"，AE 不再手填
- **下半区：AE 判定**——Fine/Not sure（manual）或自动 flag + 覆盖下拉（auto）；下面恒有 comment 框。

其余交互沿用既有实现：Required 星号、Optional 可勾选、分类折叠、warning 必填 comment、Generate 校验 + summary 面板。

## 实施范围

| 文件 | 改动 |
|---|---|
| `src/mock/ace.js` | 移除 Retractions & Corrections（12→11 项） |
| `src/mock/detectionResults.js` | 新增：按稿件关联的检测结果 mock |
| `src/views/GenerateView.vue` | 检测结果区渲染、auto 覆盖下拉、按稿件拉取结果 |
| `src/views/AceChecklist.vue` | 无改动（判定逻辑已在 config 表达） |

## 待确认的开放项

- AI 同心圆的实现方式（SVG 自绘 vs 组件）——样式自定时实现者自定。
- Journal/SI Scope 的"处理中等"状态是否影响校验（仍是 warning 必填 comment，不影响）。

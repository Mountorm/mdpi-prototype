# AcE 报告页 UAT 调研与方案

日期：2026-08-14
状态：**待产品经理确认后实施**

## 背景
对 AcE 报告页（AcEd 视角、只读、PDF 优先）做了一次完整的 UAT 调研：先生成逼真的静态快照，再请 5 位不同画像的学术编辑（AcEd）审阅并回答问卷，由产品经理和 UX 设计师分别出方案、PM 汇总、UX 评审迭代，最终达成一致的改造方案。

**调研产物**：静态快照 `docs/uat/report-preview.html`（真实业务场景 mock，含 MDPI 品牌、稿件上下文、两版分组、完整检测结果、processing 项、AE 留言、摘要+详情交互、打印）。

## 参与方与画像
- **PM ×1**、**UX 设计师 ×1**、**学术编辑 ×5**（不同画像以覆盖多样性）：
  1. 资深生物传感器教授，诚信导向，读得快
  2. 非母语计算生物学家，新流程，爱扫读
  3. 方法严谨的材料学教授，不信任折叠细节、重证据
  4. 临床教授，常在小屏/打印件上审稿，对 UI 挑剔
  5. 新晋环境科学副教授，希望系统教他"什么重要、怎么办"

## 5 位编辑的共识问题（跨问卷高频）
1. **计数对不上（5/5）**：顶部"4 warning"与 5 个 Warning 徽章不符——Out of Scope References 带 Warning 徽章却放在中性的"Reference data"组。
2. **Pending 被误标 Warning（4/5）**：SI Scope 结果未出却显示橙色 Warning 并被计入告警。
3. **By category 视图丢信息（4/5）**：切换后 Details 按钮、多数 AE note 消失。
4. **证据被折叠（3/5）+ 打印丢失（1 强）**：参考清单、AI 图默认折叠；打印时更是全折叠。AI 的 Details 只有占比图，没有标记的句子/段落（2 位编辑要求）。
5. **死链（3/5）**："View report" 点了没反应——恰好是最重的诚信项（Figure 3 图像告警）。
6. **术语歧义（4/5）**："AE note"被误读为"学术编辑本人的备注"（实际是助理编辑写的）；"Uncertain"未定义；Out of Scope vs Unverifiable 不分；"Reference data"组名含糊。
7. **无"下一步"引导（2/5）**：新手编辑看完不知道做什么；页面无 Proceed/Reject 入口（但决策本就在单独页面）。
8. 扫描易用性平均 4/5（良好）；分组偏好 "By attention" 4/5（已是默认）。

## 最终方案（PM 汇总 + UX 评审 ACCEPT + 微调后定稿）

**Pending 跨页规则（贯穿 1-3 项）**：两页上，只要 `isResultUnavailable(item, result)` 为真，该行就以 **Pending** 呈现——灰色、不算告警、不要求 AE 判定或留言。generate 页不得把此类项预置为 warning。Pending 是"状态"，不是"缺陷"。

| # | 优先级 | 改动 | 文件 |
|---|---|---|---|
| 1 | P0 | **generate 页停止强标 pending 项为 warning**；pending 项跳过判定/留言校验、隐藏 Fine/Not sure 单选与 comment，行头显示灰色 Pending 徽章 | GenerateView.vue, itemKinds.js |
| 2 | P0 | **报告页新增 Pending 分组**（Between Attention & Passed），组头注明"结果未出，完成后显示"；无 banner，只有 pill+组+徽章三处；scopeStatusText 的 processing/errors 改灰色 pending 音调 | ReportView.vue, itemKinds.js, DetectionResult.vue |
| 3 | P0 | **行结构重构 + 顶层只读提示条**：title+badge → 一行 caption（item.description）→ 检测结果块 → 系统引导行（仅 warning，info 图标，放结果块内）→ "Note from the Assistant Editor"（从"AE note:"改名）。新增 warnings-only 的 resultGuidance 助手 | ReportView.vue, DetectionResult.vue, itemKinds.js |
| 4 | P0 | **移除报告页"Edit checklist"按钮**（AE 走 Generate 修订），只读提示条才诚实 | ReportView.vue |
| 5 | P0 | **"Report unavailable"按结果可用性门控**——只在"有结果但缺报告 URL"时显示，永不出现在 pending 行 | DetectionResult.vue |
| 6 | P1 | **sticky 汇总 pills 仅屏幕生效**；打印时强制展开的详情行允许跨页拆分（避免大空白页） | ReportView.vue, DetectionResult.vue |
| 7 | P1 | **术语**："Reference data" → "Manuscript numbers/metrics"；"AE note" → "Note from the Assistant Editor"；AI 图例下加 "Uncertain" 定义 | ReportView.vue, DetectionResult.vue, ace.js |
| 8 | P1 | **计数不误导**：meta 增加灰色"pending"pill；category 头显示 "N warning · M passed" 含 pending 或说明信息项排除；generate 的进度补 "· N pending" | ReportView.vue, GenerateView.vue |
| 9 | P1 | **共享 pending 管道**：scopeStatusText 加 pending 音调、isResultUnavailable 为唯一真相源、resultGuidance 助手；mock 补一个 interface_error 变体演示 | itemKinds.js, detectionResults.js |

## 延期的项（明确不做）
- AI 标记句子/段落文本：需要上游检测器产出新的数据字段，超出"仅呈现"约束。
- 决策页链接/CTA：原型中决策路由还不存在；用只读提示条文案代替。
- 卡住的 Processing 项"重新检测"：后端行为，超出范围；Pending 已诚实呈现。
- 稿件-编辑专业不匹配提示：mock 数据问题，非呈现层改动。
- 报告页的 Proceed/Reject 动作：报告必须保持只读（产品约束）。
- 按编辑记忆分组偏好：已默认 By attention，原型不值得做状态持久化。

## 待你确认的点
1. 是否认可这份最终方案（P0 四项 + P1 五项）？
2. P0-3 的"系统引导行"文案（resultGuidance）会按项写一条"为什么重要 + 我能做什么"——确认要让 report 页带这类引导文案，还是保持更简？（UX 已建议放、且与 AE note 视觉区分）
3. 确认后我按方案实施（仅样式与交互，不动数据结构）。

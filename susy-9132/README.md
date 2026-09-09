# Technical Precheck Report 配置页（Vue3 + Element Plus 重构版）

Susy 系统中"Technical Precheck Report"的模板配置页原型。

## 运行方式

```bash
npm install        # 安装依赖
npm run dev        # 启动开发环境（默认 http://localhost:5173）
npm run build      # 构建产物到 dist/
```

## 页面定位

公司管理员在此配置 Technical Precheck Report（技术预检查报告）的检查项模板。前台"生成报告"页在系统其他模块，不属于本原型范围。

## 新流程说明（相对原快照的改动）

- 每条检查项含字段：分类、标题、描述、**报告必选**、**标记方式**（无需标记 / 需要标记）、**判定方式**（编辑手动选择 / 自动判定）、**自动化规则**（数值阈值，如"近 5 年引用占比 < 40% → warning"；或布尔条件，如"缺失 ORCID → warning"）、状态（In Use / Draft）
- 表格新增 **Required** 与 **Flag** 列（Attach File / Internal Use 两个旧配置已废弃）
- 新增条目在代码层维护（mock/ace.js），前端已移除 **Add New**；Draft（草稿）条目不生效，可在表格中切换为 In Use
- **编辑**：点击行内编辑图标打开编辑弹窗，复用表单并回显
- **删除**：带二次确认，避免误删生效配置
- **分类**：Edit 弹窗分类下拉支持搜索与内联新增（输入新分类回车即创建）；分类改名/删除未做（删除已引用分类会造成悬空，属原型简化）
- **Pilot Journals**：全局试点期刊数据源，勾选后保存，作为后续"按期刊查看启用了哪些检查项"的数据基础

## 目录结构

```
src/
  App.vue                 # 布局外壳（顶栏 / 侧边栏 / 面包屑，含侧边栏折叠交互）
  views/AceChecklist.vue  # Technical Precheck Report 配置页
  components/MdIcon.vue   # Google Material 图标（内联 SVG）
  mock/ace.js             # Mock 数据（检查项 / 期刊 / 分类）
  styles/                 # theme.css 主题变量 / layout.css 布局样式 / ace-checklist.css 表格弹窗样式
  router/index.js         # 单一路由
```

## 备注

- 主色 #0156ce（Element Plus 默认 #409eff 已全局覆盖为 SuSy 蓝）
- 图标使用本地 Material Symbols 字体，离线可用
- 重构目标：除技术栈改为 Vue3 + Element Plus 外，用户侧样式与交互与原快照一致

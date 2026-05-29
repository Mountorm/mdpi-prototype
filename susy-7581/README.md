# SuSy Prototype

前端原型，纯静态 HTML/CSS/JS，无构建工具。

---

## 文件结构

### 页面

| 文件 | 说明 |
|------|------|
| `index.html` | 主页面，包含 navbar 和全局搜索面板 |

### 样式

| 文件 | 说明 |
|------|------|
| `style.css` | 全局样式，包含 navbar、搜索面板、卡片、骨架屏、modal 等所有组件样式 |

### 搜索系统

搜索面板的逻辑分层设计，各模块职责独立：

| 文件 | 说明 |
|------|------|
| `search-new.js` | 搜索主控制器，管理状态、分层搜索调度（primary/secondary）、事件绑定 |
| `search-ui.js` | UI 渲染层，负责结果列表、骨架屏、filter chips、recent 列表、modal 的渲染 |
| `search-utils.js` | 工具函数，包含输入类型判断（email/IP/numeric/hyphen-id）、格式化、HTML 转义等 |

### 搜索数据源

每个数据源是独立的 class，实现统一接口（`canHandle`、`buildResults`、`getCommandDefinition(s)`、`getActionHandler(s)`）：

| 文件 | 触发条件 | 说明 |
|------|----------|------|
| `user-search.js` | 输入合法 email 地址 | 查找用户，返回用户卡片 |
| `manuscript-search.js` | 输入纯数字 ID 或 `journal-id` 格式（如 `energies-130901`） | 返回 Editorial Office 和 English Office 两个入口 |
| `invoice-search.js` | 输入纯数字 ID 或 `journal-id` 格式 | 查找发票 |
| `ip-search.js` | 输入 IPv4 或 IPv6 地址 | 查找 IP 信息 |
| `sponsorship-search.js` | 输入纯数字 | 查找赞助记录 |

### 静态资源

| 文件 | 说明 |
|------|------|
| `404.png` | 错误页插图 |

---

## 搜索面板工作原理

输入内容后，`search-new.js` 会根据输入格式自动判断类型并路由到对应数据源：

```
email        → user-search 
IPv4/IPv6    → ip-search 
纯数字       → manuscript/invoice + sponsorship 
journal-id   → manuscript/invoice 
```

。Recent 列表记录最近 5 条操作。

---

## 本地运行

直接用浏览器打开 `index.html`，或通过任意静态文件服务器：

```bash
npx serve .
# 或
python -m http.server 8080
```

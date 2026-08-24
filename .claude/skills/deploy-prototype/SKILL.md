---
name: deploy-prototype
description: 将 mdpi-prototype 仓库中的 SuSy 原型上线或更新到 Cloudflare（Pages + Worker）。当用户要求"上线/部署/发布/托管某个 susy-XXXX 原型"、"新建一个原型项目并部署到 CF"、"配置 xxx.mdpi.cloud 自定义域名"、"更新 index.html 导航页"、"配置监视目录 / 构建监视路径 / build watch paths"、"部署 Cloudflare Worker"、"推送原型到 GitHub 触发自动构建"、"验证某个原型是否已上线"时触发。即使只是提到需求编号（如 susy-9132）、mdpi.cloud 域名或"原型托管"也应考虑使用本 skill。部署和发布本身不是本 skill 的唯一目的——它还负责新需求上线时的一整套流程（建目录→构建→建项目→配域名→配监视路径→更新导航页→推送→验证）。
---

# SuSy 原型 Cloudflare 部署

本 skill 管理 [Mountorm/mdpi-prototype](https://github.com/Mountorm/mdpi-prototype) 仓库中原型的上线与更新。核心原则：**一个需求 = 仓库里一个子目录 = 一个 Cloudflare 项目 = 一个 `xxx.mdpi.cloud` 域名**。仓库是单仓库多子项目（monorepo），Cloudflare 端通过"每项目指定根目录（root directory）"来区分各子项目。

## 仓库结构

```
mdpi-prototype/
├── index.html          # 导航页：列出所有已上线原型（必须用 https 链接）
├── susy-XXXX/          # 每个需求一个子目录（纯静态 / Vite+Vue / VueCLI / Worker）
├── table-designer/     # 特殊子项目（Vite，未列入导航页）
└── .claude/skills/deploy-prototype/   # 本 skill
```

## 前置条件（不满足先处理）

1. **`CLOUDFLARE_API_TOKEN`**：权限 = Account 范围 `Cloudflare Pages:Edit`、`Workers Scripts:Edit`、`Workers Routes:Edit` + Zone 范围（限 `mdpi.cloud`）`DNS:Edit`。从环境变量或 `.claude/settings.local.json` 读取；不要从对话里硬编码密钥。
2. **`CLOUDFLARE_ACCOUNT_ID`**：`wrangler` 部署 Worker 时需要。若未设置，用 `GET https://api.cloudflare.com/client/v4/accounts` 取第一个账户 id（记得 `result[0].id`）。
3. **Git 仓库已连接 Cloudflare**：Cloudflare GitHub App 已安装且本仓库已授权（现有 13 个项目已验证）。新项目创建时直接复用该连接，无需重新授权。
4. **`mdpi.cloud` zone** 在同一个 Cloudflare 账户内（自定义域名会自动创建 DNS 记录）。

## 两种轨道（先判断子目录类型）

- **Pages 轨道**：纯静态 / Vite / VueCLI —— 用 git 集成自动构建。
- **Worker 轨道**：子目录含 `wrangler.toml` —— 用 `wrangler deploy`，走另一条链路，**不**受 Pages 根目录/监视路径约束。

按 [references/project-types.md](references/project-types.md) 检测类型，按 [references/api-commands.md](references/api-commands.md) 执行命令，遇到限制先读 [references/risks.md](references/risks.md)。

## 流程 A：新需求原型上线（完整全流程）

对每个新需求，按以下顺序执行。**任何一步失败都停下来，先看 [references/risks.md](references/risks.md) 的排查清单，不要盲目重试。**

### 步骤 1 · 确认并创建子目录
- 需求编号 → 子目录名 `susy-<编号>`（如 susy-9132），目录名即 Pages 项目名、域名前缀。
- 若目录已存在（用户只是要上线已有原型），跳过本步骤直接走"流程 B"。

### 步骤 2 · 本地构建验证（很重要，别跳过）
在子目录内安装依赖并构建，确保本地能构建成功，避免 CF 上构建失败后反复排查：
- 有 `package.json`：`npm install`（或 `npm ci`，有 lockfile 时）→ `npm run build`
- 纯静态：无需构建
- 构建产物目录按类型判断（见 project-types.md）

### 步骤 3 · 用 API 创建 Pages 项目
创建项目时一并设置 git 连接、根目录、构建命令、输出目录。**构建命令和输出目录必须与本地验证结果一致**。命令模板见 api-commands.md。创建成功后 CF 会用当前 `main` 分支触发首次构建。

### 步骤 4 · 添加自定义域名
`POST .../pages/projects/{project_name}/domains`，域名 = `{子目录名}.mdpi.cloud`。**注意：API 添加域名不会自动创建 DNS 记录（实测确认），还需显式创建 CNAME `{子目录名}.mdpi.cloud → {子目录名}.pages.dev`**，命令见 api-commands.md。若提示域名已有 DNS 记录或 zone 不存在，按 risks.md 处理。

### 步骤 5 · 配置监视路径（Build watch paths）
用 API 写入 `source.config.path_includes = ["{子目录名}/*"]`（`*` 会跨 `/` 匹配子目录内所有文件）。**创建项目时可在 `source.config` 里一并写入**，或事后用 PATCH 更新。效果：只有该子目录内有变更才触发构建，其他项目的改动不会触发本项目重建。命令见 api-commands.md。

### 步骤 6 · 更新 index.html 导航页
- 新增卡片：`<a class="card" href="https://{子目录名}.mdpi.cloud/"><span class="name">SUSY-{编号}</span><span class="domain">{子目录名}.mdpi.cloud</span></a>`
- **链接必须用 `https://`**（仓库历史曾用 `http://`，已废弃）。
- 按需求编号数字序插入卡片，保持列表有序。SUSY-icon / SUSY-demo / SUSY-template 等非数字命名放在数字项之后。

### 步骤 7 · 提交并推送，触发自动构建
只提交该子目录 + index.html。`git add {子目录名} index.html && git commit -m "..." && git push`。监视路径保证只有本项目被重建。

### 步骤 8 · 验证上线
按 api-commands.md 的验证清单检查：域名可访问、内容正确、构建成功。验证通过后向用户汇报域名与状态。

## 流程 B：更新已有原型

1. 只在子目录内改文件（不改其他项目、不改 index.html 之外的内容）。
2. 本地如需验证则构建（改纯静态 HTML 无需构建）。
3. `git add {子目录名} && git commit && git push`。
4. 用监视路径判定：本目录有改动 → CF 自动构建；无改动 → 跳过（属预期，不是失败）。
5. 如需验证，`curl -I https://{子目录名}.mdpi.cloud` 应返回 200。

## 流程 C：Worker 部署

子目录含 `wrangler.toml`（如 susy-8182 mock-api-service）：
1. 在子目录内 `npx wrangler login` 或确保 `CLOUDFLARE_API_TOKEN` 已配置。
2. `npx wrangler deploy`（默认读子目录 `wrangler.toml`）。
3. 自定义域名：在 `wrangler.toml` 的 `routes` 里加 `{ pattern = "{子目录名}.mdpi.cloud", zone_name = "mdpi.cloud", custom_domain = true }` 后重新 deploy；或在 dashboard 的 Worker → Settings → Domains & Routes 里添加。**注意 Worker 名（wrangler.toml 的 `name`）与目录名、域名可以不同**。
4. 验证：`curl -I https://{子目录名}.mdpi.cloud`。

## 汇报格式

完成后用固定格式汇报，方便产品经理核对：
```
已上线：<域名>
类型：<静态/Vite/VueCLI/Worker>
构建：<成功/跳过/失败——失败给原因>
导航页：<已加入 index.html / 无变化>
监视路径：<已配置（Include: {子目录名}/*）/ 待配置>
```

## 一致性原则

- 复用仓库已有的 `index.html` 卡片样式，不重写导航页结构。
- 复用已有子项目的构建命令风格，不发明新命令。
- 所有域名统一 `https://`、统一 `{子目录名}.mdpi.cloud` 模式。

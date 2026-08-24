# 风险与限制

以下约束影响部署方式，遇到对应场景先读这里再行动。

## 硬限制

### 1. 每仓库最多 5 个 Pages 项目（monorepo）
- Cloudflare Pages monorepo 模式官方限制**每个仓库最多 5 个 Pages 项目**，需 Build System V2 或更高。
- 当前仓库已有 13 个项目，**已超过限制但能正常使用**（限制为可提额的软上限，或按账户配置放行）。
- **新增项目时如果 API 返回与"项目数量/仓库"相关的限制错误**：提醒用户到 dashboard 提交 Limit Increase Request，或联系账户团队提额（社区有提到可提到 50）。
- 这不会影响 Worker 轨道。

### 2. Build watch paths 绕行条件（强制构建）
即使监视路径配置正确，以下情况**必定触发构建**，属预期行为不是故障：
- push 事件包含 **0 个文件变更**（空 push）
- push 事件包含 **≥3000 个文件变更** 或 **≥20 个 commits**

### 3. 监视路径可通过 API 配置（`source.config.path_includes`/`path_excludes`）
- 字段位于 Pages 项目 API 的 `source.config` 下（官方文档偏 dashboard 展示，但 API schema 支持），创建时一并写入或事后 PATCH。dashboard 路径：Settings → Build → Build watch paths。
- 未配置时默认 Include `*`（全仓库变更都会触发本项目构建）——这正是要避免的"全盘重建"，**所以每个新项目都必须写入监视路径**。

### 4. 域名约束
- 自定义域名只能在**账户内已存在的 zone** 上添加；`mdpi.cloud` 必须在同一账户，且 zone 需为 Cloudflare 权威 DNS。
- **API 添加域名不会自动创建 DNS 记录**（实测确认），域名会停在 `pending`；必须显式创建 CNAME `{目录名}.mdpi.cloud → {目录名}.pages.dev`（proxied=true）。见 api-commands.md。
- 域名若已有 CNAME 记录（重复添加）会冲突，需要先处理已有记录。
- 项目名/目录名决定域名：`{目录名}.mdpi.cloud`，命名要一致。

### 5. index.html 链接必须 https
- 导航页历史遗留 `http://` 链接，已废弃。新卡片一律 `https://`，避免混合内容。

## 构建相关风险

### Node 版本不匹配
- Pages Build System V2 默认 Node.js 22。旧 VueCLI 项目（如 susy-8004 依赖 Vue 2）可能不兼容 Node 22。
- 若构建失败且报 Node 相关错误：在项目 Settings → Environment variables 加 `NODE_VERSION`（如 `14` 或 `16`）后重试。

### 构建超时 / 依赖安装
- Pages 构建上限 20 分钟。本地 `npm install` 已装过则 CF 上仍需重新装依赖，大依赖项目可能接近上限。
- 首次构建失败先看 Build log，别盲目重试。

### 输出目录相对仓库根
- Pages 的 `destination_dir` 是**相对仓库根**的路径，不是相对 build command 工作目录。设了 `root_dir = susy-XXXX` 时，通常 `destination_dir = dist`（相对 root_dir 的 dist 会由 CF 换算，遇到 404 检查这里）。

## 安全

- `CLOUDFLARE_API_TOKEN` 权限：Account 级 `Cloudflare Pages:Edit` + `Workers Scripts:Edit` + `Workers Routes:Edit`，Zone 级（限 mdpi.cloud）`DNS:Edit`。**不要**给 All zones 权限。
- 不要把 token 写进对话、脚本或提交 git。wrangler 读 `CLOUDFLARE_API_TOKEN` 环境变量。

## 排查清单（失败时按序检查）

1. **API 返回错误**：读 `errors` 数组。403/401 → token 权限不足（缺 Pages/Workers/Zone 权限）。
2. **项目创建成功但构建失败**：`deployments` 接口看 `latest_stage` 与构建日志 → Node 版本、依赖安装、构建命令。
3. **域名加不上**：zone 不在账户内 / 已有 CNAME / 域名拼写。
4. **页面 404**：`destination_dir` 错（相对仓库根）、静态项目输出目录没填 `/`。
5. **推送后没构建**：监视路径绕行条件（空 push 等）或该目录确实无变更（预期跳过）。
6. **Worker 部署失败**：`CLOUDFLARE_ACCOUNT_ID` 未设置 / wrangler 未登录 / 目录不对。

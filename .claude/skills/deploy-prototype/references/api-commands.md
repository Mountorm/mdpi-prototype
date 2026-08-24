# API 命令参考

> **准确性提醒**：Cloudflare API 字段可能更新。执行前若对字段名不确定，用 `cloudflare-docs` 检索工具核对 `pages/projects` 当前 schema，不要依赖本文件的记忆。

## 环境变量

```bash
export CLOUDFLARE_API_TOKEN="..."   # 不要硬编码进脚本/提交到 git
export CLOUDFLARE_ACCOUNT_ID="..."  # wrangler 需要；未设则用下面命令取
```

获取账户 id（token 需有账户级读取权限）：
```bash
curl -s "https://api.cloudflare.com/client/v4/accounts" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq '.result[0].id'
```

## Pages 项目生命周期

### 创建项目（git 集成 + 根目录 + 构建配置）

```bash
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "susy-XXXX",
    "production_branch": "main",
    "source": {
      "type": "github",
      "config": {
        "owner": "Mountorm",
        "repo_name": "mdpi-prototype",
        "production_branch": "main",
        "path_includes": ["susy-XXXX/*"]
      }
    },
    "build_config": {
      "build_command": "npm run build",
      "destination_dir": "dist",
      "root_dir": "susy-XXXX"
    }
  }'
```
- `build_command` / `destination_dir` 与本地验证结果一致（纯静态：build_command 空、destination_dir `"/"`）。
- 成功后 CF 会用当前 `main` 分支触发首次构建。

### 添加自定义域名

```bash
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/susy-XXXX/domains" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "susy-XXXX.mdpi.cloud"}'
```
> ⚠️ **API 添加域名不会自动创建 DNS 记录**（实测确认），域名会一直停在 `pending`。需显式创建 CNAME：

```bash
# 1. 取 zone id
ZONE_ID=$(curl -s "https://api.cloudflare.com/client/v4/zones?name=mdpi.cloud" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq -r '.result[0].id')
# 2. 创建 CNAME：{子目录名}.mdpi.cloud -> {子目录名}.pages.dev
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "CNAME", "name": "susy-XXXX.mdpi.cloud", "content": "susy-XXXX.pages.dev", "proxied": true, "ttl": 1}'
```

> 添加域名后再建 CNAME，域名状态会从 `pending` 变为 `active`。zone 需在账户内且为 Cloudflare 权威 DNS。

### 查看项目 / 构建列表（验证用）

```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/susy-XXXX" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq '.result | {name, build_config, subdomain}'

curl -s "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/susy-XXXX/deployments" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | jq '.result[0] | {id, created_on, environment, latest_stage}'
```

### 更新构建配置（改根目录/构建命令时）

```bash
curl -s -X PATCH "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/susy-XXXX" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"build_config": {"build_command": "npm run build", "destination_dir": "dist", "root_dir": "susy-XXXX"}}'
```

> **Build watch paths（监视路径）可通过 API 配置**：字段位于 `source.config.path_includes` / `path_excludes`（官方文档以 dashboard 展示为主，但 API schema 支持）。创建时在 `source.config` 一并写入，或对已有项目 PATCH：
>
> ```bash
> curl -s -X PATCH "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/susy-XXXX" \
>   -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
>   -H "Content-Type: application/json" \
>   -d '{"source": {"config": {"path_includes": ["susy-XXXX/*"]}}}'
> ```
> Include 填 `susy-XXXX/*`（`*` 跨 `/` 匹配子目录内所有文件）。效果：仅该子目录内有变更才触发构建。

## Worker 生命周期

在子目录内（`wrangler.toml` 所在处）：
```bash
cd susy-8182
npx wrangler deploy          # 读 CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID
```
自定义域名两种方式：
- `wrangler.toml` 加 routes 后重新 deploy：
  ```toml
  [[routes]]
  pattern = "susy-8182.mdpi.cloud"
  zone_name = "mdpi.cloud"
  custom_domain = true
  ```
- dashboard：Worker → Settings → Domains & Routes → Custom Domain。

## 上线验证

```bash
# 域名可访问（期望 200）
curl -sI "https://susy-XXXX.mdpi.cloud" | head -1
# 内容正确（静态/构建产物）
curl -sL "https://susy-XXXX.mdpi.cloud" | head -20
```
若返回非 200，先看构建是否成功（deployments 接口），再读 risks.md。

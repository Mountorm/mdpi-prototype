# SUSY-9200 接口模拟服务

Mock 扮演"AI 预检服务"这一侧，供 Susy 联调测试"评审报告检查结果回传"链路。

**两个能力**

1. Susy 调用 Mock：`POST /api/v2/ingest/peer_review_report?susy_submission_id=X` → 成功返 **201**
2. Mock 回调 Susy：`POST https://susy-9200.susy.mdpi.dev/restapi/open_api/submit/review_report/check_result/{ms_id}`，`ms_id` = `susy_submission_id`，带 `susy-api-token`

外加一个测试面板 `GET /`：配置"回传给 Susy 的名单" + 事件日志（收到的请求 / 发出的请求各一条，按时间排列）。

---

## 一、测试流程

**触发必须来自 Susy 系统**（面板不触发，这是要测的东西本身）。所以顺序是：起桥 → 配置 → 去 Susy 操作 → 看记录。

| 步骤 | 做什么 |
|---|---|
| 0 | **在本机跑 `npm run bridge`**（保持运行）。Cloudflare 访问不到 Susy dev，回调必须由你本机从公司网络发出 |
| 1 | 打开 `https://susy-9200.mdpi.cloud/`（本地开发是 `http://127.0.0.1:8787/`） |
| 2 | 填 `susy_submission_id`（必须是 Susy 里**真实存在**的稿件 ID，否则回调会被判 `Invalid manuscript ID`） |
| 3 | 逐行填报告数据：`reviewer_rel_id` 和 `round_number` 必须是 Susy 里**真实存在**的值（Susy 会校验）；同一篇稿子多个 reviewer 或多轮，就"新增一行"或"复制行" |
| 4 | `severe_warning_count` 和三个比例可手填，也可点行内"随机填充"（比例之和不等于 1 会标黄提示） |
| 5 | 点**保存配置**（存服务端，Susy 触发那一刻就能读到） |
| 6 | 去 Susy 系统里真实触发 |
| 7 | 回面板看**事件日志**（每 5 秒自动刷新，从旧到新）。一次交互出两条：先"收到"（Susy 打进来的请求 + 返回给它的响应体），后"发出"（Mock 发给 Susy 的包体 + Susy 的答复）。发出前那条会标"待发出" |

**事件日志每一行长什么样**

| 方向 | 接口 | 结果 | 说明 |
|---|---|---|---|
| 收到 | `POST /api/v2/ingest/peer_review_report?susy_submission_id=X` | `HTTP 201` + `待发出` / `已发出` / `未发起回调` | 未配置、缺参数、面板强制错误码的原因 |
| 发出 | `POST /restapi/open_api/submit/review_report/check_result/{ms_id}` | `HTTP 200 成功` / `HTTP 404 失败` + 耗时 | Susy 返回的 `message` |

每行点"详情"展开完整事件 JSON（入站含来源 IP、User-Agent、完整 URL、Mock 返回的响应体；出站含完整包体和 Susy 原始答复）。最新 200 条。

桥脚本控制台也会同步打印每次发送结果，方便你边测边看。

---

## 二、接口 1：ingest

```
POST /api/v2/ingest/peer_review_report?susy_submission_id=12345
```

无请求包体、无 `force` 参数。

| 返回码 | 触发条件 | 是否发起回调 |
|---|---|---|
| **201** | 该 `submission_id` 已配置且返回码配置为 201 | 是（后台异步发起） |
| **400** | 缺 `susy_submission_id` | 否 |
| **404** | 该 `submission_id` 在 Mock 里没有配置 | 否 |
| **400 / 404 / 500** | 面板上把"ingest 返回码"强制设成了该值（用于测 Susy 的容错） | 否 |

成功响应：

```json
{
  "date": "2026-10-14T09:59:18.194Z",
  "note": null,
  "result": { "submission_id": "12345", "count": 2 }
}
```

> **为什么未配置要返 404 而不是随便编数据**：Mock 编的 `reviewer_rel_id` 在 Susy 侧一定校验不过（实测返回 `{"success":false,"message":"Invalid manuscript ID."}`），返 404 能让你一眼区分"忘了保存配置"和"链路坏了"。

---

## 三、接口 2：check_result 回调

```
POST https://susy-9200.susy.mdpi.dev/restapi/open_api/submit/review_report/check_result/{ms_id}
susy-api-token: <存在 Worker secret 里，不进代码/仓库/页面>
Content-Type: application/json
```

包体（一个 reviewer 的一轮 = 一条）：

```json
[
  {
    "reviewer_rel_id": 21755109,
    "round_number": 1,
    "data": {
      "severe_warning_count": 1,
      "ai_proportions": {
        "human_proportion": 0.1,
        "maybe_ai_proportion": 0.1,
        "likely_ai_proportion": 0.8
      }
    }
  }
]
```

**成功判定**：HTTP 2xx 且 `body.success !== false`。
**失败不重试**，原始答复（截断 2000 字符）与耗时一并记入面板记录。超时 15 秒。

---

## 四、本地开发

```bash
npm install
# 本地跑需要 .dev.vars（已在 .gitignore），内容：
#   SUSY_API_TOKEN=<token>
npx wrangler dev --port 8787
```

本地自测：

```bash
# 保存配置
curl -X POST "http://127.0.0.1:8787/api/panel/config" -H "Content-Type: application/json" \
  -d '{"submission_id":"12345","return_code":201,"items":[{"reviewer_rel_id":21755109,"round_number":1,"data":{"severe_warning_count":1,"ai_proportions":{"human_proportion":0.1,"maybe_ai_proportion":0.1,"likely_ai_proportion":0.8}}}]}'

# 模拟 Susy 触发
curl -X POST "http://127.0.0.1:8787/api/v2/ingest/peer_review_report?susy_submission_id=12345"

# 看回调记录
curl "http://127.0.0.1:8787/api/panel/logs"
```

---

## 五、部署

```bash
npx wrangler deploy                              # 部署 Worker + 自定义域名
echo "<token>" | npx wrangler secret put SUSY_API_TOKEN   # 写入回调凭证
```

`wrangler.toml` 里已配好：Durable Object 绑定 `MOCK_STORE`、回调模式 `CALLBACK_MODE = "bridge"`、路由 `susy-9200.mdpi.cloud`（`custom_domain = true`，Cloudflare 自动建 DNS）。

部署完记得在**本机**跑桥（用线上的 Mock 时必须）：

```bash
npm run bridge     # 读 .dev.vars 里的 token，Ctrl+C 退出
```

---

## 六、为什么需要本机桥脚本

Cloudflare 边缘**访问不到** Susy 的 dev 环境。实测证据（`GET /api/panel/probe`）：

| 目标 | 从 Cloudflare 边缘请求 | 结果 |
|---|---|---|
| `https://susy-9200.susy.mdpi.dev/` | 12s 超时 | 被挡（该域名解析到 `195.65.177.78`，公网 nginx，不是 Cloudflare 代理） |
| `https://example.com/` | 6ms 返回 200 | 说明不是 Cloudflare 出网问题 |

同一条回调，在本机（公司网络，出口 `188.188.2.21`）用 curl 1.6 秒就通了。所以 chain 变成：

```
Susy ──触发──> Mock(Cloudflare)  ──入队──> 队列(DO)
                                       ↑ 轮询          ↓ 发送
                               面板记录 <──回写──  本机 bridge.mjs ──> Susy dev
```

- 入队模式（默认）：Worker 只返 201 并把任务标记为 `pending`，`bridge.mjs` 每 2 秒取一次任务、在公司网络里发出、把 Susy 的答复回写面板。
- 若哪天 Susy 侧放行了 Cloudflare 出口，把 `wrangler.toml` 里的 `CALLBACK_MODE` 改成 `"direct"` 重新部署即可，就回到边缘直连。
- **代价**：桥脚本运行期间 Mock 才有回调能力；`pending` 事件会一直挂着直到桥取走（面板上标"待发出"）。

---

## 七、设计取舍与已知限制

- **存储用 Durable Object，不用 KV**：KV 是最终一致（写入后最多 60 秒才全球生效），"面板刚保存配置 → 马上去 Susy 触发"会读到旧值甚至读不到；Durable Object 强一致，且当前 API Token 没有 KV 权限。
- **先返 201、后台异步回调**（`ctx.waitUntil`）：真实系统不会等回调完成才回 201，同步等会把 Susy 测出假的时序。
- **面板无访问口令**：任何拿到域名的人都能改配置、触发回调打 dev 环境。内部测试可接受，若需收紧再加口令或 Cloudflare Access。
- **事件日志保留最近 200 条**（一次交互占 2 条，约 100 次），超出自动淘汰；存储只有一份日志，多人同时查看会互相覆盖（单实例存储的天然限制）。
- **面板不触发接口**：这是刻意的，你测的就是"Susy 真实触发"这条链路。
- **`ms_id` 直接等于 `susy_submission_id`**：若 Susy 侧两者不同，需要改成面板单独填。
- **比例之和不等于 1 时不阻断保存**，只在面板上标黄提示，方便故意测异常数据。
- **改代码后 Durable Object 仍跑旧版本**：改 `src/index.js` 里 DO 的逻辑后，第一次部署可能仍是旧代码在跑（曾有"日志里 `pending` 有记录、`/pending` 却返回空"的现象）。**再部署一次**即可生效；判不准就多部署一次。
- **"清空记录"会把 `pending` 待发任务一起删掉**：清空前确认队列里没有等桥发送的任务。
- **`/api/panel/probe` 只探固定目标**，不接受外部传入 URL（避免被当成 SSRF 跳板）。

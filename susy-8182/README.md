# Mock API Service for Cloudflare Workers

这是一个部署在 Cloudflare Workers 上的 Mock API 服务，模拟三个文档处理相关的 API 接口。

## 🚀 快速开始

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 测试接口
curl -X POST "http://localhost:8787/api/v2/ingest/submission?susy_submission_id=12345"
```

服务将在 `http://localhost:8787` 启动。

### 部署到 Cloudflare

#### 方法 1: 网页控制台部署（推荐）

**详细步骤请查看：[网页部署指南.md](./网页部署指南.md)**

简要步骤：
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **Create application** > **Create Worker**
3. 给 Worker 命名（例如：`mock-api-service`）
4. 点击 **Deploy**，然后点击 **Edit code**
5. 复制 `src/index.js` 的全部代码，粘贴到编辑器
6. 点击 **Save and Deploy**
7. 完成！你会得到一个 `https://your-worker.workers.dev` 域名

#### 方法 2: 命令行部署

```bash
# 1. 登录 Cloudflare
npx wrangler login

# 2. 部署
npm run deploy
```

部署成功后会得到一个 `https://your-worker.workers.dev` 域名。

### 配置自定义域名（可选）

编辑 `wrangler.toml` 文件：

```toml
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

---

## 📖 API 接口说明

### 1. POST /api/v2/ingest/submission

提交文档进行处理。

**查询参数：**
- `susy_submission_id` (必需): Susy 提交 ID
- `force` (可选): 是否强制重新处理（true/false）

**特性：**
- 返回 **16 位** document hash
- Hash 尾数与 `submission_id` 尾数一致

**请求示例：**
```bash
curl -X POST "http://localhost:8787/api/v2/ingest/submission?susy_submission_id=12345&force=true"
```

**响应示例：**
```json
{
  "date": "2026-05-14T02:30:09.123Z",
  "note": null,
  "result": {
    "document_hashes": [
      "abcdef123456789e"
    ],
    "count": 1
  }
}
```

**响应字段说明：**
- `date`: ISO 8601 格式的时间戳
- `note`: 固定为 `null`
- `result.document_hashes`: 包含一个 16 位 hash 的数组，hash 尾数与 `submission_id` 尾数相同
- `result.count`: 固定为 `1`

---

### 2. GET /api/v2/documents/{document_hash}/status

查询文档处理状态。

**路径参数：**
- `document_hash`: 文档哈希值（16 位）

**状态规则（根据 hash 尾数）：**
- 尾数为 **0**：随机返回 `pending`、`in_progress`、`failed`
- 尾数为 **1-9**：返回 `done`

**请求示例：**
```bash
# 尾数为 0 - 随机状态
curl "http://localhost:8787/api/v2/documents/abcdef1234567890/status"

# 尾数为 5 - done 状态
curl "http://localhost:8787/api/v2/documents/abcdef1234567895/status"
```

**响应示例（尾数为 5）：**
```json
{
  "date": "2026-05-14T02:30:09.123Z",
  "note": null,
  "result": {
    "status": "done"
  }
}
```

**响应示例（尾数为 0 - 随机）：**
```json
{
  "date": "2026-05-14T02:30:09.123Z",
  "note": null,
  "result": {
    "status": "in_progress"
  }
}
```

**响应字段说明：**
- `date`: ISO 8601 格式的时间戳
- `note`: 固定为 `null`
- `result.status`: 文档处理状态（`pending`、`in_progress`、`done`、`failed`）

---

### 3. GET /api/v2/reports/{document_hash}/issues_summary

获取文档问题摘要。

**路径参数：**
- `document_hash`: 文档哈希值（16 位）

**场景规则（根据 hash 尾数）：**

| 尾数 | 场景描述 | HTTP 状态码 |
|------|---------|------------|
| 0 | 返回空 result | 200 |
| 1 | authors 只有普通问题（warning > 0，severe warning = 0）且 ai_writing 有问题（human < 0.7，且 likely 和 maybe 不为 0） | 200 |
| 2 | authors 只有严重问题（warning = 0，severe warning > 0） | 200 |
| 3 | references 只有普通问题（warning > 0，severe warning = 0） | 200 |
| 4 | references 只有严重问题（warning = 0，severe warning > 0） | 200 |
| 5 | authors + references 都只有普通问题 | 200 |
| 6 | authors + references 都只有严重问题，且 peer_review_reports 有问题（human < 0.7） | 200 |
| 7 | 所有项都有问题（warning 和 severe 都 > 0），human 都 < 0.7 | 200 |
| 8 | 无问题（所有指标正常） | 200 |
| 9 | 返回错误 | 500 |

**请求示例：**
```bash
# 尾数为 1 - authors 普通问题 + AI 问题
curl "http://localhost:8787/api/v2/reports/abcdef1234567891/issues_summary"

# 尾数为 2 - authors 严重问题
curl "http://localhost:8787/api/v2/reports/abcdef1234567892/issues_summary"

# 尾数为 5 - authors + references 普通问题
curl "http://localhost:8787/api/v2/reports/abcdef1234567895/issues_summary"

# 尾数为 7 - 所有问题
curl "http://localhost:8787/api/v2/reports/abcdef1234567897/issues_summary"

# 尾数为 8 - 无问题
curl "http://localhost:8787/api/v2/reports/abcdef1234567898/issues_summary"

# 尾数为 9 - 返回错误
curl "http://localhost:8787/api/v2/reports/abcdef1234567899/issues_summary"
```

**响应示例（尾数为 1 - authors 普通问题 + AI 问题）：**
```json
{
  "date": "2026-05-14T02:30:09.123Z",
  "note": null,
  "result": {
    "issues_summary": {
      "authors": {
        "warning_count": 3,
        "severe_warning_count": 0
      },
      "references": {
        "warning_count": 0,
        "severe_warning_count": 0
      },
      "ai_writing": {
        "severe_warning_count": 2,
        "proportions": {
          "human_proportion": 0.55,
          "maybe_ai_proportion": 0.25,
          "likely_ai_proportion": 0.20
        }
      },
      "peer_review_reports": [
        {
          "human_proportion": 1.0,
          "maybe_ai_proportion": 0.0,
          "likely_ai_proportion": 0.0
        }
      ]
    },
    "report_link": "https://deployment.susy.mdpi.dev/"
  }
}
```

**响应示例（尾数为 2 - authors 严重问题）：**
```json
{
  "date": "2026-05-14T02:30:09.123Z",
  "note": null,
  "result": {
    "issues_summary": {
      "authors": {
        "warning_count": 0,
        "severe_warning_count": 2
      },
      "references": {
        "warning_count": 0,
        "severe_warning_count": 0
      },
      "ai_writing": {
        "severe_warning_count": 0,
        "proportions": {
          "human_proportion": 1.0,
          "maybe_ai_proportion": 0.0,
          "likely_ai_proportion": 0.0
        }
      },
      "peer_review_reports": [
        {
          "human_proportion": 1.0,
          "maybe_ai_proportion": 0.0,
          "likely_ai_proportion": 0.0
        }
      ]
    },
    "report_link": "https://deployment.susy.mdpi.dev/"
  }
}
```

**响应示例（尾数为 8 - 无问题）：**
```json
{
  "date": "2026-05-14T02:30:09.123Z",
  "note": null,
  "result": {
    "issues_summary": {
      "authors": {
        "warning_count": 0,
        "severe_warning_count": 0
      },
      "references": {
        "warning_count": 0,
        "severe_warning_count": 0
      },
      "ai_writing": {
        "severe_warning_count": 0,
        "proportions": {
          "human_proportion": 1.0,
          "maybe_ai_proportion": 0.0,
          "likely_ai_proportion": 0.0
        }
      },
      "peer_review_reports": [
        {
          "human_proportion": 1.0,
          "maybe_ai_proportion": 0.0,
          "likely_ai_proportion": 0.0
        }
      ]
    },
    "report_link": "https://deployment.susy.mdpi.dev/"
  }
}
```

**响应示例（尾数为 0 - 空 result）：**
```json
{
  "date": "2026-05-14T02:30:09.123Z",
  "note": null,
  "result": {}
}
```

**错误响应示例（尾数为 9）：**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to retrieve issues summary",
  "details": "Document analysis service unavailable"
}
```

**字段说明：**

- `date`: ISO 8601 格式的时间戳
- `note`: 固定为 `null`
- `result.issues_summary`: 问题摘要对象
- `result.report_link`: 固定为 `https://deployment.susy.mdpi.dev/`

**问题摘要字段：**

- `authors`: 作者相关问题
  - `warning_count`: 普通警告数量
  - `severe_warning_count`: 严重警告数量

- `references`: 参考文献相关问题
  - `warning_count`: 普通警告数量
  - `severe_warning_count`: 严重警告数量

- `ai_writing`: AI 写作检测
  - `severe_warning_count`: 严重警告数量
  - `proportions.human_proportion`: 人类写作比例（0-1）
  - `proportions.maybe_ai_proportion`: 可能 AI 写作比例（0-1）
  - `proportions.likely_ai_proportion`: 很可能 AI 写作比例（0-1）
  - 注：三个比例之和为 1.0

- `peer_review_reports`: 同行评审报告
  - `human_proportion`: 人类写作比例（0-1）
  - `maybe_ai_proportion`: 可能 AI 写作比例（0-1）
  - `likely_ai_proportion`: 很可能 AI 写作比例（0-1）
  - 注：三个比例之和为 1.0

---

## 🧪 测试示例

### 完整流程测试

```bash
# 1. 提交文档（submission_id 尾数为 5）
curl -X POST "http://localhost:8787/api/v2/ingest/submission?susy_submission_id=12345"
# 返回的 hash 尾数也是 5

# 2. 查询状态（使用返回的 hash）
curl "http://localhost:8787/api/v2/documents/abcdef1234567895/status"
# 因为尾数是 5，返回 done

# 3. 查询问题摘要（使用返回的 hash）
curl "http://localhost:8787/api/v2/reports/abcdef1234567895/issues_summary"
# 因为尾数是 5，返回随机 2 个问题
```

### 测试不同场景

```bash
# 测试所有尾数的 ingest 接口
for i in {0..9}; do
  echo "=== Testing submission_id ending with $i ==="
  curl -X POST "http://localhost:8787/api/v2/ingest/submission?susy_submission_id=123$i"
  echo ""
done

# 测试所有尾数的 status 接口
for i in {0..9}; do
  echo "=== Testing hash ending with $i ==="
  curl "http://localhost:8787/api/v2/documents/abcdef123456789$i/status"
  echo ""
done

# 测试所有尾数的 summary 接口
for i in {0..9}; do
  echo "=== Testing hash ending with $i ==="
  curl "http://localhost:8787/api/v2/reports/abcdef123456789$i/issues_summary"
  echo ""
done
```

---

## 🎯 场景速查表

### Hash 尾数与场景对应关系

| 尾数 | Ingest 接口 | Status 接口 | Summary 接口 |
|------|------------|------------|-------------|
| 0 | hash 尾数 0 | 随机：pending/in_progress/failed | 空 result |
| 1 | hash 尾数 1 | done | authors 普通问题 + AI 问题 |
| 2 | hash 尾数 2 | done | authors 只有严重问题 |
| 3 | hash 尾数 3 | done | references 只有普通问题 |
| 4 | hash 尾数 4 | done | references 只有严重问题 |
| 5 | hash 尾数 5 | done | authors + references 普通问题 |
| 6 | hash 尾数 6 | done | authors + references 只有严重问题 + peer_review 问题 |
| 7 | hash 尾数 7 | done | 所有项都有问题 |
| 8 | hash 尾数 8 | done | 无问题 |
| 9 | hash 尾数 9 | done | 返回 500 错误 |

---

## 📝 注意事项

- ✅ 所有接口都支持 CORS，可以从任何域名访问
- ✅ Hash 长度固定为 **16 位**
- ✅ Hash 尾数决定返回的场景数据
- ✅ 所有接口的 `note` 字段固定为 `null`
- ✅ Status 接口只返回 `status` 字段（不包含 progress、message 等）
- ✅ Summary 接口的 `report_link` 固定为 `https://deployment.susy.mdpi.dev/`
- ✅ Ingest 接口的 `count` 固定为 `1`
- ✅ 尾数 0 的 status 接口每次请求可能返回不同状态（随机）
- ✅ 尾数 1 的 summary 接口：authors 只有普通问题，且 AI 写作的 maybe 和 likely 都不为 0

---

## 🛠️ 自定义修改

如果需要修改响应数据或添加新的接口，请编辑 `src/index.js` 文件。

### 示例：固定返回特定状态

```javascript
// 在 handleDocumentStatus 函数中
const responseData = {
  date: new Date().toISOString(),
  note: null,
  result: {
    status: 'done',  // 固定状态
  },
};
```

### 示例：修改问题摘要的固定值

```javascript
// 在 handleIssuesSummary 函数中
const responseData = {
  date: new Date().toISOString(),
  note: null,
  result: {
    issues_summary: {
      authors: {
        warning_count: 5,  // 固定值
        severe_warning_count: 2,
      },
      // ... 其他字段
    },
    report_link: 'https://deployment.susy.mdpi.dev/',
  },
};
```

修改后保存文件，Wrangler 开发服务器会自动重新加载。

---

## 📂 项目结构

```
.
├── src/
│   └── index.js          # 主要的 Worker 代码
├── package.json          # 项目依赖
├── wrangler.toml         # Cloudflare Workers 配置
├── .gitignore           # Git 忽略文件
└── README.md            # 项目文档（本文件）
```

---

## 🔗 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

---

## 📄 许可证

MIT

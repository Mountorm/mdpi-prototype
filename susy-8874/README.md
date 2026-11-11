# SUSY-8874 接口文档

纯静态 Swagger UI + OpenAPI 3.0.3，不含业务代码和构建步骤。

## 本地查看

浏览器不允许 `file://` 直接读取本地 `openapi.yaml`，需起一个本地静态服务：

```bash
cd susy-8874
npx serve .          # 或用 python -m http.server 8080
```

然后访问终端给出的地址（如 `http://localhost:3000/`）。

## 文件

| 文件 | 用途 |
|---|---|
| `openapi.yaml` | 唯一的接口契约文件，改这里 |
| `index.html` | Swagger UI 页面，读取并渲染 `openapi.yaml` |
| `assets/swagger-ui/` | Swagger UI 5.17.14 静态资源，已内置，不依赖外网 |

## 新增接口

在 `openapi.yaml` 的 `paths` 下按路径写入接口。示例：

```yaml
paths:
  /api/example:
    get:
      tags: [Example]
      summary: 示例接口
      parameters:
        - name: id
          in: query
          required: true
          schema: { type: integer }
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: { type: integer }
```

`tags` 会自动在左侧分组；同一 `tags` 的接口归到一组。`components.schemas` 里定义的模型会自动出现在页面底部 Models 区。

## 当前设置

- Try it out 已关闭（`tryItOutEnabled: false`），只做契约展示；需要在线调试时把 `index.html` 里该值改为 `true`，并替换 `servers` 为可访问地址
- `servers` 为占位地址，未接 mock 服务
- 鉴权：请求头 `Susy-Auth-Token`，值为 `Bearer {JWT}`

## 部署

目录本身即产物，Cloudflare Pages 直接指向 `susy-8874/` 即可，无需构建命令。

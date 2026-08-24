# 子项目类型检测与构建命令

在动手前先判断子目录类型，决定走 Pages 还是 Worker 轨道，以及构建命令/输出目录。判断顺序：**先看 `wrangler.toml`，再看 `package.json`，最后是纯静态。**

## 检测顺序

1. 目录含 **`wrangler.toml`** → **Worker 轨道**，走流程 C。
2. 目录含 **`package.json`** → 看依赖与脚本：
   - `vite` / `@vitejs/plugin-vue` → **Vite+Vue3**
   - `@vue/cli-service` → **Vue2 + VueCLI**
   - 无构建框架 → 按纯静态处理（有 `package.json` 但无构建脚本，如纯依赖工具）
3. 目录只有静态文件（`index.html` + css/js 资源）→ **纯静态**。

## 各类型构建配置（对应 Pages 项目设置）

| 类型 | 判断特征 | 构建命令 | 输出目录 (destination_dir) | 备注 |
|---|---|---|---|---|
| 纯静态 | 无 package.json，或 index.html 直出 | 空 | `/` | 输出目录填根，直接服务 root_dir 内容 |
| Vite+Vue3 | 依赖含 vite | `npm run build` | `dist` | susy-9132、table-designer 即此类 |
| Vue2+VueCLI | 依赖含 @vue/cli-service | `npm run build` | `dist` | susy-8004 用 `vue-cli-service build`；其 `publicPath='./'` 生成相对路径资源，兼容正常 |
| Worker | 含 wrangler.toml | 不适用（wrangler deploy） | 不适用 | 走流程 C |

## 当前仓库已知项目（参考）

- **纯静态**：susy-7515、susy-7581、susy-8315、susy-8326、susy-8398、susy-8906、susy-8977、susy-demo、susy-icon、susy-template
- **Vite+Vue3**：susy-9132、table-designer（后者未列入导航页）
- **Vue2+VueCLI**：susy-8004
- **Worker**：susy-8182（mock-api-service，wrangler 项目名与目录名不同）

> 注意：以上是存量判断，新项目务必按"检测顺序"重新判定，不要照抄列表。

## 本地构建命令

```bash
cd {子目录名}
npm install        # 有 package-lock.json 时优先 npm ci
npm run build      # 构建
```

构建成功后确认产物目录存在（`dist/` 或静态根目录），记录下构建命令与输出目录，供 API 创建项目时填写，**两者必须一致**。

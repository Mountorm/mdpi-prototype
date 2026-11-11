# susy-vue-template

SuSy 设计系统的组件目录，按组件分类陈列 `@mdpi-ui/design-system` 5.0.0-alpha.1 的全部组件，用于查组件长什么样、有哪些属性、怎么组合。

不含任何业务内容。

## 启动

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # 产物在 dist/，可直接托管到 Cloudflare Pages
```

`npm install` 需要连通 MDPI 内网，并依赖本目录的 `.npmrc`（已加入 `.gitignore`，不要提交）。

### 部署说明

Cloudflare 构建机访问不到内网 registry，因此本项目的 `dist/` 需要提交到仓库，Pages 项目配置为不做依赖安装、不执行构建，直接托管已提交的 `dist/`。

修改组件后本地执行 `npm run build`，把 `dist/` 一起提交推送即可触发上线。

## 页面

| 路由 | 内容 |
|---|---|
| `/overview` | 全部组件总览，按分类铺开 |
| `/actions` | MButton、MButtonGroup、MIconButton、MButtonScrollTop |
| `/inputs` | 14 个表单控件 |
| `/data-display` | 13 个展示类组件 |
| `/feedback` | 8 个提示与浮层 |
| `/navigation` | 6 个导航组件 |
| `/layout` | MContainer |

## 目录

```
src/
├── App.vue                 # 顶栏 + 左侧目录 + 内容区
├── data/
│   ├── catalog.js          # 分类与组件清单，决定导航和总览页
│   └── demo.js             # 示例用中性数据
├── components/
│   ├── DemoSection.vue     # 每个组件的区块标题与说明
│   └── DemoRow.vue         # 单个示例行
└── views/                  # 每个分类一个页面
```

## 新增组件

1. 在 `data/catalog.js` 对应分类里加 `{ id, name }`
2. 在对应分类页里加一个 `DemoSection`，`id` 与上一步一致
3. 左侧导航和总览页会自动带上

## 样式规则（已按 v5 实际包核对）

| 用途 | 正确写法 |
|---|---|
| 页面底色 | `bg-default` / `bg-surface-default` |
| 正文 | `text-color-default` |
| 次要文字 | `text-color-subtle` / `text-color-subtlest` |
| 边框 | `border-color-default` |
| 品牌蓝 | `bg-brand-default` / `text-color-brand-bold` |
| 链接 | `text-color-link-bold` |

注意：`text-color-brand` 不存在，品牌色文字用 `text-color-brand-bold`。

- 间距用 4 的倍数（`p-4` = 16px），圆角只用 `rounded`（4px）和 `rounded-full`
- 组件属性以 `node_modules/@mdpi-ui/design-system/dist/types/` 为准
- 也可以用包内自带的 CLI 查属性：`node node_modules/@mdpi-ui/design-system/code-connect/component-api.mjs MButton`

## 已知限制

- **字体**：Suisse Int'l 是授权字体，包里不带字体文件，会回退到系统无衬线字体
- **图标**：`MIcon` 底层用 Iconify 的 `material-symbols` 图标集，首次加载需要外网
- **MSwiperPagination**：必须传 Swiper 实例，本项目未引入 Swiper，只做说明
- **MButtonScrollTop**：fixed 悬浮按钮，为避免遮挡页面只做静态预览

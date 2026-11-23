# susy-vue-template

SuSy 设计系统的组件目录，按组件分类陈列 `@mdpi-ui/design-system` 5.0.0-alpha.1 的全部组件，用于查组件长什么样、有哪些属性、怎么组合。

不含任何业务内容。

## 启动

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # 产物在 dist/，可直接托管到 Cloudflare Pages
```

`npm install` 需要连通 MDPI 内网。本目录 `.npmrc` 只保留 `@mdpi-ui` 的 registry 地址；访问令牌统一配置在本机 `~/.npmrc`，不要写进项目文件或提交。

### 部署说明

Cloudflare 构建机访问不到内网 registry，因此本项目的 `dist/` 需要提交到仓库，Pages 项目配置为不做依赖安装、不执行构建，直接托管已提交的 `dist/`。

修改组件后本地执行 `npm run build`，把 `dist/` 一起提交推送即可触发上线。

## 页面

只有一条路由，所有组件在同一页内按分类排开，侧边栏用锚点跳转：

| 路由 | 内容 |
|---|---|
| `/design-system` | 全部组件：总览 + Actions / Inputs / Data display / Feedback / Navigation / Layout |

旧的 `/overview`、`/actions` 等地址会重定向到 `/design-system#分类`，不会失效。

## 外框

页面外壳取自真实 SuSy（`susy-mdpi/templates/base.html.twig`），包括：

- **Header**：MDPI 公共导航（Journals / Topics / Author Services / Information / About）+ SUSY logo + Start Submission + 账号下拉，用户邮箱为 mock 值
- **Sidebar**：真实左栏的菜单分组和折叠样式，内容换成组件目录
- **Footer**：版权与政策链接

样式和字体来自线上 `susy.mdpi.com/build/*.css`，已下载到 `public/build/`（约 3MB），页面按原路径 `/build/...` 引用。SuSy 线上样式更新后，重新下载这四个 CSS 和它们引用的字体即可：

```bash
for f in foundation main vendor 199; do
  curl -sSL -o "public/build/$f.css" "https://susy.mdpi.com/build/$f.css"
done
```

外框与组件目录的衔接样式在 `src/styles/susy-frame.css`，只补间距和宽度，不覆盖外框本身。

## 目录

```
src/
├── App.vue                 # 真实 SuSy 外框：header + 侧栏 + 内容区 + footer
├── layout/
│   ├── SusyHeader.vue      # 顶部导航与账号菜单
│   ├── SusySidebar.vue     # 左侧组件目录，SuSy 菜单样式
│   └── SusyFooter.vue      # 页脚
├── data/
│   ├── catalog.js          # 分类与组件清单，决定导航、总览页和侧栏
│   └── demo.js             # 示例用中性数据
├── components/
│   ├── DemoSection.vue     # 每个组件的区块标题与说明
│   └── DemoRow.vue         # 单个示例行
├── views/
│   ├── DesignSystemView.vue # 单一路由，按顺序挂载各分类
│   └── *View.vue            # 各分类的内容区块
└── styles/susy-frame.css   # 外框与目录的衔接样式
```

## 新增组件

1. 在 `data/catalog.js` 对应分类里加 `{ id, name }`
2. 在对应分类页里加一个 `DemoSection`，`id` 与上一步一致
3. 侧边栏、总览页和锚点会自动带上

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
- **移动端外框**：真实 SuSy 在窄屏会切换成移动版顶栏和抽屉菜单，本项目只做了桌面版；窗口宽度小于 1024 时顶部导航和左侧栏会隐藏
- **外框交互**：下拉菜单靠 CSS hover，Start Submission、账号菜单里的链接都是占位，不触发真实业务

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

默认进入主页，主区域留白；左侧菜单只有 Components 入口，点进去才是组件目录。组件目录所有组件在同一页内按分类排开，侧边栏点击后脚本滚动到对应区块，地址栏始终是 `/components`（history 模式，不带 `#`）：

| 路由 | 内容 |
|---|---|
| `/` | 主页，主区域留白，侧栏只有 Components 入口；点 logo 回这里 |
| `/components` | 全部组件：总览 + Actions / Inputs / Data display / Feedback / Navigation / Layout |

旧的 `/design-system`、`/overview`、`/actions` 等地址会重定向到 `/components` 顶部，不会 404；其他未知地址回主页。

使用 history 模式后，静态托管需要把未知路径回退到 `index.html`，项目内已放 `public/_redirects`（Cloudflare Pages 规则：`/* /index.html 200`），构建时会一起复制到 `dist/`。换成其他静态服务器时需自行配置同样的回退。

## 外框

页面外壳取自真实 SuSy（`susy-mdpi/templates/base.html.twig`），包括：

- **Header**：MDPI 公共导航（Journals / Topics / Author Services / Information / About）+ SUSY logo + 全局搜索 + Start Submission + 账号下拉，用户邮箱为 mock 值
- **Sidebar**：真实左栏的菜单分组和折叠样式，内容换成组件目录
- **Footer**：版权与政策链接

样式和字体来自线上 `susy.mdpi.com/build/*.css`，已下载到 `public/build/`（约 3MB）。页面只引一个入口 `/build/susy.css`，它把四个文件按原路径 import 进来。SuSy 线上样式更新后，重新下载这四个 CSS 和它们引用的字体即可（`susy.css` 不需要重下）：

```bash
for f in foundation main vendor 199; do
  curl -sSL -o "public/build/$f.css" "https://susy.mdpi.com/build/$f.css"
done
```

外框与组件目录的衔接样式在 `src/styles/susy-frame.css`。

## 布局

- 真实 SuSy 的顶栏、内容容器和页脚封顶 1440px 并居中；本项目取消该封顶，整页铺满视口宽度，随窗口自适应
- 页面至少占满一屏：`off-canvas-content` 纵向撑满视口，`#container` 自动增高，页脚始终贴在底部；主页留白时也不会把页脚顶到中间
- 顶栏在桌面端固定于视口顶部（`sticky`），高度就是导航本身的 54px，没有多余留白；下方 10px 是 `#container` 的上内边距，吸附时用容器底色补刷，内容不会从缝里漏出来
- 侧栏的吸附位置由 `App.vue` 量取“顶栏实际高度 + `#container` 上内边距”写入 `--susy-sidebar-top`，滚动前后位置一致；移动端顶栏本来隐藏，不受影响
- 内容区占满侧栏之外的剩余宽度，组件卡片按视口宽度自动换行（`auto-fill` 栅格）
- 侧栏底部的按钮可把左栏收起成 60px 的图标栏；收起时点分类图标会先展开侧栏再滚到该分类
- 收起状态记在浏览器 `localStorage`（键名 `susy-left-menu-collapsed`），刷新后保持
- 视口小于 1024px 时侧栏和顶部导航隐藏，内容区仍占满宽度

### 全局搜索

顶栏搜索框按真实 SuSy 的 GlobalSearch 组件复刻交互，只做前端效果，不调用接口：

- 点击或聚焦输入框，在视口中央展开面板；面板含筛选标签栏、Search Results 和 Recent 两个区块
- 输入内容后出现 Search Results（没有数据源，固定显示 `No direct actions found.`），Recent 固定显示 `No recent actions yet.`
- 输入框有内容时显示清空按钮；`Escape` 先清空，再按一次收起面板；点击面板外部或窗口尺寸变化时同步收起/重新居中
- 面板宽度 `min(800px, 92vw)`，最大高度 70vh，超出部分面板内部滚动
- 搜索框宽度随窗口收缩（200–260px）；窗口小于 1280px 时顶栏放不下，整块隐藏

注意：真实系统的筛选标签由用户角色权限决定，本项目固定展示全部 5 个标签；接入接口前不要把它当作可用的筛选能力。

### 样式隔离（重要）

SuSy 的这四个文件是完整的旧框架样式，里面有 200 多个与设计系统同名的 CSS 变量（`--radius-*`、`--color-*`）和同名工具类（`.rounded-2xl`、`.flex`、`.overflow-hidden` 等）。直接引入时它们属于"无层级样式"，优先级高于设计系统的 `@layer`，会把组件样式和交互全部压掉，所以做了三层隔离：

1. **级联层**：`public/build/susy.css` 先声明层级顺序 `properties < base < susy < theme < components < utilities`，再把四个文件 import 到 `susy` 层。外框样式因此高于 reset、低于设计系统的 token 和工具类。
2. **内容区标记**：SuSy 的 CSS 自带 `:not(.v-3)` 守卫，内容区容器加 `v-3` 类后，旧框架的元素样式不会作用到组件上。
3. **弹层标记**：对话框、滑块提示等被设计系统挂到 `body` 下，不在 `v-3` 子树里。`src/main.js` 用 MutationObserver 给这些挂载点补 `v-3`。

调整外框时要保留这三层，否则会再次出现"组件样式全变"的问题。

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
│   ├── DemoRow.vue         # 单个示例行
│   └── GlobalSearch.vue    # 顶栏全局搜索，前端交互与空态
├── views/
│   ├── HomeView.vue         # 主页，主区域留白
│   ├── DesignSystemView.vue # 组件页，按顺序挂载各分类
│   └── *View.vue            # 各分类的内容区块
├── utils/scroll.js         # 滚动定位与侧栏高亮
├── styles/susy-frame.css   # 外框与目录的衔接样式
└── main.js                 # 挂载应用，并给设计系统弹层补 v-3 标记

public/build/
├── susy.css                # 外框样式入口：声明层级顺序并 import 下面四个文件
└── foundation|vendor|199|main.css
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
- **全局搜索**：只有前端交互和空态，没有结果、最近操作记录和筛选逻辑；筛选标签固定展示全部 5 个，窗口小于 1280px 时搜索框隐藏
- **外框交互**：下拉菜单靠 CSS hover，Start Submission、账号菜单里的链接都是占位，不触发真实业务

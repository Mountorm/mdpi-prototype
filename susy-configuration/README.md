# SuSy Configurations（清洗后的静态页）

从浏览器另存页清洗而来，仅作视觉对照 / 原型底稿。

## 打开方式

用浏览器直接打开 `index.html`（会加载本地 JS 注入图标精灵）。

## 目录

```text
index.html                         # 可见页面 DOM（已瘦身）
assets/
  css/                             # 主题与页面样式
    theme.css                      # CSS 变量
    icon-svg-inline.css            # 压缩后的内联图标样式
    ...
  icons/
    sprite.svg                     # 本页实际用到的 10 个 SVG symbol
  js/
    inject-sprite.js               # 注入 sprite（兼容 file://）
  img/
    susy-logo.png
    ai-logo-sq.png
  partials/
    hidden-dialogs.html            # 隐藏抽屉/弹层快照（不自动加载）
```

## 已外提 / 移除

| 内容 | 处理 |
|------|------|
| 主题色变量 | → `assets/css/theme.css` |
| Logo base64 | → `assets/img/susy-logo.png` |
| SVG 图标精灵 | → `assets/icons/sprite.svg` + `inject-sprite.js` |
| 未使用的 79 个 icon | 已删除 |
| 隐藏编辑抽屉/弹层 | → `assets/partials/hidden-dialogs.html`（静态首屏不需要） |
| 扩展插件 / 坏掉的 SPA JS / 邻页 CSS | 已删除 |

## 说明

- 仍是**静态快照**：交互不可用。
- `index.html` 行数主要来自 Element Plus 嵌套 DOM（每条配置多层 `div`），这是另存页结构本身，继续硬删会影响样式对齐。
- 若要以可维护方式继续做交互原型，建议以本页为视觉基准另建源码。

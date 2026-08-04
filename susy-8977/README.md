# SuSy Configurations（清洗后的静态页）

从浏览器另存页清洗而来，仅作视觉对照 / 原型底稿。

## 打开方式

用浏览器直接打开 `index.html`（会加载本地 JS 注入图标精灵）。

## 目录

```text
index.html                         # 可见页面 DOM
assets/
  css/                             # 主题与页面样式
  icons/
    sprite.svg                     # 本页用到的 SVG symbol
  js/
    inject-sprite.js               # 注入 sprite（兼容 file://）
    email-name-demo.js             # Journal Name in Email 交互
  img/
    susy-logo.png
    ai-logo-sq.png
```

## Demo：Journal Name in Email

在 **Basic Configurations** 中（粉色圈出位置）：

- 开关开启后可配置邮件期刊名；关闭则不生效、列表留空
- 弹窗编辑 + 非空校验；问号 tooltip 说明替换规则

代码：`assets/js/email-name-demo.js`、`assets/css/email-name-demo.css`。

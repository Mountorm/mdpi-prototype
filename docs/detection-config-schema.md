# Detection Config — Item JSON Schema

普通检测项（非 Ethicality）的完整字段说明。

---

## Section

```js
{
  id: string,       // 唯一标识，如 "section-1"
  title: string,    // 显示名称，如 "Manuscript"
  items: Item[]
}
```

---

## Item

```js
{
  id: string,           // 唯一标识，如 "item-1-1"
  title: string,        // 检测项名称
  description: string,  // 简短说明，显示在标题下方
  status: 'healthy' | 'warning' | 'error',  // 检测结果状态
  results: Result[]     // 一个或多个结果块
}
```

`status` 含义：
- `healthy` — 通过，无问题
- `warning` — 警告，需关注
- `error` — 严重问题，需处理

---

## Result

```js
{
  result: string,                    // 结果描述文本，必填
  author?: {                         // 可选，关联到具体作者
    name: string,
    email: string
  },
  resultSlots?: Record<string, Slot>, // 可选，result 文本中的插槽替换（见下）
  detailsType?: 'list' | 'html',      // 可选，默认 'list'
  details?: string[],                 // detailsType === 'list' 时使用
  htmlContent?: string                // detailsType === 'html' 时使用
}
```

---

## Result 文本插槽（resultSlots）

当 `result` 字符串中包含 `{{key}}` 占位符时，通过 `resultSlots` 提供对应节点，渲染为链接或 tooltip 图标。

```js
result: "7 manuscripts submitted {{guide}} {{icon}}",
resultSlots: {
  guide: { type: 'link',    content: 'view guide', href: '#', target?: '_blank' },
  icon:  { type: 'tooltip', tooltip: 'hover text', icon?: 'info' }
}
```

Slot 类型：

| type      | 必填字段                  | 说明               |
|-----------|---------------------------|--------------------|
| `text`    | `content`                 | 纯文本（一般不用） |
| `link`    | `content`, `href`         | 可点击链接         |
| `tooltip` | `tooltip`                 | 带 info 图标的提示 |

---

## detailsType 说明

| 值     | 渲染方式                          | 对应字段        |
|--------|-----------------------------------|-----------------|
| `list` | 通用无序列表（默认）              | `details[]`     |
| `html` | 后端返回的自定义 HTML 字符串      | `htmlContent`   |

`detailsType` 省略时默认按 `list` 处理。`details` 为空或不存在时不显示展开按钮。

---

## 完整示例

### 最简单（healthy，无 details）

```js
{
  id: "item-1-7",
  title: "Similar Title",
  description: "Prevents duplicate submissions.",
  status: "healthy",
  results: [{ result: "No similar title found" }]
}
```

### 多作者 + list details

```js
{
  id: "item-2-4",
  title: "Doctoral Degree",
  description: "Validates academic qualification of authors.",
  status: "error",
  results: [
    {
      author: { name: "Jane Smith", email: "jane.smith@example.com" },
      result: "No doctoral degree found in profile"
    },
    {
      author: { name: "Bob Wilson", email: "bob.wilson@example.com" },
      result: "Degree record unverifiable — affiliation not indexed"
    }
  ]
}
```

### result 内嵌插槽

```js
{
  id: "item-2-10",
  title: "Author Submitted Papers",
  description: "Monitors submission frequency.",
  status: "error",
  results: [
    {
      author: { name: "Dr. Michael Chen", email: "michael.chen@example.com" },
      result: "manuscripts submitted in last 3 months (≥ 6) {{guide}} {{icon}}",
      resultSlots: {
        guide: { type: 'link',    content: 'view guide', href: '#' },
        icon:  { type: 'tooltip', tooltip: 'hover text', icon: 'info' }
      },
      detailsType: 'list',
      details: ["nutrients-4201234", "ijms-4198765"]
    }
  ]
}
```

### 后端 HTML details

```js
{
  id: "item-1-11",
  title: "Reference",
  description: "Validates bibliography integrity.",
  status: "error",
  results: [
    {
      result: "Problematic references found",
      detailsType: 'html',
      htmlContent: `<div class="retraction-references">...</div>`
    }
  ]
}
```

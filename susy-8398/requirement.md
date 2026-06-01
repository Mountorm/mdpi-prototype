请帮我生成一个完整的 HTML 文件（单文件，所有 CSS 内嵌在 <style>，JS 内嵌在 <script>），
100% 像素级还原 MDPI Ethics Issue View 页面。

## 外部资源（通过 CDN 引入）
```html
<!-- Google Material Symbols Outlined 图标库（第 1 个图标库） -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0">
<!-- Font Awesome 4.7（第 2 个图标库） -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<!-- jQuery 3.x -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<!-- jQuery UI（用于 dialog 模态框） -->
<link rel="stylesheet" href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
<script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
```

## 颜色变量（直接使用实际色值，不要用 var()）
--color-submit: #4f5671
--color-active: #007f7f
--color-font-red: #ff0000
--color-dark-gray: #8a8a8a
--color-white: #ffffff
--color-black: #000000
--color-primary: #0156CE
--color-border-default: #DCDFE4
--color-default-button-text: #172B4D
--color-navigation-menu-text: #626f86
--color-link: #3156A2

---

## 整体布局
body 背景色 #f5f5f5
#maincol 容器：max-width 1200px，margin 0 auto，font-family Arial/sans-serif，font-size 14px，line-height 130%，padding 5px

---

## 区块 1：导航子菜单（对应 _nav.html.twig）
结构：
```html
<div class="navigation-menu">
  <ul>
    <li class="active"><a href="#">Ethics Issues</a></li>
    <li><a href="#">Public Forum</a></li>
  </ul>
</div>
```

.navigation-menu CSS：
  height: 40px
  border-bottom: 3px solid #DCDFE4
  background: transparent
  margin-bottom: 15px
  ul: list-style none, padding 0, margin 0, display flex, align-items stretch, height 100%
  li: display flex, align-items center, min-width 64px, margin-right 20px
  li:last-child: margin-right 0
  li a: display flex, align-items center, justify-content center, height 100%, width 100%
    color #626f86, font-size 16px, font-weight 400, text-decoration none
  li a:visited: color #626f86
  li.active: margin-bottom -3px, border-bottom 3px solid #0156CE
  li.active a: color #0156CE, font-weight 500

---

## 区块 2：Manuscript Information（稿件信息）
容器：.quickform → background #f9f9f9, border 1px solid #ddd, border-radius 4px, padding 15px, margin-bottom 15px
legend → font-size 16px, font-weight 600, color #333, border-bottom 2px solid #ddd, padding-bottom 8px, width 100%, margin-bottom 10px
fieldset → border none, padding 10px

每一行结构（row.div_row 宏 对应）：
```html
<div class="row grid-x grid-padding-x grid-margin-y">
  <div class="cell small-12 medium-6 large-2">标签名</div>
  <div class="cell small-12 medium-6 large-8 break-word">值内容</div>
</div>
```

.grid-x: display flex, flex-wrap wrap
.cell.large-2: flex 0 0 16.66667%, max-width 16.66667%, font-weight bold, color #555, text-align right, padding-right 10px
.cell.large-8: flex 0 0 66.66667%, max-width 66.66667%
.grid-padding-x: padding 0 10px（子 cell 上）
.break-word: word-wrap break-word

字段顺序（标签：值格式）：
1. "Assigned Editor": 编辑姓名
2. "Journal": 斜体全称（斜体缩写），如 <i>MDPI Sensors</i> (<i>Sensors</i>)
3. "Type": 文章类型名称
4. "Open Review"（仅当 openReview==1 时显示）: <span class="morandiRed" style="font-weight: bold;">yes</span> 或 "no"
5. "Number of Pages": 数字
6. "Manuscript Status": 状态名
7. "Title": 文章标题
8. "Authors": 作者表格（非盲审时显示）
9. "Keywords": 关键词（如果有）
10. "Submitted to Section": 章节（如果有）
11. "Submitted to Special Issue": 特刊（如果有）
12. "Submission Received": 日期
13. "Accepted": 日期（如果有）
14. "Published": 日期（如果有）

---

## 区块 3：Ethics Issue 详情头
```html
<div class="user_box user_box_wide" id="ethic-issue_info">
  <h1>
    <button onclick="window.location.href='#'" class="submit float-right margin-left-1" title="Edit issue">Edit Issue</button>
  </h1>
</div>
```
.user_box: padding 0.8em, font-size 9pt (12px), background #ffffff, width 45%
.user_box_wide: width 100%, box-sizing border-box
#ethic-issue_info h1: margin 0 0 10px 0, min-height 30px

legend 内图标：
```html
<legend>
  Ethics Issue - 12345
  <a href="javascript:void(0);" class="manuscript-special-issue-notes" data-load-url="#">
    <!-- 有 notes 时 -->
    <i class="ms ms-note-add ms-faded tooltip-info" title="Ethics Issue notes"></i>
    <!-- 无 notes 时 -->
    <!-- <i class="ms ms-note ms-faded tooltip-info" title="Ethics Issue notes"></i> -->
  </a>
</legend>
```

---

## 区块 4：.caption table 详情表格（2列布局，th-td-th-td）
结构：
```html
<div class="caption">
  <table width="100%" cellpadding="0" cellspacing="0">
```

.caption table CSS:
  width 100%, border-collapse collapse
  th: font-weight bold, background-color #f2f2f2, padding 8px 10px, text-align left, width 15%, border-bottom 1px solid #ddd, white-space nowrap, vertical-align top
  td: font-weight normal, padding 8px 10px, border-bottom 1px solid #eee, vertical-align top

Row 1: "Issue Status" | Under Investigation | "Submission Date" | 2026-01-20
Row 2: "Priority" | High | "Issue Type" | Research Integrity
Row 3: "Doi Id" | 10.3390/s23010123（有 sameDoiIssues 时显示红色粗体） | "Manuscript ID" | sensors-12345（链接新窗口）
Row 4: "Coordinator" | Jane Doe | "Complainant Name/E-Mail" | email@test.com
Row 5: "Watchers" | watcher 列表 + 加号 | "Result" | No Misconduct
Row 6: "Title of Complaint" | 投诉标题 | "Related Manuscripts" | 稿件链接列表
Row 7: "Public Forum with Same DOI" | Case 链接列表（条件显示）

Watchers 区域：
```html
<span id="watcher-1">Alice Wang</span>
<a href="#" class="tooltip-info color-red" title="Delete Watcher" onclick="return confirm('Are you sure to delete this watcher?');"><i class="fa fa-trash" aria-hidden="true"></i></a>
<br>
<i id="add-watcher" title="Add Watcher" class="fa fa-lg fa-plus-circle" aria-hidden="true"></i>
```

DOI 有 sameDoiIssues 时：
```html
<a class="show-dialog-btn morandiRed" style="font-weight: bold;" data-url="#" title="Other Issue(s) with same Manuscript ID">10.3390/s23010123 <span class="ms ms-filled ms-xm morandiRed">error</span></a>
```

PubPeer Cases 行：
```html
<a href="#">Case - 678</a> (Follow-up: Open) <br>
```

---

## 区块 5：Description 描述
```html
<div class="user_box user_box_wide">
  <b>Description:</b>
  <div id="content-12345">
    <p>描述内容...</p>
  </div>
  <!-- 修订编辑器（隐藏） -->
  <span style="display: none;" class="update-revised-content" id="change-revised-content-12345">
    <textarea id="revised-content-12345" class="tiny-mce-editor" cols="60" rows="6" placeholder="Revised Description"></textarea>
    <input data-id="12345" type="button" value="Submit" class="submit submit-revised-content"> or <a href="#" onclick="cancelAddRevisedContent(12345); return false;">Cancel</a>
  </span>
  <!-- 编辑按钮 -->
  <div class="float-right change-buttons">
    <a href="javascript:void(0);" data-id="12345" class="change-revised-content-button tooltip-info" title="Revised Description">
      <i class="ms ms-edit"></i>
    </a>
  </div>
</div>
```

---

## 区块 6：File Attachments 文件附件
切换链接（绿色加粗）：
```html
<a href="#" class="colorFGreen" style="font-weight: bold;" id="files-additional-info-button">Display Files [+]</a>
```

文件列表（默认 display: none）：
每个文件格式 → 图标 + 文件名 + <span class="color-gray">用户名 ,日期</span>
无文件时显示 "No Files"

图标映射（用 emoji 或小占位图）：
doc/docx → 📄, pdf → 📕, zip/tar/tar.gz → 📦, jpg/png → 🖼, xlsx/xls → 📊, ppt/pptx → 📑

上传表单（有编辑权限时显示）：
```html
<div class="quickform">
  <form>
    <div><fieldset>
      <div class="row grid-x grid-padding-x grid-margin-y">
        <div class="cell small-12 medium-6 large-2"></div>
        <div class="cell small-12 medium-6 large-8">
          <input class="submit" type="submit" value="Upload">
        </div>
      </div>
    </fieldset></div>
  </form>
</div>
```

---

## 区块 7：Feeds（仅内部编辑显示）
```html
<div class="issue_feed">
  <div class="row grid-x grid-padding-x grid-margin-y">
    <div class="cell small-12 medium-6 large-2"></div>
    <div class="cell small-12 medium-6 large-8 break-word">
      <a href="#" style="font-weight: bold;" class="display-feed-btn colorFGreen" data-title="Issue Feed" data-url="#">Display Feeds</a>
    </div>
  </div>
</div>
```
.issue_feed: padding 0.8em

---

## 区块 8：Comments 评论

每条评论：
分隔线 .separator-line → display block, clear both, width 100%, margin 15px 0, border-bottom 1px #CCCCCC solid

变更历史（NORMAL 类型，且是内部编辑时）：
```html
<li><strong>字段名</strong> updated from <i>旧值</i> to <i>新值</i></li>
<li><strong>字段名</strong> set to <i>新值</i></li>
<li><strong>字段名</strong> delete from <i>旧值</i></li>
<li><strong>发件人</strong> send email <i>"主题"</i> to <strong>收件人</strong></li>
```

评论主体：
```html
<div class="user_box user_box_wide margin-bottom-1">
  <div id="comment-1">
    <!-- 有 revisedCommentContent 时 -->
    <div class="margin-bottom-1"><b>Revised by Admin User</b>  <span class="color-gray float-right">2026-02-10 14:30</span></div>
    <div id="revised-comment-1">修订内容... Issue Attachment:<a href="#"> file.pdf</a><br></div>
    <!-- 无修订内容时显示原始 -->
    <!-- <div class="margin-bottom-1"><b>Editor Name</b><span class="color-gray float-right">2026-01-20 10:00</span></div>
    <div id="comment-file-1">原始评论内容...</div> -->
  </div>
  <!-- 编辑框（display none） -->
  <span style="display: none;" class="comment-to-editor" id="change-comment-1">
    <textarea id="new-comment-1" class="tiny-mce-editor" cols="60" rows="6" placeholder="Revised Comment"></textarea>
    <input data-id="1" type="button" value="Submit" class="submit submit-comment"> or <a href="javascript:void(0);" class="cancelComment" data-id="1" data-commentType="add">Cancel</a>
  </span>
  <span style="display: none;" class="comment-to-editor" id="change-revised-comment-1">
    <textarea id="new-revised-comment-1" class="tiny-mce-editor" cols="60" rows="6" placeholder="Revised Comment"></textarea>
    <input data-id="1" type="button" value="Submit" class="submit submit-revised-comment"> or <a href="javascript:void(0);" class="cancelComment" data-id="1" data-commentType="update">Cancel</a>
  </span>
  <div class="float-right change-buttons">
    <!-- 有修订内容时 -->
    <a href="javascript:void(0);" data-id="1" class="change-revised-comment-button tooltip-info" title="Update Revised Comment"><i class="ms ms-edit"></i></a>
    <!-- 无修订内容时 -->
    <!-- <a href="javascript:void(0);" data-id="1" class="comment-to-editor-button tooltip-info" title="Add Revised Comment"><i class="ms ms-edit"></i></a> -->
  </div>
</div>
```

非 NORMAL 类型的评论上方显示：
```html
<div class="user_box user_box_wide"><b>Comments for editors (will not be revealed to authors/reader)</b></div>
```

底部按钮：
```html
<button onclick="window.location.href='#'" class="submit float-right margin-left-1" title="Add Comment">Add Comment</button>
```

---

## 区块 9：隐藏对话框占位
```html
<!-- Add Watcher 表单 -->
<form id="dialog" style="display: none;" class="QuickForm2" action="#" method="get">
  <div class="row grid-x grid-padding-x grid-margin-y">
    <div class="cell small-12 medium-6 large-2"><label><span class="required">*</span> Email</label></div>
    <div class="cell small-12 medium-6 large-8">
      <input id="add-watcher-select" name="watcher_email" type="text" class="quick-search-no-jump" placeholder="Add Watcher email" autocomplete="true" required>
    </div>
  </div>
  <input name="issue_id" value="12345" type="hidden">
  <div class="row grid-x grid-padding-x grid-margin-y">
    <div class="cell small-12 medium-6 large-2"></div>
    <div class="cell small-12 medium-6 large-8">
      <input class="submit" type="submit" value="Add" id="submit_watcher">
    </div>
  </div>
</form>

<div id="edit-history-feed-browser" title="Assigned History" style="display: none;"></div>
<div id="manuscript-special-issue-notes" title="Ethics Issue Notes" style="display: none;"></div>
<div id="feed_dialog" style="display: none;"></div>
<div id="feed_details_dialog" style="display: none;"></div>
```

---

## 核心 CSS 类（属性全部列出）

### .submit（按钮）
display: inline-block, padding 6px 12px, font-size 14px, font-weight 400, line-height 1.42857143, text-align center, white-space nowrap, vertical-align middle, cursor pointer, user-select none, background-image none, border 1px solid transparent, border-radius 4px, color #FFFFFF, background-color #4f5671, border-color #4f5671
:hover: background-color #3d4460, border-color #3d4460
:active: background-color #2c3249, border-color #2c3249, transform translateY(0.5px)
:disabled: background-color #F1F2F4, border-color #B3B9C4, color #B3B9C4, cursor not-allowed

### .ms（Material Symbols 图标基类）
font-family "Material Symbols Outlined", font-weight normal, font-style normal, font-size 18px, line-height 1, letter-spacing normal, text-transform none, display inline-block, white-space nowrap, word-wrap normal, direction ltr, -webkit-font-feature-settings "liga", -webkit-font-smoothing antialiased, cursor pointer, color #4f5671, vertical-align middle
:hover color #3156a2

### .ms 尺寸变体
.ms-xs: font-size 12px
.ms-sm: font-size 14px
.ms-xm: font-size 16px
.ms-lg: font-size 20px
.ms-xl: font-size 24px
.ms-filled: color #4f5671, font-variation-settings "FILL" 1
.ms-faded: color #172B4D
.ms-faded:hover: color #172B4D

### .ms 图标 content（使用 before 伪元素）
.ms-note:before { content: "\e091"; }
.ms-note-add:before { content: "\e09e"; color: #8FB529; }
.ms-note-add:hover:before { color: #A6CE39; }
.ms-edit:before { content: "\e3c9"; }
.ms-error:before { content: "\e000"; }

### 工具类
.float-right: float right !important
.margin-left-1: margin-left 10px !important
.margin-bottom-1: margin-bottom 10px !important
.cursor-pointer: cursor pointer !important
.color-red: color red !important
.color-gray: color #8a8a8a !important
.colorFGreen: color #007f7f !important
.morandiRed: color #ff0000 !important
.required: color #CC3333
.required sup: top 0, font-size 1.25rem
.quick-search-no-jump: width 100%, padding 5px 8px, border 1px solid #cacaca, border-radius 4px, font-size 14px, line-height 1.5
.ui-autocomplete: z-index 11111 !important

---

## JavaScript 交互行为（全部）

1. 防重复提交：所有 form submit 后禁用自身
2. Add Watcher 对话框：$('#dialog').dialog({autoOpen:false, title:"Add Watcher", width:600, modal:true}) → #add-watcher 点击时打开 → #submit_watcher 点击时校验空值
3. Description 修订编辑：点击 .change-revised-content-button → 隐藏 #content-{id} 和 .change-buttons → 显示 #change-revised-content-{id}
4. Comment 编辑切换：点击 .comment-to-editor-button → 隐藏 #comment-file-{id} 和自身 → 显示 #change-comment-{id}
5. Revised Comment 编辑切换：点击 .change-revised-comment-button → 隐藏 #revised-comment-{id} 和自身 → 显示 #change-revised-comment-{id}
6. 取消编辑(cancelComment)：点击 .cancelComment → 显示对应区域，隐藏编辑区域。data-commentType="update" 时显示 revised-comment，否则显示 comment-file
7. Submit Comment：AJAX POST /user/issues/update-revised-comment → 成功后 window.location.reload（demo 中 alert 模拟）
8. Submit Revised Content：AJAX POST /user/issues/update-revised-content → 成功后 reload（demo alert）
9. Submit Revised Comment：AJAX POST /user/issues/update-revised-comment → 成功后 reload（demo alert）
10. 文件切换：点击 #files-additional-info-button → .files-additional-info toggle() → 文字在 "Display Files [+]" 和 "Collapse [-]" 间切换
11. Edit History Dialog：点击 a[data-edit-history-url] → $.get(url) → 内容填入 #edit-history-feed-browser 后 .dialog('open')
12. Notes 对话框：点击 .manuscript-special-issue-notes → $.get(url) → 创建 dialog
13. Feeds：点击 .display-feed-btn → 打开 #feed_dialog 模态框
14. cancelAddRevisedContent(id)：全局函数 → 显示 #content-{id} 和 .change-buttons → 隐藏 #change-revised-content-{id}
15. cancelComment(id)：全局函数 → 显示 #comment-{id} 和 .change-buttons → 隐藏 #change-comment-{id}
16. cancelSecondComment(id)：全局函数 → 显示 .change-buttons → 隐藏 #comment-to-comment-{id}
17. 确认删除 Watcher：通过 onclick="return confirm(...)" 处理
18. Show Dialog（same DOI）：点击 .show-dialog-btn → 弹出 modal dialog

---

## 模拟数据建议
- 有稿件信息，状态 Published
- Issue ID=12345, Status="Under Investigation", Priority="High", Issue Type="Research Integrity"
- DOI=10.3390/s23010123（有 sameDoiIssues 显示红色粗体）
- 2 watchers: Alice Wang, Bob Chen
- 2 条评论：第 1 条 NORMAL 类型带变更历史，第 2 条非 NORMAL 类型带 "Comments for editors" 标注
- 2 个文件附件：investigation_report.pdf + response_letter.docx
- 2 个 PubPeer Cases
- 当前用户为内部编辑（显示 Feeds 和所有编辑按钮）
- 有 notes（显示 ms-note-add 绿色图标）

请严格按照以上所有细节生成一个完整的单 HTML 文件。

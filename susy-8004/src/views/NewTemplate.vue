<template>
  <div class="min-h-screen" style="background-color: #f7f8f9;">
    <!-- 面包屑导航 -->
    <div class="bg-white border-b">
      <div class="px-6 py-3">
        <el-breadcrumb separator=">" class="text-sm">
          <el-breadcrumb-item>Content Management</el-breadcrumb-item>
          <el-breadcrumb-item>Email Management</el-breadcrumb-item>
          <el-breadcrumb-item>Email Templates</el-breadcrumb-item>
          <el-breadcrumb-item class="font-medium">New Template</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="p-6">
      <div class="bg-white rounded shadow-sm">
        <el-form
          ref="templateForm"
          :model="formData"
          :rules="rules"
          label-position="left"
          label-width="80px"
          class="p-6"
        >
          <!-- 第一行：ID 和 Labels -->
          <div class="form-row">
            <el-form-item label="ID" prop="id" required class="form-item-half">
              <el-input
                v-model="formData.id"
                placeholder="Please enter ID"
              />
            </el-form-item>
            <el-form-item label="Labels" class="form-item-half">
              <el-select
                v-model="formData.labels"
                multiple
                placeholder="Please select or enter labels"
                allow-create
                filterable
                default-first-option
              >
                <el-option
                  v-for="item in labelOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </div>

          <!-- 第二行：Title 和 Subject -->
          <div class="form-row">
            <el-form-item label="Title" prop="title" required class="form-item-half">
              <el-input
                v-model="formData.title"
                placeholder="Please enter email title"
              />
            </el-form-item>
            <el-form-item label="Subject" prop="subject" required class="form-item-half">
              <el-input
                v-model="formData.subject"
                placeholder="Please enter email subject"
              />
            </el-form-item>
          </div>

          <!-- 邮件内容编辑器 -->
          <el-form-item label="Content" prop="content" required class="form-item-content">
            <div class="editor-wrapper">
              <!-- 临时显示，确认组件是否加载 -->
              <div v-if="!editorLoaded" class="editor-placeholder">
                Loading TinyMCE Editor...
              </div>
              <Editor
                v-if="editorLoaded"
                v-model="formData.content"
                :init="editorConfig"
                :disabled="false"
                @onInit="onEditorInit"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'

export default {
  name: 'NewTemplate',
  components: {
    Editor
  },
  data() {
    return {
      editorLoaded: false,
      formData: {
        id: '',
        labels: [],
        title: '',
        subject: '',
        content: `<p>This is an HTML-formatted email template content, 
<a href="#" style="color: #1a6eb4; text-decoration: underline;">here is a hyperlink</a>, 
<strong>here is bold text</strong>, 
<span style="color: #d9534f;">here is colored text</span>, 
<em>here is italic text</em>.
</p>
        <p>这里输入的html标签会自动转码；&nbsp;</p>
<p>The HTML tags entered here will be automatically encoded&nbsp;&nbsp;</p>
<p>e.g.</p>
<p>&lt;a href="blank"&gt;Welcome to SuSy&lt;/a&gt;</p>
<p>will not be displayed as</p>
<p><a href="blank">Welcome to SuSy</a></p>
<p><br></p>
<p><span style="color: rgb(53, 152, 219);"><strong>The prototype is for demonstration and reference only. In the project, please directly replace the text editor component.</br>原型只用于演示参考，项目中请直接替换文本域组件</strong></span></p>
<p><br></p>`
      },
      labelOptions: [],
      editorConfig: {
        apiKey: 'xrdzt2c801lgn5s5m85e1c43qhxx8mi0qoinytqijhwntuop',
        height: 600,
        menubar: false,
        plugins: [
          'link', 'contextmenu', 'fullscreen', 'code'
        ],
        toolbar: 'undo redo | bold italic underline | forecolor | removeformat | link | code | fullscreen',
        contextmenu: 'cut copy paste | link',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; line-height:1.6; background-color:#f8f9fd; }',
        branding: false,
        resize: true,
        elementpath: true,
        paste_as_text: false,
        valid_elements: 'strong,em,span[style],u,br,p,a[href]',
        valid_styles: {'*':'color'},
        statusbar: true
      },
      rules: {
        id: [
          { required: true, message: 'Please enter ID', trigger: 'blur' }
        ],
        title: [
          { required: true, message: 'Please enter email title', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: 'Please enter email subject', trigger: 'blur' }
        ],
        content: [
          { required: true, message: 'Please enter email content', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    onEditorInit() {
      console.log('TinyMCE editor initialized successfully')
    },
    toggleFullscreen() {
      // TinyMCE 自带全屏功能
      this.$message.info('Use the fullscreen button in the editor toolbar')
    },
    submitForm() {
      this.$refs.templateForm.validate((valid) => {
        if (valid) {
          console.log('Form data:', this.formData)
          this.$message.success('Template saved successfully')
        } else {
          this.$message.error('Please fill in all required fields')
          return false
        }
      })
    }
  },
  mounted() {
    console.log('NewTemplate component mounted')
    console.log('Editor component:', Editor)
    
    // 延迟加载编辑器，确保 DOM 准备就绪
    this.$nextTick(() => {
      setTimeout(() => {
        this.editorLoaded = true
        console.log('Editor loading enabled')
      }, 500)
    })
  }
}
</script>

<style scoped>
/* 面包屑样式 */
::v-deep .el-breadcrumb__inner {
  color: #606266;
}

::v-deep .el-breadcrumb__item:last-child .el-breadcrumb__inner {
  color: #303133;
  font-weight: 500;
}

/* 表单行布局 */
.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 0;
}

/* 半宽表单项 */
.form-item-half {
  flex: 1;
  margin-bottom: 18px !important;
}

/* 内容编辑器表单项 */
.form-item-content {
  margin-bottom: 0 !important;
  margin-top: 6px;
}

/* 编辑器容器 */
.editor-wrapper {
  width: 100%;
  min-height: 600px;
}

/* 编辑器占位符 */
.editor-placeholder {
  width: 100%;
  height: 600px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  color: #909399;
  font-size: 14px;
}

/* TinyMCE 编辑器样式 */
.form-item-content ::v-deep .tox-tinymce {
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.form-item-content ::v-deep .tox-tinymce:hover {
  border-color: #c0c4cc;
}

.form-item-content ::v-deep .tox-tinymce.tox-tinymce--focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 表单项基础样式 */
::v-deep .el-form-item__label {
  color: #606266;
  font-weight: 500;
  padding-bottom: 0;
  line-height: 32px;
}

::v-deep .el-form-item.is-required:not(.is-no-asterisk) .el-form-item__label::before {
  color: #f56c6c;
  margin-right: 4px;
}

/* 确保错误提示有足够空间 */
::v-deep .el-form-item__error {
  position: relative;
  top: 0;
  padding-top: 2px;
  line-height: 1.4;
}

/* 内容区域的错误提示 */
.form-item-content ::v-deep .el-form-item__error {
  position: relative;
  top: -10px;
}

/* 输入框样式 */
::v-deep .el-input,
::v-deep .el-select {
  width: 100%;
}

::v-deep .el-input__inner,
::v-deep .el-textarea__inner {
  border-radius: 4px;
}

::v-deep .el-textarea__inner {
  font-family: 'Courier New', Courier, monospace;
}

/* 多选标签样式 */
::v-deep .el-select__tags {
  max-width: 100%;
}
</style>

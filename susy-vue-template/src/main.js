import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 先加载主题（变量 + @theme），再加载组件样式
import './styles/main.css'
import '@mdpi-ui/design-system/styles'
// 外框与目录的衔接样式，放在最后以覆盖必要布局
import './styles/susy-frame.css'

createApp(App).use(router).mount('#app')

// 设计系统的弹层（对话框、滑块提示等）会挂到 body 下，不在内容区的 .v-3 子树里，
// 这里给 body 新增的挂载点补上 v-3 标记，让 SuSy 旧框架样式同样不作用到它们
function markPortalRoots() {
  for (const el of document.body.children) {
    if (el.id !== 'app' && !el.classList.contains('v-3')) el.classList.add('v-3')
  }
}

new MutationObserver(markPortalRoots).observe(document.body, { childList: true })
markPortalRoots()

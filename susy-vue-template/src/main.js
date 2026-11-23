import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 先加载主题（变量 + @theme），再加载组件样式
import './styles/main.css'
import '@mdpi-ui/design-system/styles'
// 外框与目录的衔接样式，放在最后以覆盖必要布局
import './styles/susy-frame.css'

createApp(App).use(router).mount('#app')

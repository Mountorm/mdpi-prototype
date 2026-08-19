import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 原型工程：base 用相对路径，build 产物可直接静态部署
export default defineConfig({
  base: './',
  plugins: [vue()],
  server: {
    port: 5173,
    open: false,
  },
})

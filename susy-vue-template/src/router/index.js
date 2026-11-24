import { createRouter, createWebHistory } from 'vue-router'

const categoryKeys = ['actions', 'inputs', 'data-display', 'feedback', 'navigation', 'layout']

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Home' },
  },
  {
    path: '/components',
    name: 'components',
    component: () => import('@/views/DesignSystemView.vue'),
    meta: { title: 'Components' },
  },
  // 旧的分类路由统一收进组件页，保留跳转避免历史链接失效
  ...categoryKeys.map((key) => ({ path: `/${key}`, redirect: '/components' })),
  { path: '/overview', redirect: '/components' },
  { path: '/design-system', redirect: '/components' },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | SuSy` : 'SuSy'
})

export default router

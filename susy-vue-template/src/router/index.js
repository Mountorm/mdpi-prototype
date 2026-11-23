import { createRouter, createWebHashHistory } from 'vue-router'

const categoryKeys = ['actions', 'inputs', 'data-display', 'feedback', 'navigation', 'layout']

const routes = [
  { path: '/', redirect: '/design-system' },
  {
    path: '/design-system',
    name: 'design-system',
    component: () => import('@/views/DesignSystemView.vue'),
    meta: { title: 'Design System' },
  },
  // 旧的分类路由统一收进单一路由，保留跳转避免历史链接失效
  ...categoryKeys.map((key) => ({
    path: `/${key}`,
    redirect: { path: '/design-system', hash: `#${key}` },
  })),
  { path: '/overview', redirect: '/design-system' },
  { path: '/:pathMatch(.*)*', redirect: '/design-system' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: 80 }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | SuSy Design System` : 'SuSy Design System'
})

export default router

import { createRouter, createWebHashHistory } from 'vue-router'

const views = {
  actions: () => import('@/views/ActionsView.vue'),
  inputs: () => import('@/views/InputsView.vue'),
  'data-display': () => import('@/views/DataDisplayView.vue'),
  feedback: () => import('@/views/FeedbackView.vue'),
  navigation: () => import('@/views/NavigationView.vue'),
  layout: () => import('@/views/LayoutView.vue'),
}

const titles = {
  actions: 'Actions',
  inputs: 'Inputs',
  'data-display': 'Data display',
  feedback: 'Feedback',
  navigation: 'Navigation',
  layout: 'Layout',
}

const routes = [
  { path: '/', redirect: '/overview' },
  {
    path: '/overview',
    name: 'overview',
    component: () => import('@/views/OverviewView.vue'),
    meta: { title: 'Components' },
  },
  ...Object.entries(views).map(([key, component]) => ({
    path: `/${key}`,
    name: key,
    component,
    meta: { title: titles[key] },
  })),
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | SuSy Design System` : 'SuSy Design System'
})

export default router

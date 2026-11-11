import { createRouter, createWebHistory } from 'vue-router'
import SubmittedManuscripts from '../components/SubmittedManuscripts.vue'
import SubmittedManuscriptsOption2 from '../components/SubmittedManuscriptsOption2.vue'

const routes = [
  { path: '/', redirect: '/submitted' },
  { path: '/submitted', component: SubmittedManuscripts, meta: { breadcrumb: 'Submitted Manuscripts (Option 1)' } },
  { path: '/submitted-option2', component: SubmittedManuscriptsOption2, meta: { breadcrumb: 'Submitted Manuscripts (Option 2)' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

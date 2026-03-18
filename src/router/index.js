import { createRouter, createWebHashHistory } from 'vue-router'
import ManageManuscripts from '../components/ManageManuscripts.vue'
import ProcessManuscript from '../components/ProcessManuscript.vue'
import SubmittedManuscripts from '../components/SubmittedManuscripts.vue'
import DetectionAssistant from '../components/DetectionAssistant.vue'
import Dashboard from '../components/Dashboard.vue'
import DetectionManagement from '../components/DetectionManagement.vue'
import ItemVisibility from '../components/ItemVisibility.vue'
import UserOverview from '../components/UserOverview.vue'

const routes = [
  { path: '/', redirect: '/manuscripts' },
  { path: '/dashboard', component: Dashboard, meta: { breadcrumb: 'Dashboard' } },
  { path: '/user-overview', component: UserOverview, meta: { breadcrumb: 'User Overview' } },
  { path: '/manuscripts', component: ManageManuscripts, meta: { breadcrumb: 'Manage Manuscripts' } },
  { path: '/process', component: ProcessManuscript, meta: { breadcrumb: 'Process Manuscript' } },
  { path: '/submitted', component: SubmittedManuscripts, meta: { breadcrumb: 'Submitted Manuscripts' } },
  { path: '/detection-assistant', component: DetectionAssistant, meta: { breadcrumb: 'Detection Assistant' } },
  { path: '/detection-management', component: DetectionManagement, meta: { breadcrumb: 'Keywords' } },
  { path: '/item-visibility', component: ItemVisibility, meta: { breadcrumb: 'Configuration' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router

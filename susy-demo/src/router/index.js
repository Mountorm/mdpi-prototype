import { createRouter, createWebHistory } from 'vue-router'
import ManageManuscripts from '../components/ManageManuscripts.vue'
import ProcessManuscript from '../components/ProcessManuscript.vue'
import SubmittedManuscripts from '../components/SubmittedManuscripts.vue'
import DetectionAssistant from '../components/DetectionAssistant.vue'
import Dashboard from '../components/Dashboard.vue'
import DetectionManagement from '../components/DetectionManagement.vue'
import ItemVisibility from '../components/ItemVisibility.vue'
import UserOverview from '../components/UserOverview.vue'
import ReportBuilder from '../views/ReportBuilder.vue'
import ReportPreview from '../views/ReportPreview.vue'

const routes = [
  { path: '/', redirect: '/manuscripts' },
  { path: '/dashboard', component: Dashboard, meta: { breadcrumb: 'Dashboard' } },
  { path: '/user-overview', component: UserOverview, meta: { breadcrumb: 'User Overview' } },
  { path: '/manuscripts', component: ManageManuscripts, meta: { breadcrumb: 'Manage Manuscripts' } },
  { path: '/process', component: ProcessManuscript, meta: { breadcrumb: 'Process Manuscript' } },
  { path: '/submitted', component: SubmittedManuscripts, meta: { breadcrumb: 'Submitted Manuscripts' } },
  { path: '/detection-assistant', component: DetectionAssistant, meta: { breadcrumb: 'Detection Assistant' } },
  { path: '/report-builder', component: ReportBuilder, meta: { breadcrumb: 'Report Builder' } },
  { path: '/report-preview', component: ReportPreview, meta: { breadcrumb: 'Report Preview' } },
  { path: '/keywords', component: DetectionManagement, meta: { breadcrumb: 'Keywords' } },
  { path: '/item-visibility', component: ItemVisibility, meta: { breadcrumb: 'Configuration' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

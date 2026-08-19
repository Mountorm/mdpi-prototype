import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '../views/IndexView.vue'
import AppShell from '../layouts/AppShell.vue'
import ReportShell from '../layouts/ReportShell.vue'
import AceChecklist from '../views/AceChecklist.vue'
import GenerateView from '../views/GenerateView.vue'
import ReportView from '../views/ReportView.vue'
import ReportSnapView from '../views/ReportSnapView.vue'

const routes = [
  // Home: three buttons as the entry menu
  { path: '/', name: 'home', component: IndexView },
  // Configuration reuses the original app shell (top bar / sidebar / breadcrumb)
  {
    path: '/config',
    component: AppShell,
    children: [{ path: '', name: 'config', component: AceChecklist }],
  },
  // Report pages use their own shell (header + static sidebar from susy-demo)
  {
    path: '/generate',
    component: ReportShell,
    children: [{ path: '', name: 'generate', component: GenerateView }],
  },
  {
    path: '/report',
    component: ReportShell,
    children: [{ path: '', name: 'report', component: ReportView }],
  },
  {
    path: '/report1',
    component: ReportShell,
    children: [{ path: '', name: 'report-snap-attention', component: ReportSnapView }],
  },
  {
    path: '/report2',
    component: ReportShell,
    children: [{ path: '', name: 'report-snap-category', component: ReportSnapView }],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

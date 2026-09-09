<script setup>
// Report shell layout: white top header + fixed sidebar + routed content.
// Header / sidebar visually follow susy-demo. The sidebar menu is static:
// a single "Technical Precheck Report" group with only the two report pages.
// The breadcrumb area can be replaced by a page-level toolbar: the routed
// view registers one via provide('registerToolbar') (used by /generate).
import { ref, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import MdIcon from '../components/MdIcon.vue'
import GenToolbar from '../components/GenToolbar.vue'

const route = useRoute()
const collapsed = ref(false)
const groupOpen = ref(true)

// Page-level toolbar slot: { manuscript, onReset, onGenerate } or null
const toolbarProps = ref(null)
provide('registerToolbar', (props) => { toolbarProps.value = props })

// Header nav links (kept as in susy-demo, non-navigating)
const navLinks = ['Journals', 'Topics', 'Information', 'Author Services', 'Initiatives', 'About']

// Static sidebar menu: report pages under "Technical Precheck Report"
const menuItems = [
  { to: '/generate', label: 'Generate Report' },
  { to: '/report', label: 'Report Page' },
  { to: '/report1', label: 'Report Snap · Attention' },
  { to: '/report2', label: 'Report Snap · Category' },
]

const pageTitle = computed(() => {
  if (route.path.startsWith('/generate')) return 'Generate Report'
  if (route.path.startsWith('/report1')) return 'Report Snap · Attention'
  if (route.path.startsWith('/report2')) return 'Report Snap · Category'
  return 'Report Page'
})

const toggleGroup = () => { groupOpen.value = !groupOpen.value }
</script>

<template>
  <div class="report-shell">
    <!-- ========== Header (from susy-demo) ========== -->
    <header class="report-header">
      <img
        src="https://susy.mdpi.com/build/img/icon/SUSY_logo.svg?56d587c"
        alt="SuSy Logo"
        class="header-logo"
      />
      <nav class="header-nav">
        <a v-for="l in navLinks" :key="l" href="#" class="header-nav-link" @click.prevent>{{ l }}</a>
      </nav>
      <div class="header-right">
        <button class="submit-btn">Submit</button>
        <span class="header-email">hongqiang.cui@mdpi.com</span>
      </div>
    </header>

    <!-- ========== Sidebar (from susy-demo, static menu) ========== -->
    <aside class="report-sidebar" :class="{ collapsed }">
      <nav class="sidebar-nav">
        <div class="menu-group">
          <div class="menu-group-title" @click="toggleGroup">
            <template v-if="!collapsed">
              <span>Technical Precheck Report</span>
              <MdIcon name="expand_more" :size="16" class="group-arrow" :class="{ open: groupOpen }" />
            </template>
            <template v-else>
              <span class="group-abbr">A</span>
            </template>
          </div>
          <ul v-if="!collapsed && groupOpen" class="menu">
            <li
              v-for="item in menuItems"
              :key="item.to"
              :class="{ active: route.path === item.to }"
            >
              <RouterLink :to="item.to" class="menu-item">{{ item.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </nav>
      <div class="sidebar-footer">
        <button
          class="toggle-btn"
          type="button"
          :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="collapsed = !collapsed"
        >
          <MdIcon :name="collapsed ? 'menu_open' : 'menu'" :size="20" />
        </button>
      </div>
    </aside>

    <!-- ========== Main ========== -->
    <div
      class="report-main"
      :style="{ marginLeft: collapsed ? '48px' : 'var(--sidebar-width)' }"
    >
      <!-- Breadcrumb slot: replaced by the page toolbar when one is registered -->
      <GenToolbar v-if="toolbarProps" v-bind="toolbarProps" />
      <div v-else class="report-breadcrumb">
        <span>SuSy</span>
        <span class="sep">/</span>
        <span class="current">{{ pageTitle }}</span>
      </div>
      <main class="report-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<!-- Global print rules so "Print / Save as PDF" produces a clean report sheet:
     hide the app chrome (header / sidebar / breadcrumb / toolbar), keep colors. -->
<style>
@media print {
  .report-header,
  .report-sidebar,
  .report-breadcrumb,
  .gen-toolbar { display: none !important; }
  .report-main { margin: 0 !important; height: auto !important; }
  .report-content { overflow: visible !important; padding: 0 !important; }
  .report-shell { height: auto !important; overflow: visible !important; }
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
@page { size: A4; margin: 16mm 14mm; }
</style>

<style scoped>
.report-shell {
  --sidebar-width: 240px;
  height: 100vh;
  overflow: hidden;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* ---- Header ---- */
.report-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  gap: 1rem;
  z-index: 110;
}
.header-logo { width: 90px; height: 36px; flex-shrink: 0; }
.header-nav { display: flex; align-items: center; gap: 24px; height: 100%; margin-left: 1rem; }
.header-nav-link {
  font-size: 14px;
  font-weight: 500;
  color: #172b4d;
  text-decoration: none;
  height: 100%;
  display: flex;
  align-items: center;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}
.header-nav-link:hover { color: #1f6ad4; border-bottom-color: #1f6ad4; }
.header-right { margin-left: auto; display: flex; align-items: center; gap: 16px; }
.submit-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #0156ce;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s;
}
.submit-btn:hover { background: #014bb5; }
.header-email { font-size: 14px; font-weight: 500; color: #172b4d; }

/* ---- Sidebar ---- */
.report-sidebar {
  position: fixed;
  top: 64px;
  left: 0;
  height: calc(100vh - 64px);
  width: var(--sidebar-width);
  border-right: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
  transition: width 0.3s ease-in-out;
}
.report-sidebar.collapsed { width: 48px; }
.sidebar-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 16px 4px; }
.menu-group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  margin-bottom: 8px;
  padding: 0 0.6rem;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}
.group-abbr { font-size: 12px; font-weight: 700; }
.group-arrow {
  color: #94a3b8;
  transition: transform 0.2s;
}
.group-arrow.open { transform: rotate(180deg); }
.menu { list-style: none; padding: 0; margin: 0; }
.menu li {
  font-size: 14px;
  padding: 8px 0 8px 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  white-space: nowrap;
}
.menu li:hover { background: #f5f7ff; }
.menu li.active { background: #e6eefa; }
.menu-item {
  text-decoration: none;
  display: block;
  width: 100%;
  white-space: nowrap;
  font-weight: 500;
  color: #626f86;
}
.menu li.active .menu-item { color: #0156ce; }
.sidebar-footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;
  padding: 0 6px;
  flex-shrink: 0;
}
.toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  color: #94a3b8;
}
.toggle-btn:hover { opacity: 0.7; }

/* ---- Main ---- */
.report-main {
  height: calc(100vh - 64px);
  margin-top: 64px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease-in-out;
}
.report-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #626f86;
  background: #fff;
}
.report-breadcrumb .sep { color: #c0c4cc; }
.report-breadcrumb .current { color: #172b4d; font-weight: 500; }
.report-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
</style>

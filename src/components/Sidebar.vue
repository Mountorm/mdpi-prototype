<template>
  <aside
    :class="['sidebar', { 'collapsed': isCollapsed }]"
  >
    <!-- 导航菜单 -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-1">

      <!-- 展开状态：正常菜单 -->
      <template v-if="!isCollapsed">
        <div class="mb-6" style="width: auto;" v-for="group in groups" :key="group.key">
          <div class="menu-group-title" @click="toggleGroup(group.key)">
            <span>{{ group.label }}</span>
            <svg :class="['w-4 h-4 transition-transform', { 'rotate-180': expandedGroups[group.key] }]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 0.6rem; flex-shrink: 0;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          <ul v-if="expandedGroups[group.key]" class="menu">
            <li v-for="item in group.items" :key="item.to" :class="{ 'active': route.path === item.to }">
              <RouterLink :to="item.to" class="menu-item">{{ item.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </template>

      <!-- 折叠状态：首字母，hover 触发浮层 -->
      <template v-else>
        <div
          v-for="group in groups"
          :key="group.key"
          class="collapsed-group"
          @mouseenter="onGroupEnter(group.key, $event)"
          @mouseleave="scheduleClose"
        >
          <div class="collapsed-group-label">{{ group.abbr }}</div>
        </div>
      </template>
    </nav>

    <!-- 底部操作栏 -->
    <div class="sidebar-footer">
      <template v-if="!isCollapsed">
        <button class="footer-icon-btn" title="Feedback">
          <span class="material-symbols-outlined" style="font-size: 20px;">feedback</span>
        </button>
      </template>

      <button class="toggle-btn" @click="$emit('toggle')" :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <span class="material-icons" style="font-size: 20px;">
          {{ isCollapsed ? 'menu_open' : 'menu' }}
        </span>
      </button>
    </div>
  </aside>

  <!-- flyout 挂到 body，脱离 sidebar 层叠上下文，z-index 不受限制 -->
  <Teleport to="body">
    <div
      v-if="hoveredGroup"
      class="sidebar-flyout-menu"
      :style="{ top: flyoutTop + 'px' }"
      @mouseenter="cancelClose"
      @mouseleave="scheduleClose"
    >
      <div class="sidebar-flyout-title">{{ activeGroup?.label }}</div>
      <ul class="sidebar-flyout-list">
        <li v-for="item in activeGroup?.items" :key="item.to" :class="{ 'active': route.path === item.to }">
          <RouterLink :to="item.to" class="sidebar-flyout-item" @click="hoveredGroup = null">{{ item.label }}</RouterLink>
        </li>
      </ul>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  isCollapsed: { type: Boolean, default: false }
})

defineEmits(['toggle'])

const route = useRoute()
const hoveredGroup = ref(null)
const flyoutTop = ref(0)
let closeTimer = null

const expandedGroups = reactive({
  account: true, editorial: true, management: true,
  group4: true, group5: true, group6: true, group7: true,
  group8: true, group9: true, group10: true
})

const groups = [
  {
    key: 'account',
    label: 'Account',
    abbr: 'A',
    items: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/user-overview', label: 'User Overview' },
    ]
  },
  {
    key: 'editorial',
    label: 'Editorial Office',
    abbr: 'E',
    items: [
      { to: '/manuscripts', label: 'Manage Manuscripts' },
      { to: '/process', label: 'Process Manuscript' },
      { to: '/submitted', label: 'Submitted Manuscripts' },
      { to: '/detection-assistant', label: 'Detection Assistant' },
    ]
  },
  {
    key: 'management',
    label: 'Detection Management',
    abbr: 'D',
    items: [
      { to: '/detection-management', label: 'Keywords' },
      { to: '/item-visibility', label: 'Configuration' },
    ]
  },
  {
    key: 'group4',
    label: 'Group Title 4',
    abbr: 'G4',
    items: [
      { to: '#', label: 'Menu 4-1' },
      { to: '#', label: 'Menu 4-2' },
      { to: '#', label: 'Menu 4-3' },
    ]
  },
  {
    key: 'group5',
    label: 'Group Title 5',
    abbr: 'G5',
    items: [
      { to: '#', label: 'Menu 5-1' },
      { to: '#', label: 'Menu 5-2' },
    ]
  },
  {
    key: 'group6',
    label: 'Group Title 6',
    abbr: 'G6',
    items: [
      { to: '#', label: 'Menu 6-1' },
      { to: '#', label: 'Menu 6-2' },
      { to: '#', label: 'Menu 6-3' },
      { to: '#', label: 'Menu 6-4' },
    ]
  },
  {
    key: 'group7',
    label: 'Group Title 7',
    abbr: 'G7',
    items: [
      { to: '#', label: 'Menu 7-1' },
      { to: '#', label: 'Menu 7-2' },
    ]
  },
  {
    key: 'group8',
    label: 'Group Title 8',
    abbr: 'G8',
    items: [
      { to: '#', label: 'Menu 8-1' },
      { to: '#', label: 'Menu 8-2' },
      { to: '#', label: 'Menu 8-3' },
    ]
  },
  {
    key: 'group9',
    label: 'Group Title 9',
    abbr: 'G9',
    items: [
      { to: '#', label: 'Menu 9-1' },
      { to: '#', label: 'Menu 9-2' },
    ]
  },
  {
    key: 'group10',
    label: 'Group Title 10',
    abbr: 'G10',
    items: [
      { to: '#', label: 'Menu 10-1' },
      { to: '#', label: 'Menu 10-2' },
      { to: '#', label: 'Menu 10-3' },
    ]
  },
]

const activeGroup = computed(() => groups.find(g => g.key === hoveredGroup.value))

const onGroupEnter = (key, event) => {
  cancelClose()
  hoveredGroup.value = key
  const rect = event.currentTarget.getBoundingClientRect()
  flyoutTop.value = rect.top
}

const scheduleClose = () => {
  closeTimer = setTimeout(() => { hoveredGroup.value = null }, 80)
}

const cancelClose = () => {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
}

const toggleGroup = (group) => {
  expandedGroups[group] = !expandedGroups[group]
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 64px;
  left: 0;
  height: calc(100vh - 64px);
  width: var(--sidebar-width);
  background-color: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
  flex-shrink: 0;
}

.sidebar.collapsed { width: 48px; }

.sidebar:not(.collapsed) nav > * { width: var(--sidebar-width); overflow: hidden; }
.sidebar.collapsed nav { width: 48px; }

/* 细滚动条 */
.sidebar nav::-webkit-scrollbar { width: 4px; }
.sidebar nav::-webkit-scrollbar-track { background: transparent; }
.sidebar nav::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
.sidebar nav::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  flex-shrink: 0;
}

.menu-group-title {
  color: #172b4d;
  display: flex;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  padding: 0 0.6rem;
  white-space: nowrap;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.menu { list-style: none; padding: 0; margin: 0; }

.menu li {
  font-size: 14px;
  padding: 0.5rem 0 0.5rem 0.6rem;
  width: 100%;
  color: #626f86;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.menu li:hover { background-color: #f8f9fd; border-radius: 4px; }
.menu li.active { background-color: #e6eefa; color: #0156ce; font-weight: 500; border-radius: 4px; }
.menu li.active a { color: #0156ce; }

.menu-item {
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;
  white-space: nowrap;
}

.collapsed-group {
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 4px;
}

.collapsed-group:hover { background: #f8f9fd; }

.collapsed-group-label {
  font-size: 13px;
  font-weight: 700;
  color: #172b4d;
  user-select: none;
}

.sidebar-footer {
  height: 48px;
  display: flex;
  align-items: center;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
  padding: 0 4px;
}

.footer-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 4px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s;
}

.footer-icon-btn:hover { background: #f1f5f9; color: #475569; }

.toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 4px;
  color: #626f86;
  cursor: pointer;
  transition: all 0.15s;
  margin-left: auto;
}

.toggle-btn:hover { background: #f8f9fd; }
</style>

<style>
/* flyout 通过 Teleport 渲染到 body，必须全局样式 */
.sidebar-flyout-menu {
  position: fixed;
  left: 48px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  min-width: 180px;
  z-index: 9999;
  padding: 6px 0;
}

.sidebar-flyout-title {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  padding: 4px 12px 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 4px;
}

.sidebar-flyout-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-flyout-list li { display: flex; }

.sidebar-flyout-item {
  display: block;
  width: 100%;
  padding: 7px 12px;
  font-size: 13px;
  color: #626f86;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s;
}

.sidebar-flyout-item:hover { background: #f8f9fd; color: #0156ce; }

.sidebar-flyout-list li.active .sidebar-flyout-item {
  background: #e6eefa;
  color: #0156ce;
  font-weight: 500;
}
</style>

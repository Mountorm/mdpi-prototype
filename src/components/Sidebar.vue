<template>
  <aside :class="['sidebar', { 'collapsed': isCollapsed }]">
    <!-- Logo 区域 -->
    <div class="sidebar-logo">
      <img
        v-if="!isCollapsed"
        src="https://susy.mdpi.com/build/img/icon/SUSY_logo.svg?56d587c"
        alt="SuSy Logo"
        style="width: 120px; height: 48px; padding-left: 20px;"
      >
      <img
        v-else
        src="/logo.png"
        alt="SuSy"
        style="width: 28px; height: 28px; object-fit: contain;"
      >
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4">

      <!-- 展开状态：正常菜单 -->
      <template v-if="!isCollapsed">
        <div class="mb-6" v-for="group in groups" :key="group.key">
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

      <!-- 折叠状态：首字母 + hover 展开浮层 -->
      <template v-else>
        <div
          v-for="group in groups"
          :key="group.key"
          class="collapsed-group"
          @mouseenter="hoveredGroup = group.key"
          @mouseleave="hoveredGroup = null"
        >
          <div class="collapsed-group-label">{{ group.abbr }}</div>

          <!-- 右侧浮层菜单 -->
          <div v-if="hoveredGroup === group.key" class="flyout-menu">
            <div class="flyout-title">{{ group.label }}</div>
            <ul class="flyout-list">
              <li v-for="item in group.items" :key="item.to" :class="{ 'active': route.path === item.to }">
                <RouterLink :to="item.to" class="flyout-item">{{ item.label }}</RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </nav>

    <!-- 底部操作栏 -->
    <div class="sidebar-footer">
      <!-- 展开状态：feedback 图标按钮（左对齐） -->
      <template v-if="!isCollapsed">
        <button class="footer-icon-btn" title="Feedback">
          <span class="material-symbols-outlined" style="font-size: 20px;">feedback</span>
        </button>
      </template>

      <!-- 折叠/展开按钮（右对齐） -->
      <button class="toggle-btn" @click="$emit('toggle')" :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <span class="material-icons" style="font-size: 20px;">
          {{ isCollapsed ? 'menu_open' : 'menu' }}
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  isCollapsed: { type: Boolean, default: false }
})

defineEmits(['toggle'])

const route = useRoute()
const hoveredGroup = ref(null)
const expandedGroups = reactive({ account: true, editorial: true, management: true })

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
  }
]

const toggleGroup = (group) => {
  expandedGroups[group] = !expandedGroups[group]
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--sidebar-width);
  background-color: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 48px;
}

.sidebar:not(.collapsed) nav > * {
  width: var(--sidebar-width);
  overflow: hidden;
}

.sidebar.collapsed nav {
  width: 48px;
}

/* Logo */
.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  /* justify-content: center; */
  padding: 0 12px;
  /* border-bottom: 1px solid #e5e7eb; */
  flex-shrink: 0;
}

/* 展开状态菜单 */
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

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

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

/* 折叠状态 group */
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

.collapsed-group:hover {
  background: #f8f9fd;
}

.collapsed-group-label {
  font-size: 13px;
  font-weight: 700;
  color: #172b4d;
  user-select: none;
}

/* 浮层菜单 */
.flyout-menu {
  position: fixed;
  left: 48px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 180px;
  z-index: 200;
  padding: 6px 0;
}

.flyout-title {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  padding: 4px 12px 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 4px;
}

.flyout-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.flyout-list li {
  display: flex;
}

.flyout-item {
  display: block;
  width: 100%;
  padding: 7px 12px;
  font-size: 13px;
  color: #626f86;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s;
}

.flyout-item:hover { background: #f8f9fd; color: #0156ce; }

.flyout-list li.active .flyout-item {
  background: #e6eefa;
  color: #0156ce;
  font-weight: 500;
}

/* 底部操作栏 */
.sidebar-footer {
  height: 48px;
  display: flex;
  align-items: center;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
  padding: 0 4px;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
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

.footer-icon-btn:hover {
  background: #f1f5f9;
  color: #475569;
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
  color: #626f86;
  cursor: pointer;
  transition: all 0.15s;
  margin-left: auto;
}

.toggle-btn:hover {
  background: #f8f9fd;
}
</style>

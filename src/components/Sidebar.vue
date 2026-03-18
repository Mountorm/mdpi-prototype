<template>
  <aside :class="['sidebar', { 'collapsed': isCollapsed }]">
    <nav class="flex-1 overflow-y-auto py-4">
      <!-- Account Group -->
      <div class="mb-6">
        <div class="menu-group-title" @click="toggleGroup('account')" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>Account</span>
          <svg :class="['w-4 h-4 transition-transform', { 'rotate-180': expandedGroups.account }]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 0.6rem;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        <ul v-if="expandedGroups.account" class="menu">
          <li :class="{ 'active': route.path === '/dashboard' }">
            <RouterLink to="/dashboard" class="menu-item">Dashboard</RouterLink>
          </li>
          <li :class="{ 'active': route.path === '/user-overview' }">
            <RouterLink to="/user-overview" class="menu-item">User Overview</RouterLink>
          </li>
        </ul>
      </div>

      <!-- Editorial Office Group -->
      <div class="mb-6">
        <div class="menu-group-title" @click="toggleGroup('editorial')" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>Editorial Office</span>
          <svg :class="['w-4 h-4 transition-transform', { 'rotate-180': expandedGroups.editorial }]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 0.6rem;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        <ul v-if="expandedGroups.editorial" class="menu">
          <li :class="{ 'active': route.path === '/manuscripts' }">
            <RouterLink to="/manuscripts" class="menu-item">Manage Manuscripts</RouterLink>
          </li>
          <li :class="{ 'active': route.path === '/process' }">
            <RouterLink to="/process" class="menu-item">Process Manuscript</RouterLink>
          </li>
          <li :class="{ 'active': route.path === '/submitted' }">
            <RouterLink to="/submitted" class="menu-item">Submitted Manuscripts</RouterLink>
          </li>
          <li :class="{ 'active': route.path === '/detection-assistant' }">
            <RouterLink to="/detection-assistant" class="menu-item">Detection Assistant</RouterLink>
          </li>
        </ul>
      </div>
      <!-- Detection Management Group -->
      <div class="mb-6">
        <div class="menu-group-title" @click="toggleGroup('management')" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
          <span>Detection Management</span>
          <svg :class="['w-4 h-4 transition-transform', { 'rotate-180': expandedGroups.management }]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 0.6rem;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        <ul v-if="expandedGroups.management" class="menu">
          <li :class="{ 'active': route.path === '/detection-management' }">
            <RouterLink to="/detection-management" class="menu-item">Keywords</RouterLink>
          </li>
          <li :class="{ 'active': route.path === '/item-visibility' }">
            <RouterLink to="/item-visibility" class="menu-item">Configuration</RouterLink>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { reactive } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  isCollapsed: { type: Boolean, default: false }
})

defineEmits(['toggle'])

const route = useRoute()
const expandedGroups = reactive({ account: true, editorial: true, management: true })

const toggleGroup = (group) => {
  expandedGroups[group] = !expandedGroups[group]
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background-color: white;
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 0;
  border-right: none;
}

.sidebar > nav {
  min-width: var(--sidebar-width);
  width: var(--sidebar-width);
}

.menu-group-title {
  color: #172b4d;
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  padding: 0 0.6rem;
  white-space: nowrap;
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
  height: auto;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.menu li:hover {
  background-color: #f8f9fd;
  border-radius: 4px;
}

.menu li.active {
  background-color: #e6eefa;
  color: #0156ce;
  font-weight: 500;
  border-radius: 4px;
}

.menu li.active a {
  color: #0156ce;
}

.menu-item {
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;
  white-space: nowrap;
}
</style>

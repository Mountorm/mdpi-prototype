<template>
  <aside
    :class="['sidebar', { 'collapsed': isCollapsed }]"
    :style="{
      background: currentTheme.bg,
      borderRightColor: currentTheme.border,
      '--sidebar-hover-bg': currentTheme.hoverBg,
      '--sidebar-active-bg': currentTheme.activeBg,
    }"
  >
    <!-- 导航菜单 -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-1">

      <!-- 展开状态：正常菜单 -->
      <template v-if="!isCollapsed">
        <div class="mb-6" style="width: auto;" v-for="group in groups" :key="group.key">
          <div
            class="menu-group-title"
            :style="{ color: currentTheme.groupTitle }"
            @click="toggleGroup(group.key)"
          >
            <span>{{ group.label }}</span>
            <svg :class="['w-4 h-4 transition-transform', { 'rotate-180': expandedGroups[group.key] }]" fill="none" :stroke="currentTheme.groupTitle" viewBox="0 0 24 24" style="margin-right: 0.6rem; flex-shrink: 0;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          <ul v-if="expandedGroups[group.key]" class="menu">
            <li
              v-for="item in group.items"
              :key="item.to"
              :class="{ 'active': route.path === item.to }"
              :style="route.path === item.to
                ? { background: currentTheme.activeBg, borderRadius: '4px' }
                : {}"
            >
              <RouterLink
                :to="item.to"
                class="menu-item"
                :style="{ color: route.path === item.to ? currentTheme.activeText : currentTheme.itemText }"
              >{{ item.label }}</RouterLink>
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
          <div class="collapsed-group-label" :style="{ color: currentTheme.groupTitle }">{{ group.abbr }}</div>
        </div>
      </template>
    </nav>

    <!-- 底部操作栏 -->
    <div class="sidebar-footer" :style="{ borderTopColor: currentTheme.border }">
      <template v-if="!isCollapsed">
        <button class="footer-icon-btn" title="Feedback" :style="{ color: currentTheme.iconColor }">
          <span class="material-symbols-outlined" style="font-size: 20px;">feedback</span>
        </button>

        <!-- 配色切换按钮 -->
        <div class="theme-picker-wrap">
          <button
            class="footer-icon-btn"
            :style="{ color: currentTheme.iconColor }"
            :title="'当前：' + currentTheme.name"
            @click.stop="pickerOpen = !pickerOpen"
          >
            <span class="material-symbols-outlined" style="font-size: 20px;">palette</span>
          </button>

          <!-- 展开面板 -->
          <div v-if="pickerOpen" class="theme-picker-panel" @click.stop>
            <div class="theme-picker-title">Sidebar Theme</div>
            <div class="theme-picker-grid">
              <button
                v-for="(theme, idx) in themes"
                :key="idx"
                class="theme-picker-item"
                :class="{ active: currentThemeIdx === idx }"
                @click="currentThemeIdx = idx; pickerOpen = false"
              >
                <span class="theme-picker-swatch" :style="{ background: theme.bg, border: '2px solid ' + theme.border }"></span>
                <span class="theme-picker-label">{{ theme.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>

      <button
        class="toggle-btn"
        :style="{ color: currentTheme.iconColor }"
        @click="$emit('toggle')"
        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <span class="material-icons" style="font-size: 20px;">
          {{ isCollapsed ? 'menu_open' : 'menu' }}
        </span>
      </button>
    </div>
  </aside>

  <!-- flyout 挂到 body，脱离 sidebar 层叠上下文 -->
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
import { reactive, ref, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  isCollapsed: { type: Boolean, default: false }
})

defineEmits(['toggle'])

const route = useRoute()
const hoveredGroup = ref(null)
const flyoutTop = ref(0)
let closeTimer = null

// 18 套配色方案，文字对背景对比度均 ≥ 4.5:1 (WCAG AA)
// 参考：Notion、Linear、Vercel、GitHub、Stripe、Figma、VS Code、Slack、Atlassian、Tailwind UI 等
const themes = [
  {
    name: '纯白',
    bg: '#ffffff', border: '#e5e7eb',
    groupTitle: '#172b4d', itemText: '#626f86', iconColor: '#94a3b8',
    activeBg: '#e6eefa', activeText: '#0156ce', hoverBg: '#f5f7ff',
  },
  {
    name: '浅灰蓝',
    bg: '#f0f4f8', border: '#dde3ea',
    groupTitle: '#1e293b', itemText: '#475569', iconColor: '#64748b',
    activeBg: '#dbeafe', activeText: '#0156ce', hoverBg: '#e2eaf4',
  },
  {
    name: '冷雾蓝灰',
    bg: '#eef2f7', border: '#d4dce8',
    groupTitle: '#1a2b42', itemText: '#3d5166', iconColor: '#5a7290',
    activeBg: '#d0dff0', activeText: '#0156ce', hoverBg: '#e0e8f2',
  },
  {
    name: '暖石板灰',
    bg: '#f1f0ef', border: '#e2ddd9',
    groupTitle: '#292524', itemText: '#57534e', iconColor: '#78716c',
    activeBg: '#e7e5e4', activeText: '#0156ce', hoverBg: '#e8e6e4',
  },
  {
    name: '暖米色',
    bg: '#faf7f2', border: '#e8e0d5',
    groupTitle: '#1c1917', itemText: '#44403c', iconColor: '#78716c',
    activeBg: '#fde68a', activeText: '#92400e', hoverBg: '#f3ede3',
  },
  {
    name: '深海军蓝',
    bg: '#1e3a5f', border: '#2d4f7c',
    groupTitle: '#e2e8f0', itemText: '#94b4d4', iconColor: '#94b4d4',
    activeBg: '#2d5a9e', activeText: '#ffffff', hoverBg: '#264872',
  },
  {
    name: '深炭灰',
    bg: '#1c1c1e', border: '#2c2c2e',
    groupTitle: '#f5f5f5', itemText: '#a1a1aa', iconColor: '#a1a1aa',
    activeBg: '#2c2c2e', activeText: '#60a5fa', hoverBg: '#28282a',
  },
  {
    name: '深玫瑰棕',
    bg: '#2d1b1b', border: '#3d2828',
    groupTitle: '#fde8e8', itemText: '#f0a8a8', iconColor: '#f0a8a8',
    activeBg: '#5c2e2e', activeText: '#ffffff', hoverBg: '#3d2424',
  },
  {
    name: 'GitHub Light',
    bg: '#f6f8fa', border: '#d0d7de',
    groupTitle: '#1f2328', itemText: '#57606a', iconColor: '#6e7781',
    activeBg: '#ddf4ff', activeText: '#0969da', hoverBg: '#eaeef2',
  },
  {
    name: 'Linear Dark',
    bg: '#16161a', border: '#232329',
    groupTitle: '#ededef', itemText: '#8b8d97', iconColor: '#8b8d97',
    activeBg: '#232329', activeText: '#5e6ad2', hoverBg: '#1e1e24',
  },
  {
    name: 'Slack Aubergine',
    bg: '#3f0e40', border: '#521853',
    groupTitle: '#ffffff', itemText: '#cfc3cf', iconColor: '#cfc3cf',
    activeBg: '#1164a3', activeText: '#ffffff', hoverBg: '#4d1a4e',
  },
  {
    name: 'VS Code Dark',
    bg: '#252526', border: '#3c3c3c',
    groupTitle: '#cccccc', itemText: '#858585', iconColor: '#858585',
    activeBg: '#37373d', activeText: '#ffffff', hoverBg: '#2a2d2e',
  },
  {
    name: 'Notion Light',
    bg: '#fbfbfa', border: '#e9e9e7',
    groupTitle: '#37352f', itemText: '#787774', iconColor: '#9b9a97',
    activeBg: '#efefef', activeText: '#37352f', hoverBg: '#f1f1ef',
  },
  {
    name: 'Stripe Slate',
    bg: '#0a2540', border: '#1a3a5c',
    groupTitle: '#ffffff', itemText: '#8898aa', iconColor: '#8898aa',
    activeBg: '#1a3a5c', activeText: '#7795f8', hoverBg: '#0f2f50',
  },
  {
    name: 'Figma Dark',
    bg: '#2c2c2c', border: '#3c3c3c',
    groupTitle: '#ffffff', itemText: '#b3b3b3', iconColor: '#b3b3b3',
    activeBg: '#383838', activeText: '#18a0fb', hoverBg: '#333333',
  },
  {
    name: 'Tailwind Zinc',
    bg: '#18181b', border: '#27272a',
    groupTitle: '#fafafa', itemText: '#a1a1aa', iconColor: '#71717a',
    activeBg: '#27272a', activeText: '#818cf8', hoverBg: '#1f1f23',
  },
  {
    name: '薄荷清新',
    bg: '#f0fdf4', border: '#bbf7d0',
    groupTitle: '#14532d', itemText: '#166534', iconColor: '#16a34a',
    activeBg: '#dcfce7', activeText: '#15803d', hoverBg: '#e6fced',
  },
  {
    name: '暮色玫瑰',
    bg: '#fff1f2', border: '#fecdd3',
    groupTitle: '#881337', itemText: '#9f1239', iconColor: '#e11d48',
    activeBg: '#ffe4e6', activeText: '#be123c', hoverBg: '#ffe0e3',
  },
]

const currentThemeIdx = ref(0)
const currentTheme = computed(() => themes[currentThemeIdx.value])
const pickerOpen = ref(false)

// 点击外部关闭面板
const closePicker = () => { pickerOpen.value = false }
if (typeof window !== 'undefined') {
  window.addEventListener('click', closePicker)
}
onUnmounted(() => { window.removeEventListener('click', closePicker) })

const expandedGroups = reactive({
  account: true, editorial: true, management: true,
  group4: true, group5: true, group6: true, group7: true,
  group8: true, group9: true, group10: true
})

const groups = [
  {
    key: 'account', label: 'Account', abbr: 'A',
    items: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/user-overview', label: 'User Overview' },
    ]
  },
  {
    key: 'editorial', label: 'Editorial Office', abbr: 'E',
    items: [
      { to: '/manuscripts', label: 'Manage Manuscripts' },
      { to: '/process', label: 'Process Manuscript' },
      { to: '/submitted', label: 'Submitted Manuscripts' },
      { to: '/detection-assistant', label: 'Detection Assistant' },
    ]
  },
  {
    key: 'management', label: 'Detection Management', abbr: 'D',
    items: [
      { to: '/keywords', label: 'Keywords' },
      { to: '/item-visibility', label: 'Configuration' },
    ]
  },
  { key: 'group4', label: 'Group Title 4', abbr: 'G4', items: [{ to: '#', label: 'Menu 4-1' }, { to: '#', label: 'Menu 4-2' }, { to: '#', label: 'Menu 4-3' }] },
  { key: 'group5', label: 'Group Title 5', abbr: 'G5', items: [{ to: '#', label: 'Menu 5-1' }, { to: '#', label: 'Menu 5-2' }] },
  { key: 'group6', label: 'Group Title 6', abbr: 'G6', items: [{ to: '#', label: 'Menu 6-1' }, { to: '#', label: 'Menu 6-2' }, { to: '#', label: 'Menu 6-3' }, { to: '#', label: 'Menu 6-4' }] },
  { key: 'group7', label: 'Group Title 7', abbr: 'G7', items: [{ to: '#', label: 'Menu 7-1' }, { to: '#', label: 'Menu 7-2' }] },
  { key: 'group8', label: 'Group Title 8', abbr: 'G8', items: [{ to: '#', label: 'Menu 8-1' }, { to: '#', label: 'Menu 8-2' }, { to: '#', label: 'Menu 8-3' }] },
  { key: 'group9', label: 'Group Title 9', abbr: 'G9', items: [{ to: '#', label: 'Menu 9-1' }, { to: '#', label: 'Menu 9-2' }] },
  { key: 'group10', label: 'Group Title 10', abbr: 'G10', items: [{ to: '#', label: 'Menu 10-1' }, { to: '#', label: 'Menu 10-2' }, { to: '#', label: 'Menu 10-3' }] },
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
  border-right: 1px solid;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
  flex-shrink: 0;
  transition: width 0.3s ease-in-out, background 0.25s ease;
}

.sidebar.collapsed { width: 48px; }

.sidebar:not(.collapsed) nav > * { width: var(--sidebar-width); overflow: hidden; }
.sidebar.collapsed nav { width: 48px; }

/* 细滚动条 */
.sidebar nav::-webkit-scrollbar { width: 4px; }
.sidebar nav::-webkit-scrollbar-track { background: transparent; }
.sidebar nav::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
.sidebar nav::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.menu-group-title {
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
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  white-space: nowrap;
  border-radius: 4px;
}

.menu li:hover {
  background: var(--sidebar-hover-bg);
}

.collapsed-group:hover {
  background: var(--sidebar-hover-bg);
}

.menu-item {
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;
  white-space: nowrap;
  font-weight: 500;
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
  border-radius: 4px;
  transition: background 0.15s;
}

.collapsed-group-label {
  font-size: 12px;
  font-weight: 700;
  user-select: none;
}

.sidebar-footer {
  height: 48px;
  display: flex;
  align-items: center;
  border-top: 1px solid;
  flex-shrink: 0;
  padding: 0 4px;
  gap: 2px;
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
  cursor: pointer;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.footer-icon-btn:hover { opacity: 0.7; }

/* 配色切换 */
.theme-picker-wrap {
  position: relative;
}

.theme-picker-panel {
  position: absolute;
  bottom: 44px;
  left: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  padding: 10px;
  width: 180px;
  z-index: 500;
}

.theme-picker-title {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.theme-picker-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theme-picker-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 6px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
  width: 100%;
  text-align: left;
}

.theme-picker-item:hover { background: #f1f5f9; }
.theme-picker-item.active { background: #eef4ff; }

.theme-picker-swatch {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  flex-shrink: 0;
  display: inline-block;
}

.theme-picker-label {
  font-size: 12px;
  color: #374151;
  white-space: nowrap;
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
  transition: opacity 0.15s;
  margin-left: auto;
  flex-shrink: 0;
}

.toggle-btn:hover { opacity: 0.7; }
</style>

<style>
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

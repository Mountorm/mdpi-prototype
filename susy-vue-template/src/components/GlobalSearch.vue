<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 与 SuSy 全局搜索一致：只做前端交互，不发请求，也不塞假结果。
// 面板结构、文案和筛选标签取自 susy-mdpi/assets/vue3/src/components/GlobalSearch.vue
const filters = [
  { key: 'all', label: 'All' },
  { key: 'user', label: 'User' },
  { key: 'manuscript', label: 'Manuscript' },
  { key: 'ip', label: 'IP' },
  { key: 'invoice', label: 'Invoice' },
]

const rootRef = ref(null)
const inputRef = ref(null)
const query = ref('')
const panelOpen = ref(false)
const panelStyle = ref({})
const activeFilter = ref('all')

// 面板在视口内水平居中：按输入框相对视口的位置换算偏移，窗口变化时重算
function updatePanelPosition() {
  const rect = rootRef.value?.getBoundingClientRect()
  if (!rect) return
  panelStyle.value = {
    left: `${window.innerWidth / 2 - rect.left}px`,
    transform: 'translateX(-50%)',
  }
}

function openPanel() {
  updatePanelPosition()
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
}

function onInput() {
  openPanel()
}

function onClear() {
  query.value = ''
  inputRef.value?.focus()
}

function onSearch() {
  if (query.value.trim()) openPanel()
  else inputRef.value?.focus()
}

// 与真实组件一致：有输入时 Escape 先清空，再按一次才收起面板
function onKeydown(event) {
  if (event.key !== 'Escape') return
  if (query.value) {
    query.value = ''
    return
  }
  closePanel()
  inputRef.value?.blur()
}

function selectFilter(key) {
  activeFilter.value = activeFilter.value === key && key !== 'all' ? 'all' : key
}

function onDocumentClick(event) {
  if (panelOpen.value && rootRef.value && !rootRef.value.contains(event.target)) {
    closePanel()
  }
}

function onWindowResize() {
  if (panelOpen.value) updatePanelPosition()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick, true)
  window.addEventListener('resize', onWindowResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick, true)
  window.removeEventListener('resize', onWindowResize)
})
</script>

<template>
  <!-- v-3：顶栏仍在旧框架样式中，标记后输入框和面板不被 SuSy 旧元素样式影响 -->
  <div ref="rootRef" class="gs-root v-3" aria-label="Global Search">
    <div class="gs-input-wrapper" @keydown="onKeydown">
      <div class="gs-input">
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          placeholder="Search"
          autocomplete="off"
          aria-label="Search"
          @focus="openPanel"
          @click="openPanel"
          @input="onInput"
        />
        <button
          v-show="query"
          type="button"
          class="gs-clear"
          tabindex="-1"
          aria-label="Clear search"
          @click.stop="onClear"
        >
          <i class="ms" aria-hidden="true">close</i>
        </button>
        <i
          class="ms gs-search-icon"
          role="button"
          tabindex="-1"
          aria-label="Search"
          @click.stop="onSearch"
        >search</i>
      </div>
    </div>

    <Transition name="gs-panel">
      <div
        v-show="panelOpen"
        class="gs-panel"
        role="listbox"
        aria-label="Search results"
        :style="panelStyle"
      >
        <!-- 筛选标签栏：始终显示 -->
        <div class="gs-panel__filter-section">
          <div class="gs-filter-bar">
            <button
              v-for="item in filters"
              :key="item.key"
              type="button"
              class="gs-filter-chip"
              :class="{ 'gs-filter-chip--active': activeFilter === item.key }"
              @click="selectFilter(item.key)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="gs-panel__body">
          <!-- 有输入才出现结果区；未接接口，因此一直是无结果空态 -->
          <div v-if="query" class="gs-row-section">
            <div class="gs-row-header-row">
              <span class="gs-row-header">Search Results</span>
            </div>
            <div class="gs-row-list">
              <div class="gs-row-empty">No direct actions found.</div>
            </div>
          </div>

          <!-- 最近操作：没有历史记录，显示空态 -->
          <div class="gs-row-section" :class="{ 'gs-row-section--with-divider': !!query }">
            <div class="gs-row-header-row">
              <span class="gs-row-header">Recent</span>
            </div>
            <div class="gs-panel__no-recent">No recent actions yet.</div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 样式对应 susy-mdpi/assets/vue3/src/styles/_global-search.scss，
   输入框改为原生 input，避免依赖设计系统 MInput 的内部结构 */
.gs-root {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 260px;
  min-width: 12.25rem;
  font-family: "Suisse Int'l", sans-serif;
  font-weight: 400;
}

.gs-input-wrapper {
  width: 100%;
}

.gs-input {
  display: flex;
  align-items: center;
  height: 32px;
  min-height: 32px;
  padding: 0 6px 0 0;
  background: var(--color-bg-content-sunken);
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.gs-input:focus-within {
  background: var(--color-bg-surface-base);
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-border-focus) 10%, transparent);
}

.gs-input input {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-default);
  font-family: inherit;
  font-size: 13px;
  line-height: 32px;
}

.gs-input input::placeholder {
  color: var(--color-text-subtlest);
}

.gs-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-subtle);
  cursor: pointer;
}

.gs-clear .ms {
  font-size: 18px;
  color: inherit;
}

.gs-search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 2px;
  border-radius: 2px;
  background: var(--color-bg-brand-sunken);
  color: var(--color-brand-bold);
  font-size: 20px;
  cursor: pointer;
}

/* 下拉面板 */
.gs-panel {
  position: absolute;
  top: calc(100% + 12px);
  width: min(800px, 92vw);
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg-surface-base);
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  font-family: "Suisse Int'l", sans-serif;
  z-index: 99999;
}

.gs-panel__filter-section {
  flex-shrink: 0;
  margin: 24px 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border-default);
}

.gs-panel__body {
  flex: 1;
  padding: 12px 26px 36px 24px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-bg-content-subtle) transparent;
}

.gs-panel__body::-webkit-scrollbar {
  width: 4px;
}

.gs-panel__body::-webkit-scrollbar-thumb {
  background: var(--color-bg-content-subtle);
  border-radius: 2px;
}

.gs-panel__no-recent {
  padding: 4px 0;
  font-size: 12px;
  color: var(--color-text-subtlest);
}

.gs-panel-enter-active,
.gs-panel-leave-active {
  transition: opacity 0.15s ease;
}

.gs-panel-enter-from,
.gs-panel-leave-to {
  opacity: 0;
}

/* 筛选标签 */
.gs-filter-bar {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
  gap: 4px;
  background: var(--color-bg-surface-subtle);
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
}

.gs-filter-chip {
  padding: 4px 16px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: var(--color-bg-surface-base);
  color: var(--color-text-default);
  font-family: inherit;
  font-size: 14px;
  line-height: 18px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gs-filter-chip:hover {
  background: var(--color-bg-content-sunken);
}

.gs-filter-chip--active {
  background: var(--color-brand-sunken);
  border-color: transparent;
  color: var(--color-brand-bold);
}

.gs-filter-chip--active:hover {
  filter: brightness(1.05);
}

/* 结果 / 最近操作区块 */
.gs-row-section {
  margin-top: 4px;
}

.gs-row-section--with-divider {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border-default);
}

.gs-row-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
}

.gs-row-header {
  padding: 0;
  background: transparent;
  color: var(--color-text-subtle);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1;
  text-align: left;
}

.gs-row-empty {
  padding: 8px 0;
  color: var(--color-text-subtlest);
  font-size: 12px;
  text-align: center;
}

.gs-row-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (max-width: 960px) {
  .gs-panel {
    width: min(92vw, 560px);
  }
}
</style>

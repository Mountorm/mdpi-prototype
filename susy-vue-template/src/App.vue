<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import SusyHeader from '@/layout/SusyHeader.vue'
import SusySidebar from '@/layout/SusySidebar.vue'
import SusyFooter from '@/layout/SusyFooter.vue'
import { scrollToId } from '@/utils/scroll'

const STORAGE_KEY = 'susy-left-menu-collapsed'
const collapsed = ref(false)

// 侧栏的吸附位置要跟着顶栏的真实高度走：顶栏内容换行或被字体撑高时，
// 固定写 4rem 会让侧栏顶部钻到顶栏下面
let headerEl = null
let headerObserver = null

function syncHeaderHeight() {
  if (!headerEl) return
  const headerH = Math.round(headerEl.getBoundingClientRect().height)
  // 侧栏在文档流里位于 #container 的内边距之内，吸附时保留这段距离，
  // 否则一滚动就会比静止状态高 10px，像和顶栏贴住/重合
  const container = document.querySelector('#container')
  const containerPad = container ? parseFloat(getComputedStyle(container).paddingTop) || 0 : 0
  const style = document.documentElement.style
  style.setProperty('--susy-header-h', `${headerH}px`)
  style.setProperty('--susy-container-pad', `${containerPad}px`)
  style.setProperty('--susy-sidebar-top', `${headerH + containerPad}px`)
}

onMounted(() => {
  try {
    collapsed.value = localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    // 无痕模式等场景下读取失败，保持默认展开
  }

  headerEl = document.querySelector('#susy-prototype-app > header')
  if (headerEl) {
    syncHeaderHeight()
    headerObserver = new ResizeObserver(syncHeaderHeight)
    headerObserver.observe(headerEl)
  }
})

onBeforeUnmount(() => {
  headerObserver?.disconnect()
})

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, collapsed.value ? '1' : '0')
  } catch {
    // 忽略写入失败
  }
}

function toggleMenu() {
  collapsed.value = !collapsed.value
  persist()
}

// 收起状态点击菜单图标：展开侧栏；带 key 时再定位到该分类
// （主页的组件入口不带 key，由侧栏自己跳转到组件页）
function expandAndGo(key) {
  if (collapsed.value) {
    collapsed.value = false
    persist()
  }
  if (key) nextTick(() => scrollToId(key))
}
</script>

<template>
  <div id="susy-prototype-app">
    <SusyHeader />

    <div class="off-canvas-wrapper">
      <div class="off-canvas-content" data-off-canvas-content>
        <div id="container">
          <div id="main" class="grid-x">
            <div
              id="left-menu-main-container"
              class="show-for-large"
              :class="{ 'left-menu-collapsed': collapsed }"
            >
              <div class="left-menu-container">
                <SusySidebar @expand="expandAndGo" />
              </div>
              <div class="left-menu-footer">
                <span
                  class="left-toggle-button ms ms-filled !tw-text-color-default tw-mx-4"
                  role="button"
                  tabindex="0"
                  :aria-expanded="collapsed ? 'false' : 'true'"
                  :aria-label="collapsed ? 'Expand navigation' : 'Collapse navigation'"
                  :title="collapsed ? 'Expand navigation' : 'Collapse navigation'"
                  @click="toggleMenu"
                  @keydown.enter.prevent="toggleMenu"
                  @keydown.space.prevent="toggleMenu"
                >right_panel_open</span>
              </div>
            </div>

            <!-- v-3：SuSy 线上样式中带 :not(.v-3) 守卫，放进该标记可让内容区不受旧框架样式影响 -->
            <div class="cell small-12 medium-12 large-auto susy-ds-content v-3">
              <router-view />
            </div>
          </div>
        </div>

        <SusyFooter />
      </div>
    </div>
  </div>
</template>

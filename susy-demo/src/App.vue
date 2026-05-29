<template>
  <div class="flex flex-col h-full w-full">
    <Sidebar
      :is-collapsed="sidebarCollapsed"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />

    <div
      class="flex flex-col h-full overflow-hidden"
      :style="{ marginLeft: sidebarCollapsed ? '48px' : 'var(--sidebar-width)', transition: 'margin-left 0.3s ease-in-out' }"
    >
      <Header
        :sidebar-collapsed="sidebarCollapsed"
        :sidebar-width="sidebarCollapsed ? '48px' : 'var(--sidebar-width)'"
      />

      <main ref="mainEl" class="flex-1 overflow-auto" style="margin-top: 64px;" @scroll="onScroll">
        <div class="px-4 py-2 border-border-color">
          <nav class="breadcrumb">
            <span>SuSy</span>
            <span>/</span>
            <span>{{ breadcrumb }}</span>
          </nav>
        </div>

        <div class="pb-4 px-4">
          <RouterView />
        </div>

        <footer style="background: #363638; color: #f0f8f1; font-size: 12px; padding: 8px 18px; margin: -6px 16px;">
          © 1996-2026 MDPI (Basel, Switzerland) unless otherwise stated
        </footer>
      </main>

      <!-- 右侧浮动按钮组 -->
      <div class="common-right-button">
        <Transition name="fade-slide">
          <button v-if="showScrollTop" class="right-btn" title="Back to top" @click="scrollToTop">
            <span class="material-icons">expand_less</span>
          </button>
        </Transition>

        <button class="right-btn wechat-btn" title="WeChat Official Account">
          <span class="material-icons">qr_code_2</span>
        </button>

        <Transition name="fade-slide">
          <button v-if="showScrollBottom" class="right-btn" title="Go to bottom" @click="scrollToBottom">
            <span class="material-icons">expand_more</span>
          </button>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const sidebarCollapsed = ref(false)
const route = useRoute()
const mainEl = ref(null)
const showScrollTop = ref(false)
const showScrollBottom = ref(true)

const breadcrumb = computed(() => route.meta?.breadcrumb || 'Manage Manuscripts')

const onScroll = () => {
  const el = mainEl.value
  if (!el) return
  const { scrollTop, scrollHeight, clientHeight } = el
  showScrollTop.value = scrollTop > 120
  showScrollBottom.value = scrollTop + clientHeight < scrollHeight - 120
}

const scrollToTop = () => mainEl.value?.scrollTo({ top: 0, behavior: 'smooth' })
const scrollToBottom = () => {
  if (mainEl.value) mainEl.value.scrollTo({ top: mainEl.value.scrollHeight, behavior: 'smooth' })
}
</script>

<style scoped>
.common-right-button {
  position: fixed;
  right: 32px;
  bottom: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 500;
}

.right-btn {
  width: 42px;
  height: 42px;
  border-radius: 2px;
  border: 1px solid #d1d9e6;
  background: #f8faff;
  color: #4a6fa5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 1px 3px rgba(26, 54, 93, 0.08);
}

.right-btn .material-icons {
  font-size: 22px;
}

.right-btn:hover {
  background: #eef3fb;
  color: #0156ce;
  border-color: #a8c0e8;
}

.wechat-btn {
  height: 46px;
  border-top: none;
  border-bottom: none;
  border-radius: 0;
  background: #f0f5ff;
  color: #2e6db4;
}

.wechat-btn:hover {
  background: #e4edfa;
  color: #0156ce;
}

/* 上下箭头按钮圆角处理 */
.common-right-button > .fade-slide-enter-active:first-child .right-btn,
.common-right-button > button:first-child {
  border-radius: 2px 2px 0 0;
}
.common-right-button > .fade-slide-enter-active:last-child .right-btn,
.common-right-button > button:last-child {
  border-radius: 0 0 2px 2px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>

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

      <main class="flex-1 overflow-auto" style="margin-top: 64px;">
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

const breadcrumb = computed(() => route.meta?.breadcrumb || 'Manage Manuscripts')
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <Header
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="flex flex-1 overflow-hidden">
      <Sidebar :is-collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />

      <main class="flex-1 overflow-auto">
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
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const sidebarCollapsed = ref(false)
const route = useRoute()

const breadcrumb = computed(() => route.meta?.breadcrumb || 'Manage Manuscripts')
</script>

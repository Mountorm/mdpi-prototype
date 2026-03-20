<template>
  <header
    class="app-header"
    :style="{ left: sidebarWidth, color: '#172b4d' }"
  >
    <!-- Navigation Links -->
    <nav class="flex items-center gap-6 h-full">
      <a href="#" class="nav-link">Journals</a>
      <a href="#" class="nav-link">Topics</a>
      <a href="#" class="nav-link">Information</a>
      <a href="#" class="nav-link">Author Services</a>
      <a href="#" class="nav-link">Initiatives</a>
      <a href="#" class="nav-link">About</a>
    </nav>

    <!-- Right Side Actions -->
    <div class="ml-auto flex items-center gap-4">
      <button class="px-4 py-2 text-sm font-medium text-white rounded transition-colors" style="background-color: #0156ce;" onmouseover="this.style.backgroundColor='#014bb5'" onmouseout="this.style.backgroundColor='#0156ce'">
        Submit
      </button>
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">hongqiang.cui@mdpi.com</span>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  sidebarCollapsed: { type: Boolean, default: false },
  sidebarWidth: { type: String, default: 'var(--sidebar-width)' }
})

defineEmits(['toggle-sidebar'])
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  right: 0;
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  gap: 1rem;
  z-index: 90;
}

.nav-link {
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

.nav-link:hover {
  color: #1f6ad4;
  border-bottom-color: #1f6ad4;
}
</style>

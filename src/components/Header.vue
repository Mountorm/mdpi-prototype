<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4" style="color: #172b4d;">
    <!-- Menu Toggle Button -->
    <button 
      @click="$emit('toggle-sidebar')"
      class="p-2 hover:bg-gray-100 rounded transition-colors"
      title="Toggle Sidebar"
    >
      <span v-if="sidebarCollapsed" class="material-icons" style="font-size: 20px;">menu_open</span>
      <span v-else class="material-icons" style="font-size: 20px;">menu</span>
    </button>

    <!-- Logo -->
    <img 
      src="https://susy.mdpi.com/build/img/icon/SUSY_logo.svg?56d587c" 
      alt="SuSy Logo" 
      :style="{ width: '90px', height: '36px' }"
      class="h-10"
    >
  
    <!-- Navigation Links -->
    <nav class="flex items-center gap-6 ml-6 h-full">
      <a href="#" class="text-sm font-medium transition-all h-full flex items-center border-b-2 border-transparent hover:border-[#1f6ad4]" style="color: #172b4d;" onmouseover="this.style.color='#1f6ad4'" onmouseout="this.style.color='#172b4d'">Journals</a>
      <a href="#" class="text-sm font-medium transition-all h-full flex items-center border-b-2 border-transparent hover:border-[#1f6ad4]" style="color: #172b4d;" onmouseover="this.style.color='#1f6ad4'" onmouseout="this.style.color='#172b4d'">Topics</a>
      <a href="#" class="text-sm font-medium transition-all h-full flex items-center border-b-2 border-transparent hover:border-[#1f6ad4]" style="color: #172b4d;" onmouseover="this.style.color='#1f6ad4'" onmouseout="this.style.color='#172b4d'">Information</a>
      <a href="#" class="text-sm font-medium transition-all h-full flex items-center border-b-2 border-transparent hover:border-[#1f6ad4]" style="color: #172b4d;" onmouseover="this.style.color='#1f6ad4'" onmouseout="this.style.color='#172b4d'">Author Services</a>
      <a href="#" class="text-sm font-medium transition-all h-full flex items-center border-b-2 border-transparent hover:border-[#1f6ad4]" style="color: #172b4d;" onmouseover="this.style.color='#1f6ad4'" onmouseout="this.style.color='#172b4d'">Initiatives</a>
      <a href="#" class="text-sm font-medium transition-all h-full flex items-center border-b-2 border-transparent hover:border-[#1f6ad4]" style="color: #172b4d;" onmouseover="this.style.color='#1f6ad4'" onmouseout="this.style.color='#172b4d'">About</a>
    </nav>

    <!-- Right Side Actions -->
    <div class="ml-auto flex items-center gap-4">
      <!-- Submit Button -->
      <button class="px-4 py-2 text-sm font-medium text-white rounded transition-colors" style="background-color: #0156ce;" onmouseover="this.style.backgroundColor='#014bb5'" onmouseout="this.style.backgroundColor='#0156ce'">
        Submit
      </button>

      <!-- User Info -->
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">hongqiang.cui@mdpi.com</span>
        
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  sidebarCollapsed: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-sidebar'])
</script>

<style scoped>
</style>

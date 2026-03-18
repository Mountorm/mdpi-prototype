<template>
  <div class="section-block">
    <div class="section-header" @click="open = !open">
      <span class="section-title">{{ title }}</span>
      <span class="section-toggle">{{ open ? '▲' : '▼' }}</span>
    </div>
    <div v-if="open" class="section-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ title: String, defaultOpen: { type: Boolean, default: true } })
const open = ref(props.defaultOpen)
</script>

<style scoped>
.section-block { border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 16px; }
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; background: #f8f9fa; cursor: pointer;
  border-radius: 6px 6px 0 0; user-select: none;
}
.section-header:hover { background: #eef2ff; }
.section-title { font-weight: 600; font-size: 14px; color: #172b4d; }
.section-toggle { font-size: 12px; color: #6b7280; }
.section-content { padding: 16px; }
</style>

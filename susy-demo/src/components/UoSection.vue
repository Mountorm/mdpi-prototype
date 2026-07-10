<template>
  <div class="section-block">
    <div class="section-header" @click="open = !open">
      <span class="section-title">{{ title }}</span>
      <span class="material-symbols-outlined section-toggle">
        {{ open ? 'expand_less' : 'expand_more' }}
      </span>
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
.section-block {
  border: 1px solid #e5e7eb;
  border-radius: 0;
  margin-bottom: 12px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 16px;
  background: #f8f9fa;
  cursor: pointer;
  border-radius: 0;
  user-select: none;
}
.section-header:hover {
  background: #eef2ff;
}
.section-title {
  font-weight: 600;
  font-size: 14px;
  color: #172b4d;
}
.section-toggle {
  font-size: 20px;
  color: #6b7280;
  line-height: 1;
  flex-shrink: 0;
}
.section-content {
  padding: 8px 12px;
  border-top: 1px solid #e5e7eb;
}
</style>

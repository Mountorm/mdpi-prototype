<template>
  <span class="tooltip-wrap" :title="text">
    <span class="tooltip-icon">ℹ</span>
  </span>
</template>

<script setup>
defineProps({ text: String })
</script>

<style scoped>
.tooltip-wrap { position: relative; display: inline-block; margin-left: 4px; cursor: help; }
.tooltip-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%;
  background: #dbeafe; color: #2563eb; font-size: 11px; font-weight: 700;
}
</style>

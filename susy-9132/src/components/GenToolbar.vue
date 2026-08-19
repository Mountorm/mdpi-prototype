<script setup>
// Manuscript context toolbar, rendered by ReportShell in the breadcrumb slot
// (always visible, outside the scrollable content area). Shows the manuscript
// ID; actions are provided by the routed view (GenerateView).
import MdIcon from './MdIcon.vue'

defineProps({
  manuscriptId: { type: String, required: true },
  onReset: { type: Function, required: true },
  onGenerate: { type: Function, required: true },
  onReview: { type: Function, required: true },
})
</script>

<template>
  <div class="gen-toolbar">
    <div class="gen-left">
      <span class="gen-ms-id">{{ manuscriptId }}</span>
      <span class="gen-title">
        <MdIcon name="description" :size="18" class="gen-title-icon" />Generate Technical Precheck Report
      </span>
    </div>
    <div class="gen-actions">
      <button class="gen-btn ghost" type="button" title="Clear all answers and comments" @click="onReset">Reset</button>
      <button class="gen-btn" type="button" title="Validate the checklist without submitting" @click="onGenerate">Validate</button>
      <button class="gen-btn primary" type="button" title="Hand the checklist over to the report page" @click="onReview">
        <MdIcon name="visibility" :size="16" class="gen-btn-icon" />Review Report
      </button>
    </div>
  </div>
</template>

<style scoped>
.gen-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}
.gen-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.gen-ms-id {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1b3555;
}
.gen-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #172b4d;
  font-size: 14px;
  font-weight: 600;
}
.gen-title-icon { color: #0156ce; }
.gen-actions { display: flex; gap: 8px; }
.gen-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid #c8cdd3;
  border-radius: 4px;
  color: #3e4a5a;
  background: #fff;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.gen-btn:hover { border-color: #0156ce; color: #0156ce; }
.gen-btn:focus-visible {
  outline: 2px solid #0156ce;
  outline-offset: 1px;
}
.gen-btn.primary:focus-visible {
  outline: 2px solid #fff;
  outline-offset: -1px;
  box-shadow: 0 0 0 3px #0156ce;
}
.gen-btn.ghost { border-color: transparent; color: #5f6b7d; }
.gen-btn.ghost:hover { border-color: transparent; color: #3e4a5a; background: #f5f7ff; }
.gen-btn.primary {
  border-color: #0156ce;
  color: #fff;
  background: #0156ce;
}
.gen-btn.primary:hover { background: #004db9; color: #fff; }
</style>

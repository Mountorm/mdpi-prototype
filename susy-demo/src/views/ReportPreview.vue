<template>
  <div :class="['rpv-layout', { 'rpv-layout--embed': isEmbedded }]">
    <!-- Top bar (hidden in embed mode) -->
    <div v-if="!isEmbedded" class="rpv-topbar">
      <div class="rpv-topbar__left">
        <span class="material-symbols-outlined rpv-topbar__icon">description</span>
        <span class="rpv-topbar__title">Detection Report</span>
        <span v-if="reportData" class="rpv-topbar__ms">{{ reportData.manuscript.id }}</span>
      </div>
      <div class="rpv-topbar__actions">
        <el-button size="small" @click="handleBack">
          <span class="material-symbols-outlined" style="font-size:14px;">arrow_back</span>
          Edit
        </el-button>
        <el-button size="small" @click="handlePrint">
          <span class="material-symbols-outlined" style="font-size:14px;">print</span>
          Print
        </el-button>
      </div>
    </div>

    <!-- Report Paper -->
    <div class="rpv-paper-wrap">
      <ReportPaper
        v-if="reportData"
        :manuscript="reportData.manuscript"
        :sections="reportData.sections"
        :stats="reportData.stats"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ReportPaper from '../components/report/ReportPaper.vue'

const router = useRouter()
const route = useRoute()

const isEmbedded = computed(() => route.query.embed === '1')

const reportData = computed(() => {
  try {
    const raw = route.query.d
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
})

function handleBack() {
  router.push('/report-builder')
}

function handlePrint() {
  window.print()
}
</script>

<style scoped>
.rpv-layout {
  min-height: calc(100vh - 120px);
  background: #f0f2f5;
}
.rpv-layout--embed {
  min-height: auto;
  background: #fff;
}

/* Top bar */
.rpv-topbar {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-top: none;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  position: sticky;
  top: 0;
  z-index: 20;
}
.rpv-topbar__left { display: flex; align-items: center; gap: 10px; }
.rpv-topbar__icon { font-size: 18px; color: #0156ce; }
.rpv-topbar__title { font-size: 16px; font-weight: 600; color: #172b4d; }
.rpv-topbar__ms { font-size: 13px; color: #0156ce; font-weight: 500; }
.rpv-topbar__actions { display: flex; gap: 8px; }

/* Paper */
.rpv-paper-wrap {
  padding: 24px;
  display: flex;
  justify-content: center;
}
.rpv-layout--embed .rpv-paper-wrap { padding: 0; }

/* Print styles */
@media print {
  .rpv-topbar { display: none; }
  .rpv-layout { background: #fff; }
  .rpv-paper-wrap { padding: 0; }
}
</style>

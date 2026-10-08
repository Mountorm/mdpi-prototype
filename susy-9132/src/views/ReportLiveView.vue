<script setup>
// Live report — same layout as report3, filled from the generate-page submission.
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MdIcon from '../components/MdIcon.vue'
import TechnicalReport from '../components/TechnicalReport.vue'
import { checklistStore } from '../store/checklist.js'
import { mockManuscript } from '../mock/ace.js'
import { getDetectionResult } from '../mock/detectionResults.js'
import { reportStore, hasReport } from '../store/report.js'
import { isNumberItem, isArticleTypeItem } from '../utils/itemKinds.js'

const router = useRouter()

const entries = computed(() => {
  if (!hasReport()) return []
  const manuscriptId = reportStore.manuscriptId || mockManuscript.id
  return checklistStore.items
    .filter((item) => item.inUse && item.required)
    .map((item) => ({
      item,
      ans: reportStore.answers[item.id] ?? { status: null, comment: '', numberValue: null, resultVisible: false, selected: false },
      result: getDetectionResult(manuscriptId, item.id),
    }))
    .filter((e) => e.ans.selected)
})

const countsNote = computed(() =>
  entries.value
    .filter((e) => isNumberItem(e.item))
    .map((e) => String(e.ans.comment || '').trim())
    .find(Boolean) || ''
)

const noteOf = (entry) => String(entry.ans.comment || '').trim()

const articleTypeOf = (entry) => {
  if (!isArticleTypeItem(entry.item)) return ''
  if (!entry.ans.resultVisible || !entry.result) return ''
  return entry.result.articleType || ''
}
</script>

<template>
  <div v-if="!hasReport()" class="live-empty">
    <MdIcon name="info" :size="40" class="live-empty-icon" />
    <h2>No report available</h2>
    <p>The checklist has not been generated yet. Preview it on the generate page, then confirm.</p>
    <button type="button" @click="router.push('/generate')">Back to Generate</button>
  </div>
  <div v-else class="r3-page">
    <TechnicalReport
      :entries="entries"
      :counts-note="countsNote"
      :note-of="noteOf"
      :article-type-of="articleTypeOf"
    />
  </div>
</template>

<style scoped>
.r3-page {
  margin: -16px;
  padding: 16px;
  min-height: calc(100% + 32px);
  box-sizing: border-box;
}
.live-empty {
  max-width: 480px;
  margin: 48px auto;
  text-align: center;
  color: #172b4d;
}
.live-empty-icon { color: #0156ce; }
.live-empty h2 { margin: 8px 0; font-size: 18px; }
.live-empty p { margin: 0 0 16px; color: #5f6b7d; font-size: 14px; }
.live-empty button {
  height: 32px;
  padding: 0 14px;
  border: 1px solid #0156ce;
  border-radius: 4px;
  color: #fff;
  background: #0156ce;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
</style>

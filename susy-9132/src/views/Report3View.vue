<script setup>
// Report 3 — fixed sample. Does not read the generate-page submission.
// The Technical Precheck Report block uses the shared layout; notes and the
// article type here stay on the sample, not the live submission.
import { computed } from 'vue'
import TechnicalReport from '../components/TechnicalReport.vue'
import { checklistStore } from '../store/checklist.js'
import { snapshotAnswers, snapshotManuscript } from '../mock/reportSnapshot.js'
import { getDetectionResult } from '../mock/detectionResults.js'
import { isArticleTypeItem } from '../utils/itemKinds.js'
import manuscriptInfoImg from '../assets/img/1.png'
import editorDecisionImg from '../assets/img/2.png'

const MANUSCRIPT_NOTE =
  'Counts are taken from the submitted file. Please confirm word count, figures, and tables against the manuscript before screening continues.'
const SPECIAL_ISSUE_NOTE =
  'The topic is point-of-care diagnostics. Fit with the current Special Issue is not confirmed. Please advise whether this assignment should stand.'

const entries = computed(() =>
  checklistStore.items
    .filter((item) => item.inUse && item.required)
    .map((item) => ({
      item,
      ans: snapshotAnswers[item.id] ?? { status: null, comment: '', numberValue: null, resultVisible: true, selected: false },
      result: getDetectionResult(snapshotManuscript.id, item.id),
    }))
    .filter((e) => e.ans.selected)
)

const staticNote = (entry) => {
  if (entry.item.id === 5) return SPECIAL_ISSUE_NOTE
  return String(entry.ans.comment || '').trim()
}
const staticArticleType = (entry) =>
  (isArticleTypeItem(entry.item) ? snapshotManuscript.articleType : '')
</script>

<template>
  <div class="r3-page">
    <section class="r3 r3-other" aria-label="稿件信息">
      <h1 class="r3-title">This is the manuscript information area above</h1>
      <img class="r3-mock-img" :src="manuscriptInfoImg" alt="Manuscript information" />
    </section>

    <TechnicalReport
      :entries="entries"
      :counts-note="MANUSCRIPT_NOTE"
      :note-of="staticNote"
      :article-type-of="staticArticleType"
      placeholder-links
    />

    <section class="r3 r3-other" aria-label="Editor Decision">
      <h1 class="r3-title">Editor Decision</h1>
      <img class="r3-mock-img" :src="editorDecisionImg" alt="Editor Decision" />
    </section>
  </div>
</template>

<style scoped>
.r3-page {
  margin: -16px;
  padding: 16px;
  min-height: calc(100% + 32px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.r3 {
  padding: 16px;
  box-sizing: border-box;
  color: #172b4d;
  background: #fff;
  font-size: 14px;
}
.r3-title {
  margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #0156ce;
  font-size: 18px;
  font-weight: 650;
}
.r3-mock-img {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
}
</style>

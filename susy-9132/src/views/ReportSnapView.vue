<script setup>
// Report Snap — a fixed, always-available preview of the AcE report page.
// Injects a realistic snapshot (realistic manuscript + AE answers) so the
// report can be reviewed anytime without first going through generate.
// Two routes share this view with a locked grouping:
//   /report1 → 'priority' (By attention)
//   /report2 → 'category' (By category)
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import ReportView from './ReportView.vue'
import { snapshotAnswers, snapshotManuscript } from '../mock/reportSnapshot.js'

const route = useRoute()
const fixedGrouping = computed(() =>
  route.path.includes('report2') ? 'category' : 'priority'
)

// UX note (prototype-only, shown on the category snapshot route): a sticky
// note to UX colleagues describing the intended report structure. It floats
// over the page, can be closed, and never appears in print/PDF output.
const noteVisible = ref(true)
</script>

<template>
  <ReportView
    :snapshot-answers="snapshotAnswers"
    :snapshot-manuscript="snapshotManuscript"
    :fixed-grouping="fixedGrouping"
  />

  <aside v-if="noteVisible && fixedGrouping === 'category'" class="ux-note" aria-label="Note to UX">
    <button class="ux-note-close" type="button" aria-label="Close note" @click="noteVisible = false">×</button>
    <div class="ux-note-title">设计需求</div>
    <ol class="ux-note-list">
      <li>命名：Technical Precheck Report</li>
      <li>两栏设计，左信息右概况</li>
      <li>目前共 3 大类 11 项</li>
      <li>每一项必包含 name、description</li>
      <li>每一项可能包含 结果块（带展开/折叠的）、flag（passed/warning）、editor note</li>
    </ol>
  </aside>
</template>

<style scoped>
.ux-note {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 999;
  width: 330px;
  padding: 14px 16px;
  background: #fffbe6;
  border: 1px solid #e6d685;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14);
  font-size: 13px;
  line-height: 1.6;
  color: #5c4d00;
}
.ux-note-title {
  margin-bottom: 8px;
  padding-right: 18px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #d9c65e;
  font-size: 13px;
  font-weight: 700;
}
.ux-note-list { margin: 0; padding-left: 18px; }
.ux-note-list li { margin: 2px 0; }
.ux-note-close {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #8a7a1e;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}
.ux-note-close:hover { background: #f5e9a8; }
@media print { .ux-note { display: none; } }
</style>

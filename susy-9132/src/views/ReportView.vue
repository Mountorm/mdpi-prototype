<script setup>
// Report page — AcEd Screen 2 (pre-check report, read-only)
// Shows the AE's filled checklist as a printable report with the FULL detection
// results (identical to what the AE reviewed). Two grouping modes:
//   'priority' — Attention needed (warning) first
//   'category' — grouped by checklist category
// The report is display-only: the AcEd decision happens on a separate page.
//
// Data source: normally the shared reportStore (set by the generate page).
// The Report Snap page (/report1) injects a fixed snapshot via the
// `snapshotAnswers` prop instead, so it can be viewed anytime without first
// going through generate.
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import MdIcon from '../components/MdIcon.vue'
import DetectionResult from '../components/DetectionResult.vue'
import { checklistStore } from '../store/checklist.js'
import { mockManuscript } from '../mock/ace.js'
import { getDetectionResult } from '../mock/detectionResults.js'
import { reportStore, hasReport } from '../store/report.js'
import { isNumberItem } from '../utils/itemKinds.js'

const props = defineProps({
  // fixed answers keyed by item id (snapshot mode); otherwise read from store
  snapshotAnswers: { type: Object, default: null },
  // manuscript metadata for snapshot mode (defaults to the standard mock)
  snapshotManuscript: { type: Object, default: null },
  // fixed grouping for snapshot routes ('priority' | 'category'); when set,
  // the grouping toggle is hidden and the view is locked to that grouping.
  fixedGrouping: { type: String, default: null },
})

const router = useRouter()
const grouping = ref(props.fixedGrouping || 'priority') // 'priority' | 'category'

// /report1 and /report2 share this view (different fixedGrouping); Vue Router
// reuses the component instance, so sync the internal grouping when the
// snapshot route changes instead of requiring a refresh.
watch(
  () => props.fixedGrouping,
  (v) => { if (v) grouping.value = v }
)

/* ---------------- Data assembly ---------------- */
const inSnapshotMode = computed(() => Boolean(props.snapshotAnswers))
const reportReady = computed(() => inSnapshotMode.value || hasReport())

const manuscriptId = computed(() => mockManuscript.id)

// displayed manuscript metadata (snapshot uses its own manuscript)
const manuscript = computed(() => props.snapshotManuscript || mockManuscript)

const items = computed(() => {
  if (!reportReady.value) return []
  const answersSource = props.snapshotAnswers || reportStore.answers
  // Only required items (per the shared journal config) appear in the report.
  return checklistStore.items
    .filter((item) => item.inUse && item.required)
    .map((item) => {
      const ans = answersSource[item.id] ?? { status: null, comment: '', numberValue: null }
      const result = getDetectionResult(manuscriptId.value, item.id)
      return { item, ans, result }
    })
    .filter(({ ans }) => ans.selected) // only items the AE added to the report
})

const flagTone = (entry) => {
  const { item, ans } = entry
  if (!item.flagRequired || !ans.status) return null
  return ans.status === 'passed' ? 'passed' : 'warning'
}

// informational items carry no flag (numbers etc.) — reference data
const isInformational = (entry) => !entry.item.flagRequired

const hasComment = (entry) => Boolean(String(entry.ans.comment || '').trim())

/* ---- grouping: priority ---- */
const priorityGroups = computed(() => {
  const attention = items.value.filter((e) => flagTone(e) === 'warning')
  const passed = items.value.filter((e) => flagTone(e) === 'passed')
  const informational = items.value.filter((e) => isInformational(e))
  return [
    { key: 'attention', title: 'Attention needed', tone: 'warning', list: attention },
    { key: 'passed', title: 'Passed', tone: 'passed', list: passed },
    { key: 'informational', title: 'Manuscript Information', tone: 'none', list: informational },
  ].filter((g) => g.list.length > 0)
})

/* ---- grouping: category ---- */
const categoryGroups = computed(() => {
  const map = new Map()
  items.value.forEach((e) => {
    if (!map.has(e.item.category)) map.set(e.item.category, [])
    map.get(e.item.category).push(e)
  })
  return [...map.entries()].map(([cat, list]) => ({ title: cat, list }))
})

const allGroups = computed(() =>
  grouping.value === 'priority' ? priorityGroups.value : categoryGroups.value
)

const stats = computed(() => {
  let passed = 0, warning = 0
  items.value.forEach((e) => {
    const t = flagTone(e)
    if (t === 'passed') passed++
    else if (t === 'warning') warning++
  })
  return { passed, warning }
})

/* ---------------- Actions ---------------- */
const goEdit = () => router.push('/generate')
const printReport = () => window.print()
</script>

<template>
  <div class="report-page">
    <!-- Empty state: no report submitted yet -->
    <div v-if="!reportReady" class="rp-empty">
      <MdIcon name="info" :size="40" class="rp-empty-icon" />
      <h2 class="rp-empty-title">No report available</h2>
      <p class="rp-empty-desc">
        The checklist has not been reviewed yet. Generate and review the checklist first.
      </p>
      <button class="rp-btn primary" type="button" @click="goEdit">Back to Generate</button>
    </div>

    <!-- ====== Printable report sheet ====== -->
    <div v-else class="rp-sheet">
      <!-- Report header -->
      <header class="rp-header">
        <div class="rp-header-left">
          <img
            class="rp-logo"
            src="https://pub.mdpi-res.com/img/design/mdpi-pub-logo-black-small1.svg?da3a8dcae975a41c"
            alt="MDPI"
          />
        </div>
        <div class="rp-header-right">
          <div class="rp-report-title">Technical Precheck Report</div>
          <div class="rp-report-sub">Summary of preliminary manuscript assessment</div>
        </div>
      </header>

      <!-- Manuscript meta -->
      <section class="rp-meta">
        <div class="rp-meta-title">{{ manuscript.title }}</div>
        <div class="rp-meta-row">
          <div class="rp-meta-item">
            <span class="rp-meta-label">Manuscript ID</span>
            <span class="rp-meta-value">{{ manuscriptId }}</span>
          </div>
          <div class="rp-meta-item">
            <span class="rp-meta-label">Journal</span>
            <span class="rp-meta-value">{{ manuscript.journal }}</span>
          </div>
          <div class="rp-meta-item">
            <span class="rp-meta-label">Submitted</span>
            <span class="rp-meta-value">{{ inSnapshotMode ? '2026-08-11' : (reportStore.submittedAt ? reportStore.submittedAt.slice(0, 10) : '—') }}</span>
          </div>
          <div class="rp-meta-item rp-meta-summary">
            <span class="rp-sum-pill passed">{{ stats.passed }} passed</span>
            <span class="rp-sum-pill warning">{{ stats.warning }} warning</span>
          </div>
        </div>
      </section>

      <!-- Screen controls: subtle grouping toggle + print (real mode only;
           snapshot routes are fixed to one grouping and show nothing here) -->
      <div v-if="!props.fixedGrouping" class="rp-controls">
        <div class="rp-group-toggle" role="radiogroup" aria-label="Group report by">
          <button
            v-for="g in [['priority', 'By attention'], ['category', 'By category']]"
            :key="g[0]"
            class="rp-toggle"
            :class="{ active: grouping === g[0] }"
            role="radio"
            :aria-checked="grouping === g[0] ? 'true' : 'false'"
            type="button"
            @click="grouping = g[0]"
          >{{ g[1] }}</button>
        </div>
        <button class="rp-btn" type="button" @click="printReport">
          <MdIcon name="description" :size="14" />Print / Save as PDF
        </button>
      </div>

      <!-- Report body -->
      <div class="rp-body">
        <section v-for="group in allGroups" :key="group.key || group.title" class="rp-group">
          <h3 class="rp-group-title" :class="group.tone">
            <span class="rp-group-name">{{ group.title }}</span>
            <span class="rp-group-count">{{ group.list.length }}</span>
          </h3>

          <ul class="rp-list">
            <li v-for="e in group.list" :key="e.item.id" class="rp-row">
              <!-- item title + description + flag (read-only judgment badge) -->
              <div class="rp-row-title-line">
                <span class="rp-row-title">{{ e.item.title }}</span>
                <span class="rp-row-desc">{{ e.item.description }}</span>
                <span v-if="flagTone(e)" class="rp-badge" :class="flagTone(e)">
                  {{ flagTone(e) === 'passed' ? 'Passed' : 'Warning' }}
                </span>
              </div>
              <!-- full detection result, identical to what the AE reviewed -->
              <DetectionResult
                :item="e.item"
                :result="e.result"
                :value="e.ans.numberValue"
                :visible="e.ans.resultVisible !== false"
                readonly
              />
              <!-- AE comment -->
              <p v-if="hasComment(e)" class="rp-row-comment">{{ e.ans.comment }}</p>
            </li>
          </ul>
        </section>

        <p v-if="!items.length" class="rp-empty-list">No checklist items were added to this report.</p>
      </div>

      <!-- Report footer -->
      <footer class="rp-footer">
        <span>Technical Precheck Report · Generated by Assistant Editor</span>
        <span v-if="reportStore.submittedAt">· {{ reportStore.submittedAt.slice(0, 16).replace('T', ' ') }}</span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.report-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 8px 0 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1b3555;
}

/* ---- empty state ---- */
.rp-empty {
  padding: 80px 24px;
  text-align: center;
  color: #5f6b7d;
}
.rp-empty-icon { color: #778293; }
.rp-empty-title { margin: 12px 0 6px; color: #1b3555; font-size: 20px; }
.rp-empty-desc { margin: 0 0 20px; font-size: 13px; }
.rp-empty .rp-btn.primary {
  padding: 10px 20px;
  border: 1px solid #0156ce;
  border-radius: 4px;
  color: #fff;
  background: #0156ce;
  font-size: 13px;
  cursor: pointer;
}
.rp-empty .rp-btn.primary:hover { background: #004db9; }

/* ---- report sheet (paper-like) ---- */
.rp-sheet {
  background: #fff;
  border: 1px solid #e1e5ea;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* header */
.rp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 32px 16px;
  border-bottom: 2px solid #001a3e;
}
.rp-logo { height: 34px; }
.rp-header-right { text-align: right; }
.rp-report-title { font-size: 22px; font-weight: 700; color: #001a3e; }
.rp-report-sub { margin-top: 2px; font-size: 12px; color: #5f6b7d; }

/* meta */
.rp-meta {
  padding: 14px 32px 10px;
  background: #f8f9fd;
  border-bottom: 1px solid #eef0f3;
  font-size: 13px;
}
.rp-meta-title { margin: 0 0 10px; font-size: 15px; font-weight: 600; color: #1b3555; line-height: 1.4; }
.rp-meta-row { display: flex; align-items: center; flex-wrap: wrap; gap: 20px; }
.rp-meta-item { display: flex; flex-direction: column; gap: 2px; }
.rp-meta-label { font-size: 11px; color: #5f6b7d; text-transform: uppercase; letter-spacing: 0.3px; }
.rp-meta-value { font-weight: 600; color: #1b3555; }
.rp-meta-summary { margin-left: auto; flex-direction: row; align-items: center; gap: 8px; }
.rp-sum-pill {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.rp-sum-pill.passed { color: #256b41; background: #e7f4ec; }
.rp-sum-pill.warning { color: #9a3d20; background: #fdeee7; }
.rp-sum-pill.none { color: #5f6b7d; background: #f0f2f5; }

/* screen controls (subtle) */
.rp-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 32px;
  border-bottom: 1px solid #eef0f3;
}
.rp-group-toggle { display: inline-flex; gap: 0; }
.rp-toggle {
  height: 26px;
  padding: 0 10px;
  border: none;
  background: transparent;
  color: #5f6b7d;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}
.rp-toggle.active { color: #0156ce; font-weight: 600; border-bottom-color: #0156ce; }
.rp-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 12px;
  border: 1px solid #c8cdd3;
  border-radius: 4px;
  color: #3e4a5a;
  background: #fff;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.rp-btn:hover { border-color: #0156ce; color: #0156ce; }
.rp-btn.primary {
  border-color: #0156ce;
  color: #fff;
  background: #0156ce;
}
.rp-btn.primary:hover { background: #004db9; color: #fff; }
.rp-toggle:focus-visible,
.rp-btn:focus-visible {
  outline: 2px solid #0156ce;
  outline-offset: 1px;
}
.rp-toggle.active:focus-visible,
.rp-btn.primary:focus-visible {
  outline: 2px solid #fff;
  outline-offset: -1px;
  box-shadow: 0 0 0 3px #0156ce;
}

/* body groups */
.rp-body { padding: 16px 32px 8px; }
.rp-group { margin-bottom: 20px; }
.rp-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eef0f3;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.rp-group-title.passed { color: #256b41; }
.rp-group-title.warning { color: #9a3d20; }
.rp-group-title.none { color: #5f6b7d; }
.rp-group-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  background: #f0f2f5;
  color: #5f6b7d;
}

/* rows */
.rp-list { list-style: none; margin: 0; padding: 0; }
.rp-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  margin-bottom: 10px;
  border: 1px solid #eef0f3;
  border-radius: 6px;
}
.rp-row-title-line { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rp-row-title { flex: 0 1 auto; min-width: 0; font-size: 13px; font-weight: 600; color: #344764; }
.rp-row-desc {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 12px;
  line-height: 1.4;
  color: #5f6b7d;
}
.rp-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 9px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}
.rp-badge.passed { color: #256b41; background: #e7f4ec; }
.rp-badge.warning { color: #9a3d20; background: #fdeee7; }
.rp-row-comment {
  margin: 0;
  padding: 8px 10px;
  border-radius: 4px;
  background: #f8f9fd;
  font-size: 12px;
  line-height: 1.5;
  color: #5f6b7d;
  overflow-wrap: break-word;
}
.rp-row-comment::before {
  content: 'Editor note: ';
  font-weight: 600;
  color: #344764;
}

.rp-empty-list { padding: 20px 0; text-align: center; color: #5f6b7d; font-size: 13px; }

/* footer */
.rp-footer {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  padding: 14px 32px;
  border-top: 1px solid #eef0f3;
  color: #5f6b7d;
  font-size: 11px;
}

/* ---- print: PDF-style ---- */
@media print {
  .report-page { padding: 0; }
  .rp-sheet { border: 0; box-shadow: none; }
  .rp-controls { display: none; }
  .rp-row { break-inside: avoid; }
  body { background: #fff; }
  .rp-sum-pill { border: 1px solid #c8cdd3; }
}
</style>

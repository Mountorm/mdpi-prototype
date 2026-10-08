<script setup>
// Generate Report page — AE Screen 1 (pre-check preparation)
// The manuscript comes from SuSy context (mock data; in the real system the
// manuscript ID arrives as a route parameter). Detection results are pulled
// from the tools automatically (detectionResults.js); the AE reviews them and
// judges each item:
//   - number items (Word / Figures / Tables): detection value, AE can edit
//   - judgment items: Fine (passed) / Not sure (warning); warning requires a comment
//   - auto items (Scope Match / Reference Analysis): system flag, AE can override
// The flag / comment behavior follows the config (ace.js): manual items let the
// AE pick, auto items resolve from the detection result or rule.
// Preview validates the checklist and opens a dialog. Generate writes the
// report and opens /report.
import { ref, reactive, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import MdIcon from '../components/MdIcon.vue'
import DetectionResult from '../components/DetectionResult.vue'
import TechnicalReport from '../components/TechnicalReport.vue'
import { checklistStore } from '../store/checklist.js'
import { mockManuscript } from '../mock/ace.js'
import { getDetectionResult } from '../mock/detectionResults.js'
import { setReport } from '../store/report.js'
import { isNumberItem, isScopeItem, isReferenceAnalysisItem, isImageItem, isResultUnavailable, isArticleTypeItem } from '../utils/itemKinds.js'

const router = useRouter()
const manuscriptId = mockManuscript.id

/* ---------------- Answers ---------------- */
// answers[itemId] = { status, comment, numberValue, counts, selected }
// status: 'passed' | 'warning' | null (auto items pre-fill from detection result)
const answers = reactive({})

const emptyAnswer = (item) => {
  const result = getDetectionResult(manuscriptId, item.id)
  let status = null
  let numberValue = null
  let counts = null
  if (isNumberItem(item)) {
    counts = {}
    for (const part of item.parts || []) {
      counts[part.key] = result?.counts?.[part.key] ?? null
    }
  } else if (isScopeItem(item)) {
    // auto: in_scope → passed, everything else (out_of_scope / unknown) → warning.
    // The AE can override the judgment if they consider it fine.
    status = result?.status === 'in_scope' ? 'passed' : 'warning'
  } else if (isReferenceAnalysisItem(item)) {
    // auto: numeric threshold — found refs > threshold → warning
    const count = result?.refs?.length ?? 0
    const r = item.rule
    const isWarn =
      (r.operator === '>' && count > r.value) ||
      (r.operator === '≥' && count >= r.value) ||
      (r.operator === '<' && count < r.value) ||
      (r.operator === '≤' && count <= r.value)
    status = isWarn ? r.result : 'passed'
  } else if (isImageItem(item)) {
    // auto: boolean — pass → passed, anything else (alert) → warning
    status = result?.status === 'pass' ? 'passed' : 'warning'
  }
  // resultVisible: whether the result is shown in the AcEd report.
  // Unavailable results (unknown scope) and Reference Analysis structures
  // default to hidden and their checkbox stays disabled.
  const resultVisible = !isResultUnavailable(item, result)
  return { status, comment: '', numberValue, counts, selected: item.required, resultVisible }
}
const getAnswer = (id) => answers[id]

// collapsed categories / items (default: everything expanded)
const collapsedCategories = ref(new Set())
const collapsedItems = ref(new Set())

/* ---------------- Derived ---------------- */
// Only required items (per the shared journal config) are processed on this
// page and go into the report; optional items are hidden here.
const activeItems = computed(() =>
  checklistStore.items.filter((i) => i.inUse && i.required)
)
activeItems.value.forEach((i) => { answers[i.id] = emptyAnswer(i) })
const itemsByCategory = computed(() => {
  const map = new Map()
  activeItems.value.forEach((i) => {
    if (!map.has(i.category)) map.set(i.category, [])
    map.get(i.category).push(i)
  })
  return [...map.entries()]
})

const resolvedFlag = (item) => {
  const a = getAnswer(item.id)
  if (!item.flagRequired) return null
  return a.status
}

const isWarning = (item) => resolvedFlag(item) === 'warning'

// scope status display helper lives in utils/itemKinds.js (shared with report)

/* ---------------- Validation ---------------- */
const errors = reactive({})
const errorText = (id) => errors[id] ?? ''
const clearError = (id) => { delete errors[id] }

// Same rule as Preview: numbers filled, Fine, or Not sure with a comment.
const itemGap = (item) => {
  const a = getAnswer(item.id)
  if (!a?.selected) return ''
  if (isNumberItem(item)) {
    const missing = (item.parts || []).some((part) => {
      const v = a.counts?.[part.key]
      return v === null || v === undefined
    })
    return missing ? 'Please fill in the numbers' : ''
  }
  if (!a.status) return 'Please mark Fine or Not sure'
  if (a.status === 'warning' && !String(a.comment || '').trim()) return 'A comment is required for Warning'
  return ''
}
const isItemComplete = (item) => !itemGap(item)

const validate = () => {
  for (const key of Object.keys(errors)) delete errors[key]
  let firstErrorItem = null

  activeItems.value.forEach((item) => {
    const msg = itemGap(item)
    if (msg) {
      errors[item.id] = msg
      firstErrorItem ??= item.id
    }
  })

  if (firstErrorItem !== null) {
    ElMessage.warning('Some required fields are missing, please check the highlighted items')
    const el = document.getElementById(`item-${firstErrorItem}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return false
  }
  return true
}

const previewOpen = ref(false)

const previewEntries = computed(() =>
  activeItems.value.map((item) => ({
    item,
    ans: getAnswer(item.id),
    result: getDetectionResult(manuscriptId, item.id),
  })).filter((e) => e.ans?.selected)
)

const previewCountsNote = computed(() =>
  previewEntries.value
    .filter((e) => isNumberItem(e.item))
    .map((e) => String(e.ans.comment || '').trim())
    .find(Boolean) || ''
)

const previewNote = (entry) => String(entry.ans.comment || '').trim()

const previewArticleType = (entry) => {
  if (!isArticleTypeItem(entry.item)) return ''
  if (!entry.ans.resultVisible || !entry.result) return ''
  return entry.result.articleType || ''
}

/* ---------------- Actions ---------------- */
// Preview: validate, then show the report body in a dialog.
const onReview = () => {
  if (validate()) previewOpen.value = true
}

const onGenerate = () => {
  setReport(manuscriptId, answers)
  previewOpen.value = false
  router.push('/report')
}

const onReset = () => {
  ElMessageBox.confirm(
    'This will clear all answers and comments. Continue?',
    'Reset checklist',
    { confirmButtonText: 'Reset', cancelButtonText: 'Cancel', type: 'warning' }
  )
    .then(() => {
      activeItems.value.forEach((i) => { answers[i.id] = emptyAnswer(i) })
      for (const key of Object.keys(errors)) delete errors[key]
      ElMessage.success('Form reset')
    })
    .catch(() => {})
}

// Register the toolbar into the ReportShell breadcrumb slot (always visible)
const registerToolbar = inject('registerToolbar', null)
onMounted(() => registerToolbar?.({ manuscriptId, onReset, onReview }))
onBeforeUnmount(() => registerToolbar?.(null))

const numberItems = (items) => items.filter(isNumberItem)
const otherItems = (items) => items.filter((item) => !isNumberItem(item))

const toggleCategory = (cat) => {
  const s = collapsedCategories.value
  s.has(cat) ? s.delete(cat) : s.add(cat)
}
const toggleItem = (id) => {
  const s = collapsedItems.value
  s.has(id) ? s.delete(id) : s.add(id)
}

const categoryProgress = (items) => {
  const chosen = items.filter((item) => getAnswer(item.id).selected)
  const done = chosen.filter(isItemComplete).length
  return `${done}/${chosen.length}`
}
</script>

<template>
  <div class="generate-page">
    <!-- ========== Checklist accordion ========== -->
    <div class="gen-list">
      <section v-for="[cat, items] in itemsByCategory" :key="cat" class="gen-category">
        <header class="gen-category-header" type="button" @click="toggleCategory(cat)">
          <MdIcon :name="collapsedCategories.has(cat) ? 'expand_more' : 'expand_less'" :size="18" class="gen-arrow" />
          <span class="gen-category-name">{{ cat }}</span>
          <span class="gen-category-progress">{{ categoryProgress(items) }} completed</span>
        </header>

        <div v-if="!collapsedCategories.has(cat)" class="gen-items">
          <article
            v-for="item in numberItems(items)"
            :id="`item-${item.id}`"
            :key="item.id"
            class="gen-item"
            :class="{ pending: !isItemComplete(item), error: errorText(item.id) }"
          >
            <header class="gen-item-header" @click="toggleItem(item.id)">
              <MdIcon
                :name="collapsedItems.has(item.id) ? 'expand_more' : 'expand_less'"
                :size="16"
                class="gen-arrow"
              />
              <div class="gen-item-title">
                <span class="gen-item-name">{{ item.title }}</span>
                <span v-if="item.required" class="gen-required-star" title="Required">*</span>
              </div>
              <span class="gen-item-desc">{{ item.description }}</span>
            </header>
            <div v-if="!collapsedItems.has(item.id)" class="gen-item-body">
              <div class="gen-counts-row">
                <div v-for="part in item.parts" :key="part.key" class="gen-count">
                  <div class="gen-count-label">{{ part.title }}</div>
                  <el-input-number
                    :model-value="getAnswer(item.id).counts[part.key]"
                    :min="0"
                    controls-position="right"
                    class="gen-num"
                    @update:model-value="(v) => { getAnswer(item.id).counts[part.key] = v; clearError(item.id) }"
                  />
                </div>
              </div>
              <p v-if="errorText(item.id)" class="gen-error">
                <MdIcon name="error" :size="14" />{{ errorText(item.id) }}
              </p>
              <div class="gen-comment">
                <textarea
                  :value="getAnswer(item.id).comment"
                  rows="2"
                  placeholder="Add a comment"
                  @input="(e) => { getAnswer(item.id).comment = e.target.value }"
                ></textarea>
              </div>
            </div>
          </article>

          <article
            v-for="item in otherItems(items)"
            :key="item.id"
            :id="`item-${item.id}`"
            class="gen-item"
            :class="{ pending: !isItemComplete(item), error: errorText(item.id) }"
          >
            <header class="gen-item-header" @click="toggleItem(item.id)">
              <MdIcon
                :name="collapsedItems.has(item.id) ? 'expand_more' : 'expand_less'"
                :size="16"
                class="gen-arrow"
              />
              <div class="gen-item-title">
                <span class="gen-item-name">{{ item.title }}</span>
                <span v-if="item.required" class="gen-required-star" title="Required">*</span>
              </div>
              <span class="gen-item-desc" :title="item.description">{{ item.description }}</span>
              <span
                v-if="item.flagRequired && resolvedFlag(item)"
                class="gen-badge"
                :class="resolvedFlag(item)"
              >
                {{ resolvedFlag(item) === 'passed' ? 'Passed' : 'Warning' }}
              </span>
            </header>

            <!-- expandable even when not selected: AE reviews the detection result first -->
            <div v-if="!collapsedItems.has(item.id)" class="gen-item-body">
              <!-- ===== Detection result (system pulled) ===== -->
              <DetectionResult
                :item="item"
                :result="getDetectionResult(manuscriptId, item.id)"
                :value="getAnswer(item.id).numberValue"
                :visible="getAnswer(item.id).resultVisible"
                :show-visibility="getAnswer(item.id).selected"
                :readonly="false"
                @update:value="(v) => { getAnswer(item.id).numberValue = v; clearError(item.id) }"
                @update:visible="(v) => { getAnswer(item.id).resultVisible = v }"
              />

              <!-- ===== AE judgment (shown once the item is selected) ===== -->
              <div v-if="item.flagRequired && getAnswer(item.id).selected" class="gen-judge">
                <el-radio-group
                  :model-value="getAnswer(item.id).status"
                  @update:model-value="(v) => { getAnswer(item.id).status = v; clearError(item.id) }"
                >
                  <el-radio value="passed">Fine</el-radio>
                  <el-radio value="warning">Not sure</el-radio>
                </el-radio-group>
              </div>

              <!-- comment: available for any selected item -->
              <div v-if="getAnswer(item.id).selected" class="gen-comment" :class="{ error: isWarning(item) && !String(getAnswer(item.id).comment || '').trim() }">
                <textarea
                  :value="getAnswer(item.id).comment"
                  rows="2"
                  placeholder="Add a comment"
                  @input="(e) => { getAnswer(item.id).comment = e.target.value; clearError(item.id) }"
                ></textarea>
              </div>

              <p v-if="errorText(item.id)" class="gen-error">
                <MdIcon name="error" :size="14" />{{ errorText(item.id) }}
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>

    <el-dialog
      v-model="previewOpen"
      title="Preview"
      width="880px"
      append-to-body
      class="gen-preview-dialog"
    >
      <TechnicalReport
        main-only
        :entries="previewEntries"
        :counts-note="previewCountsNote"
        :note-of="previewNote"
        :article-type-of="previewArticleType"
      />
      <template #footer>
        <button class="gen-btn" type="button" @click="previewOpen = false">Cancel</button>
        <button class="gen-btn primary" type="button" @click="onGenerate">Generate</button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.generate-page {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ---- category accordion ---- */
.gen-list { display: flex; flex-direction: column; gap: 10px; }
.gen-category {
  border: 1px solid #e1e5ea;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}
.gen-category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fd;
  border-bottom: 1px solid #eef0f3;
  cursor: pointer;
  user-select: none;
}
.gen-category-header:hover { background: #f0f3fb; }
.gen-arrow { color: #5f6b7d; flex-shrink: 0; }
.gen-category-name { font-size: 17px; font-weight: 700; color: #1b3555; }
.gen-category-progress { margin-left: auto; font-size: 12px; color: #5f6b7d; }

.gen-items { display: flex; flex-direction: column; }
.gen-counts-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.gen-count-label { margin-bottom: 6px; color: #344764; font-size: 13px; font-weight: 600; }
.gen-num { width: 100%; }
.gen-item { border-bottom: 1px solid #eef0f3; }
.gen-item:last-child { border-bottom: 0; }
.gen-item.pending { box-shadow: inset 3px 0 0 #e65100; }
.gen-item.error { background: #fffbf7; box-shadow: inset 3px 0 0 #e65100; }

.gen-item-header { display: flex; align-items: center; gap: 8px; padding: 10px 16px; cursor: pointer; user-select: none; }
.gen-item-title { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.gen-item-name { font-size: 15px; font-weight: 600; color: #344764; }
.gen-required-star { color: #c7352d; font-weight: 700; }
.gen-item-desc {
  flex: 1;
  min-width: 0;
  margin: 0;
  color: #5f6b7d;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gen-item-body { padding: 2px 16px 14px 40px; }

/* ---- judgment ---- */
.gen-judge { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }

/* comment & examples */
.gen-comment { margin-top: 0; }
.gen-comment textarea {
  width: 100%;
  min-height: 48px;
  padding: 8px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #1b3555;
  background: #fff;
  font: inherit;
  font-size: 13px;
  resize: vertical;
  outline: none;
}
.gen-comment textarea:focus { border-color: #0156ce; }
.gen-comment.error textarea { border-color: #c7352d; }
.gen-comment.error textarea:focus { border-color: #c7352d; }

/* badges */
.gen-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 9px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.gen-badge.passed { color: #256b41; background: #e7f4ec; }
.gen-badge.warning { color: #9a3d20; background: #fdeee7; }
.gen-badge.none { color: #5f6b7d; background: #f0f2f5; }

/* validation error */
.gen-error {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 8px 0 0;
  color: #c7352d;
  font-size: 12px;
}
.gen-error .md-icon { flex-shrink: 0; }

.gen-btn {
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
.gen-btn.primary {
  border-color: #0156ce;
  color: #fff;
  background: #0156ce;
}
.gen-btn.primary:hover { background: #004db9; color: #fff; }
@media (max-width: 800px) {
  .gen-counts-row { grid-template-columns: 1fr; }
}
</style>

<style>
.gen-preview-dialog .el-dialog__body {
  max-height: 70vh;
  overflow: auto;
  background: #f5f7fb;
}
.gen-preview-dialog .el-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

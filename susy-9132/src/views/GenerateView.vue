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
// Generate validates, then shows a read-only summary below (no navigation).
import { ref, reactive, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import MdIcon from '../components/MdIcon.vue'
import DetectionResult from '../components/DetectionResult.vue'
import { checklistStore } from '../store/checklist.js'
import { mockManuscript } from '../mock/ace.js'
import { getDetectionResult } from '../mock/detectionResults.js'
import { setReport } from '../store/report.js'
import { isNumberItem, isScopeItem, isReferenceAnalysisItem, isImageItem, isResultUnavailable } from '../utils/itemKinds.js'

const router = useRouter()
const manuscriptId = mockManuscript.id

/* ---------------- Answers ---------------- */
// answers[itemId] = { status, comment, numberValue, selected }
// status: 'passed' | 'warning' | null (auto items pre-fill from detection result)
const answers = reactive({})

const emptyAnswer = (item) => {
  const result = getDetectionResult(manuscriptId, item.id)
  let status = null
  let numberValue = null
  if (isNumberItem(item)) {
    numberValue = result?.value ?? null
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
  return { status, comment: '', numberValue, selected: item.required, resultVisible }
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

const validate = () => {
  for (const key of Object.keys(errors)) delete errors[key]
  let firstErrorItem = null

  activeItems.value.forEach((item) => {
    const a = getAnswer(item.id)
    if (!a.selected) return // items not added to the report are not validated
    let msg = ''
    if (isNumberItem(item)) {
      if (a.numberValue === null || a.numberValue === undefined) msg = 'Please fill in the number'
    } else if (!a.status) {
      msg = 'Please mark Fine or Not sure'
    } else if (a.status === 'warning' && !String(a.comment || '').trim()) {
      msg = 'A comment is required for Warning'
    }
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

/* ---------------- Actions ---------------- */
// Generate: keep the button, real submission is wired to another flow later
const onGenerate = () => {
  if (validate()) {
    ElMessage.success('Checklist validated')
  }
}

// Review: hand the filled checklist over to the report page
const onReview = () => {
  if (validate()) {
    setReport(manuscriptId, answers)
    router.push('/report')
  }
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
onMounted(() => registerToolbar?.({ manuscriptId, onReset, onGenerate, onReview }))
onBeforeUnmount(() => registerToolbar?.(null))

const toggleCategory = (cat) => {
  const s = collapsedCategories.value
  s.has(cat) ? s.delete(cat) : s.add(cat)
}
const toggleItem = (id) => {
  const s = collapsedItems.value
  s.has(id) ? s.delete(id) : s.add(id)
}

// category progress: done / selected (number items filled + judged items resolved)
const categoryProgress = (items) => {
  const chosen = items.filter((item) => getAnswer(item.id).selected)
  let done = 0
  chosen.forEach((item) => {
    const a = getAnswer(item.id)
    if (isNumberItem(item) && a.numberValue !== null && a.numberValue !== undefined) done++
    else if (resolvedFlag(item)) done++
  })
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
            v-for="item in items"
            :key="item.id"
            :id="`item-${item.id}`"
            class="gen-item"
            :class="{ error: errorText(item.id) }"
          >
            <!-- item header: title + required star, resolved badge, add-checkbox on the right -->
            <header class="gen-item-header" @click="toggleItem(item.id)">
              <MdIcon
                :name="collapsedItems.has(item.id) ? 'expand_more' : 'expand_less'"
                :size="16"
                class="gen-arrow"
              />
              <div class="gen-item-title">
                <span class="gen-item-name" :class="{ unselected: !getAnswer(item.id).selected }">{{ item.title }}</span>
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
              <el-checkbox
                :model-value="getAnswer(item.id).selected"
                disabled
                :aria-label="'Included in report: ' + item.title"
              ></el-checkbox>
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
.gen-item { border-bottom: 1px solid #eef0f3; }
.gen-item:last-child { border-bottom: 0; }
.gen-item.error { background: #fffbf7; box-shadow: inset 3px 0 0 #e65100; }

.gen-item-header { display: flex; align-items: center; gap: 8px; padding: 10px 16px; cursor: pointer; user-select: none; }
.gen-item-header .el-checkbox {
  margin-right: 0;
  margin-left: auto;
  --el-checkbox-checked-bg-color: #0156ce;
  --el-checkbox-checked-input-border-color: #0156ce;
  --el-checkbox-disabled-checked-input-fill: rgba(1, 86, 206, 0.4);
  --el-checkbox-disabled-checked-input-border-color: rgba(1, 86, 206, 0.4);
  --el-checkbox-disabled-checked-icon-color: #fff;
}
.gen-item-title { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.gen-item-name { font-size: 15px; font-weight: 600; color: #344764; }
.gen-item-name.unselected { color: #b1b6bf; }
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
</style>

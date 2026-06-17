<template>
  <div class="rb-layout">
    <!-- Header -->
    <div class="rb-header">
      <div class="rb-header__left">
        <span class="material-symbols-outlined rb-header__icon">description</span>
        <span class="rb-header__title">Report Builder</span>
        <span class="rb-header__sep">|</span>
        <span class="rb-header__ms">{{ state.manuscriptId }}</span>
      </div>
      <div class="rb-header__actions">
        <el-button size="small" @click="handleBack">
          <span class="material-symbols-outlined" style="font-size:14px;">arrow_back</span>
          Back
        </el-button>
        <el-button size="small" type="primary" class="susy-btn" @click="handlePreview">
          <span class="material-symbols-outlined" style="font-size:14px;">open_in_new</span>
          Full Preview
        </el-button>
      </div>
    </div>

    <!-- Body: Selection + Preview -->
    <div class="rb-body">
      <!-- Left: Item Selection -->
      <div class="rb-select">
        <div class="rb-select__header">
          <span class="rb-select__label">Select items to include</span>
          <span class="rb-select__count">{{ includedCount }} / {{ state.items.length }}</span>
        </div>

        <div class="rb-select__sections">
          <div v-for="section in allSections" :key="section.id" class="rb-select__section">
            <div class="rb-select__section-head" @click="toggleExpand(section.id)">
              <span class="material-symbols-outlined rb-select__chevron" :class="{ 'rb-select__chevron--open': expandedSections[section.id] }">expand_more</span>
              <el-checkbox
                :model-value="isSectionAllIncluded(section)"
                :indeterminate="isSectionPartial(section)"
                @click.stop
                @change="doToggleSection(section.id)"
              />
              <span class="rb-select__section-title">{{ section.title }}</span>
              <span class="rb-select__section-count">{{ section.items.filter(i => i.included).length }}/{{ section.items.length }}</span>
            </div>

            <div v-if="expandedSections[section.id]" class="rb-select__items">
              <div v-for="item in section.items" :key="item.id" class="rb-select__item">
                <el-checkbox v-model="item.included" />
                <div class="rb-select__item-info">
                  <div class="rb-select__item-top">
                    <span class="rb-select__item-title">{{ item.title }}</span>
                    <span :class="['rb-select__item-status', `rb-select__item-status--${item.status}`]">{{ statusLabel(item.status) }}</span>
                  </div>
                  <p v-if="item.description" class="rb-select__item-desc">{{ item.description }}</p>
                </div>
                <button
                  :class="['rb-select__flag-btn', { 'rb-select__flag-btn--active': item.annotation.note }]"
                  title="Edit & annotate"
                  @click="openDialog(item)"
                >
                  <span class="material-symbols-outlined" style="font-size:14px;">edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Live Preview -->
      <div class="rb-preview">
        <ReportPaper
          :manuscript="{ id: state.manuscriptId, journal: state.journal }"
          :sections="sections"
          :stats="stats"
        />
      </div>
    </div>

    <!-- Edit + Annotate Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="Edit Detection Result"
      width="600px"
      :close-on-click-modal="false"
      top="5vh"
    >
      <div v-if="dialogTarget" class="rb-dialog">
        <!-- Status -->
        <div class="rb-dialog__field">
          <label class="rb-dialog__label">Status</label>
          <div class="rb-dialog__status-group">
            <label
              v-for="opt in statusOptions"
              :key="opt.value"
              :class="['rb-dialog__status-opt', { 'rb-dialog__status-opt--active': form.status === opt.value }]"
              @click="form.status = opt.value"
            >
              <span :class="['rb-sel-status', `rb-sel-status--${opt.value}`]">{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <!-- Title -->
        <div class="rb-dialog__field">
          <label class="rb-dialog__label">Title</label>
          <el-input v-model="form.title" size="small" />
        </div>

        <!-- Description -->
        <div class="rb-dialog__field">
          <label class="rb-dialog__label">Description</label>
          <el-input v-model="form.description" type="textarea" :rows="2" size="small" />
        </div>

        <!-- Results -->
        <div class="rb-dialog__field">
          <div class="rb-dialog__label-row">
            <label class="rb-dialog__label">Results</label>
            <button class="rb-dialog__add-btn" @click="addResult">
              <span class="material-symbols-outlined" style="font-size:13px;">add</span>
              Add
            </button>
          </div>

          <div v-if="form.results.length === 0" class="rb-dialog__empty">No results</div>

          <div v-for="(result, ri) in form.results" :key="ri" class="rb-dialog__result">
            <div class="rb-dialog__result-head">
              <span class="rb-dialog__result-idx">#{{ ri + 1 }}</span>
              <button class="rb-dialog__result-del" @click="removeResult(ri)">
                <span class="material-symbols-outlined" style="font-size:14px;">close</span>
              </button>
            </div>
            <el-input v-model="result.result" size="small" placeholder="Result text" />
            <textarea
              class="rb-dialog__textarea"
              :value="result.details?.join('\n')"
              rows="2"
              placeholder="Details (one per line)"
              @input="e => result.details = e.target.value.split('\n').filter(l => l.length > 0)"
            />
            <!-- Author -->
            <div class="rb-dialog__author">
              <template v-if="result.author">
                <el-input v-model="result.author.name" size="small" placeholder="Author name" style="flex:1;" />
                <el-input v-model="result.author.email" size="small" placeholder="Email" style="flex:1;" />
                <button class="rb-dialog__result-del" @click="result.author = null" title="Remove author">
                  <span class="material-symbols-outlined" style="font-size:14px;">close</span>
                </button>
              </template>
              <button v-else class="rb-dialog__text-btn" @click="result.author = { name: '', email: '' }">+ Add author</button>
            </div>
          </div>
        </div>

        <!-- Note -->
        <div class="rb-dialog__field">
          <label class="rb-dialog__label">Editor Note</label>
          <el-input
            v-model="form.note"
            type="textarea"
            :rows="3"
            size="small"
            placeholder="Leave a note for the editor..."
          />
        </div>
      </div>

      <template #footer>
        <el-button size="small" @click="dialogVisible = false">Cancel</el-button>
        <el-button v-if="dialogTarget?.annotation.note" size="small" @click="clearAndClose">Clear Note</el-button>
        <el-button size="small" type="primary" class="dm-btn-primary" @click="saveDialog">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReport } from '../composables/useReport.js'
import ReportPaper from '../components/report/ReportPaper.vue'

const router = useRouter()
const { state, allSections, sections, stats, toggleSection: doToggleSection, setAnnotation, updateItem } = useReport()

const includedCount = computed(() => state.items.filter(i => i.included).length)

// Expanded sections
const expandedSections = reactive({})
onMounted(() => {
  allSections.value.forEach(s => { expandedSections[s.id] = true })
})

function toggleExpand(sectionId) {
  expandedSections[sectionId] = !expandedSections[sectionId]
}

function isSectionAllIncluded(section) {
  return section.items.every(i => i.included)
}
function isSectionPartial(section) {
  const inc = section.items.filter(i => i.included).length
  return inc > 0 && inc < section.items.length
}

function statusLabel(status) {
  return { healthy: 'Passed', warning: 'Warning', error: 'Severe' }[status] || status
}

// ── Dialog ──
const dialogVisible = ref(false)
const dialogTarget = ref(null)
const form = reactive({ title: '', description: '', status: 'healthy', results: [], note: '' })

const statusOptions = [
  { value: 'error', label: 'Severe' },
  { value: 'warning', label: 'Warning' },
  { value: 'healthy', label: 'Passed' },
]

function openDialog(item) {
  dialogTarget.value = item
  form.title = item.title
  form.description = item.description || ''
  form.status = item.status
  form.results = (item.results || []).map(r => ({
    result: r.result || '',
    details: r.details ? [...r.details] : [],
    author: r.author ? { ...r.author } : null,
    detailsType: r.detailsType || 'list',
    htmlContent: r.htmlContent || null,
    resultSlots: r.resultSlots ? { ...r.resultSlots } : null,
  }))
  form.note = item.annotation.note || ''
  dialogVisible.value = true
}

function addResult() {
  form.results.push({ result: '', details: [], author: null, detailsType: 'list' })
}

function removeResult(ri) {
  form.results.splice(ri, 1)
}

function saveDialog() {
  if (!dialogTarget.value) return
  // Save edits
  updateItem(dialogTarget.value.id, {
    title: form.title,
    description: form.description,
    status: form.status,
    results: form.results,
  })
  // Save note
  const hasNote = form.note.trim().length > 0
  setAnnotation(dialogTarget.value.id, {
    accurate: hasNote ? false : null,
    note: form.note,
  })
  dialogVisible.value = false
}

function clearAndClose() {
  if (dialogTarget.value) {
    setAnnotation(dialogTarget.value.id, { accurate: null, note: '' })
  }
  dialogVisible.value = false
}

function handleBack() {
  router.push('/detection-assistant')
}

function handlePreview() {
  const data = {
    manuscript: { id: state.manuscriptId, journal: state.journal },
    sections: sections.value,
    stats: stats.value,
  }
  router.push({ path: '/report-preview', query: { d: JSON.stringify(data) } })
}
</script>

<style scoped>
.rb-layout {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 120px);
  background: #f0f2f5;
}

/* Header */
.rb-header {
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
.rb-header__left { display: flex; align-items: center; gap: 10px; }
.rb-header__icon { font-size: 18px; color: #0156ce; }
.rb-header__title { font-size: 16px; font-weight: 600; color: #172b4d; }
.rb-header__sep { color: #d1d5db; }
.rb-header__ms { font-size: 13px; color: #0156ce; font-weight: 500; }
.rb-header__actions { display: flex; gap: 8px; }

/* Body */
.rb-body { display: flex; flex: 1; overflow: hidden; }

/* Left Panel */
.rb-select {
  width: 380px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.rb-select__header {
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 5;
}
.rb-select__label { font-size: 13px; font-weight: 600; color: #1e293b; }
.rb-select__count { font-size: 12px; color: #64748b; }
.rb-select__sections { padding: 8px 0; }
.rb-select__section { border-bottom: 1px solid #f1f5f9; }
.rb-select__section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.1s;
}
.rb-select__section-head:hover { background: #f8fafc; }
.rb-select__chevron { font-size: 18px; color: #94a3b8; transition: transform 0.2s; }
.rb-select__chevron--open { transform: rotate(-180deg); }
.rb-select__section-title { font-size: 13px; font-weight: 600; color: #334155; flex: 1; }
.rb-select__section-count { font-size: 11px; color: #94a3b8; }
.rb-select__items { padding: 0 16px 8px 40px; }
.rb-select__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f8fafc;
}
.rb-select__item:last-child { border-bottom: none; }
.rb-select__item-info { flex: 1; min-width: 0; }
.rb-select__item-top { display: flex; align-items: center; gap: 8px; }
.rb-select__item-title { font-size: 13px; color: #1e293b; font-weight: 500; }
.rb-select__item-desc { font-size: 11px; color: #94a3b8; margin: 2px 0 0 0; line-height: 1.4; }
.rb-select__item-status {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 1px 6px;
  white-space: nowrap;
  line-height: 1.5;
}
.rb-select__item-status--error { color: #991b1b; background: #fef2f2; border: 1px solid #fecaca; }
.rb-select__item-status--warning { color: #92400e; background: #fffbeb; border: 1px solid #fde68a; }
.rb-select__item-status--healthy { color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; }
.rb-select__flag-btn {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.15s;
  flex-shrink: 0;
  margin-top: 2px;
}
.rb-select__flag-btn:hover { border-color: #0156ce; color: #0156ce; }
.rb-select__flag-btn--active { border-color: #0156ce; color: #0156ce; background: #f0f5ff; }

/* Preview */
.rb-preview {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
}

/* ── Dialog ── */
.rb-dialog__field { margin-bottom: 14px; }
.rb-dialog__label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
}
.rb-dialog__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}
.rb-dialog__label-row .rb-dialog__label { margin-bottom: 0; }

.rb-dialog__status-group { display: flex; gap: 8px; }
.rb-dialog__status-opt {
  cursor: pointer;
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: border-color 0.1s;
}
.rb-dialog__status-opt--active { border-color: #0156ce; }

/* Status tags (local, not reusing left panel's) */
.rb-sel-status {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 2px 8px;
  line-height: 1.4;
}
.rb-sel-status--error { color: #991b1b; background: #fef2f2; border: 1px solid #fecaca; }
.rb-sel-status--warning { color: #92400e; background: #fffbeb; border: 1px solid #fde68a; }
.rb-sel-status--healthy { color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; }

.rb-dialog__add-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
}
.rb-dialog__add-btn:hover { border-color: #0156ce; color: #0156ce; }

.rb-dialog__empty {
  font-size: 12px;
  color: #9ca3af;
  padding: 10px;
  background: #f9fafb;
  text-align: center;
}

.rb-dialog__result {
  padding: 10px;
  background: #f9fafb;
  margin-bottom: 6px;
}
.rb-dialog__result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.rb-dialog__result-idx { font-size: 11px; font-weight: 700; color: #0156ce; }
.rb-dialog__result-del {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  display: flex;
}
.rb-dialog__result-del:hover { color: #dc2626; }

.rb-dialog__textarea {
  width: 100%;
  margin-top: 6px;
  padding: 5px 11px;
  font-size: 13px;
  font-family: inherit;
  color: #1f2937;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.rb-dialog__textarea:focus { border-color: #0156ce; }
.rb-dialog__textarea::placeholder { color: #a8abb2; }

/* Dialog body scroll */
:deep(.el-dialog__body) {
  max-height: 65vh;
  overflow-y: auto;
  padding: 16px 20px;
}

/* Author row in results */
.rb-dialog__author {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}
.rb-dialog__text-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #0156ce;
  cursor: pointer;
  padding: 0;
}
.rb-dialog__text-btn:hover { text-decoration: underline; }
</style>

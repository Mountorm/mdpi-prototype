<template>
  <div class="dm-layout">

    <!-- 左侧：分类列表 -->
    <div class="panel dm-sidebar">
      <div class="panel-header">
        <span class="panel-title">Categories</span>
        <el-button size="small" @click="openCategoryDialog(null)">New</el-button>
      </div>
      <div class="dm-cat-list">
        <div
          :class="['dm-cat-item', { 'dm-cat-item--active': selectedCategory === null }]"
          @click="selectedCategory = null"
        >
          <span class="dm-cat-item__name"><span class="dm-cat-item__name-text">All</span></span>
          <span class="dm-cat-item__count">{{ keywords.length }}</span>
        </div>
        <div
          v-for="cat in categories" :key="cat.id"
          :class="['dm-cat-item', { 'dm-cat-item--active': selectedCategory === cat.id }]"
          @click="selectedCategory = cat.id"
        >
          <span class="dm-cat-item__name">
            <span class="dm-cat-item__name-text">{{ cat.display_name }}<button class="dm-icon-btn dm-icon-btn--inline" @click.stop="openCategoryDialog(cat)" title="Edit"><span class="material-symbols-outlined" style="font-size:13px;">edit</span></button></span>
          </span>
          <span class="dm-cat-item__count">{{ getCountByCategory(cat.id) }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧：关键词管理 -->
    <div class="dm-main">
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Keywords</span>
          <div class="dm-header-actions">
            <el-button size="small" @click="openImportDialog">
              <span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;margin-right:2px;">upload</span>
              Import
            </el-button>
            <input ref="importInputRef" type="file" accept=".csv,.xlsx,.xls" style="display:none" @change="handleImportFile" />
            <el-button size="small" type="primary" @click="openKeywordDialog()">Add Keyword</el-button>
          </div>
        </div>
        <div class="panel-body">

          <!-- 筛选栏 -->
          <div class="dm-filter-bar">
            <el-input v-model="searchQuery" placeholder="Search keywords..." size="small" clearable style="width:220px" />
            <el-select v-model="filterStatus" placeholder="Status" size="small" clearable style="width:110px">
              <el-option label="Active" value="active" />
              <el-option label="Inactive" value="inactive" />
            </el-select>
            <template v-if="!bulkMode">
              <button class="dm-bulk-toggle-btn" @click="enterBulkMode">
                <span class="material-symbols-outlined" style="font-size:14px;">checklist</span>
                Bulk Edit
              </button>
            </template>
            <template v-else>
              <span class="dm-bulk-hint">{{ selectedIds.size }} selected</span>
              <el-select v-model="bulkStatus" placeholder="Set status" size="small" style="width:120px" :disabled="selectedIds.size === 0" @change="handleBulkStatus">
                <el-option label="Set Active" value="active" />
                <el-option label="Set Inactive" value="inactive" />
              </el-select>
              <el-button size="small" type="danger" plain :disabled="selectedIds.size === 0" @click="confirmBulkDelete">Delete</el-button>
              <el-button size="small" @click="exitBulkMode">Exit</el-button>
            </template>
            <span class="dm-filter-total">{{ filteredKeywords.length }} keywords</span>
          </div>

          <!-- 表格 -->
          <div class="table-shell">
            <div class="overflow-x-auto">
              <table class="w-full table-striped table-compact">
                <thead class="bg-gray-50 border-b border-border-color">
                  <tr>
                    <th v-if="bulkMode" class="py-2 px-3" style="width:32px">
                      <input type="checkbox" :checked="isAllSelected" :indeterminate="isIndeterminate" @change="toggleSelectAll" style="cursor:pointer" />
                    </th>
                    <th class="py-2 px-3 text-left text-xs font-semibold text-foreground">Keyword</th>
                    <th class="py-2 px-3 text-left text-xs font-semibold text-foreground" style="width:220px;white-space:nowrap;">Category</th>
                    <th class="py-2 px-3 text-left text-xs font-semibold text-foreground" style="width:80px">Status</th>
                    <th class="py-2 px-3" style="width:48px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="kw in tableData" :key="kw.id"
                    class="border-b border-border-color hover:bg-gray-50"
                    :class="{ 'dm-row--selected': selectedIds.has(kw.id) }"
                  >
                    <td v-if="bulkMode" class="py-2 px-3">
                      <input type="checkbox" :checked="selectedIds.has(kw.id)" @change="toggleSelect(kw.id)" style="cursor:pointer" />
                    </td>
                    <td class="py-2 px-3 text-xs text-foreground">
                      <span :class="{ 'line-through text-secondary': !kw.is_active }">{{ kw.keyword }}</span>
                    </td>
                    <td class="py-2 px-3 text-xs text-secondary" style="white-space:nowrap;">
                      {{ getCategoryName(kw.category_id) }}
                    </td>
                    <td class="py-2 px-3">
                      <el-switch v-model="kw.is_active" size="small" />
                    </td>
                    <td class="py-2 px-3">
                      <button class="dm-icon-btn dm-icon-btn--danger" @click="confirmDeleteKeyword(kw)" title="Delete">
                        <span class="material-symbols-outlined" style="font-size:14px;">delete</span>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="tableData.length === 0">
                    <td :colspan="bulkMode ? 5 : 4" class="py-8 text-center text-xs text-secondary">No keywords found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="data-table-pagination" v-if="filteredKeywords.length > pageSize">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="pageSizes"
              :total="filteredKeywords.length"
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Category Dialog -->
  <el-dialog v-model="categoryDialogVisible" :title="editingCategory ? 'Edit Category' : 'New Category'" width="500px" :close-on-click-modal="false">
    <el-form :model="catForm" label-position="top" size="small">
      <el-form-item label="Name" required>
        <el-input v-model="catForm.display_name" placeholder="e.g. AI Generated Phrases" />
      </el-form-item>
      <!-- <el-form-item v-if="editingCategory">
        <template #label>
          <span>ID</span><span class="dm-label-hint">System-generated, cannot be changed</span>
        </template>
        <el-input v-model="catForm.id" disabled />
      </el-form-item> -->
      <el-form-item required>
        <template #label>
          <span>Match Type</span><span class="dm-label-hint">How keywords are matched against text</span>
        </template>
        <el-select v-model="catForm.match_type" class="w-full">
          <el-option value="contains">
            <div class="dm-opt"><span class="dm-opt__name">Contains</span><span class="dm-opt__desc">Keyword appears anywhere in the text</span></div>
          </el-option>
          <el-option value="exact">
            <div class="dm-opt"><span class="dm-opt__name">Exact</span><span class="dm-opt__desc">Full keyword match, word boundary aware, case-insensitive</span></div>
          </el-option>
        </el-select>
        <div class="dm-match-preview" v-if="catForm.match_type">{{ matchTypeDescriptions[catForm.match_type] }}</div>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span>Min Occurrences</span><span class="dm-label-hint">Trigger only when keyword appears ≥ this many times</span>
        </template>
        <el-input-number v-model="catForm.min_occurrences" :min="1" :max="100" size="small" style="width:120px" />
      </el-form-item>
      <el-form-item label="Scope" required>
        <el-cascader v-model="catForm.scope" :options="scopeOptions" :props="{ multiple: true, checkStrictly: false, emitPath: false }" placeholder="Select detection scope" class="w-full" collapse-tags collapse-tags-tooltip />
        <div class="dm-form-hint">Select which parts of the submission to scan</div>
      </el-form-item>
      <el-form-item label="Description">
        <el-input v-model="catForm.description" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button size="small" @click="categoryDialogVisible = false">Cancel</el-button>
      <el-button type="primary" size="small" @click="handleSaveCategory">{{ editingCategory ? 'Save' : 'Create' }}</el-button>
    </template>
  </el-dialog>

  <!-- Keyword Dialog -->
  <el-dialog v-model="keywordDialogVisible" title="Add Keyword" width="380px" :close-on-click-modal="false">
    <el-form :model="kwForm" label-position="top" size="small">
      <el-form-item label="Keyword" required>
        <el-input v-model="kwForm.keyword" placeholder="Enter keyword or phrase" />
      </el-form-item>
      <el-form-item label="Category" required>
        <el-select v-model="kwForm.category_id" class="w-full">
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.display_name" :value="cat.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button size="small" @click="keywordDialogVisible = false">Cancel</el-button>
      <el-button type="primary" size="small" @click="handleSaveKeyword">Add</el-button>
    </template>
  </el-dialog>

  <!-- Import Dialog (step 1: instructions + upload / step 2: preview) -->
  <el-dialog
    v-model="importDialogVisible"
    :title="importStep === 1 ? 'Import Keywords' : 'Import Keywords — Review'"
    width="580px"
    :close-on-click-modal="false"
    @closed="resetImport"
  >
    <!-- Step 1: instructions + template + upload -->
    <template v-if="importStep === 1">
      <div class="import-step1">
        <p class="text-xs text-secondary" style="margin-bottom:14px;">
          Prepare your file using the template below. Each row should contain a keyword and its category.
          Supported formats: <strong>.csv</strong>, <strong>.xlsx</strong>
        </p>

        <!-- Template preview
        <div class="table-shell" style="margin-bottom:12px;">
          <table class="w-full table-compact">
            <thead class="bg-gray-50 border-b border-border-color">
              <tr>
                <th class="py-2 px-3 text-left text-xs font-semibold text-foreground">keyword</th>
                <th class="py-2 px-3 text-left text-xs font-semibold text-foreground">category</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in templateSample" :key="row.keyword" class="border-b border-border-color">
                <td class="py-1 px-3 text-xs text-foreground">{{ row.keyword }}</td>
                <td class="py-1 px-3 text-xs text-secondary">{{ row.category }}</td>
              </tr>
            </tbody>
          </table>
        </div> -->

        <div style="margin-bottom:16px;">
          <el-button size="small" @click="downloadTemplate">
            <span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;margin-right:2px;">download</span>
            Download CSV Template
          </el-button>
        </div>

        <!-- Upload area -->
        <div
          class="import-dropzone"
          :class="{ 'import-dropzone--error': importFileError }"
          @click="importInputRef?.click()"
          @dragover.prevent
          @drop.prevent="handleDropFile"
        >
          <span class="material-symbols-outlined" style="font-size:32px;color:#94a3b8;margin-bottom:8px;">upload_file</span>
          <p class="text-xs" style="color:#374151;margin-bottom:4px;">Click to select or drag &amp; drop your file here</p>
          <p class="text-xs text-secondary">Accepted: .csv, .xlsx, .xls</p>
        </div>

        <!-- Error message -->
        <div v-if="importFileError" class="import-error-msg">
          <span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;margin-right:4px;">error</span>
          {{ importFileError }}
        </div>
      </div>
    </template>

    <!-- Step 2: preview table -->
    <template v-else>
      <p class="text-xs text-secondary" style="margin-bottom:12px;">
        Found <strong>{{ importPreview.length }}</strong> keyword(s) in <strong>{{ importFileName }}</strong>.
        Review the list below, then click Import to save.
      </p>
      <div class="table-shell" style="max-height:320px;overflow-y:auto;">
        <table class="w-full table-compact">
          <thead class="bg-gray-50 border-b border-border-color" style="position:sticky;top:0;z-index:1;">
            <tr>
              <th class="py-2 px-3 text-left text-xs font-semibold text-foreground" style="width:36px;">#</th>
              <th class="py-2 px-3 text-left text-xs font-semibold text-foreground">Keyword</th>
              <th class="py-2 px-3 text-left text-xs font-semibold text-foreground" style="width:260px;">Category</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in importPreview" :key="i" class="border-b border-border-color hover:bg-gray-50">
              <td class="py-1 px-3 text-xs text-secondary">{{ i + 1 }}</td>
              <td class="py-1 px-3 text-xs text-foreground">{{ row.keyword }}</td>
              <td class="py-1 px-3 text-xs">
                <span v-if="row.category" class="py-1  text-xs text-foreground" style="font-size:11px;">{{ row.category }}</span>
                <el-select v-else v-model="row.category_id" placeholder="Assign category" size="small" style="width:260px">
                  <el-option v-for="cat in categories" :key="cat.id" :label="cat.display_name" :value="cat.id" />
                </el-select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template #footer>
      <template v-if="importStep === 1">
        <el-button size="small" @click="importDialogVisible = false">Cancel</el-button>
      </template>
      <template v-else>
        <el-button size="small" @click="importStep = 1">Back</el-button>
        <el-button size="small" @click="importDialogVisible = false">Discard</el-button>
        <el-button type="primary" size="small" :disabled="importPreview.length === 0" @click="handleConfirmImport">
          Import {{ importPreview.length }} Keywords
        </el-button>
      </template>
    </template>
  </el-dialog>

  <!-- Delete single confirm -->
  <el-dialog v-model="deleteConfirmVisible" title="Delete Keyword" width="380px" :close-on-click-modal="false">
    <p class="text-sm" style="color:#374151;">Are you sure you want to delete <strong>{{ deletingKeyword?.keyword }}</strong>? This cannot be undone.</p>
    <template #footer>
      <el-button size="small" @click="deleteConfirmVisible = false">Cancel</el-button>
      <el-button type="danger" size="small" @click="handleDeleteKeyword">Delete</el-button>
    </template>
  </el-dialog>

  <!-- Bulk delete confirm -->
  <el-dialog v-model="bulkDeleteConfirmVisible" title="Delete Keywords" width="380px" :close-on-click-modal="false">
    <p class="text-sm" style="color:#374151;">Are you sure you want to delete <strong>{{ selectedIds.size }}</strong> keyword(s)? This cannot be undone.</p>
    <template #footer>
      <el-button size="small" @click="bulkDeleteConfirmVisible = false">Cancel</el-button>
      <el-button type="danger" size="small" @click="handleBulkDelete">Delete</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { mockCategories, mockKeywords, NEXT_ID_START } from '../mock/keywords.js'
import './DetectionManagement.css'

const scopeOptions = [
  { value: 'manuscript', label: 'Manuscript', children: [
    { value: 'manuscript.title',    label: 'Title' },
    { value: 'manuscript.abstract', label: 'Abstract' },
    { value: 'manuscript.keywords', label: 'Keywords' },
    { value: 'manuscript.body',     label: 'Body' },
    { value: 'manuscript.funds',    label: 'Funds' },
    { value: 'manuscript.conflict', label: 'Potential Conflict' },
  ]},
  { value: 'author', label: 'Author', children: [
    { value: 'author.affiliation', label: 'Affiliation' },
  ]},
  { value: 'review_report', label: 'Review Report', children: [
    { value: 'review_report.comments_to_authors', label: 'Comments to Authors' },
    { value: 'review_report.major_comment',       label: 'Major Comment' },
    { value: 'review_report.detail_comment',      label: 'Detail Comment' },
    { value: 'review_report.language_comment',    label: 'Language Comment' },
  ]},
]

const matchTypeDescriptions = {
  contains: 'Keyword appears anywhere in the text',
  exact:    'Full keyword match, word boundary aware, case-insensitive',
}

// ── Data (deep-cloned from mock so edits don't mutate the source) ──
const categories = ref(mockCategories.map(c => ({ ...c, scope: [...c.scope] })))
const keywords   = ref(mockKeywords.map(k => ({ ...k })))
let nextId = NEXT_ID_START

// ── State ──
const selectedCategory = ref(null)
const searchQuery  = ref('')
const filterStatus = ref('')
const currentPage  = ref(1)
const pageSize     = ref(20)
const pageSizes    = [20, 50, 100]

// 切换分类/筛选条件时重置到第一页
watch([selectedCategory, searchQuery, filterStatus], () => { currentPage.value = 1 })

// ── Bulk mode ──
const bulkMode    = ref(false)
const selectedIds = ref(new Set())
const bulkStatus  = ref('')

function enterBulkMode() { bulkMode.value = true }
function exitBulkMode()  { bulkMode.value = false; selectedIds.value = new Set() }

// ── Filtered / paged ──
const filteredKeywords = computed(() => {
  let list = keywords.value
  if (selectedCategory.value) list = list.filter(k => k.category_id === selectedCategory.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(k => k.keyword.toLowerCase().includes(q))
  }
  if (filterStatus.value === 'active')   list = list.filter(k => k.is_active)
  if (filterStatus.value === 'inactive') list = list.filter(k => !k.is_active)
  return list
})

const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredKeywords.value.slice(start, start + pageSize.value)
})

const isAllSelected  = computed(() => tableData.value.length > 0 && tableData.value.every(kw => selectedIds.value.has(kw.id)))
const isIndeterminate = computed(() => tableData.value.some(kw => selectedIds.value.has(kw.id)) && !isAllSelected.value)

function toggleSelectAll(e) {
  const next = new Set(selectedIds.value)
  tableData.value.forEach(kw => e.target.checked ? next.add(kw.id) : next.delete(kw.id))
  selectedIds.value = next
}
function toggleSelect(id) {
  const next = new Set(selectedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selectedIds.value = next
}

// ── Bulk ops ──
const bulkDeleteConfirmVisible = ref(false)

function handleBulkStatus(val) {
  keywords.value.forEach(kw => { if (selectedIds.value.has(kw.id)) kw.is_active = val === 'active' })
  bulkStatus.value = ''
  selectedIds.value = new Set()
}
function confirmBulkDelete() { bulkDeleteConfirmVisible.value = true }
function handleBulkDelete() {
  keywords.value = keywords.value.filter(kw => !selectedIds.value.has(kw.id))
  bulkDeleteConfirmVisible.value = false
  selectedIds.value = new Set()
}

// ── Helpers ──
function getCountByCategory(id) { return keywords.value.filter(k => k.category_id === id).length }
function getCategoryName(id)    { return categories.value.find(c => c.id === id)?.display_name || id }

// ── Import ──
const importInputRef      = ref(null)
const importDialogVisible = ref(false)
const importStep          = ref(1)   // 1 = instructions, 2 = preview
const importPreview       = ref([])
const importFileName      = ref('')
const importFileError     = ref('')

const templateSample = [
  { keyword: 'pharmaceutical sponsor', category: 'Potential Commercial Interests' },
  { keyword: 'delve into',             category: 'AI Generated Phrases' },
  { keyword: 'paper mill',             category: 'Controversial Topics' },
  { keyword: 'hidden text',            category: 'Harmful Topics' },
  { keyword: 'insert title here',      category: 'Template Phrase' },
]

function openImportDialog() {
  importStep.value = 1
  importDialogVisible.value = true
}

function resetImport() {
  importStep.value = 1
  importPreview.value = []
  importFileName.value = ''
  importFileError.value = ''
}

function downloadTemplate() {
  const header = 'keyword,category'
  const rows = templateSample.map(r => `${r.keyword},${r.category}`)
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'keywords-template.csv'; a.click()
  URL.revokeObjectURL(url)
}

function handleDropFile(e) {
  const file = e.dataTransfer?.files?.[0]
  if (file) processImportFile(file)
}

function handleImportFile(e) {
  const file = e.target.files?.[0]
  if (file) processImportFile(file)
  e.target.value = ''
}

function processImportFile(file) {
  importFileError.value = ''
  const allowed = /\.(csv|xlsx|xls)$/i
  if (!allowed.test(file.name)) {
    importFileError.value = `"${file.name}" is not a supported file type. Please upload a .csv or .xlsx file.`
    return
  }

  importFileName.value = file.name

  // Demo: xlsx/xls → mock parsed rows
  if (/\.(xlsx|xls)$/i.test(file.name)) {
    importPreview.value = [
      { keyword: 'pharmaceutical sponsor', category: 'Potential Commercial Interests', category_id: '1' },
      { keyword: 'delve into',             category: 'AI Generated Phrases',           category_id: '6' },
      { keyword: 'paper mill',             category: 'Controversial Topics',           category_id: '2' },
      { keyword: 'hidden text',            category: 'Harmful Topics',                 category_id: '3' },
      { keyword: 'insert title here',      category: 'Template Phrase',                category_id: '4' },
    ]
    importStep.value = 2
    return
  }

  // CSV → real parse
  const reader = new FileReader()
  reader.onload = (ev) => {
    const lines = (ev.target.result || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    const firstLine = lines[0]?.toLowerCase() || ''
    const hasHeader = firstLine.includes('keyword') && firstLine.includes('category')
    const dataLines = hasHeader ? lines.slice(1) : lines

    importPreview.value = dataLines.map(line => {
      const parts = line.split(',')
      const keyword = parts[0]?.trim() || ''
      const categoryName = parts[1]?.trim() || ''
      const matchedCat = categories.value.find(c =>
        c.display_name.toLowerCase() === categoryName.toLowerCase()
      )
      return {
        keyword,
        category: matchedCat?.display_name || categoryName || '',
        category_id: matchedCat?.id || '',
      }
    }).filter(r => r.keyword)

    importStep.value = 2
  }
  reader.readAsText(file)
}

function handleConfirmImport() {
  importPreview.value.forEach(row => {
    const catId = row.category_id
    if (!catId || !row.keyword) return
    if (!keywords.value.find(k => k.keyword.toLowerCase() === row.keyword.toLowerCase() && k.category_id === catId)) {
      keywords.value.push({ id: nextId++, keyword: row.keyword, category_id: catId, is_active: true })
    }
  })
  importDialogVisible.value = false
}

// ── Category dialog ──
const categoryDialogVisible = ref(false)
const editingCategory = ref(null)
const catForm = reactive({ id: '', display_name: '', match_type: 'contains', min_occurrences: 1, scope: [], description: '' })

function openCategoryDialog(cat) {
  editingCategory.value = cat
  Object.assign(catForm, cat
    ? { ...cat, scope: [...(cat.scope || [])] }
    : { id: '', display_name: '', match_type: 'contains', min_occurrences: 1, scope: [], description: '' }
  )
  categoryDialogVisible.value = true
}

function handleSaveCategory() {
  if (!catForm.display_name.trim()) return
  if (editingCategory.value) {
    const idx = categories.value.findIndex(c => c.id === editingCategory.value.id)
    if (idx !== -1) categories.value[idx] = { ...catForm, scope: [...catForm.scope] }
  } else {
    const autoId = catForm.display_name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const newId  = categories.value.find(c => c.id === autoId) ? `${autoId}_${Date.now()}` : autoId
    categories.value.push({ ...catForm, id: newId, scope: [...catForm.scope] })
  }
  categoryDialogVisible.value = false
}

// ── Keyword dialog ──
const keywordDialogVisible = ref(false)
const kwForm = reactive({ keyword: '', category_id: '' })

function openKeywordDialog() {
  Object.assign(kwForm, { keyword: '', category_id: selectedCategory.value || '' })
  keywordDialogVisible.value = true
}
function handleSaveKeyword() {
  if (!kwForm.keyword.trim() || !kwForm.category_id) return
  keywords.value.push({ id: nextId++, keyword: kwForm.keyword.trim(), category_id: kwForm.category_id, is_active: true })
  keywordDialogVisible.value = false
}

// ── Delete single ──
const deleteConfirmVisible = ref(false)
const deletingKeyword = ref(null)

function confirmDeleteKeyword(kw) { deletingKeyword.value = kw; deleteConfirmVisible.value = true }
function handleDeleteKeyword() {
  keywords.value = keywords.value.filter(k => k.id !== deletingKeyword.value.id)
  deleteConfirmVisible.value = false
  deletingKeyword.value = null
}
</script>

<style scoped>
:deep(.el-cascader) { width: 100%; }

.import-dropzone {
  border: 2px dashed var(--color-border);
  border-radius: 6px;
  padding: 28px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.import-dropzone:hover {
  border-color: #0156ce;
  background: #eef4ff;
}
.import-dropzone--error {
  border-color: #dc2626;
  background: #fff5f5;
}
.import-error-msg {
  margin-top: 10px;
  font-size: 12px;
  color: #dc2626;
  display: flex;
  align-items: center;
}
</style>

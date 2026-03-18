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
          <div class="dm-cat-item__main">
            <span class="dm-cat-item__name">All</span>
            <span class="dm-cat-item__count">{{ keywords.length }}</span>
          </div>
        </div>
        <div
          v-for="cat in categories"
          :key="cat.id"
          :class="['dm-cat-item', { 'dm-cat-item--active': selectedCategory === cat.id }]"
          @click="selectedCategory = cat.id"
        >
          <div class="dm-cat-item__main">
            <span class="dm-cat-item__name">{{ cat.display_name }}</span>
            <div class="dm-cat-item__side">
              <span class="dm-cat-item__count">{{ getCountByCategory(cat.id) }}</span>
              <button class="dm-icon-btn" @click.stop="openCategoryDialog(cat)" title="Edit">
                <PencilLine class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：关键词管理 -->
    <div class="dm-main">
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Keywords</span>
          <el-button size="small" type="primary" class="dm-btn-primary" @click="openKeywordDialog()">
            Add Keyword
          </el-button>
        </div>
        <div class="panel-body">

          <!-- 筛选栏 -->
          <div class="dm-filter-bar">
            <el-input v-model="searchQuery" placeholder="Search keywords..." size="small" clearable style="width:240px" />
            <el-select v-model="filterStatus" placeholder="Status" size="small" clearable style="width:120px">
              <el-option label="Active" value="active" />
              <el-option label="Inactive" value="inactive" />
            </el-select>
            <span class="dm-filter-total">{{ filteredKeywords.length }} keywords</span>
          </div>

          <!-- 表格 -->
          <div class="table-shell">
            <div class="overflow-x-auto">
              <table class="w-full table-striped table-compact">
                <thead class="bg-gray-50 border-b border-border-color">
                  <tr>
                    <th class="py-2 px-3 text-left text-xs font-semibold text-foreground">Keyword</th>
                    <th v-if="!selectedCategory" class="py-2 px-3 text-left text-xs font-semibold text-foreground" style="width:180px">Category</th>
                    <th class="py-2 px-3 text-left text-xs font-semibold text-foreground" style="width:80px">Status</th>
                    <th class="py-2 px-3 text-left text-xs font-semibold text-foreground" style="width:60px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="kw in tableData" :key="kw.id" class="border-b border-border-color hover:bg-gray-50">
                    <td class="py-2 px-3 text-xs text-foreground">
                      <span :class="{ 'line-through text-secondary': !kw.is_active }">{{ kw.keyword }}</span>
                    </td>
                    <td v-if="!selectedCategory" class="py-2 px-3 text-xs text-secondary">
                      {{ getCategoryName(kw.category_id) }}
                    </td>
                    <td class="py-2 px-3">
                      <el-switch v-model="kw.is_active" size="small" />
                    </td>
                    <td class="py-2 px-3">
                      <button class="dm-icon-btn dm-icon-btn--danger" @click="handleDeleteKeyword(kw)" title="Delete">
                        <Trash2 class="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="tableData.length === 0">
                    <td :colspan="selectedCategory ? 3 : 4" class="py-8 text-center text-xs text-secondary">No keywords found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="data-table-pagination" v-if="filteredKeywords.length > pageSize">
            <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="filteredKeywords.length" layout="total, prev, pager, next" />
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
      <el-form-item required>
        <template #label>
          <span>ID</span>
          <span class="dm-label-hint">Unique identifier, cannot be changed after creation</span>
        </template>
        <el-input v-model="catForm.id" placeholder="e.g. ai_generated" :disabled="!!editingCategory" />
      </el-form-item>
      <el-form-item required>
        <template #label>
          <span>Match Type</span>
          <span class="dm-label-hint">How keywords are matched against text</span>
        </template>
        <el-select v-model="catForm.match_type" class="w-full">
          <el-option value="contains">
            <div class="dm-opt">
              <span class="dm-opt__name">Contains</span>
              <span class="dm-opt__desc">Keyword appears anywhere in the text</span>
            </div>
          </el-option>
          <el-option value="exact">
            <div class="dm-opt">
              <span class="dm-opt__name">Exact</span>
              <span class="dm-opt__desc">The full keyword must match precisely, word boundary aware, case-insensitive</span>
            </div>
          </el-option>
        </el-select>
        <div class="dm-match-preview" v-if="catForm.match_type">
          <span class="dm-match-preview__label">{{ matchTypeDescriptions[catForm.match_type] }}</span>
        </div>
      </el-form-item>
      <el-form-item>
        <template #label>
          <span>Min Occurrences</span>
          <span class="dm-label-hint">Trigger only when keyword appears ≥ this many times</span>
        </template>
        <el-input-number v-model="catForm.min_occurrences" :min="1" :max="100" size="small" style="width:120px" />
      </el-form-item>
      <el-form-item label="Scope" required>
        <el-cascader
          v-model="catForm.scope"
          :options="scopeOptions"
          :props="{ multiple: true, checkStrictly: false, emitPath: false }"
          placeholder="Select detection scope"
          class="w-full"
          collapse-tags
          collapse-tags-tooltip
        />
        <div class="dm-form-hint">Select which parts of the submission to scan</div>
      </el-form-item>
      <el-form-item label="Description">
        <el-input v-model="catForm.description" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button size="small" @click="categoryDialogVisible = false">Cancel</el-button>
      <el-button type="primary" size="small" class="dm-btn-primary" @click="handleSaveCategory">
        {{ editingCategory ? 'Save' : 'Create' }}
      </el-button>
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
      <el-button type="primary" size="small" class="dm-btn-primary" @click="handleSaveKeyword">Add</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { PencilLine, Trash2 } from 'lucide-vue-next'

// ── Scope tree ──
const scopeOptions = [
  {
    value: 'manuscript',
    label: 'Manuscript',
    children: [
      { value: 'manuscript.title',     label: 'Title' },
      { value: 'manuscript.abstract',  label: 'Abstract' },
      { value: 'manuscript.keywords',  label: 'Keywords' },
      { value: 'manuscript.body',      label: 'Body' },
      { value: 'manuscript.funds',     label: 'Funds' },
      { value: 'manuscript.conflict',  label: 'Potential Conflict' },
    ]
  },
  {
    value: 'author',
    label: 'Author',
    children: [
      { value: 'author.affiliation', label: 'Affiliation' },
    ]
  },
  {
    value: 'review_report',
    label: 'Review Report',
    children: [
      { value: 'review_report.comments_to_authors', label: 'Comments to Authors' },
      { value: 'review_report.major_comment',       label: 'Major Comment' },
      { value: 'review_report.detail_comment',      label: 'Detail Comment' },
      { value: 'review_report.language_comment',    label: 'Language Comment' },
    ]
  },
]

const matchTypeDescriptions = {
  contains: 'Keyword appears anywhere in the text',
  exact:    'The full keyword must match precisely, word boundary aware, case-insensitive',
}

// ── Data ──
const categories = ref([
  { id: '1', display_name: 'Potential Commercial Interests',  match_type: 'contains', min_occurrences: 1, scope: ['manuscript.body', 'manuscript.funds', 'manuscript.conflict'], description: '' },
  { id: '2',       display_name: 'Controversial Topics',         match_type: 'contains', min_occurrences: 1, scope: ['manuscript.body', 'manuscript.abstract'], description: '' },
  { id: '3',     display_name: 'Harmful Topics',        match_type: 'exact',    min_occurrences: 1, scope: ['manuscript.title', 'manuscript.abstract', 'manuscript.body'], description: '' },
  { id: '4',        display_name: 'Template Phrase',   match_type: 'contains', min_occurrences: 2, scope: ['manuscript.abstract', 'manuscript.body'], description: '' },
  { id: '5',     display_name: 'Tortured Phrase',        match_type: 'exact',    min_occurrences: 1, scope: ['manuscript.body'], description: '' },
  { id: '6',      display_name: 'AI Generated Phrases',         match_type: 'contains', min_occurrences: 1, scope: ['manuscript.body'], description: '' },
  { id: '7',   display_name: 'Publicly Available Data Set',      match_type: 'contains', min_occurrences: 1, scope: ['manuscript.body'], description: '' }
 ])

const keywords = ref([
  { id: 1,  keyword: 'pharmaceutical sponsor',                            category_id: '1', is_active: true  },
  { id: 2,  keyword: 'device manufacturer',                               category_id: '1', is_active: true  },
  { id: 3,  keyword: 'misinformation risk',                               category_id: '1',       is_active: true  },
  { id: 4,  keyword: 'insert title here',                                 category_id: '1',     is_active: true  },
  { id: 5,  keyword: 'add explanation',                                   category_id: '1',     is_active: true  },
  { id: 6,  keyword: 'as is widely acknowledged',                         category_id: '1',        is_active: true  },
  { id: 7,  keyword: 'in recent years there has been increasing interest', category_id: '1',       is_active: true  },
  { id: 8,  keyword: 'multi-sphere electron cloud',                       category_id: '1',     is_active: true  },
  { id: 9,  keyword: 'thermal motion aggregator',                         category_id: '1',     is_active: true  },
  { id: 10, keyword: 'incompetent analysis',                              category_id: '1',      is_active: true  },
  { id: 11, keyword: 'unprofessional conclusion',                         category_id: '1',      is_active: true  },
  { id: 12, keyword: 'APC',                                               category_id: '2',           is_active: true  },
  { id: 13, keyword: 'white-font string',                                 category_id: '3',           is_active: true  },
  { id: 14, keyword: 'Zenodo',                                            category_id: '4',      is_active: true  },
  { id: 15, keyword: 'figshare',                                          category_id: '5',      is_active: false },
])
let nextId = 16

// ── State ──
const selectedCategory = ref(null)
const currentCategory = computed(() => categories.value.find(c => c.id === selectedCategory.value) || null)
const searchQuery = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = 20

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
  const start = (currentPage.value - 1) * pageSize
  return filteredKeywords.value.slice(start, start + pageSize)
})

function getCountByCategory(id) { return keywords.value.filter(k => k.category_id === id).length }
function getCategoryName(id)    { return categories.value.find(c => c.id === id)?.display_name || id }

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
  if (!catForm.id.trim() || !catForm.display_name.trim()) return
  if (editingCategory.value) {
    const idx = categories.value.findIndex(c => c.id === editingCategory.value.id)
    if (idx !== -1) categories.value[idx] = { ...catForm, scope: [...catForm.scope] }
  } else {
    if (categories.value.find(c => c.id === catForm.id)) return
    categories.value.push({ ...catForm, scope: [...catForm.scope] })
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

function handleDeleteKeyword(kw) {
  keywords.value = keywords.value.filter(k => k.id !== kw.id)
}
</script>

<style scoped>
.dm-layout { display: flex; align-items: flex-start; gap: 0; }

.dm-sidebar { width: 220px; flex-shrink: 0; margin-right: 2px; }
.dm-cat-list { padding: 4px 0; }
.dm-cat-item { padding: 8px 16px; cursor: pointer; transition: background 0.15s; border-left: 3px solid transparent; }
.dm-cat-item:hover { background: #f8f9fd; }
.dm-cat-item--active { background: #eef4ff; border-left-color: #0156ce; }
.dm-cat-item__main { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; }
.dm-cat-item__name { font-size: 13px; color: #172b4d; font-weight: 500; flex: 1; min-width: 0; word-break: break-word; white-space: normal; line-height: 1.4; }
.dm-cat-item--active .dm-cat-item__name { color: #0156ce; }
.dm-cat-item__side { display: flex; flex-direction: column; align-items: center; gap: 2px; flex-shrink: 0; }
.dm-cat-item__count { font-size: 11px; color: #94a3b8; }

.dm-main { flex: 1; min-width: 0; }

.dm-filter-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.dm-filter-total { font-size: 12px; color: #94a3b8; margin-left: auto; }

.dm-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: none; background: none; border-radius: 4px; cursor: pointer; color: #94a3b8; transition: all 0.15s; padding: 0; }
.dm-icon-btn:hover { background: #f1f5f9; color: #475569; }
.dm-icon-btn--danger:hover { background: #fee2e2; color: #dc2626; }

.data-table-pagination { display: flex; justify-content: flex-end; padding-top: 12px; }

/* form */
.dm-label-hint { font-size: 11px; color: #94a3b8; margin-left: 6px; font-weight: 400; }
.dm-form-hint { font-size: 11px; color: #94a3b8; margin-top: 3px; }

/* match type option */
.dm-opt { display: flex; flex-direction: column; gap: 1px; padding: 2px 0; }
.dm-opt__name { font-size: 13px; color: #172b4d; font-weight: 500; }
.dm-opt__desc { font-size: 11px; color: #94a3b8; }

/* match type preview */
.dm-match-preview { margin-top: 5px; padding: 6px 10px; background: #f8fafc; border-radius: 4px; border-left: 3px solid #e2e8f0; }
.dm-match-preview__label { font-size: 12px; color: #475569; }

:deep(.el-cascader) { width: 100%; }
</style>

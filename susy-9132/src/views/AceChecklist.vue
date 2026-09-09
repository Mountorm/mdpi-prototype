<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MdIcon from '../components/MdIcon.vue'
import { checklistStore } from '../store/checklist.js'

/* ---------------- Data ---------------- */
// Reads/writes the shared store so changes apply to Generate & Report too.
const items = checklistStore.items
const categoriesState = checklistStore.categories

/* ---------------- Filters & pagination ---------------- */
const filters = reactive({ category: '', title: '' })
const pagination = reactive({ page: 1, pageSize: 20 })
const openFilter = ref('')

const filteredItems = computed(() =>
  items.filter((item) => {
    const matchesCategory = !filters.category || item.category === filters.category
    const matchesTitle = !filters.title || item.title.toLowerCase().includes(filters.title.toLowerCase())
    return matchesCategory && matchesTitle
  })
)

const pageCount = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pagination.pageSize)))

const visibleItems = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredItems.value.slice(start, start + pagination.pageSize)
})

const onPageChange = (p) => { pagination.page = p }
const onSizeChange = (s) => { pagination.pageSize = s; pagination.page = 1 }

/* ---------------- Filter panels ---------------- */
const toggleFilter = (name) => {
  openFilter.value = openFilter.value === name ? '' : name
}
const onFilterChange = () => { pagination.page = 1 }
const onDocClick = () => { openFilter.value = '' }
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

/* ---------------- Delete ---------------- */
const confirmDelete = (item) => {
  ElMessageBox.confirm(
    `Deleting this item will permanently remove it from the template. Delete "${item.title}"?`,
    'Delete Item',
    { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning' }
  )
    .then(() => {
      const idx = items.findIndex((i) => i.id === item.id)
      if (idx > -1) items.splice(idx, 1)
      ElMessage.success('Item deleted')
    })
    .catch(() => {})
}

/* ---------------- Edit dialog ---------------- */
// New items are added at code level (mock/ace.js), not from the UI.
const editModalOpen = ref(false)
const editingId = ref(null)
// whether the item being edited has a locked Required flag — those stay
// disabled so only unlocked items can be toggled (journal config).
const editingRequiredLocked = ref(false)

const emptyForm = () => ({
  category: '',
  title: '',
  description: '',
  required: true,
  flagRequired: true,
  flagMode: 'manual',
  rule: { type: 'numeric', subject: '', operator: '<', value: null, result: 'warning' },
})
const form = reactive(emptyForm())

const openEditModal = (item) => {
  editingId.value = item.id
  editingRequiredLocked.value = item.requiredLocked ?? false
  Object.assign(form, {
    category: item.category,
    title: item.title,
    description: item.description,
    required: item.required,
    flagRequired: item.flagRequired,
    flagMode: item.flagMode,
    rule: item.rule
      ? {
          type: item.rule.type,
          subject: item.rule.subject || '',
          operator: item.rule.operator || '<',
          value: item.rule.value ?? null,
          result: item.rule.result || 'warning',
        }
      : emptyForm().rule,
  })
  editModalOpen.value = true
}

const closeEditModal = () => { editModalOpen.value = false }

// New category created inline via el-select allow-create is added to the list
const onCategoryChange = (val) => {
  if (val && !categoriesState.includes(val)) categoriesState.push(val)
}

const submitItem = () => {
  const category = String(form.category || '').trim()
  const title = String(form.title || '').trim()
  const description = String(form.description || '').trim()
  if (!category) { ElMessage.warning('Please select or enter a category'); return }
  if (!title) { ElMessage.warning('Please enter a title'); return }
  if (!description) { ElMessage.warning('Please enter a description'); return }
  if (form.flagRequired && form.flagMode === 'auto') {
    if (form.rule.type === 'numeric') {
      if (!String(form.rule.subject || '').trim() || form.rule.value === null || form.rule.value === undefined) {
        ElMessage.warning('Please complete the numeric threshold rule (indicator and value)'); return
      }
    } else if (form.rule.type === 'boolean') {
      if (!String(form.rule.subject || '').trim()) {
        ElMessage.warning('Please enter a boolean subject'); return
      }
    }
  }

  const target = items.find((i) => i.id === editingId.value)
  const payload = {
    category,
    title,
    description,
    required: form.required,
    flagRequired: form.flagRequired,
    flagMode: form.flagMode,
    rule: form.flagRequired && form.flagMode === 'auto' ? { ...form.rule } : null,
    inUse: target ? target.inUse : false, // keep the existing status (In Use / Draft)
  }

  Object.assign(target, { ...payload, id: target.id })
  ElMessage.success('Item updated')
  closeEditModal()
}

/* ---------------- ESC / backdrop close ---------------- */
const onKeydown = (e) => {
  if (e.key === 'Escape') editModalOpen.value = false
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

const closeByBackdrop = (modal) => {
  if (modal === 'edit') editModalOpen.value = false
}

/* ---------------- Flag / rule display ---------------- */
const flagSummary = (item) => {
  if (!item.flagRequired) return { mode: 'none', label: 'Not required', ruleText: '' }
  if (item.flagMode === 'auto' && item.rule) {
    const r = item.rule
    let text = ''
    if (r.type === 'numeric') {
      text = `${r.subject} ${r.operator} ${r.value} → ${r.result}`
    } else if (r.type === 'boolean') {
      text = `${r.subject} → ${r.result}`
    }
    return { mode: 'auto', label: 'Auto', ruleText: text }
  }
  return { mode: 'manual', label: 'Manual', ruleText: 'passed / warning' }
}
</script>

<template>
  <div class="checklist-page ace-checklist-root">
    <!-- ========== Table ========== -->
    <div class="table-wrap">
      <table aria-label="Technical Precheck Report">
        <thead>
          <tr>
            <th>
              <span class="header-label">
                Category
                <button class="header-control" type="button" @click.stop="toggleFilter('category')">
                  <MdIcon name="filter_alt" :size="14" />
                </button>
              </span>
              <div class="filter-panel" :class="{ open: openFilter === 'category' }" @click.stop>
                <select v-model="filters.category" aria-label="Filter by category" @change="onFilterChange">
                  <option value="">All categories</option>
                  <option v-for="c in categoriesState" :key="c" :value="c">{{ c.replace('\n', ' ') }}</option>
                </select>
              </div>
            </th>
            <th>
              <span class="header-label">
                Title
                <button class="header-control" type="button" @click.stop="toggleFilter('title')">
                  <MdIcon name="search" :size="14" />
                </button>
              </span>
              <div class="filter-panel" :class="{ open: openFilter === 'title' }" @click.stop>
                <input v-model="filters.title" type="search" placeholder="Search title" @input="onFilterChange" />
              </div>
            </th>
            <th>Description</th>
            <th>Required</th>
            <th>Flag</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visibleItems" :key="item.id">
            <td class="category">{{ item.category }}</td>
            <td class="title">{{ item.title }}</td>
            <td class="description"><span class="desc-text">{{ item.description }}</span></td>
            <td>
              <span class="req-tag" :class="item.required ? 'required' : 'optional'">
                {{ item.required ? 'Required' : 'Optional' }}
              </span>
            </td>
            <td>
              <span class="flag-cell">
                <span class="flag-mode">
                  <span class="flag-tag" :class="flagSummary(item).mode">{{ flagSummary(item).label }}</span>
                </span>
              </span>
            </td>
            <td class="action-cell">
              <button class="action" type="button" :aria-label="'Edit ' + item.title" @click="openEditModal(item)">
                <MdIcon name="edit" :size="17" />
              </button>
              <button class="action delete" type="button" :aria-label="'Delete ' + item.title" @click="confirmDelete(item)">
                <MdIcon name="delete" :size="17" />
              </button>
            </td>
          </tr>
          <tr v-if="!visibleItems.length">
            <td class="empty" colspan="6">No matching checklist items</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ========== Pagination (Element Plus) ========== -->
    <div class="pagination" aria-label="Pagination">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredItems.length"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[20, 10, 5, 1]"
        @size-change="onSizeChange"
      />
    </div>

    <!-- ========== Add / Edit dialog ========== -->
    <div class="modal-backdrop" :class="{ open: editModalOpen }" @click.self="closeByBackdrop('edit')">
      <section class="modal add-modal" role="dialog" aria-modal="true">
        <header class="modal-header">
          <h2 class="modal-title" id="addModalTitle">Edit Item</h2>
          <button class="modal-close" type="button" aria-label="Close" @click="closeEditModal">
            <MdIcon name="close" :size="30" />
          </button>
        </header>
        <form @submit.prevent="submitItem">
          <div class="modal-content">
            <div class="form-field">
              <label for="newCategory">Category <span class="required">*</span></label>
              <el-select
                v-model="form.category"
                filterable
                allow-create
                default-first-option
                placeholder="Select a category"
                @change="onCategoryChange"
              >
                <el-option v-for="c in categoriesState" :key="c" :value="c" :label="c.replace('\n', ' ')"></el-option>
              </el-select>
            </div>
            <div class="form-field">
              <label for="newTitle">Title <span class="required">*</span></label>
              <input id="newTitle" v-model="form.title" type="text" placeholder="Please input..." />
            </div>
            <div class="form-field">
              <label for="newDescription">Description <span class="required">*</span></label>
              <textarea
                id="newDescription"
                v-model="form.description"
                placeholder="Please indicate the specific description for this item"
              ></textarea>
            </div>
            <div class="form-field">
              <label>Required</label>
              <el-switch
                v-model="form.required"
                :disabled="editingRequiredLocked"
                active-text="Required in report"
              />
            </div>
            <div class="form-field">
              <label>Flag</label>
              <el-switch v-model="form.flagRequired" active-text="Require marking (passed / warning)" />
            </div>
            <template v-if="form.flagRequired">
              <div class="form-field">
                <label>Determination</label>
                <el-radio-group v-model="form.flagMode">
                  <el-radio value="manual">Manual selection</el-radio>
                  <el-radio value="auto">Auto determination</el-radio>
                </el-radio-group>
              </div>
              <div v-if="form.flagMode === 'auto'" class="form-field">
                <label>Automation rule</label>
                <div v-if="form.rule.type === 'numeric'" class="rule-config">
                  <span class="rule-subject">{{ form.rule.subject || 'Indicator' }}</span>
                  <el-select v-model="form.rule.operator">
                    <el-option v-for="op in ['<', '>', '≤', '≥']" :key="op" :label="op" :value="op"></el-option>
                  </el-select>
                  <el-input-number v-model="form.rule.value" :min="0" :max="100" controls-position="right" />
                  <span class="rule-arrow">→</span>
                  <el-select v-model="form.rule.result">
                    <el-option label="passed" value="passed"></el-option>
                    <el-option label="warning" value="warning"></el-option>
                  </el-select>
                </div>
                <div v-else class="rule-config">
                  <span class="rule-subject">{{ form.rule.subject || 'Subject' }}</span>
                  <span class="rule-arrow">→</span>
                  <el-select v-model="form.rule.result">
                    <el-option label="passed" value="passed"></el-option>
                    <el-option label="warning" value="warning"></el-option>
                  </el-select>
                </div>
              </div>
            </template>
          </div>
          <footer class="modal-footer">
            <button class="modal-button" type="button" @click="closeEditModal">Cancel</button>
            <button class="modal-button primary" type="submit">Submit</button>
          </footer>
        </form>
      </section>
    </div>
  </div>
</template>

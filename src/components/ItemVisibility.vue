<template>
  <div class="iv-layout">

    <!-- Ethicality Card -->
    <div class="panel iv-card">
      <div class="panel-header">
        <span class="panel-title">Ethicality</span>
        <button v-if="!ethicEditing" class="iv-edit-btn" @click="startEdit">
          <PencilLine class="h-3.5 w-3.5" />
          Edit
        </button>
        <div v-else class="iv-action-group">
          <el-button size="small" @click="cancelEdit">Cancel</el-button>
          <el-button size="small" type="primary" class="dm-btn-primary" @click="saveEdit">Save</el-button>
        </div>
      </div>
      <div class="panel-body">
        <div class="iv-ethic-row">
          <div class="iv-ethic-label">
            <span class="iv-item-title">AI Writing Score Threshold</span>
            <span class="iv-item-desc">Set the score ranges for Low, Medium, and High AI writing detection levels (0–100)</span>
          </div>

          <!-- Display mode -->
          <div v-if="!ethicEditing" class="iv-range-display">
            <div class="iv-range-band iv-range-band--low">
              <span class="iv-band-label">Low</span>
              <span class="iv-band-range">0 – {{ draft.lowMax }}</span>
            </div>
            <div class="iv-range-band iv-range-band--medium">
              <span class="iv-band-label">Medium</span>
              <span class="iv-band-range">{{ draft.lowMax + 1 }} – {{ draft.medMax }}</span>
            </div>
            <div class="iv-range-band iv-range-band--high">
              <span class="iv-band-label">High</span>
              <span class="iv-band-range">{{ draft.medMax + 1 }} – 100</span>
            </div>
          </div>

          <!-- Edit mode -->
          <div v-else class="iv-range-editor">
            <div class="iv-threshold-inputs">
              <div class="iv-threshold-field">
                <label>Low (0 – ?)</label>
                <el-input-number
                  v-model="draft.lowMax"
                  :min="1" :max="draft.medMax - 1"
                  size="small" style="width:110px"
                />
              </div>
              <div class="iv-threshold-sep">–</div>
              <div class="iv-threshold-field">
                <label>Medium (? – ?)</label>
                <el-input-number
                  v-model="draft.medMax"
                  :min="draft.lowMax + 1" :max="99"
                  size="small" style="width:110px"
                />
              </div>
              <div class="iv-threshold-sep">–</div>
              <div class="iv-threshold-field iv-threshold-field--fixed">
                <label>High (? – 100)</label>
                <span class="iv-fixed-val">100</span>
              </div>
            </div>
            <div class="iv-threshold-hint">
              Low: 0–{{ draft.lowMax }} &nbsp;·&nbsp;
              Medium: {{ draft.lowMax + 1 }}–{{ draft.medMax }} &nbsp;·&nbsp;
              High: {{ draft.medMax + 1 }}–100
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Visibility Rules Card -->
    <div class="panel iv-card">
      <div class="panel-header">
        <span class="panel-title">Visibility Rules</span>
        <span class="iv-header-hint">Control which detection items are visible to external users</span>
      </div>
      <div class="panel-body">
        <div class="table-shell">
          <div class="overflow-x-auto">
            <table class="w-full table-striped table-compact">
              <thead class="bg-gray-50 border-b border-border-color">
                <tr>
                  <th class="py-2 px-3 text-left text-xs font-semibold text-foreground">Section</th>
                  <th class="py-2 px-3 text-left text-xs font-semibold text-foreground">Item</th>
                  <th class="py-2 px-3 text-left text-xs font-semibold text-foreground">Description</th>
                  <th class="py-2 px-3 text-left text-xs font-semibold text-foreground" style="width:130px">Internal Only</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableRows" :key="row.id" class="border-b border-border-color hover:bg-gray-50">
                  <td class="py-2 px-3 text-xs text-secondary">{{ row.sectionTitle }}</td>
                  <td class="py-2 px-3 text-xs font-medium text-foreground">{{ row.title }}</td>
                  <td class="py-2 px-3 text-xs text-secondary">{{ row.description || '—' }}</td>
                  <td class="py-2 px-3">
                    <el-switch v-model="row.internalOnly" size="small" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { PencilLine } from 'lucide-vue-next'
import { detectionConfig } from '../migrated-detection/detection-config.js'

// ── Ethicality threshold state ──
const thresholds = reactive({ lowMax: 30, medMax: 70 })
const draft = reactive({ lowMax: 30, medMax: 70 })
const ethicEditing = ref(false)

function startEdit() {
  draft.lowMax = thresholds.lowMax
  draft.medMax = thresholds.medMax
  ethicEditing.value = true
}

function cancelEdit() {
  ethicEditing.value = false
}

function saveEdit() {
  thresholds.lowMax = draft.lowMax
  thresholds.medMax = draft.medMax
  ethicEditing.value = false
}

// ── Visibility table rows ──
const tableRows = ref(
  detectionConfig.flatMap(section => {
    if (section.title === 'Ethicality') {
      return [{
        id: section.id,
        sectionTitle: section.title,
        title: 'Ethicality',
        description: section.description || '',
        internalOnly: false,
      }]
    }
    return section.items.map(item => ({
      id: item.id,
      sectionTitle: section.title,
      title: item.title,
      description: item.description || '',
      internalOnly: false,
    }))
  })
)
</script>

<style scoped>
.iv-layout { display: flex; flex-direction: column; gap: 16px; }
.iv-card { }
.iv-header-hint { font-size: 12px; color: #94a3b8; margin-left: 10px; font-weight: 400; }

/* Edit button */
.iv-edit-btn {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: #0156ce; background: none; border: 1px solid #0156ce;
  border-radius: 4px; padding: 3px 10px; cursor: pointer; transition: all 0.15s;
}
.iv-edit-btn:hover { background: #eef4ff; }
.iv-action-group { display: flex; gap: 6px; }

/* Ethicality row */
.iv-ethic-row { display: flex; align-items: flex-start; gap: 24px; flex-wrap: wrap; }
.iv-ethic-label { flex: 0 0 260px; }
.iv-item-title { display: block; font-size: 13px; font-weight: 500; color: #172b4d; margin-bottom: 4px; }
.iv-item-desc { display: block; font-size: 12px; color: #94a3b8; line-height: 1.5; }

/* Display mode bands */
.iv-range-display { display: flex; gap: 10px; flex: 1; align-items: center; flex-wrap: wrap; }
.iv-range-band {
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 20px; border-radius: 6px; min-width: 90px;
}
.iv-band-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
.iv-band-range { font-size: 13px; font-weight: 500; }
.iv-range-band--low    { background: #dcfce7; color: #166534; }
.iv-range-band--medium { background: #fef9c3; color: #854d0e; }
.iv-range-band--high   { background: #fee2e2; color: #991b1b; }

/* Edit mode */
.iv-range-editor { flex: 1; min-width: 280px; }
.iv-threshold-inputs { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.iv-threshold-field { display: flex; flex-direction: column; gap: 4px; }
.iv-threshold-field label { font-size: 11px; color: #64748b; }
.iv-threshold-field--fixed { }
.iv-fixed-val { display: inline-flex; align-items: center; height: 28px; font-size: 13px; color: #94a3b8; padding: 0 4px; }
.iv-threshold-sep { font-size: 14px; color: #94a3b8; padding-bottom: 4px; }
.iv-threshold-hint { margin-top: 8px; font-size: 11px; color: #94a3b8; }
</style>

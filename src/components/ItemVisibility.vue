<template>
  <div class="iv-layout">

    <!-- Ethicality Card -->
    <div class="panel iv-card">
      <div class="panel-header">
        <span class="panel-title">Ethicality</span>
        <button v-if="!ethicEditing" class="iv-edit-btn" @click="startEthicEdit">
          <PencilLine class="h-3.5 w-3.5" />
          Edit
        </button>
        <div v-else class="iv-action-group">
          <el-button size="small" @click="cancelEthicEdit">Cancel</el-button>
          <el-button size="small" type="primary" class="dm-btn-primary" @click="saveEthicEdit">Save</el-button>
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
              <span class="iv-band-range">0 – {{ ethicDraft.lowMax }}</span>
            </div>
            <div class="iv-range-band iv-range-band--medium">
              <span class="iv-band-label">Medium</span>
              <span class="iv-band-range">{{ ethicDraft.lowMax + 1 }} – {{ ethicDraft.medMax }}</span>
            </div>
            <div class="iv-range-band iv-range-band--high">
              <span class="iv-band-label">High</span>
              <span class="iv-band-range">{{ ethicDraft.medMax + 1 }} – 100</span>
            </div>
          </div>

          <!-- Edit mode -->
          <div v-else class="iv-range-editor">
            <div class="iv-threshold-inputs">
              <div class="iv-threshold-field">
                <label>Low (0 – ?)</label>
                <el-input-number
                  v-model="ethicDraft.lowMax"
                  :min="1" :max="ethicDraft.medMax - 1"
                  size="small" style="width:110px"
                />
              </div>
              <div class="iv-threshold-sep">–</div>
              <div class="iv-threshold-field">
                <label>Medium (? – ?)</label>
                <el-input-number
                  v-model="ethicDraft.medMax"
                  :min="ethicDraft.lowMax + 1" :max="99"
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
              Low: 0–{{ ethicDraft.lowMax }} &nbsp;·&nbsp;
              Medium: {{ ethicDraft.lowMax + 1 }}–{{ ethicDraft.medMax }} &nbsp;·&nbsp;
              High: {{ ethicDraft.medMax + 1 }}–100
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detection Assistant form row -->
    <div class="form_row">
      <div class="form_row_label">
        <span class="material-symbols-outlined form_row_icon">window</span>
        <span>Detection Assistant</span>
      </div>
      <div class="form_row_value">
        <div class="form_row_value_show">
          <span class="form_row_value_show_span">{{ visibilitySummary }}</span>
        </div>
        <div class="form_row_value_btn">
          <el-button size="small" text @click="openVisibilityDialog">
            <span class="material-symbols-outlined" style="font-size:14px;">edit</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- Visibility Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="Edit Visibility Rules"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="iv-dialog-body">
        <table class="iv-dialog-table">
          <thead>
            <tr>
              <th style="width:100px">Section</th>
              <th style="width:200px">Item</th>
              <th>Description</th>
              <th style="width:120px">Externally visible</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in dialogRows" :key="row.id">
              <td>{{ row.sectionTitle }}</td>
              <td class="iv-dialog-item-title">{{ row.title }}</td>
              <td>
                <el-input
                  v-model="row.description"
                  size="small"
                  placeholder="Description"
                />
              </td>
              <td>
                <el-switch v-model="row.internalOnly" size="small" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <el-button size="small" @click="dialogVisible = false">Cancel</el-button>
        <el-button size="small" type="primary" class="dm-btn-primary" @click="saveVisibility">Save</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { PencilLine } from 'lucide-vue-next'
import { detectionConfig } from '../migrated-detection/detection-config.js'

// ── Ethicality threshold state ──
const ethicThresholds = reactive({ lowMax: 30, medMax: 70 })
const ethicDraft = reactive({ lowMax: 30, medMax: 70 })
const ethicEditing = ref(false)

function startEthicEdit() {
  ethicDraft.lowMax = ethicThresholds.lowMax
  ethicDraft.medMax = ethicThresholds.medMax
  ethicEditing.value = true
}

function cancelEthicEdit() {
  ethicEditing.value = false
}

function saveEthicEdit() {
  ethicThresholds.lowMax = ethicDraft.lowMax
  ethicThresholds.medMax = ethicDraft.medMax
  ethicEditing.value = false
}

// ── Visibility Rules ──
const visibilityRows = ref(
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

const visibilitySummary = computed(() => {
  const internal = visibilityRows.value.filter(r => r.internalOnly).length
  const total = visibilityRows.value.length
  return `${internal} of ${total} visible to external users`
})

// Dialog state
const dialogVisible = ref(false)
const dialogRows = ref([])

function openVisibilityDialog() {
  dialogRows.value = visibilityRows.value.map(r => ({ ...r }))
  dialogVisible.value = true
}

function saveVisibility() {
  visibilityRows.value = dialogRows.value.map(r => ({ ...r }))
  dialogVisible.value = false
}
</script>

<style scoped>
.iv-layout { display: flex; flex-direction: column; gap: 16px; }
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
.iv-fixed-val { display: inline-flex; align-items: center; height: 28px; font-size: 13px; color: #94a3b8; padding: 0 4px; }
.iv-threshold-sep { font-size: 14px; color: #94a3b8; padding-bottom: 4px; }
.iv-threshold-hint { margin-top: 8px; font-size: 11px; color: #94a3b8; }

/* Form row */
.form_row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.form_row_label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #172b4d;
  min-width: 180px;
}
.form_row_icon { font-size: 12px; color: #64748b; }
.form_row_value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.form_row_value_show_span {
  font-size: 12px;
  color: #64748b;
}
.form_row_value_btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Dialog */
.iv-dialog-body { max-height: 60vh; overflow-y: auto; }
.iv-dialog-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.iv-dialog-table th {
  background: #f8fafc;
  padding: 8px 10px;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e5e7eb;
}
.iv-dialog-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.iv-dialog-table tr:hover td { background: #f8fafc; }
.iv-dialog-item-title { font-weight: 500; color: #172b4d; }
</style>

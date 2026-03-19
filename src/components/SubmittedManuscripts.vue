<template>
  <div>
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">Manuscript Status</span>
      </div>
      <div class="panel-body">
        <!-- 状态标签页 -->
        <div class="status-tabs mb-4">
          <a
            v-for="tab in statusTabs"
            :key="tab.key"
            href="#"
            :class="['status-tab', { 'active': activeTab === tab.key }]"
            @click.prevent="activeTab = tab.key"
          >
            {{ tab.label }}
          </a>
        </div>

        <!-- ORCID 提示条（仅 published 页签且未连接时显示） -->
        <div v-if="activeTab === 'published' && !orcidConnected" class="orcid-banner mb-3">
          <span class="orcid-banner__text">We've noticed that you haven't attached your ORCiD account just yet.</span>
          <a href="#" class="orcid-banner__link" @click.prevent="handleConnectOrcid">Create or connect your ORCID ID</a>
          <span class="orcid-banner__info" title="here is description">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </span>
        </div>

        <!-- 表格容器 -->
        <DataTable :columns="tableColumns" :data="filteredManuscripts">
          <template #cell-manuscriptId="{ row }">
            <a href="#" class="text-primary hover:underline">{{ row.manuscriptId }}</a>
          </template>

          <template #cell-title="{ row }">
            <a v-if="row.title" href="#" class="text-primary hover:underline">{{ row.title }}</a>
            <span v-else class="text-gray-400">—</span>
          </template>

          <template #cell-section="{ row }">
            <span v-if="row.section">{{ row.section }}</span>
            <span v-else class="text-gray-400">—</span>
          </template>

          <template #cell-operations="{ row }">
            <!-- incomplete -->
            <div v-if="activeTab === 'incomplete'" class="action-cell">
              <a href="#" class="action-link">Continue</a>
              <button class="action-icon-btn action-icon-btn--danger" @click="handleDelete(row.id)" title="Delete">
                <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
              </button>
            </div>

            <!-- processing -->
            <div v-else-if="activeTab === 'processing'" class="action-cell">
              <a href="#" class="action-link" title="View manuscript">View</a>
              <a href="#" class="action-link" title="Resubmit a revision">Resubmit</a>
              <a href="#" class="action-link" title="View author biography">Biography</a>
            </div>

            <!-- published -->
            <div v-else-if="activeTab === 'published'" class="action-cell">
              <a href="#" class="action-link">View</a>
              <a href="#" class="action-link">Biography</a>
              <template v-if="orcidConnected">
                <button
                  :class="['orcid-btn', row.orcidLinked ? 'orcid-btn--active' : 'orcid-btn--inactive']"
                  :title="row.orcidLinked ? 'ORCID linked' : 'Link to ORCID'"
                >
                  <OrcidIcon :active="row.orcidLinked" />
                </button>
              </template>
            </div>

            <!-- rejected -->
            <div v-else-if="activeTab === 'rejected'" class="action-cell">
              <a href="#" class="action-link">View</a>
              <a href="#" class="action-link">Biography</a>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h } from 'vue'
import DataTable from './DataTable.vue'

// ORCID SVG icon 组件（官方 logo 形状简化版）
const OrcidIcon = defineComponent({
  props: { active: Boolean },
  setup(props) {
    return () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16', height: '16',
      viewBox: '0 0 256 256',
      style: 'display:inline-block;vertical-align:middle;'
    }, [
      h('ellipse', { cx: '128', cy: '128', rx: '128', ry: '128', fill: props.active ? '#a6ce39' : '#d1d5db' }),
      h('text', {
        x: '128', y: '148',
        'text-anchor': 'middle',
        'font-size': '120',
        'font-weight': '700',
        'font-family': 'serif',
        fill: '#fff'
      }, 'iD')
    ])
  }
})

const activeTab = ref('incomplete')
const orcidConnected = ref(false)

const handleConnectOrcid = () => {
  orcidConnected.value = true
}

const statusTabs = [
  { key: 'incomplete', label: 'Incomplete submissions ( 10 )' },
  { key: 'processing', label: 'Under processing ( 2 )' },
  { key: 'published', label: 'Published ( 5 )' },
  { key: 'rejected', label: 'Rejected / Withdrawn / Archived ( 1 )' }
]

const manuscripts = ref([
  { id: 1, manuscriptId: 'fractlract-3245678', title: 'On Testing Konacker Product Structure in Tensor Factor Models', journal: 'fractlract', section: '', submissionDate: '2024-01-15', status: 'step 4 of 6', statusType: 'incomplete' },
  { id: 2, manuscriptId: 'fractlract-3245679', title: 'Algebraic models for 1-dimensional categories of rational G-spectra', journal: 'fractlract', section: '', submissionDate: '2024-01-16', status: 'step 4 of 6', statusType: 'incomplete' },
  { id: 3, manuscriptId: 'fractlract-3245680', title: '', journal: 'fractlract', section: 'S: Water Resources Management, Policy and Governance', submissionDate: '2024-01-17', status: 'step 1 of 5', statusType: 'incomplete' },
  { id: 4, manuscriptId: 'fractlract-3245681', title: 'New duality in choices of feature spaces via kernel analysis', journal: 'fractlract', section: '', submissionDate: '2024-01-18', status: 'step 4 of 6', statusType: 'incomplete' },
  { id: 5, manuscriptId: 'fractlract-3245682', title: '', journal: 'fractlract', section: '', submissionDate: '2024-01-19', status: 'step 1 of 5', statusType: 'incomplete' },
  { id: 6, manuscriptId: 'fractlract-3245683', title: 'Governance:Evaluation of Water Infrastructure System Operation, Production Productivity, and its Relationship to Water Loss', journal: 'fractlract', section: '', submissionDate: '2024-01-20', status: 'step 4 of 6', statusType: 'incomplete' },
  { id: 7, manuscriptId: 'fractlract-3245684', title: 'Algebraic models for 1-dimensional categories of rational G-spectra', journal: 'fractlract', section: '', submissionDate: '2024-01-21', status: 'step 4 of 6', statusType: 'incomplete' },
  { id: 8, manuscriptId: 'fractlract-3245685', title: '', journal: 'fractlract', section: '', submissionDate: '2024-01-22', status: 'step 1 of 5', statusType: 'incomplete' },
  { id: 9, manuscriptId: 'fractlract-3245686', title: '', journal: 'fractlract', section: '', submissionDate: '2024-01-23', status: 'step 4 of 6', statusType: 'incomplete' },
  { id: 10, manuscriptId: 'fractlract-3245687', title: '', journal: 'fractlract', section: '', submissionDate: '2024-01-24', status: 'step 4 of 6', statusType: 'incomplete' },
  { id: 11, manuscriptId: 'fractlract-3245688', title: 'Advanced Machine Learning Techniques for Data Analysis', journal: 'fractlract', section: 'S: Artificial Intelligence', submissionDate: '2024-02-01', status: 'Under Review', statusType: 'processing' },
  { id: 12, manuscriptId: 'fractlract-3245689', title: 'Climate Change Impact on Coastal Ecosystems', journal: 'fractlract', section: 'S: Environmental Science', submissionDate: '2024-02-05', status: 'Peer Review', statusType: 'processing' },
  { id: 13, manuscriptId: 'fractlract-3245690', title: 'Novel Approaches to Quantum Computing', journal: 'fractlract', section: 'S: Physics', submissionDate: '2023-12-01', status: 'Published', statusType: 'published', orcidLinked: true },
  { id: 14, manuscriptId: 'fractlract-3245691', title: 'Biodiversity Conservation in Tropical Forests', journal: 'fractlract', section: 'S: Ecology', submissionDate: '2023-11-15', status: 'Published', statusType: 'published', orcidLinked: false },
  { id: 15, manuscriptId: 'fractlract-3245692', title: 'Experimental Study on Material Properties', journal: 'fractlract', section: 'S: Materials Science', submissionDate: '2024-01-10', status: 'Rejected', statusType: 'rejected' }
])

const filteredManuscripts = computed(() =>
  manuscripts.value.filter(m => m.statusType === activeTab.value)
)

const tableColumns = computed(() => {
  const columns = []
  if (activeTab.value !== 'incomplete') {
    columns.push({ key: 'manuscriptId', label: 'Manuscript ID', sortable: false, style: 'width: 12%;' })
  }
  columns.push({ key: 'title', label: 'Title', sortable: false, style: activeTab.value === 'incomplete' ? 'width: 35%;' : 'width: 28%;' })
  columns.push({ key: 'journal', label: 'Journal', sortable: false, style: 'width: 10%;' })
  columns.push({ key: 'section', label: 'Section / Special Issue / Topic', sortable: false, style: 'width: 22%;' })
  columns.push({ key: 'submissionDate', label: activeTab.value === 'incomplete' ? 'Created Date' : 'Submission Date', sortable: false, style: 'width: 11%;' })
  if (activeTab.value !== 'published') {
    columns.push({ key: 'status', label: 'Status', sortable: false, style: 'width: 10%;' })
  }
  columns.push({ key: 'operations', label: 'Action', sortable: false, style: 'width: 10%;' })
  return columns
})

const handleDelete = (id) => {
  console.log('Delete manuscript:', id)
}
</script>

<style scoped>
/* 表格字号提升至 13px（action 列内容保持自身样式） */
:deep(.data-table-container thead th),
:deep(.data-table-container tbody td) {
  font-size: 13px;
}

/* 状态标签页 */
.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.status-tab {
  padding: 0.5rem 0.5rem;
  background-color: transparent;
  color: #626f86;
  font-size: 13px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  white-space: nowrap;
}

.status-tab:hover { color: #0156ce; }
.status-tab.active { color: #0156ce; border-bottom-color: #0156ce; font-weight: 600; }

/* ORCID 提示条 */
.orcid-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 4px;
  font-size: 13px;
  flex-wrap: wrap;
}

.orcid-banner__text { color: #374151; }

.orcid-banner__link {
  color: #0156ce;
  text-decoration: underline;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 500;
}
.orcid-banner__link:hover { color: #014bb5; }

.orcid-banner__info {
  display: inline-flex;
  align-items: center;
  color: #9ca3af;
  cursor: help;
  flex-shrink: 0;
}
.orcid-banner__info:hover { color: #6b7280; }

/* Action 列通用 */
.action-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.action-link {
  font-size: 12px;
  color: #0156ce;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.15s;
}
.action-link:hover { color: #014bb5; text-decoration: underline; }

.action-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  transition: all 0.15s;
  color: #9ca3af;
}
.action-icon-btn:hover { background: #f1f5f9; color: #475569; }
.action-icon-btn--danger:hover { background: #fee2e2; color: #dc2626; }

/* ORCID 图标按钮 */
.orcid-btn {
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 1px;
  border-radius: 50%;
  transition: opacity 0.15s, transform 0.15s;
}
.orcid-btn:hover { opacity: 0.8; transform: scale(1.1); }
.orcid-btn--inactive { opacity: 0.5; }
.orcid-btn--inactive:hover { opacity: 0.75; }
</style>

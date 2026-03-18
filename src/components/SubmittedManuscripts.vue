<template>
  <div>
    <!-- 页面标题和操作按钮
    <div class="flex items-center justify-between mb-6">
      <h1 class="page-title">Manuscript Status</h1>
      <button class="primary-button">Submit A New Manuscript</button>
    </div> -->

    <!-- 内容面板 -->
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
            <div class="flex items-center gap-2">
              <a href="#" class="text-primary hover:underline text-xs">Edit Details</a>
              <button
                class="text-gray-600 hover:text-red-600 inline-flex"
                @click="handleDelete(row.id)"
                title="Delete"
              >
                <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataTable from './DataTable.vue'

const activeTab = ref('incomplete')

const statusTabs = [
  { key: 'incomplete', label: 'Incomplete submissions ( 10 )' },
  { key: 'processing', label: 'Under processing ( 2 )' },
  { key: 'published', label: 'Published ( 5 )' },
  { key: 'rejected', label: 'Rejected / Withdrawn / Archived ( 1 )' }
]

// 模拟数据
const manuscripts = ref([
  {
    id: 1,
    manuscriptId: 'fractlract-3245678',
    title: 'On Testing Konacker Product Structure in Tensor Factor Models',
    journal: 'fractlract',
    section: '',
    submissionDate: '2024-01-15',
    status: 'step 4 of 6',
    statusType: 'incomplete'
  },
  {
    id: 2,
    manuscriptId: 'fractlract-3245679',
    title: 'Algebraic models for 1-dimensional categories of rational G-spectra',
    journal: 'fractlract',
    section: '',
    submissionDate: '2024-01-16',
    status: 'step 4 of 6',
    statusType: 'incomplete'
  },
  {
    id: 3,
    manuscriptId: 'fractlract-3245680',
    title: '',
    journal: 'fractlract',
    section: 'S: Water Resources Management, Policy and Governance',
    submissionDate: '2024-01-17',
    status: 'step 1 of 5',
    statusType: 'incomplete'
  },
  {
    id: 4,
    manuscriptId: 'fractlract-3245681',
    title: 'New duality in choices of feature spaces via kernel analysis',
    journal: 'fractlract',
    section: '',
    submissionDate: '2024-01-18',
    status: 'step 4 of 6',
    statusType: 'incomplete'
  },
  {
    id: 5,
    manuscriptId: 'fractlract-3245682',
    title: '',
    journal: 'fractlract',
    section: '',
    submissionDate: '2024-01-19',
    status: 'step 1 of 5',
    statusType: 'incomplete'
  },
  {
    id: 6,
    manuscriptId: 'fractlract-3245683',
    title: 'Governance:Evaluation of Water Infrastructure System Operation, Production Productivity, and its Relationship to Water Loss',
    journal: 'fractlract',
    section: '',
    submissionDate: '2024-01-20',
    status: 'step 4 of 6',
    statusType: 'incomplete'
  },
  {
    id: 7,
    manuscriptId: 'fractlract-3245684',
    title: 'Algebraic models for 1-dimensional categories of rational G-spectra',
    journal: 'fractlract',
    section: '',
    submissionDate: '2024-01-21',
    status: 'step 4 of 6',
    statusType: 'incomplete'
  },
  {
    id: 8,
    manuscriptId: 'fractlract-3245685',
    title: '',
    journal: 'fractlract',
    section: '',
    submissionDate: '2024-01-22',
    status: 'step 1 of 5',
    statusType: 'incomplete'
  },
  {
    id: 9,
    manuscriptId: 'fractlract-3245686',
    title: '',
    journal: 'fractlract',
    section: '',
    submissionDate: '2024-01-23',
    status: 'step 4 of 6',
    statusType: 'incomplete'
  },
  {
    id: 10,
    manuscriptId: 'fractlract-3245687',
    title: '',
    journal: 'fractlract',
    section: '',
    submissionDate: '2024-01-24',
    status: 'step 4 of 6',
    statusType: 'incomplete'
  },
  // Under processing 数据
  {
    id: 11,
    manuscriptId: 'fractlract-3245688',
    title: 'Advanced Machine Learning Techniques for Data Analysis',
    journal: 'fractlract',
    section: 'S: Artificial Intelligence',
    submissionDate: '2024-02-01',
    status: 'Under Review',
    statusType: 'processing'
  },
  {
    id: 12,
    manuscriptId: 'fractlract-3245689',
    title: 'Climate Change Impact on Coastal Ecosystems',
    journal: 'fractlract',
    section: 'S: Environmental Science',
    submissionDate: '2024-02-05',
    status: 'Peer Review',
    statusType: 'processing'
  },
  // Published 数据
  {
    id: 13,
    manuscriptId: 'fractlract-3245690',
    title: 'Novel Approaches to Quantum Computing',
    journal: 'fractlract',
    section: 'S: Physics',
    submissionDate: '2023-12-01',
    status: 'Published',
    statusType: 'published'
  },
  {
    id: 14,
    manuscriptId: 'fractlract-3245691',
    title: 'Biodiversity Conservation in Tropical Forests',
    journal: 'fractlract',
    section: 'S: Ecology',
    submissionDate: '2023-11-15',
    status: 'Published',
    statusType: 'published'
  },
  // Rejected 数据
  {
    id: 15,
    manuscriptId: 'fractlract-3245692',
    title: 'Experimental Study on Material Properties',
    journal: 'fractlract',
    section: 'S: Materials Science',
    submissionDate: '2024-01-10',
    status: 'Rejected',
    statusType: 'rejected'
  }
])

const filteredManuscripts = computed(() => {
  return manuscripts.value.filter(m => m.statusType === activeTab.value)
})

const tableColumns = computed(() => {
  const columns = []
  if (activeTab.value !== 'incomplete') {
    columns.push({ key: 'manuscriptId', label: 'Manuscript ID', sortable: false, style: 'width: 12%;' })
  }

  columns.push({
    key: 'title',
    label: 'Title',
    sortable: false,
    style: activeTab.value === 'incomplete' ? 'width: 35%;' : 'width: 28%;'
  })
  columns.push({ key: 'journal', label: 'Journal', sortable: false, style: 'width: 10%;' })
  columns.push({ key: 'section', label: 'Section / Special Issue / Topic', sortable: false, style: 'width: 22%;' })
  columns.push({ key: 'submissionDate', label: 'Submission Date', sortable: false, style: 'width: 11%;' })

  if (activeTab.value !== 'published') {
    columns.push({ key: 'status', label: 'Status', sortable: false, style: 'width: 10%;' })
  }

  columns.push({ key: 'operations', label: 'Action', sortable: false, style: 'width: 7%;' })
  return columns
})

const handleDelete = (id) => {
  console.log('Delete manuscript:', id)
}
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #172b4d;
}

/* 主按钮样式 - 与 Header 一致 */
.primary-button {
  background-color: #0156ce;
  color: white;
  border: 1px solid #0156ce;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button:hover {
  background-color: #014bb5;
  border-color: #014bb5;
}

/* 状态标签页 - 复用 ManageManuscripts 样式 */
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

.status-tab:hover {
  color: #0156ce;
}

.status-tab.active {
  color: #0156ce;
  border-bottom-color: #0156ce;
  font-weight: 600;
}

</style>

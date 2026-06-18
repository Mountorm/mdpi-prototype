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
          We've noticed that you haven't attached your ORCID account just yet.  <a href="#" class="orcid-banner__link" @click.prevent="handleConnectOrcid">Create or connect your ORCID ID</a>
          <span
            class="orcid-banner__info material-symbols-outlined"
            title="what's this?"
            @click.prevent="openOrcidHelp"
          >
            help
          </span>
        </div>

        <!-- 表格容器 -->
        <DataTable :columns="tableColumns" :data="filteredManuscripts" :default-page-size="20">
          <template #cell-manuscriptId="{ row }">
            <div class="manuscript-id-cell">
              <a href="#" class="manuscript-id-link">{{ row.manuscriptId }}</a><button 
                class="manuscript-icon-btn" 
                @click="copyManuscriptId(row.manuscriptId, $event)"
                title="Copy Manuscript ID"
              ><span class="material-symbols-outlined">content_copy</span></button><button 
                class="manuscript-icon-btn manuscript-icon-btn--biography" 
                @click="viewBiography(row.id)"
                title="Check Biography"
              ><span class="material-symbols-outlined">format_bold</span></button>
            </div>
          </template>

          <template #cell-title="{ row }">
            <div class="title-cell">
              <template v-if="row.title">
                <span v-if="activeTab === 'incomplete'" class="title-text">{{ row.title }}</span>
                <a v-else href="#" class="title-link-wrapper" title="View the manuscript overview">
                  <span class="title-text">{{ row.title }}</span>
                </a>
              </template>
              <span v-else class="text-gray-400">—</span>
            </div>
          </template>

          <template #cell-section="{ row }">
            <span v-if="row.section">{{ row.section }}</span>
            <span v-else class="text-gray-400">—</span>
          </template>

          <template #cell-operations="{ row }">
            <!-- incomplete -->
            <div v-if="activeTab === 'incomplete'" class="action-cell">
              <a href="#" class="action-link action-link--primary">Continue</a>
              <button class="action-icon-btn action-icon-btn--danger" @click="handleDelete(row.id)" title="Delete">
                <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
              </button>
            </div>

            <!-- processing -->
            <div v-else-if="activeTab === 'processing'" class="action-cell">
              <!-- 如果有其他操作按钮，则不显示 View -->
              <template v-if="row.status === 'Author proofreading' || row.status === 'Author proofreading - resubmit manuscript'">
                <a href="#" class="action-link action-link--primary" title="Submit Proofreading Version">Submit</a>
              </template>
              <template v-else-if="row.status === 'Pending resubmission'">
                <a href="#" class="action-link action-link--primary" title="Resubmit manuscript">Resubmit</a>
              </template>
              <template v-else>
                <a href="#" class="action-link-secondary" title="View manuscript">View</a>
              </template>
            </div>

            <!-- published -->
            <div v-else-if="activeTab === 'published'" class="action-cell">
              <button class="action-icon-btn action-icon-btn--primary" title="Go to the published article">
                <span class="material-symbols-outlined">{{ getPublishedIcon(row.id) }}</span>
              </button>
              <template v-if="orcidConnected">
                <button
                  :class="['orcid-btn', row.orcidLinked ? 'orcid-btn--active' : 'orcid-btn--inactive']"
                  :title="row.orcidLinked ? `ORCID: ${row.orcidId || '0000-0002-1234-5678'}` : 'Deposit to ORCID'"
                  @click="row.orcidLinked ? null : handleDepositToOrcid(row)"
                >
                  <OrcidIcon :active="row.orcidLinked" />
                </button>
              </template>
            </div>

            <!-- rejected -->
            <div v-else-if="activeTab === 'rejected'" class="action-cell">
              <a href="#" class="action-link-secondary">View</a>
            </div>
          </template>

          <!-- 空状态 -->
          <template #empty>
            <div class="text-center py-16">
              <span class="material-symbols-outlined" style="font-size: 48px; color: #d1d5db;">description</span>
              <p class="text-gray-500 font-medium mt-4 mb-1">No manuscripts found</p>
              <a href="#" class="action-link action-link--primary">Click here to submit your manuscript.</a>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- ORCID 存储确认弹窗 -->
    <div v-if="showOrcidModal" class="modal-overlay" @click.self="cancelDeposit">
      <div class="modal-content">
        <button class="modal-close" @click="cancelDeposit">
          <span class="material-symbols-outlined">close</span>
        </button>
        <div class="modal-orcid-icon">
          <OrcidIcon :active="true" :size="30" />
        </div>
        <h3 class="modal-title">Deposit Article to ORCID</h3>
        <p class="modal-text">
          Are you sure to deposit this article ({{ selectedManuscript?.doi || selectedManuscript?.manuscriptId || 'N/A' }}) to ORCID?
        </p>
        <div class="modal-actions">
          <button class="modal-btn modal-btn--cancel" @click="cancelDeposit">Cancel</button>
          <button class="modal-btn modal-btn--confirm" @click="confirmDeposit">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h } from 'vue'
import DataTable from './DataTable.vue'

// ORCID icon 组件（使用官方 SVG 图标）
const OrcidIcon = defineComponent({
  props: { active: Boolean, size: { type: Number, default: 16 } },
  setup(props) {
    return () => h('img', {
      src: '/orcid-icon.svg',
      alt: 'ORCID iD',
      width: props.size,
      height: props.size,
      style: {
        display: 'inline-block',
        verticalAlign: 'middle',
        opacity: props.active ? '1' : '0.4',
        filter: props.active ? 'none' : 'grayscale(100%)'
      }
    })
  }
})

const activeTab = ref('incomplete')
const orcidConnected = ref(false)
const showOrcidModal = ref(false)
const selectedManuscript = ref(null)
const openOrcidHelp = () => {
  window.open('https://support.orcid.org/hc/en-us/articles/360006897334-What-is-an-ORCID-iD-and-how-do-I-use-it', '_blank')
}

const handleConnectOrcid = () => {
  orcidConnected.value = true
}

const handleDepositToOrcid = (manuscript) => {
  selectedManuscript.value = manuscript
  showOrcidModal.value = true
}

const confirmDeposit = () => {
  if (selectedManuscript.value) {
    // 模拟存储操作
    selectedManuscript.value.orcidLinked = true
    selectedManuscript.value.orcidId = '0000-0002-1234-5678'
  }
  showOrcidModal.value = false
  selectedManuscript.value = null
}

const cancelDeposit = () => {
  showOrcidModal.value = false
  selectedManuscript.value = null
}

const copyManuscriptId = (manuscriptId, event) => {
  const btn = event.target.closest('.manuscript-icon-btn')
  const icon = btn?.querySelector('.material-symbols-outlined')
  
  let copySuccess = false
  
  // 尝试使用 Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(manuscriptId).then(() => {
      showCopySuccess(btn, icon)
    }).catch(() => {
      // 如果失败，使用降级方案
      copySuccess = fallbackCopy(manuscriptId)
      if (copySuccess && btn && icon) {
        showCopySuccess(btn, icon)
      }
    })
  } else {
    // 使用降级方案
    copySuccess = fallbackCopy(manuscriptId)
    if (copySuccess && btn && icon) {
      showCopySuccess(btn, icon)
    }
  }
}

// 显示复制成功反馈
const showCopySuccess = (btn, icon) => {
  if (!btn || !icon) return
  
  const originalIcon = icon.textContent
  icon.textContent = 'check'
  btn.style.color = '#16a34a' // 绿色
  
  setTimeout(() => {
    icon.textContent = originalIcon
    btn.style.color = ''
  }, 2000)
}

// 降级复制方案（使用 execCommand）
const fallbackCopy = (text) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  
  try {
    const successful = document.execCommand('copy')
    document.body.removeChild(textarea)
    return successful
  } catch (err) {
    console.error('Fallback copy failed:', err)
    document.body.removeChild(textarea)
    return false
  }
}

const viewBiography = (id) => {
  console.log('View biography for manuscript:', id)
  // 这里可以添加跳转到 biography 页面的逻辑
}

const statusTabs = [
  { key: 'incomplete', label: 'Incomplete submissions ( 10 )' },
  { key: 'processing', label: 'Under processing ( 5 )' },
  { key: 'published', label: 'Published ( 5 )' },
  { key: 'rejected', label: 'Rejected / Withdrawn / Archived ( 1 )' },
  { key: 'no-data', label: 'No Data Demo' }
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
  { id: 16, manuscriptId: 'fractlract-3245693', title: 'Quantum Entanglement in Photonic Systems', journal: 'fractlract', section: 'S: Quantum Physics', submissionDate: '2024-02-10', status: 'Author proofreading', statusType: 'processing' },
  { id: 17, manuscriptId: 'fractlract-3245694', title: 'Machine Learning Applications in Healthcare', journal: 'fractlract', section: 'S: Medical Informatics', submissionDate: '2024-02-12', status: 'Author proofreading - resubmit manuscript', statusType: 'processing' },
  { id: 18, manuscriptId: 'fractlract-3245695', title: 'Sustainable Energy Solutions for Urban Areas', journal: 'fractlract', section: 'S: Energy Systems', submissionDate: '2024-02-15', status: 'Pending resubmission', statusType: 'processing' },
  { id: 13, manuscriptId: 'fractlract-3245690', title: 'Novel Approaches to Quantum Computing', journal: 'fractlract', section: 'S: Physics', submissionDate: '2023-12-01', status: 'Published', statusType: 'published', orcidLinked: true, orcidId: '0000-0002-1234-5678', doi: '10.3390/physics8010001' },
  { id: 14, manuscriptId: 'fractlract-3245691', title: 'Biodiversity Conservation in Tropical Forests', journal: 'fractlract', section: 'S: Ecology', submissionDate: '2023-11-15', status: 'Published', statusType: 'published', orcidLinked: false, doi: '10.3390/tomography8010043' },
  { id: 19, manuscriptId: 'fractlract-3245696', title: 'Advanced Computational Methods in Physics', journal: 'fractlract', section: 'S: Computational Science', submissionDate: '2023-10-20', status: 'Published', statusType: 'published', orcidLinked: false, doi: '10.3390/computation8010015' },
  { id: 15, manuscriptId: 'fractlract-3245692', title: 'Experimental Study on Material Properties', journal: 'fractlract', section: 'S: Materials Science', submissionDate: '2024-01-10', status: 'Rejected', statusType: 'rejected' }
])

const filteredManuscripts = computed(() =>
  manuscripts.value.filter(m => m.statusType === activeTab.value)
)

const tableColumns = computed(() => {
  const columns = []
  if (activeTab.value !== 'incomplete') {
    columns.push({ key: 'manuscriptId', label: 'Manuscript ID', sortable: false, style: 'width: 15%; white-space: nowrap;' })
  }
  
  // 根据不同标签页调整列宽，避免横向滚动
  if (activeTab.value === 'incomplete') {
    columns.push({ key: 'title', label: 'Title', sortable: false, style: 'width: 35%;' })
    columns.push({ key: 'journal', label: 'Journal', sortable: false, style: 'width: 10%;' })
    columns.push({ key: 'section', label: 'Section / Special Issue / Topic', sortable: false, style: 'width: 22%;' })
    columns.push({ key: 'submissionDate', label: 'Created Date', sortable: false, style: 'width: 11%;' })
    columns.push({ key: 'status', label: 'Status', sortable: false, style: 'width: 10%;' })
    columns.push({ key: 'operations', label: 'Action', sortable: false, style: 'width: 10%;' })
  } else if (activeTab.value === 'processing') {
    // processing 页签优化列宽，避免横向滚动
    columns.push({ key: 'title', label: 'Title', sortable: false, style: 'width: 23%;' })
    columns.push({ key: 'journal', label: 'Journal', sortable: false, style: 'width: 9%;' })
    columns.push({ key: 'section', label: 'Section / Special Issue / Topic', sortable: false, style: 'width: 16%;' })
    columns.push({ key: 'submissionDate', label: 'Submission Date', sortable: false, style: 'width: 11%;' })
    columns.push({ key: 'status', label: 'Status', sortable: false, style: 'width: 14%;' })
    columns.push({ key: 'operations', label: 'Action', sortable: false, style: 'width: 12%;' })
  } else if (activeTab.value === 'published') {
    // published 页签，title 列需要更多空间容纳外链图标
    columns.push({ key: 'title', label: 'Title', sortable: false, style: 'width: 25%;' })
    columns.push({ key: 'journal', label: 'Journal', sortable: false, style: 'width: 10%;' })
    columns.push({ key: 'section', label: 'Section / Special Issue / Topic', sortable: false, style: 'width: 20%;' })
    columns.push({ key: 'submissionDate', label: 'Submission Date', sortable: false, style: 'width: 11%;' })
    columns.push({ key: 'operations', label: 'Action', sortable: false, style: 'width: 9%;' })
  } else {
    // rejected 页签
    columns.push({ key: 'title', label: 'Title', sortable: false, style: 'width: 23%;' })
    columns.push({ key: 'journal', label: 'Journal', sortable: false, style: 'width: 10%;' })
    columns.push({ key: 'section', label: 'Section / Special Issue / Topic', sortable: false, style: 'width: 18%;' })
    columns.push({ key: 'submissionDate', label: 'Submission Date', sortable: false, style: 'width: 11%;' })
    columns.push({ key: 'status', label: 'Status', sortable: false, style: 'width: 14%;' })
    columns.push({ key: 'operations', label: 'Action', sortable: false, style: 'width: 9%;' })
  }
  
  return columns
})

const handleDelete = (id) => {
  console.log('Delete manuscript:', id)
}

const getPublishedIcon = (id) => {
  // 前三条 published 数据分别使用不同的图标
  if (id === 13) return 'public'
  if (id === 14) return 'language'
  if (id === 19) return 'captive_portal'
  return 'public' // 默认使用 public
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
  cursor: pointer;
  flex-shrink: 0;
  font-size: 16px;
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

/* 主操作链接（强调色，更突出） */
.action-link--primary {
  color: #0156ce;
  font-weight: 500;
  font-size: 13px;
}
.action-link--primary:hover {
  color: #014bb5;
}

/* 次要操作链接（弱化） */
.action-link-secondary {
  font-size: 13px;
  color: #64748b;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.15s;
}
.action-link-secondary:hover {
  color: #0156ce;
  text-decoration: underline;
}

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
.action-icon-btn--primary {
  color: #0156ce;
}
.action-icon-btn--primary:hover {
  background: #dbeafe;
  color: #014bb5;
}

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

/* ORCID 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 4px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-border);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.15s;
  width: 24px;
  height: 24px;
}
.modal-close:hover {
  background: #f1f5f9;
  color: #475569;
}
.modal-close .material-symbols-outlined {
  font-size: 20px;
}

.modal-orcid-icon {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #172b4d;
  margin-bottom: 12px;
  line-height: 1.3;
}

.modal-text {
  font-size: 14px;
  color: #626f86;
  margin-bottom: 24px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 80px;
}

.modal-btn--cancel {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}
.modal-btn--cancel:hover {
  background: #f3f4f6;
}

.modal-btn--confirm {
  background: #0156ce;
  color: white;
}
.modal-btn--confirm:hover {
  background: #014bb5;
}

/* Manuscript ID 单元格样式 */
.manuscript-id-cell {
  display: inline;
  line-height: 1.5;
}

.manuscript-id-link {
  color: #1e293b;
  text-decoration: none;
  cursor: pointer;
}

.manuscript-id-link:hover {
  text-decoration: underline;
}

.manuscript-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 2px;
  border-radius: 3px;
  transition: all 0.15s;
  color: #94a3b8;
  vertical-align: middle;
  margin-left: 2px;
}

.manuscript-icon-btn:hover {
  background: #f1f5f9;
  color: #0156ce;
}

.manuscript-icon-btn:active {
  transform: scale(0.95);
}

.manuscript-icon-btn .material-symbols-outlined {
  font-size: 16px;
  display: block;
}

.manuscript-icon-btn--biography .material-symbols-outlined {
  font-size: 20px;
  font-weight: 600;
}

/* Title 单元格样式 */
.title-cell {
  display: inline;
  line-height: 1.5;
}

.title-link-wrapper {
  color: #0156ce;
  text-decoration: none;
  display: inline;
}

.title-link-wrapper:hover {
  text-decoration: underline;
}

.title-text {
  display: inline;
}
</style>

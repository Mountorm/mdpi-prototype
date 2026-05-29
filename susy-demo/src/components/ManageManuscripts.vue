<template>
  <div>
    <!-- Assigned Journals 面板 -->
    <div class="collapsible-panel mb-4">
      <button 
        @click="isJournalsExpanded = !isJournalsExpanded"
        class="collapsible-header w-full"
      >
        <span class="panel-title">Assigned Journals</span>
        <span 
          :class="['material-icons transition-transform', { 'rotate-90': isJournalsExpanded }]"
          style="font-size: 20px;"
        >
          chevron_right
        </span>
      </button>

      <div v-if="isJournalsExpanded" class="collapsible-body">
        <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div 
            v-for="journal in journals"
            :key="journal.id"
            class="p-3 border border-border-color rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 class="font-medium text-sm mb-1">{{ journal.name }}</h3>
            <p class="text-xs text-secondary">
              <span class="font-medium">{{ journal.count }}</span> manuscripts
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选器面板 -->
    <div class="panel mb-4">
      <div class="panel-header">
        <span class="panel-title">Submitted</span>
      </div>

      <div class="panel-body">
        <el-form :model="filterForm" label-position="top">
          <div class="filter-grid">
            <!-- 前18项：默认显示 -->
            <el-form-item label="Journal">
              <el-select v-model="filterForm.journal" multiple filterable placeholder="All" class="w-full">
                <el-option label="All" value="all" />
              </el-select>
            </el-form-item>

            <el-form-item label="Section">
              <el-select v-model="filterForm.section" multiple filterable placeholder="Select Some Options" class="w-full">
                <el-option label="Option 1" value="option1" />
              </el-select>
            </el-form-item>

            <el-form-item label="Special Issue">
              <el-select v-model="filterForm.specialIssue" placeholder="---" class="w-full">
                <el-option label="---" :value="null" />
              </el-select>
            </el-form-item>

            <el-form-item label="SI Editor">
              <el-select v-model="filterForm.siEditor" multiple filterable placeholder="Select Some Options" class="w-full">
                <el-option label="Option 1" value="option1" />
              </el-select>
            </el-form-item>

            <el-form-item label="Article Type">
              <el-select v-model="filterForm.articleType" placeholder="All" class="w-full">
                <el-option label="All" value="all" />
              </el-select>
            </el-form-item>

            <el-form-item label="Manuscript Owner">
              <el-select v-model="filterForm.manuscriptOwner" multiple filterable placeholder="Select Some Options" class="w-full">
                <el-option label="Option 1" value="option1" />
              </el-select>
            </el-form-item>

            <el-form-item label="Assigned Editor">
              <el-select v-model="filterForm.assignedEditor" multiple filterable placeholder="Select Some Options" class="w-full">
                <el-option label="Option 1" value="option1" />
              </el-select>
            </el-form-item>

            <el-form-item label="Assignment Date">
              <el-date-picker
                v-model="filterForm.assignmentDate"
                type="daterange"
                start-placeholder="From date"
                end-placeholder="To date"
                class="w-full"
              />
            </el-form-item>

            <el-form-item label="Manuscript Status">
              <el-select v-model="filterForm.manuscriptStatus" multiple filterable placeholder="Select Some Options" class="w-full">
                <el-option label="Option 1" value="option1" />
              </el-select>
            </el-form-item>

            <el-form-item label="Manuscript Title">
              <el-input v-model="filterForm.manuscriptTitle" placeholder="" />
            </el-form-item>

            <el-form-item label="Manuscript Author">
              <el-input v-model="filterForm.manuscriptAuthor" placeholder="" />
            </el-form-item>

            <el-form-item label="Submitting Author Country">
              <el-select v-model="filterForm.submittingAuthorCountry" placeholder="All" class="w-full">
                <el-option label="All" value="all" />
              </el-select>
            </el-form-item>

            <el-form-item label="Submission date">
              <el-date-picker
                v-model="filterForm.submissionDate"
                type="daterange"
                start-placeholder="From date"
                end-placeholder="To date"
                class="w-full"
              />
            </el-form-item>

            <el-form-item label="QC Status">
              <el-select v-model="filterForm.qcStatus" placeholder="All" class="w-full">
                <el-option label="All" value="all" />
              </el-select>
            </el-form-item>

            <el-form-item label="Proofreading Method">
              <el-select v-model="filterForm.proofreadingMethod" placeholder="All" class="w-full">
                <el-option label="All" value="all" />
              </el-select>
            </el-form-item>

            <el-form-item label="Labels">
              <el-select v-model="filterForm.labels" multiple filterable placeholder="Select Some Options" class="w-full">
                <el-option label="Option 1" value="option1" />
              </el-select>
            </el-form-item>

            <el-form-item label="Last action">
              <el-date-picker
                v-model="filterForm.lastAction"
                type="daterange"
                start-placeholder="From date"
                end-placeholder="To date"
                class="w-full"
              />
            </el-form-item>

            <el-form-item label="Report Overall Recommendation">
              <el-select v-model="filterForm.reportOverallRecommendation" placeholder="All" class="w-full">
                <el-option label="All" value="all" />
              </el-select>
            </el-form-item>

            <!-- 高级搜索选项 -->
            <template v-if="showAdvancedFilters">
              <el-form-item label="Recruiting Reviewers">
                <el-select v-model="filterForm.recruitingReviewers" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="Open Review">
                <el-select v-model="filterForm.openReview" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="Watcher">
                <el-select v-model="filterForm.watcher" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="Resubmission">
                <el-select v-model="filterForm.resubmission" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="Ready Publish">
                <el-select v-model="filterForm.readyPublish" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="Decision request date">
                <el-date-picker
                  v-model="filterForm.decisionRequestDate"
                  type="daterange"
                  start-placeholder="From date"
                  end-placeholder="To date"
                  class="w-full"
                />
              </el-form-item>

              <el-form-item label="Pending First Decision Choice">
                <el-select v-model="filterForm.pendingFirstDecisionChoice" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="Decision Status">
                <el-select v-model="filterForm.decisionStatus" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="Revision request date">
                <el-date-picker
                  v-model="filterForm.revisionRequestDate"
                  type="daterange"
                  start-placeholder="From date"
                  end-placeholder="To date"
                  class="w-full"
                />
              </el-form-item>

              <el-form-item label="Revision due date">
                <el-date-picker
                  v-model="filterForm.revisionDueDate"
                  type="daterange"
                  start-placeholder="From date"
                  end-placeholder="To date"
                  class="w-full"
                />
              </el-form-item>

              <el-form-item label="Revision Status">
                <el-select v-model="filterForm.revisionStatus" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="Invited reviewer number">
                <div class="number-range">
                  <el-input-number v-model="filterForm.invitedReviewerMin" :controls="false" placeholder="Min" />
                  <span class="range-separator">-</span>
                  <el-input-number v-model="filterForm.invitedReviewerMax" :controls="false" placeholder="Max" />
                </div>
              </el-form-item>

              <el-form-item label="Valid reviewer number">
                <div class="number-range">
                  <el-input-number v-model="filterForm.validReviewerMin" :controls="false" placeholder="Min" />
                  <span class="range-separator">-</span>
                  <el-input-number v-model="filterForm.validReviewerMax" :controls="false" placeholder="Max" />
                </div>
              </el-form-item>

              <el-form-item label="Agreed reviewer number">
                <div class="number-range">
                  <el-input-number v-model="filterForm.agreedReviewerMin" :controls="false" placeholder="Min" />
                  <span class="range-separator">-</span>
                  <el-input-number v-model="filterForm.agreedReviewerMax" :controls="false" placeholder="Max" />
                </div>
              </el-form-item>

              <el-form-item label="Received report number">
                <div class="number-range">
                  <el-input-number v-model="filterForm.receivedReportMin" :controls="false" placeholder="Min" />
                  <span class="range-separator">-</span>
                  <el-input-number v-model="filterForm.receivedReportMax" :controls="false" placeholder="Max" />
                </div>
              </el-form-item>

              <el-form-item label="Submission revision date">
                <el-date-picker
                  v-model="filterForm.submissionRevisionDate"
                  type="daterange"
                  start-placeholder="From date"
                  end-placeholder="To date"
                  class="w-full"
                />
              </el-form-item>

              <el-form-item label="Rejected Status">
                <el-select v-model="filterForm.rejectedStatus" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="Published date">
                <el-date-picker
                  v-model="filterForm.publishedDate"
                  type="daterange"
                  start-placeholder="From date"
                  end-placeholder="To date"
                  class="w-full"
                />
              </el-form-item>

              <el-form-item label="Payment Done">
                <el-select v-model="filterForm.paymentDone" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="Has Video Abstract">
                <el-select v-model="filterForm.hasVideoAbstract" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="Has Video File">
                <el-select v-model="filterForm.hasVideoFile" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="PC Subject">
                <el-select v-model="filterForm.pcSubject" placeholder="All" class="w-full">
                  <el-option label="All" value="all" />
                </el-select>
              </el-form-item>

              <el-form-item label="Topic Name">
                <el-input v-model="filterForm.topicName" placeholder="Topic Name" />
              </el-form-item>

              <el-form-item label="Hide Proceedings">
                <el-select v-model="filterForm.hideProceedings" placeholder="None" class="w-full">
                  <el-option label="None" value="none" />
                  <el-option label="No" value="no" />
                  <el-option label="Yes" value="yes" />
                </el-select>
              </el-form-item>

              <el-form-item label="Proceeding Name">
                <el-input v-model="filterForm.proceedingName" placeholder="" />
              </el-form-item>

              <el-form-item label="Mark Case">
                <el-select v-model="filterForm.markCase" placeholder="None" class="w-full">
                  <el-option label="None" value="none" />
                </el-select>
              </el-form-item>

              <el-form-item label="Hide Skip">
                <el-select v-model="filterForm.hideSkip" placeholder="None" class="w-full">
                  <el-option label="None" value="none" />
                  <el-option label="No" value="no" />
                  <el-option label="Yes" value="yes" />
                </el-select>
              </el-form-item>

              <el-form-item label="Manuscript ID">
                <el-input v-model="filterForm.manuscriptId" placeholder="" />
              </el-form-item>

              <el-form-item label="DOI">
                <el-input v-model="filterForm.doi" placeholder="10.3390/xxxxxx" />
              </el-form-item>
            </template>
          </div>
        </el-form>

        <!-- Action Buttons -->
        <div class="panel-footer">
          <el-button type="primary" @click="handleSearch" style="background-color: #0156ce; border-color: #0156ce;">
            Search
          </el-button>
          <el-button @click="handleReset">Reset</el-button>
          <el-button @click="showAdvancedFilters = !showAdvancedFilters" type="text">
            {{ showAdvancedFilters ? 'Hide Options' : 'Advanced Search' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 表格面板 -->
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">Papers published (Data as of 2010)</span>
        <div class="flex gap-2">
          <el-button size="small">Export Report</el-button>
          <el-button size="small">Manuscript Report</el-button> 
        </div>
      </div>

      <div class="panel-body">
        <!-- 状态筛选 -->
        <div class="status-tabs mb-4">
          <a 
            v-for="filter in statusFilters"
            :key="filter.key"
            href="#"
            @click.prevent="activeStatus = filter.key"
            :class="['status-tab', { 'active': activeStatus === filter.key }]"
          >
            {{ filter.label }} ({{ filter.count.toLocaleString() }})
          </a>
        </div>

        <!-- 颜色标记说明 -->
        <div class="flex items-center justify-end gap-2 mb-4 text-xs flex-wrap">
          <span class="flex items-center gap-1" title="Two reports are received">
            <span class="w-3 h-3 inline-block" style="background-color: #ff9800;"></span>
            <span>Two reports are received</span>
          </span>
          <span class="flex items-center gap-1" title="At least three reports are received">
            <span class="w-3 h-3 inline-block" style="background-color: #ffeb3b;"></span>
            <span>At least three reports are received</span>
          </span>
          <span class="flex items-center gap-1" title="Academic editor decision done">
            <span class="w-3 h-3 inline-block" style="background-color: #4caf50;"></span>
            <span>Academic editor decision done</span>
          </span>
          <span class="flex items-center gap-1" title="New submission over 3 days">
            <span class="w-3 h-3 inline-block" style="background-color: #2196f3;"></span>
            <span>New submission over 3 days</span>
          </span>
          <span class="flex items-center gap-1" title="Abnormal Manuscripts">
            <span class="w-3 h-3 inline-block" style="background-color: #f44336;"></span>
            <span>Abnormal Manuscripts</span>
          </span>
          <span class="flex items-center gap-1" title="Free paper">
            <span class="w-3 h-3 inline-block" style="background-color: #9c27b0;"></span>
            <span>Free paper</span>
          </span>
          <span class="flex items-center gap-1" title="CN or TW hospital">
            <span class="w-3 h-3 inline-block" style="background-color: #00bcd4;"></span>
            <span>CN or TW hospital</span>
          </span>
        </div>

        <!-- 表格容器 -->
        <DataTable
          :columns="allColumns"
          :data="sortedManuscripts"
          :sort-key="sortKey"
          :sort-order="sortOrder"
          @sort-change="handleSortChange"
        >
          <template #cell-journal="{ row }">
            <div>{{ row.journal }}</div>
          </template>

          <template #cell-section="{ row }">
            <div class="space-y-0.5">
              <div v-if="row.proceedingName">
                <strong>PN:</strong> {{ row.proceedingName }}
              </div>
              <div v-if="row.section">
                <strong>S:</strong> {{ row.section }}
              </div>
              <div v-if="row.specialIssue">
                <strong>SI:</strong> {{ row.specialIssue }}
              </div>
              <div v-if="row.topic">
                <strong>T:</strong> {{ row.topic }}
              </div>
            </div>
          </template>

          <template #cell-title="{ row }">
            <a href="#" class="text-primary hover:underline">{{ row.title }}</a>
          </template>

          <template #cell-manuscriptId="{ row }">
            <div class="flex items-center gap-1 flex-wrap">
              <a
                href="#"
                :class="['font-medium hover:underline inline-block px-1.5 py-0.5 rounded', getColorMarkClass(row.colorMark)]"
              >
                {{ row.manuscriptId }}
              </a>
              <span
                v-for="(tag, index) in row.tags"
                :key="index"
                :class="['tooltip-info', tag.isBadge ? 'label-system-cursor badge-sign' : 'sup']"
                :style="{ 
                  background: tag.color || 'transparent', 
                  fontSize: tag.isBadge ? '10px' : '11px',
                  padding: tag.isBadge ? '2px 4px' : '1px 3px',
                  borderRadius: '3px',
                  color: tag.color ? '#fff' : 'inherit',
                  fontWeight: '600',
                  lineHeight: '1',
                  display: 'inline-block',
                  verticalAlign: 'super',
                  cursor: 'help'
                }"
                :title="tag.title"
              >
                {{ tag.text }}
              </span>
            </div>
          </template>

          <template #cell-articleType="{ row }">
            <div>{{ row.articleType }}</div>
          </template>

          <template #cell-assignedEditor="{ row }">
            <div>{{ row.assignedEditor }}</div>
          </template>

          <template #cell-status="{ row }">
            <div>{{ row.status }}</div>
          </template>

          <template #cell-submissionDate="{ row }">
            {{ formatDate(row.submissionDate) }}
          </template>

          <template #cell-lastAction="{ row }">
            {{ row.publishDate ? formatDate(row.publishDate) : (row.rejectedDate ? formatDate(row.rejectedDate) : formatDateTime(row.lastAction)) }}
          </template>

          <template #cell-days="{ row }">
            <div v-if="row.submissionDays" :class="['font-medium', getDaysColorClass(row.submissionDays)]">
              {{ row.submissionDays }}d
            </div>
          </template>

          <template #cell-operations="{ row }">
            <div class="flex items-center justify-center gap-2">
              <button class="text-primary hover:text-blue-700 inline-flex" title="Edit Manuscript">
                <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
              </button>
              <button class="text-gray-600 hover:text-gray-900 inline-flex" title="Add Notes">
                <span class="material-symbols-outlined" style="font-size: 18px;">add_notes</span>
              </button>
              <button
                v-if="row.isMarkedCase"
                class="text-yellow-600 hover:text-yellow-700 inline-flex"
                title="Cancel the case"
              >
                <span class="material-symbols-outlined" style="font-size: 18px; font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;">bookmark</span>
              </button>
              <button
                v-else
                class="text-gray-400 hover:text-yellow-600 inline-flex"
                title="Mark as a case"
              >
                <span class="material-symbols-outlined" style="font-size: 18px;">bookmark</span>
              </button>
            </div>
          </template>

          <template #empty>
            <div class="text-center py-12">
              <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p class="text-gray-500 font-medium">No data available</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import DataTable from './DataTable.vue'

// Assigned Journals 数据
const isJournalsExpanded = ref(true)
const journals = ref([
  { id: 1, name: 'Nature Medicine', count: 23 },
  { id: 2, name: 'Science Reviews', count: 15 },
  { id: 3, name: 'Environmental Science', count: 8 },
  { id: 4, name: 'Materials Today', count: 12 },
  { id: 5, name: 'Genome Biology', count: 19 },
  { id: 6, name: 'Physics Letters', count: 5 },
])

// 高级搜索展开状态
const showAdvancedFilters = ref(false)

// 状态筛选
const activeStatus = ref('all')
const statusFilters = [
  { key: 'all', label: 'All', count: 1990468 },
  { key: 'newSubmissions', label: 'New Submissions', count: 7206 },
  { key: 'pendingRejection', label: 'Pending Rejection', count: 103 },
  { key: 'underProcessing', label: 'Under Processing', count: 46342 },
  { key: 'finalizing', label: 'Finalizing', count: 6532 },
  { key: 'published', label: 'Published', count: 912553 },
  { key: 'rejectedArchived', label: 'Rejected & Archived', count: 1017732 },
]

// 筛选器表单
const filterForm = reactive({
  journal: [],
  section: [],
  specialIssue: null,
  siEditor: [],
  articleType: 'all',
  manuscriptOwner: [],
  assignedEditor: [],
  assignmentDate: null,
  manuscriptStatus: [],
  manuscriptTitle: '',
  manuscriptAuthor: '',
  submittingAuthorCountry: 'all',
  submissionDate: null,
  qcStatus: 'all',
  proofreadingMethod: 'all',
  labels: [],
  lastAction: null,
  reportOverallRecommendation: 'all',
  recruitingReviewers: 'all',
  openReview: 'all',
  watcher: 'all',
  resubmission: 'all',
  readyPublish: 'all',
  decisionRequestDate: null,
  pendingFirstDecisionChoice: 'all',
  decisionStatus: 'all',
  revisionRequestDate: null,
  revisionDueDate: null,
  revisionStatus: 'all',
  invitedReviewerMin: null,
  invitedReviewerMax: null,
  validReviewerMin: null,
  validReviewerMax: null,
  agreedReviewerMin: null,
  agreedReviewerMax: null,
  receivedReportMin: null,
  receivedReportMax: null,
  submissionRevisionDate: null,
  rejectedStatus: 'all',
  publishedDate: null,
  paymentDone: 'all',
  hasVideoAbstract: 'all',
  hasVideoFile: 'all',
  pcSubject: 'all',
  topicName: '',
  hideProceedings: 'none',
  proceedingName: '',
  markCase: 'none',
  hideSkip: 'none',
  manuscriptId: '',
  doi: ''
})

// 表格数据
const manuscripts = ref([
  {
    id: 'MS001',
    title: 'Deep Learning Approaches for Medical Image Analysis',
    manuscriptId: 'SUSY-000001',
    articleType: 'Research Article',
    assignedEditor: 'Dr. Smith',
    manuscriptOwner: 'Dr. Anderson',
    proofreadingEditor: 'Yes',
    status: 'Under Processing',
    submissionDate: '2024-01-15',
    journal: 'Nature Medicine',
    section: 'AI & Healthcare',
    specialIssue: 'Machine Learning in Medicine',
    topic: 'Deep Learning',
    proceedingName: '',
    lastAction: '2024-03-01',
    publishDate: null,
    rejectedDate: null,
    submissionDays: 45,
    priority: 'high',
    colorMark: 'red',
    isMarkedCase: true,
    tags: [
      { text: 'CN', color: 'orange', title: 'Corresponding author is from China' },
      { text: 'OPR', color: '#87CEEB', title: 'Open Peer Review', isBadge: true },
      { text: 'QC', color: '#067B06', title: 'Quality Check Passed', isBadge: true }
    ]
  },
  {
    id: 'MS002',
    title: 'Novel Quantum Computing Applications',
    manuscriptId: 'SUSY-000002',
    articleType: 'Review',
    assignedEditor: 'Dr. Johnson',
    manuscriptOwner: 'Dr. Lee',
    proofreadingEditor: 'No',
    status: 'Under Review',
    submissionDate: '2024-01-20',
    journal: 'Science Reviews',
    section: 'Quantum Computing',
    specialIssue: '',
    topic: 'Quantum Algorithms',
    proceedingName: '',
    lastAction: '2024-02-28',
    publishDate: null,
    rejectedDate: null,
    submissionDays: 35,
    priority: 'medium',
    colorMark: 'orange',
    isMarkedCase: false,
    tags: [
      { text: 'AU', color: '', title: 'Corresponding author is from Australia' },
      { text: 'OoS', color: '#DDDD08', title: 'Out of Scope', isBadge: true }
    ]
  },
  {
    id: 'MS003',
    title: 'Climate Change Impact on Marine Ecosystems',
    manuscriptId: 'SUSY-000003',
    articleType: 'Research Article',
    assignedEditor: 'Dr. Williams',
    manuscriptOwner: 'Dr. Chen',
    proofreadingEditor: 'Dr. Martinez',
    status: 'Published',
    submissionDate: '2024-01-10',
    journal: 'Environmental Science',
    section: 'Climate & Environment',
    specialIssue: 'Ocean Conservation',
    topic: '',
    proceedingName: '',
    lastAction: '2024-02-15',
    publishDate: '2024-02-20',
    rejectedDate: null,
    submissionDays: 25,
    priority: 'low',
    colorMark: 'green',
    isMarkedCase: false,
    tags: [
      { text: 'CN', color: 'orange', title: 'Corresponding author is from China' },
      { text: 'QC', color: '#067B06', title: 'Quality Check Passed', isBadge: true }
    ]
  },
  {
    id: 'MS004',
    title: 'Advanced Materials for Sustainable Energy',
    manuscriptId: 'SUSY-000004',
    articleType: 'Research Article',
    assignedEditor: 'Dr. Brown',
    manuscriptOwner: 'Dr. Taylor',
    proofreadingEditor: 'No',
    status: 'New Submission',
    submissionDate: '2024-03-01',
    journal: 'Materials Today',
    section: 'Energy Materials',
    specialIssue: '',
    topic: 'Renewable Energy',
    proceedingName: 'ICSE 2024',
    lastAction: '2024-03-01',
    publishDate: null,
    rejectedDate: null,
    submissionDays: 5,
    priority: 'high',
    colorMark: 'blue',
    isMarkedCase: false,
    tags: [
      { text: 'OPR', color: '#87CEEB', title: 'Open Peer Review', isBadge: true }
    ]
  },
  {
    id: 'MS005',
    title: 'Genetic Engineering Breakthrough',
    manuscriptId: 'SUSY-000005',
    articleType: 'Research Article',
    assignedEditor: 'Dr. Davis',
    manuscriptOwner: 'Dr. Wilson',
    proofreadingEditor: 'Dr. Garcia',
    status: 'Finalizing',
    submissionDate: '2024-02-05',
    journal: 'Genome Biology',
    section: 'Genetics',
    specialIssue: 'CRISPR Technology',
    topic: 'Gene Editing',
    proceedingName: '',
    lastAction: '2024-02-28',
    publishDate: null,
    rejectedDate: null,
    submissionDays: 28,
    priority: 'high',
    colorMark: 'yellow',
    isMarkedCase: true,
    tags: [
      { text: 'AU', color: '', title: 'Corresponding author is from Australia' },
      { text: 'OoS', color: '#DDDD08', title: 'Out of Scope', isBadge: true },
      { text: 'QC', color: '#067B06', title: 'Quality Check Passed', isBadge: true }
    ]
  },
])

// 表格排序
const sortKey = ref('submissionDate')
const sortOrder = ref('desc')

const allColumns = [
  { key: 'journal', label: 'Journal', sortable: true, style: 'width: 7%;' },
  { key: 'section', label: 'Section/Special Issue/Topic', sortable: false, style: 'width: 11%;' },
  { key: 'title', label: 'Title', sortable: true, style: 'width: 20%;' },
  { key: 'manuscriptId', label: 'Manuscript-ID', sortable: true, style: 'width: 9%;' },
  { key: 'articleType', label: 'Article Type', sortable: true, style: 'width: 8%;' },
  { key: 'assignedEditor', label: 'Assigned Editor', sortable: true, style: 'width: 8%;' },
  { key: 'status', label: 'Status', sortable: true, style: 'width: 9%;' },
  { key: 'submissionDate', label: 'Submission Date', sortable: true, style: 'width: 8%;' },
  { key: 'lastAction', label: 'Last Action', sortable: true, style: 'width: 9%;' },
  { key: 'days', label: 'APT', sortable: true, style: 'width: 4%;' },
  { key: 'operations', label: 'Action', sortable: false, style: 'width: 7%;' },
]

const sortedManuscripts = computed(() => {
  const sorted = [...manuscripts.value].sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]

    if (typeof aVal === 'string') {
      return sortOrder.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
  })

  return sorted
})

const handleSortChange = ({ key, order }) => {
  sortKey.value = key
  sortOrder.value = order
}

const handleSearch = () => {
  console.log('Search with filters:', filterForm)
}

const handleReset = () => {
  filterForm.journal = []
  filterForm.section = []
  filterForm.specialIssue = null
  filterForm.siEditor = []
  filterForm.articleType = 'all'
  filterForm.manuscriptOwner = []
  filterForm.assignedEditor = []
  filterForm.assignmentDate = null
  filterForm.manuscriptStatus = []
  filterForm.manuscriptTitle = ''
  filterForm.manuscriptAuthor = ''
  filterForm.submittingAuthorCountry = 'all'
  filterForm.submissionDate = null
  filterForm.qcStatus = 'all'
  filterForm.proofreadingMethod = 'all'
  filterForm.labels = []
  filterForm.lastAction = null
  filterForm.reportOverallRecommendation = 'all'
  filterForm.recruitingReviewers = 'all'
  filterForm.openReview = 'all'
  filterForm.watcher = 'all'
  filterForm.resubmission = 'all'
  filterForm.readyPublish = 'all'
  filterForm.decisionRequestDate = null
  filterForm.pendingFirstDecisionChoice = 'all'
  filterForm.decisionStatus = 'all'
  filterForm.revisionRequestDate = null
  filterForm.revisionDueDate = null
  filterForm.revisionStatus = 'all'
  filterForm.invitedReviewerMin = null
  filterForm.invitedReviewerMax = null
  filterForm.validReviewerMin = null
  filterForm.validReviewerMax = null
  filterForm.agreedReviewerMin = null
  filterForm.agreedReviewerMax = null
  filterForm.receivedReportMin = null
  filterForm.receivedReportMax = null
  filterForm.submissionRevisionDate = null
  filterForm.rejectedStatus = 'all'
  filterForm.publishedDate = null
  filterForm.paymentDone = 'all'
  filterForm.hasVideoAbstract = 'all'
  filterForm.hasVideoFile = 'all'
  filterForm.pcSubject = 'all'
  filterForm.topicName = ''
  filterForm.hideProceedings = 'none'
  filterForm.proceedingName = ''
  filterForm.markCase = 'none'
  filterForm.hideSkip = 'none'
  filterForm.manuscriptId = ''
  filterForm.doi = ''
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const getDaysColorClass = (days) => {
  if (days > 40) return 'text-red-600'
  if (days > 30) return 'text-orange-600'
  return 'text-green-600'
}

const getColorMarkClass = (colorMark) => {
  const colorMap = {
    'orange': 'bg-[#ff9800] text-white',
    'yellow': 'bg-[#ffeb3b] text-gray-900',
    'green': 'bg-[#4caf50] text-white',
    'blue': 'bg-[#2196f3] text-white',
    'red': 'bg-[#f44336] text-white',
    'purple': 'bg-[#9c27b0] text-white',
    'cyan': 'bg-[#00bcd4] text-white'
  }
  return colorMark ? colorMap[colorMark] || 'text-primary' : 'text-primary'
}
</script>

<style scoped>
.filter-grid {
  display: grid;
  gap: 0.75rem 2rem;
  grid-template-columns: 1fr;
  max-width: 100%;
}

/* 最多3列 */
@media (min-width: 1600px) {
  .filter-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1100px) and (max-width: 1599px) {
  .filter-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

:deep(.el-form-item) {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

:deep(.el-form-item__label) {
  color: #172b4d;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  white-space: normal;
  word-wrap: break-word;
  width: 100% !important;
  /* padding: 0 0 6px 0; */
  line-height: 1.3;
  display: block;
}

:deep(.el-form-item__content) {
  width: 100%;
  margin-left: 0 !important;
}

:deep(.el-input),
:deep(.el-select),
:deep(.el-date-editor) {
  width: 100%;
}

:deep(.el-date-editor .el-range-separator) {
  padding: 0 5px;
  line-height: 32px;
  width: auto;
  color: #606266;
}

:deep(.el-date-editor .el-range-input) {
  width: 39%;
}

:deep(.el-button--primary) {
  background-color: #0156ce;
  border-color: #0156ce;
}

:deep(.el-button--primary:hover) {
  background-color: #014bb5;
  border-color: #014bb5;
}

.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  /* border-bottom: 2px solid #e5e7eb; */
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
  /* background-color: #f9fafb; */
}

.status-tab.active {
  color: #0156ce;
  border-bottom-color: #0156ce;
  font-weight: 600;
}

.view-mode-switch {
  display: flex;
  align-items: center;
}

.number-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.number-range :deep(.el-input-number) {
  flex: 1;
  width: 100%;
}

.range-separator {
  color: #626f86;
  font-weight: 500;
}

/* 紧凑表格样式 */
.table-compact {
  table-layout: fixed;
}

.table-compact th,
.table-compact td {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>

<template>
  <div>
    <!-- Tab 标签页 -->
    <div class="tabs-container mb-4">
      <nav class="tabs" role="navigation" aria-label="Manuscript tabs">
        <a 
          href="#process" 
          :class="['tab-link', { 'active': activeTab === 'process' }]"
          @click.prevent="activeTab = 'process'"
          role="tab"
          :aria-selected="activeTab === 'process'"
        >
          Process Manuscript
        </a>
        <span class="tab-separator">|</span>
        <a 
          href="#finalize" 
          :class="['tab-link', { 'active': activeTab === 'finalize' }]"
          @click.prevent="activeTab = 'finalize'"
          role="tab"
          :aria-selected="activeTab === 'finalize'"
        >
          Finalize Manuscript
        </a>
        <span class="tab-separator">|</span>
        <a 
          href="#summary" 
          :class="['tab-link', { 'active': activeTab === 'summary' }]"
          @click.prevent="activeTab = 'summary'"
          role="tab"
          :aria-selected="activeTab === 'summary'"
        >
          Manuscript Summary
        </a>
      </nav>
    </div>

    <!-- 页面头部 - Manuscript Overview -->
    <div class="panel mb-4">
      <div class="panel-header">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-4">
            <span class="panel-title">{{ manuscript.manuscriptId }}</span>
            <span :class="['badge', getStatusBadgeClass(manuscript.status)]">{{ manuscript.status }}</span>
          </div>
          <!-- <div class="flex gap-2">
            <el-button size="small">Send Email</el-button>
            <el-button size="small" type="danger">Reject</el-button>
            <el-button size="small" type="primary">Accept</el-button>
          </div> -->
        </div>
      </div>
      <div class="panel-body">
        <h2 class="manuscript-title">{{ manuscript.title }}</h2>
      </div>
    </div>

    <!-- Manuscript Information Section -->
    <div class="panel mb-4">
      <div class="panel-header">
        <span class="panel-title">Manuscript Information</span>
      </div>
      <div class="panel-body">
        <!-- 两列布局 -->
        <div class="two-column-layout">
          <!-- 左列：稳定内容（What it is） -->
          <div class="left-column">
            <!-- A1: 元数据 Manuscript Metadata -->
            <div class="inner-section mb-4">
              <div class="inner-section-header">
                <span class="inner-section-title">Manuscript Metadata</span>
              </div>
              <div class="inner-section-body">
            <div class="info-grid">
              <div class="info-item">
                <label>Manuscript ID:</label>
                <span>{{ manuscript.manuscriptId }}</span>
              </div>
              <div class="info-item">
                <label>DOI:</label>
                <span>{{ manuscript.doi || 'Not assigned' }}</span>
              </div>
              <div class="info-item">
                <label>Manuscript Status:</label>
                <span >{{ manuscript.status }}</span>
              </div>
              <div class="info-item">
                <label>Title:</label>
                <span>{{ manuscript.title }}</span>
              </div>
              <div class="info-item">
                <label>Labels:</label>
                <div class="flex gap-1 flex-wrap">
                  <span v-for="label in manuscript.labels" :key="label" class="label-tag">{{ label }}</span>
                </div>
              </div>
              <div class="info-item">
                <label>Article Type:</label>
                <span>{{ manuscript.articleType }}</span>
              </div>
              <div class="info-item">
                <label>Big Review:</label>
                <span>{{ manuscript.bigReview ? 'Yes' : 'No' }}</span>
              </div>
              <div class="info-item">
                <label>Registered Reports Stage:</label>
                <span>{{ manuscript.registeredReportsStage || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <label>Journal:</label>
                <InlineEditSelect
                  v-model="manuscript.journal"
                  :options="journalOptions"
                  edit-aria-label="Edit journal"
                  save-aria-label="Save journal"
                  @save="handleInlineSave('journal', $event)"
                />
              </div>
              <div class="info-item">
                <label>Section:</label>
                <span>{{ manuscript.section }}</span>
              </div>
              <div class="info-item">
                <label>Special Issue:</label>
                <span>{{ manuscript.specialIssue || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <label>Topic:</label>
                <span>{{ manuscript.topic || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <label>Proceeding Name:</label>
                <span>{{ manuscript.proceedingName || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <label>File Type:</label>
                <span>{{ manuscript.fileType }}</span>
              </div>
              <div class="info-item">
                <label>Number of Pages:</label>
                <span>{{ manuscript.numberOfPages }}</span>
              </div>
              <div class="info-item">
                <label>Manuscript Source:</label>
                <span>{{ manuscript.manuscriptSource }}</span>
              </div>
              <div class="info-item">
                <label>Author Contributions:</label>
                <span>{{ manuscript.authorContributions || 'Not provided' }}</span>
              </div>
              <div class="info-item">
                <label>Manuscript Owner:</label>
                <span>{{ manuscript.manuscriptOwner || 'Not assigned' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- A2: 作者信息 Authors -->
        <div class="inner-section mb-4">
          <div class="inner-section-header">
            <span class="inner-section-title">Authors</span>
          </div>
          <div class="inner-section-body">
            <div class="info-grid">
              <div class="info-item">
                <label>Submitting Author:</label>
                <span>{{ manuscript.submittingAuthor }}</span>
              </div>
              <div class="info-item">
                <label>All Authors:</label>
                <span>{{ manuscript.authors }}</span>
              </div>
              <div class="info-item" v-if="manuscript.blockedEmployeeWarning">
                <label>Blocked Employee Warning:</label>
                <span class="text-danger">⚠ {{ manuscript.blockedEmployeeWarning }}</span>
              </div>
              <div class="info-item" v-if="manuscript.membershipMismatch">
                <label>Membership Mismatch:</label>
                <span class="text-warning">⚠ Warning</span>
              </div>
              <div class="info-item" v-if="manuscript.authorRoles">
                <label>Author Roles (EiC/GE):</label>
                <span>{{ manuscript.authorRoles }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- A3: 文件资源 Files -->
        <div class="inner-section mb-4">
          <div class="inner-section-header">
            <span class="inner-section-title">Files</span>
          </div>
          <div class="inner-section-body">
            <div class="file-list">
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">description</span>
                <div class="file-info">
                  <div class="file-name">Manuscript (Word)</div>
                  <div class="file-meta">manuscript.docx • 2.5 MB • 2024-01-15</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">picture_as_pdf</span>
                <div class="file-info">
                  <div class="file-name">Manuscript PDF</div>
                  <div class="file-meta">manuscript.pdf • 1.8 MB • 2024-01-15</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">description</span>
                <div class="file-info">
                  <div class="file-name">Permission File</div>
                  <div class="file-meta">permissions.pdf • 256 KB • 2024-01-15</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">folder</span>
                <div class="file-info">
                  <div class="file-name">Supplementary Materials</div>
                  <div class="file-meta">supplementary.zip • 5.2 MB • 2024-01-15</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">description</span>
                <div class="file-info">
                  <div class="file-name">Final Format</div>
                  <div class="file-meta">final_format.pdf • 2.1 MB</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">description</span>
                <div class="file-info">
                  <div class="file-name">Author Appeal (Rebuttal)</div>
                  <div class="file-meta">rebuttal.pdf • 450 KB</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">description</span>
                <div class="file-info">
                  <div class="file-name">Rebuttal Comments</div>
                  <div class="file-meta">comments.pdf • 180 KB</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">image</span>
                <div class="file-info">
                  <div class="file-name">Graphical Abstract</div>
                  <div class="file-meta">graphical_abstract.png • 1.2 MB</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">image</span>
                <div class="file-info">
                  <div class="file-name">GA Figure</div>
                  <div class="file-meta">ga_figure.jpg • 890 KB</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">description</span>
                <div class="file-info">
                  <div class="file-name">English Pre-edit File</div>
                  <div class="file-meta">pre_edit.docx • 2.3 MB</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">collections</span>
                <div class="file-info">
                  <div class="file-name">Figures / Graphics / Images</div>
                  <div class="file-meta">figures.zip • 8.5 MB</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">folder</span>
                <div class="file-info">
                  <div class="file-name">Non-published Material</div>
                  <div class="file-meta">non_published.zip • 3.2 MB</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">description</span>
                <div class="file-info">
                  <div class="file-name">Authorship Form File</div>
                  <div class="file-meta">authorship_form.pdf • 320 KB</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">archive</span>
                <div class="file-info">
                  <div class="file-name">Final Archive</div>
                  <div class="file-meta">final_archive.zip • 15.8 MB</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">mail</span>
                <div class="file-info">
                  <div class="file-name">Cover Letter</div>
                  <div class="file-meta">cover_letter.pdf • 156 KB • 2024-01-15</div>
                </div>
                <el-button size="small" text>Download</el-button>
              </div>
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">link</span>
                <div class="file-info">
                  <div class="file-name">Externally Hosted Supplementary Files</div>
                  <div class="file-meta">Link: https://example.com/data</div>
                </div>
                <el-button size="small" text>Open</el-button>
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <el-button size="small">
                <span class="material-symbols-outlined" style="font-size: 16px; margin-right: 4px;">upload</span>
                Upload Manuscript
              </el-button>
              <el-button size="small" text>Display Log</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右列：动态内容（What to do） -->
      <div class="right-column">
        <!-- B1: 状态流程 Process -->
        <div class="inner-section mb-4">
          <div class="inner-section-header">
            <span class="inner-section-title">Status & Process</span>
          </div>
          <div class="inner-section-body">
            <div class="info-grid">
              <div class="info-item">
                <label>Current Status:</label>
                <InlineEditSelect
                  v-model="manuscript.status"
                  :options="statusOptions"
                  edit-aria-label="Edit status"
                  save-aria-label="Save status"
                  @save="handleInlineSave('status', $event)"
                />
              </div>
              <div class="info-item" v-if="manuscript.rejectionReason">
                <label>Rejection Reason:</label>
                <span>{{ manuscript.rejectionReason }}</span>
              </div>
              <div class="info-item" v-if="manuscript.pendingRejectionReason">
                <label>Pending Rejection Reason:</label>
                <span class="text-warning">{{ manuscript.pendingRejectionReason }}</span>
              </div>
              <div class="info-item" v-if="manuscript.withdrawalReason">
                <label>Withdrawal Reason:</label>
                <span>{{ manuscript.withdrawalReason }}</span>
              </div>
              <div class="info-item">
                <label>Submission Received:</label>
                <span>{{ manuscript.submissionDate }} ({{ manuscript.submissionDays }} days passed)</span>
              </div>
              <div class="info-item">
                <label>Major Revision Count:</label>
                <span>{{ manuscript.majorRevisionCount }}</span>
              </div>
              <div class="info-item" v-if="manuscript.acceptedDate">
                <label>Accepted Date:</label>
                <span>{{ manuscript.acceptedDate }}</span>
              </div>
              <div class="info-item" v-if="manuscript.publishedDate">
                <label>Published Date:</label>
                <span>{{ manuscript.publishedDate }}</span>
              </div>
              <div class="info-item">
                <label>Ready Publish:</label>
                <el-switch v-model="manuscript.readyPublish" />
              </div>
            </div>
          </div>
        </div>

        <!-- B2: 人员角色 People -->
        <div class="inner-section mb-4">
          <div class="inner-section-header">
            <span class="inner-section-title">People & Roles</span>
          </div>
          <div class="inner-section-body">
            <div class="info-grid">
              <div class="info-item">
                <label>Assigned Editor:</label>
                <InlineEditSelect
                  v-model="manuscript.assignedEditor"
                  :options="assignedEditorOptions"
                  filterable
                  edit-aria-label="Edit assigned editor"
                  save-aria-label="Save assigned editor"
                  @save="handleInlineSave('assignedEditor', $event)"
                />
              </div>
              <div class="info-item">
                <label>Proofread Editor Send Proof:</label>
                <span>{{ manuscript.proofreadEditorSendProof ? 'Yes' : 'No' }}</span>
              </div>
              <div class="info-item">
                <label>Assigned Proofreading Editor:</label>
                <span>{{ manuscript.assignedProofreadingEditor || 'Not assigned' }}</span>
              </div>
              <div class="info-item" v-if="manuscript.assignedPreDate">
                <label>Assigned PrE Date:</label>
                <span>{{ manuscript.assignedPreDate }}</span>
              </div>
              <div class="info-item">
                <label>Assigned English Editor:</label>
                <span>{{ manuscript.assignedEnglishEditor || 'Not assigned' }}</span>
              </div>
              <div class="info-item">
                <label>Watchers:</label>
                <span>{{ manuscript.watchers || 'None' }}</span>
              </div>
              <div class="info-item" v-if="manuscript.topicOverseer">
                <label>Topic's Overseer:</label>
                <span>{{ manuscript.topicOverseer }}</span>
              </div>
              <div class="info-item" v-if="manuscript.guestEditors">
                <label>Guest Editors (SI/Topic):</label>
                <span>{{ manuscript.guestEditors }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- B3: 审稿与检查 Review / QC -->
        <div class="inner-section mb-4">
          <div class="inner-section-header">
            <span class="inner-section-title">Review & Quality Check</span>
          </div>
          <div class="inner-section-body">
            <div class="info-grid">
              <div class="info-item">
                <label>Open Peer Review:</label>
                <span>{{ manuscript.openPeerReview ? 'Yes' : 'No' }}</span>
              </div>
              <div class="info-item">
                <label>Recruiting Reviewers:</label>
                <span>{{ manuscript.recruitingReviewers ? 'Active' : 'Inactive' }}</span>
              </div>
              <div class="info-item">
                <label>Rebuttal Upload:</label>
                <span>{{ manuscript.rebuttalUpload ? 'Uploaded' : 'Not uploaded' }}</span>
              </div>
              <div class="info-item">
                <label>English Editing Wording:</label>
                <!-- <span :class="manuscript.englishEditingWording === 'blue' ? 'text-blue-600' : 'text-orange-600'">
                  {{ manuscript.englishEditingWording === 'blue' ? '🔵 Blue dot' : '🟠 Orange dot' }}
                </span> -->
              </div>
              <div class="info-item">
                <label>Submission Days (AE SLA):</label>
                <span>{{ manuscript.submissionDays }} days</span>
              </div>
              <div class="info-item">
                <label>QC Passed:</label>
                <span :class="manuscript.qcPassed ? 'text-success' : 'text-danger'">
                  {{ manuscript.qcPassed ? '✓ Passed' : '✗ Not Passed' }}
                </span>
              </div>
              <div class="info-item" v-if="manuscript.qcComment">
                <label>QC Comment:</label>
                <span>{{ manuscript.qcComment }}</span>
              </div>
              <div class="info-item">
                <label>Funding Information:</label>
                <span>{{ manuscript.fundingInformation || 'Not provided' }}</span>
              </div>
              <div class="info-item">
                <label>Data Availability Statement:</label>
                <span>{{ manuscript.dataAvailabilityStatement || 'Not provided' }}</span>
              </div>
              <div class="info-item" v-if="manuscript.ccdcDepositionNumber">
                <label>CCDC Deposition Number:</label>
                <span>{{ manuscript.ccdcDepositionNumber }}</span>
              </div>
              <div class="info-item">
                <label>Conflict of Interests:</label>
                <span>{{ manuscript.conflictOfInterests || 'None declared' }}</span>
              </div>
              <div class="info-item">
                <label>Published Elsewhere:</label>
                <span>{{ manuscript.publishedElsewhere ? 'Yes' : 'No' }}</span>
              </div>
              <div class="info-item">
                <label>Ethics Issues:</label>
                <span :class="manuscript.ethicsIssues ? 'text-danger' : 'text-success'">
                  {{ manuscript.ethicsIssues ? '⚠ Issues detected' : '✓ No issues' }}
                </span>
              </div>
              <div class="info-item">
                <label>Harmful Topics:</label>
                <span :class="manuscript.harmfulTopics ? 'text-danger' : 'text-success'">
                  {{ manuscript.harmfulTopics ? '⚠ Detected' : '✓ Clear' }}
                </span>
              </div>
              <div class="info-item">
                <label>Controversial Topics:</label>
                <span :class="manuscript.controversialTopics ? 'text-warning' : 'text-success'">
                  {{ manuscript.controversialTopics ? '⚠ Detected' : '✓ Clear' }}
                </span>
              </div>
              <div class="info-item">
                <label>Country Watchlists:</label>
                <span :class="manuscript.countryWatchlists ? 'text-warning' : 'text-success'">
                  {{ manuscript.countryWatchlists ? '⚠ On watchlist' : '✓ Clear' }}
                </span>
              </div>
              <div class="info-item">
                <label>Publicly Available Datasets:</label>
                <span>{{ manuscript.publiclyAvailableDatasets ? 'Yes' : 'No' }}</span>
              </div>
              <div class="info-item">
                <label>Tortured Phrase Detection:</label>
                <span :class="manuscript.torturedPhraseDetection ? 'text-danger' : 'text-success'">
                  {{ manuscript.torturedPhraseDetection ? '⚠ Detected' : '✓ Clear' }}
                </span>
              </div>
              <div class="info-item">
                <label>Additional Manuscript Attributes:</label>
                <span>{{ manuscript.additionalManuscriptAttributes || 'None' }}</span>
              </div>
              <div class="info-item">
                <label>Pre-peer-review Check (whitelist):</label>
                <span :class="manuscript.prePeerReviewCheck ? 'text-success' : 'text-warning'">
                  {{ manuscript.prePeerReviewCheck ? '✓ Passed' : '⚠ Pending' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- B4: 生产与出版 Production -->
        <div class="inner-section mb-4">
          <div class="inner-section-header">
            <span class="inner-section-title">Production & Publishing</span>
          </div>
          <div class="inner-section-body">
            <div class="info-grid">
              <div class="info-item">
                <label>Proofig (First):</label>
                <span>{{ manuscript.proofigFirst || 'Pending' }}</span>
              </div>
              <div class="info-item">
                <label>Proofig After Revision:</label>
                <span>{{ manuscript.proofigAfterRevision || 'Pending' }}</span>
              </div>
              <div class="info-item">
                <label>Layout Check (Merrin):</label>
                <span>{{ manuscript.layoutCheck || 'Pending' }}</span>
              </div>
              <div class="info-item">
                <label>Acceptance Certificate:</label>
                <div>
                  <span>{{ manuscript.acceptanceCertificate || 'Not generated' }}</span>
                  <el-button size="small" v-if="manuscript.acceptedDate" class="ml-2">Generate</el-button>
                </div>
              </div>
              <div class="info-item">
                <label>English Services Status (Author Services):</label>
                <span>{{ manuscript.englishServicesStatus || 'Not requested' }}</span>
              </div>
              <div class="info-item">
                <label>English Pre-edit Status (normal):</label>
                <span>{{ manuscript.englishPreEditStatus || 'Not requested' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- B5: Preprint -->
        <div class="inner-section mb-4">
          <div class="inner-section-header">
            <span class="inner-section-title">Preprint Publishing</span>
          </div>
          <div class="inner-section-body">
            <div class="info-grid">
              <div class="info-item">
                <label>Preprints Status:</label>
                <span>{{ manuscript.preprintsPosted ? 'Posted' : 'Not posted' }}</span>
              </div>
              <div class="info-item" v-if="manuscript.preprintsEmailSent">
                <label>Preprints Email Sent:</label>
                <span>{{ manuscript.preprintsEmailSent }}</span>
              </div>
              <div class="info-item" v-if="!manuscript.preprintsUploaded">
                <label>Preprints Not Uploaded:</label>
                <span class="text-warning">⚠ Not uploaded</span>
              </div>
              <div class="info-item" v-if="manuscript.preprintsCTAUpload">
                <label>Preprints CTA Upload:</label>
                <span>{{ manuscript.preprintsCTAUpload }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 历史记录 -->
        <div class="inner-section mb-4">
          <div class="inner-section-header">
            <span class="inner-section-title">Recent Activity</span>
          </div>
          <div class="inner-section-body">
            <div class="history-item" v-for="item in manuscript.history" :key="item.date">
              <span class="history-date">{{ item.date }}</span>
              <span class="history-text">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import InlineEditSelect from './InlineEditSelect.vue'

const activeTab = ref('process')

// 稿件数据 - 包含所有94个字段
const manuscript = reactive({
  // A1: 元数据 Manuscript Metadata
  manuscriptId: 'nutrients-4224751',
  doi: '10.3390/example2024',
  status: 'Under Review',
  title: 'Whey Proteins and Immunity: Mechanisms Underlying Immune System Reinforcement and Protection Against Viral and Bacterial Infections.  ',
  labels: ['OPR', 'PD'] ,
  articleType: 'Article',
  bigReview: false,
  registeredReportsStage: null,
  journal: 'nutrients',
  section: 'Nutritional Epidemiology',
  specialIssue: 'The Role of Bioactive Compounds in Human Health and Diseases (3rd Edition)',
  topic: 'Topic Name',
  proceedingName: null,
  fileType: 'DOC',
  numberOfPages: 25,
  numberOfWords:10086,
  manuscriptSource: 'Self-submission',
  authorContributions: 'JD: Conceptualization, Writing; JS: Data analysis',
  manuscriptOwner: 'Yoki He ',
  
  // A2: 作者信息 Authors
  submittingAuthor: 'Jean-François Lesgards (jf.lesgards@gmail.com) ',
  authors: 'Dr.	Jean-François Lesgards',
  blockedEmployeeWarning: null,
  membershipMismatch: false,
  authorRoles: 'No',
  
  // B1: 状态流程 Process
  rejectionReason: 'Test',
  pendingRejectionReason:'Test',
  withdrawalReason: 'Test',
  submissionDate: '2024-01-15',
  submissionDays: 45,
  majorRevisionCount: 0,
  acceptedDate:  '2024-01-15',
  publishedDate:  '2024-01-15',
  readyPublish: false,
  
  // B2: 人员角色 People
  assignedEditor: 'Livia Li (livia.li@mdpi.com) ',
  proofreadEditorSendProof: false,
  assignedProofreadingEditor: null,
  assignedPreDate: null,
  assignedEnglishEditor: null,
  watchers: '',
  topicOverseer: null,
  guestEditors: 'Jacqueline Isaura Alvarez-Leite',
  
  // B3: 审稿与检查 Review / QC
  openPeerReview: true,
  recruitingReviewers: true,
  rebuttalUpload: false,
  englishEditingWording: 'blue',
  qcPassed: true,
  qcComment: 'All checks passed',
  fundingInformation: 'No',
  dataAvailabilityStatement: 'The original contributions presented in this study are included in the article/supplementary material. Further inquiries can be directed to the corresponding author(s).',
  ccdcDepositionNumber: null,
  conflictOfInterests: 'Yes show more',
  publishedElsewhere: false,
  ethicsIssues: false,
  harmfulTopics: true,
  controversialTopics: true,
  countryWatchlists: true,
  publiclyAvailableDatasets: true,
  torturedPhraseDetection: false,
  additionalManuscriptAttributes: null,
  prePeerReviewCheck: true,
  
  // B4: 生产与出版 Production
  proofigFirst: 'Pending',
  proofigAfterRevision: 'Pending',
  layoutCheck: 'Pending',
  acceptanceCertificate: null,
  englishServicesStatus: 'Not requested',
  englishPreEditStatus: 'Not requested',
  
  // B5: Preprint
  preprintsPosted: false,
  preprintsEmailSent: null,
  preprintsUploaded: false,
  preprintsCTAUpload: null,
  
  // 历史记录
  history: [
    { date: '2024-01-15', text: 'Manuscript submitted' },
    { date: '2024-01-16', text: 'Initial screening completed' },
    { date: '2024-01-18', text: 'Assigned to Dr. Smith' },
    { date: '2024-01-20', text: 'QC check passed' },
    { date: '2024-02-01', text: 'Country watchlist flag raised' }
  ]
})

const journalOptions = [
  { label: 'nutrients', value: 'nutrients' },
  { label: 'Nature Medicine', value: 'Nature Medicine' }
]

const statusOptions = [
  { label: 'Under Processing', value: 'Under Processing' },
  { label: 'Under Review', value: 'Under Review' },
  { label: 'Accepted', value: 'Accepted' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Published', value: 'Published' }
]

const assignedEditorOptions = [
  { label: 'Livia Li (livia.li@mdpi.com)', value: 'Livia Li (livia.li@mdpi.com) ' },
  { label: 'Dr. Smith', value: 'Dr. Smith' },
  { label: 'Dr. Johnson', value: 'Dr. Johnson' }
]

const handleInlineSave = (field, value) => {
  console.log('Saved field:', field, value)
}

const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'Published': 'badge-success',
    'Under Processing': 'badge-info',
    'New Submission': 'badge-warning',
    'Finalizing': 'badge-info',
    'Under Review': 'badge-info',
    'Pending Rejection': 'badge-danger',
    'Accepted': 'badge-success',
    'Rejected': 'badge-danger'
  }
  return statusClasses[status] || 'badge-info'
}
</script>

<style scoped>
.tabs-container {
  background-color: #ffffff;
  border-bottom: 2px solid #e5e7eb;
  padding: 0 1.5rem;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 48px;
}

.tab-link {
  color: #626f86;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  height: 100%;
}

.tab-link.active {
  color: #0156ce;
  border-bottom-color: #0156ce;
  font-weight: 600;
}

.tab-separator {
  color: #e5e7eb;
  font-size: 14px;
  user-select: none;
}

/* 稿件标题 */
.manuscript-title {
  font-size: 18px;
  font-weight: 600;
  color: #172b4d;
  line-height: 1.4;
}

/* 两列布局 */
.two-column-layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 1400px) {
  .two-column-layout {
    grid-template-columns: 1.618fr 1fr;
  }
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
}

/* 信息网格 */
.info-grid {
  display: grid;
  gap: 0.75rem;
}

.info-item {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 0.75rem;
  font-size: 14px;
  align-items: start;
}

.info-item label {
  color: #626f86;
  font-weight: 500;
  padding-top: 2px;
}

.info-item span {
  color: #172b4d;
}

/* 标签 */
.label-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #e5e7eb;
  color: #172b4d;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 500;
}

/* 文件列表 */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background-color: #f9fafb;
}

.file-icon {
  color: #626f86;
  font-size: 24px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #172b4d;
}

.file-meta {
  font-size: 12px;
  color: #626f86;
  margin-top: 2px;
}

/* 警告区域 */
.warnings-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.warnings-title {
  font-size: 14px;
  font-weight: 600;
  color: #f59e0b;
  margin-bottom: 0.75rem;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #fef3c7;
  border-left: 3px solid #f59e0b;
  margin-bottom: 0.5rem;
  font-size: 13px;
  color: #92400e;
}

.warning-icon {
  color: #f59e0b;
  font-weight: 600;
}

/* 历史记录 */
.history-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  font-size: 13px;
  border-bottom: 1px solid #f3f4f6;
}

.history-item:last-child {
  border-bottom: none;
}

.history-date {
  color: #626f86;
  min-width: 90px;
  font-weight: 500;
}

.history-text {
  color: #172b4d;
}

/* 文本颜色工具类 */
.text-success {
  color: #10b981;
  font-weight: 500;
}

.text-danger {
  color: #ef4444;
  font-weight: 500;
}

.text-warning {
  color: #f59e0b;
  font-weight: 500;
}

/* 内部面板样式 - 简约风格 */
.inner-section {
  background-color: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.1);
  padding: 0.75rem 1rem;
}

.inner-section-header {
  margin-bottom: 0.75rem;
}

.inner-section-body {
  padding: 0;
}

.inner-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #172b4d;
}
</style>

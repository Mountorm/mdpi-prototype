<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h2>User Overview</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Tabs -->
      <div class="modal-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.email"
          :class="['tab-btn', { active: activeTab === tab.email }]"
          @click="activeTab = tab.email"
        >
          {{ tab.email }}
          <span v-if="!tab.registered" class="tab-status">(Unregistered)</span>
        </button>
      </div>

      <div class="modal-content">
        <!-- Anchor Nav -->
        <nav class="anchor-nav">
          <div class="anchor-nav-title">Sections</div>
          <a
            v-for="item in visibleNavItems"
            :key="item.id"
            :href="'#' + item.id"
            :class="['anchor-link', { active: activeSectionId === item.id }]"
            @click.prevent="scrollToSection(item.id)"
          >{{ item.label }}</a>
        </nav>

        <div ref="bodyRef" class="modal-body">

            <!-- 1. Account Info：始终展示（未注册仅邮箱行 + 退订） -->
            <div id="section-account-info">
              <UoSection title="Account Info" :defaultOpen="true">
                <div class="ov-item" style="padding:4px 0">
                  <div class="ov-row">
                    <span class="ov-email">{{ activeTab }}</span>
                    <a v-if="data.crmLink" :href="data.crmLink" target="_blank" class="link-btn">CRM</a>
                    <BellOff v-if="!data.registered" :size="14" class="bell-icon" />
                    <span v-if="data.isNorthKorea" style="margin-left:2px;color:#d93025">⚠</span>
                    <UoInfoTooltip v-if="data.isNorthKorea" text="This email is flagged as North Korea sensitive" />
                  </div>
                </div>

                <hr v-if="data.registeredUsers.length" class="ov-divider">

                <div v-for="(user, ui) in data.registeredUsers" :key="'u'+ui" class="ov-item">
                  <div class="ov-row">
                    <strong>{{ user.name }}</strong>
                    <span class="meta">{{ user.email }}</span>
                    <span v-if="user.isPrimary" class="badge badge-primary">Primary Account</span>
                  </div>
                  <div class="ov-info-line">
                    <template v-if="user.orcid">
                      ORCID: <a :href="user.orcidLink" target="_blank" class="link">{{ user.orcid }}</a>
                      <span class="ov-sep">|</span>
                    </template>
                    {{ user.fromApp }}
                    <span class="ov-sep">|</span>
                    {{ user.registeredTime }}
                    <span class="ov-sep">|</span>
                    IOAP: {{ user.ioapMembership }}
                  </div>
                  <div class="ov-row" style="margin-top:2px">
                    <BellOff :size="14" class="bell-icon" />
                    <span v-if="user.isNorthKorea" style="margin-left:2px;color:#d93025">⚠</span>
                  </div>
                  <div v-if="user.linkedEmails?.length" class="ov-subs">
                    <div v-for="(le, li) in user.linkedEmails" :key="'l'+li" class="ov-sub">
                      <span class="ov-sub-label">Linked:</span> {{ le.email }}
                      <span class="meta">— {{ le.fromApp }} · {{ le.dateAdd }}</span>
                    </div>
                  </div>
                  <div v-if="user.unlinkedEmails?.length" class="ov-subs">
                    <div v-for="(ue, ui2) in user.unlinkedEmails" :key="'ul'+ui2" class="ov-sub">
                      <span class="ov-sub-label">Unlinked:</span> {{ ue.email }}
                      <span class="meta">· {{ ue.removedTime }}</span>
                    </div>
                  </div>
                  <div v-if="user.removedEmails?.length" class="ov-subs">
                    <div v-for="(re, ri) in user.removedEmails" :key="'r'+ri" class="ov-sub">
                      <span class="ov-sub-label">Removed:</span> {{ re.email }}
                      <span class="meta">· {{ re.removedTime }}</span>
                    </div>
                  </div>
                  <div v-if="user.sameScopusEmails?.length || user.sameOrcidEmails?.length" class="ov-subs">
                    <div v-for="(se, si) in user.sameScopusEmails" :key="'ss'+si" class="ov-sub">
                      <span class="ov-sub-label">Same Scopus:</span> {{ se.email }}
                    </div>
                    <div v-for="(oe, oi) in user.sameOrcidEmails" :key="'so'+oi" class="ov-sub">
                      <span class="ov-sub-label">Same ORCID:</span> {{ oe.email }}
                    </div>
                  </div>
                  <div v-if="user.sameScholar?.length" class="suspected-same-scholar">
                    <div class="ss-header">
                      <span>Suspected Same Scholar</span>
                      <span class="ss-refresh">↻ refresh</span>
                    </div>
                    <p class="ss-tips">Potential different email addresses of the same author detected based on the same H-index / Scilit H-index URL.</p>
                    <a v-for="(sEmail, si) in user.sameScholar" :key="si" :href="'mailto:'+sEmail" class="ss-email">{{ sEmail }}</a>
                  </div>
                </div>
              </UoSection>
            </div>

            <!-- 2. Paid Invoices -->
            <div v-if="sectionVisible.paidInvoices" id="section-invoices">
              <UoSection title="Paid Invoices" :defaultOpen="true">
                <div v-for="(inv, ii) in data.paidInvoices" :key="ii" class="invoice-item">
                  <span class="label">Paid invoice {{ ii + 1 }}:</span>
                  <a :href="inv.link" target="_blank" class="link">{{ inv.formattedId }}</a>
                  <span class="meta">Amount: <strong>{{ inv.amount }} {{ inv.currency }}</strong></span>
                  <span class="meta">Paid Date: {{ inv.paidDate }}</span>
                </div>
              </UoSection>
            </div>

            <!-- 3. Submission Scholars -->
            <div v-if="sectionVisible.submissionScholars" id="section-scholars">
              <UoSection title="Submission Scholars" :defaultOpen="true">
                <div v-for="(scholar, si) in data.submissionScholars" :key="si" class="scholar-block">
                  <div class="scholar-header">
                    <strong>{{ scholar.titleString }} {{ scholar.name }}</strong>
                    <span class="meta">{{ scholar.email }}</span>
                    <span class="meta">Added: {{ scholar.createdAt }}</span>
                  </div>
                  <div class="role-list">
                    <div v-for="(role, ri) in scholar.roles" :key="ri" class="role-item">
                      <span class="role-name">{{ role.typeName }}</span>
                      <UoInfoTooltip :text="`${role.roleName}: ${role.reason}`" />
                    </div>
                  </div>
                </div>
              </UoSection>
            </div>

            <!-- 4. Editors -->
            <div v-if="sectionVisible.editors" id="section-editors">
              <UoSection title="Editors" :defaultOpen="true">
                <div v-for="(editor, ei) in data.editors" :key="ei" class="editor-block">
                  <div class="editor-header">
                    <strong>{{ editor.name }}</strong>
                    <span class="meta">
                      {{ editor.email }}
                      <span class="badge" :class="editor.isPrimaryEmail ? 'badge-primary' : 'badge-secondary'">
                        {{ editor.isPrimaryEmail ? 'primary email' : 'linked email' }}
                      </span>
                    </span>
                  </div>
                  <div v-if="editor.editorialRoles?.length" class="sub-section">
                    <div class="sub-section-title">Editorial Board Roles:</div>
                    <div v-for="(er, eri) in editor.editorialRoles" :key="eri" class="sub-item">
                      <strong>{{ er.roleName }}</strong> —
                      <a :href="er.journalUrl" target="_blank" class="link">{{ er.journalName }}</a>
                      <span v-if="er.section" class="meta">Section: {{ er.section }}</span>
                      <span v-if="er.specialIssue" class="meta">
                        SI: <a :href="er.specialIssueUrl" target="_blank" class="link">{{ er.specialIssue }}</a>
                        <span v-if="er.siDeadline" class="meta"> · Deadline: {{ er.siDeadline }}</span>
                      </span>
                    </div>
                  </div>
                  <div v-if="editor.topicBoardRoles?.length" class="sub-section">
                    <div class="sub-section-title">Topic Board Roles:</div>
                    <div v-for="(tr, tri) in editor.topicBoardRoles" :key="tri" class="sub-item">
                      <strong>{{ tr.roleName }}</strong> —
                      <a :href="tr.topicUrl" target="_blank" class="link">{{ tr.topicName }}</a>
                    </div>
                  </div>
                  <div v-if="editor.recentDecisions?.length" class="sub-section">
                    made decisions of
                    <span class="number">{{ editorDecisionCount(editor.recentDecisions) }}</span>
                    manuscripts:
                    <UoManuscriptTable
                      :manuscripts="editor.recentDecisions"
                      :toggleable="true"
                      :default-expanded="false"
                      :show-invoice="viewerFlags.showInvoice"
                      :show-apt="viewerFlags.showApt"
                    />
                  </div>
                  <div v-if="editor.historyDecisions?.length" class="sub-section">
                    made history decisions of
                    <span class="number">{{ editorDecisionCount(editor.historyDecisions) }}</span>
                    manuscripts:
                    <UoManuscriptTable
                      :manuscripts="editor.historyDecisions"
                      :toggleable="true"
                      :default-expanded="false"
                      :show-invoice="viewerFlags.showInvoice"
                      :show-apt="viewerFlags.showApt"
                    />
                  </div>
                </div>
              </UoSection>
            </div>

            <!-- 5. Discount Vouchers -->
            <div v-if="sectionVisible.vouchers" id="section-vouchers">
              <UoSection :title="`Discount Vouchers (${data.vouchers.length})`" :defaultOpen="false">
                <div style="overflow-x:auto">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Voucher Code</th><th>Discount</th><th>Reviewer Email</th>
                        <th>Bound To / Used For</th><th>Waiver Rate</th><th>Used?</th>
                        <th>Valid From</th><th>Valid To</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(v, vi) in data.vouchers" :key="vi">
                        <td><a v-if="v.link" :href="v.link" target="_blank" class="link">{{ v.code }}</a><span v-else>{{ v.code }}</span></td>
                        <td>{{ v.discount }}<span v-if="v.discountChf" class="meta"> ({{ v.discountChf }} CHF)</span></td>
                        <td>{{ v.reviewerEmail }}</td>
                        <td>
                          <a v-if="v.manuscriptLink" :href="v.manuscriptLink" target="_blank" class="link">{{ v.boundTo }}</a>
                          <a v-else-if="v.invoiceLink" :href="v.invoiceLink" target="_blank" class="link">{{ v.boundTo }}</a>
                          <span v-else>{{ v.boundTo }}</span>
                        </td>
                        <td>{{ v.waiverRate }}</td>
                        <td><span :class="v.isUsed ? 'badge badge-success' : 'badge badge-secondary'">{{ v.isUsed ? 'Yes' : 'No' }}</span></td>
                        <td>{{ v.validFrom }}</td>
                        <td>{{ v.validTo }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="total-row">Total Amount (CHF): <strong>{{ data.voucherTotalChf }}</strong></div>
              </UoSection>
            </div>

            <!-- 6. Reviewer Profile：始终展示；无档案时为 Add as Reviewer -->
            <div id="section-reviewer-profile">
              <UoSection title="Reviewer Profile" :defaultOpen="true">
                <template v-if="data.reviewers.length">
                  <div v-for="(reviewer, ri) in data.reviewers" :key="ri" class="reviewer-block">
                    <div class="reviewer-header">
                      <strong>{{ reviewer.name }}</strong>
                      <span class="meta">{{ reviewer.email }}</span>
                      <a v-if="!reviewer.onBoard" href="#" class="link-btn">Edit Reviewer</a>
                    </div>
                    <div v-if="reviewer.boards?.length" class="sub-section">
                      <div class="sub-section-title">Reviewer Board Journals:</div>
                      <div v-for="(b, bi) in reviewer.boards" :key="bi" class="sub-item">
                        <a :href="b.url" target="_blank" class="link">{{ b.journalName }}</a>
                      </div>
                    </div>
                    <table class="info-table">
                      <tr><td class="field-label">Telephone</td><td>{{ reviewer.telephone }}</td></tr>
                      <tr><td class="field-label">Title</td><td>{{ reviewer.title }}</td></tr>
                      <tr><td class="field-label">Affiliation</td><td>{{ reviewer.affiliation }}</td></tr>
                      <tr><td class="field-label">Website URL</td><td><a :href="reviewer.websiteUrl" target="_blank" class="link">{{ reviewer.websiteUrl }}</a></td></tr>
                      <tr><td class="field-label">Scilit H-index</td><td>{{ reviewer.scilitHIndex }} <a :href="reviewer.scilitHIndexUrl" target="_blank" class="link">View</a></td></tr>
                      <tr><td class="field-label">H-index</td><td>{{ reviewer.hIndex }} <a :href="reviewer.hIndexUrl" target="_blank" class="link">View</a></td></tr>
                      <tr><td class="field-label">Country</td><td>{{ reviewer.country }}</td></tr>
                      <tr><td class="field-label">Research Keywords</td><td>{{ reviewer.keywords }}</td></tr>
                    </table>
                  </div>
                </template>
                <div v-else class="reviewer-empty">
                  <a href="#" target="_blank" class="link" rel="noopener noreferrer">Add as Reviewer</a>
                </div>
              </UoSection>
            </div>

            <!-- 7. Volunteers -->
            <div v-if="sectionVisible.volunteers" id="section-volunteers">
              <UoSection title="Volunteers" :defaultOpen="true">
                <div v-for="(vol, vi) in data.volunteers" :key="vi" class="volunteer-block">
                  <div class="volunteer-header">
                    <strong>{{ vol.name }}</strong>
                    <span class="meta">{{ vol.email }}</span>
                    <button class="link-btn" @click="vol._expanded = !vol._expanded">Show/Hide</button>
                  </div>
                  <div v-if="vol._expanded" class="sub-section">
                    <div v-for="(vr, vri) in vol.volunteerRels" :key="vri" class="sub-item">
                      <span class="label">Decision:</span> {{ vr.decision }}
                      <span class="meta">Journal: {{ vr.journalReviewName }}</span>
                      <span class="meta">Responsible Editor: {{ vr.nameOfResponsibleEditor }}</span>
                      <span class="meta">Decided At: {{ vr.decideAt }}</span>
                    </div>
                  </div>
                </div>
              </UoSection>
            </div>

            <!-- 8. Submitted Manuscripts -->
            <div v-if="sectionVisible.submittedManuscripts" id="section-submitted-manuscripts">
              <UoSection title="Submitted Manuscripts" :defaultOpen="true">
                <div v-for="(author, ai) in data.authors" :key="ai" class="author-block">
                  <div class="author-header">
                    <strong>{{ author.name }}</strong>
                    <span class="meta">{{ author.email }}</span>
                    <a v-if="author.orcid" :href="author.orcidLink" target="_blank" class="link">ORCID: {{ author.orcid }}</a>
                    <span class="meta"> | Manuscripts: {{ author.manuscripts.length }}</span>
                  </div>
                  <UoManuscriptTable
                    :manuscripts="author.manuscripts"
                    :show-invoice="viewerFlags.showInvoice"
                    :show-apt="viewerFlags.showApt"
                  />
                </div>
              </UoSection>
            </div>

            <!-- 9. Reviewed Manuscripts -->
            <div v-if="sectionVisible.reviewedManuscripts" id="section-reviewed-manuscripts">
              <UoSection title="Reviewed Manuscripts" :defaultOpen="true">
                <div v-for="(reviewer, ri) in data.reviewers" :key="ri" class="reviewer-block">
                  <template v-if="reviewer.reviewedManuscripts?.length">
                    <div class="reviewer-header">
                      <strong>{{ reviewer.name }}</strong>
                      <span class="meta">{{ reviewer.email }}</span>
                      <span class="meta">Reviewed: {{ reviewer.reviewedManuscripts.length }}</span>
                    </div>
                    <UoManuscriptTable
                      :manuscripts="reviewer.reviewedManuscripts"
                      :show-review-report="true"
                      :show-invoice="viewerFlags.showInvoice"
                      :show-apt="viewerFlags.showApt"
                    />
                  </template>
                </div>
              </UoSection>
            </div>

            <!-- 10. Comments -->
            <div v-if="sectionVisible.comments" id="section-comments">
              <UoSection title="Comments" :defaultOpen="true">
                <div class="comments-section">
                  <div v-for="(comment, ci) in data.comments" :key="ci" class="comment-item">
                    <div class="comment-content">{{ comment.content }}</div>
                    <div class="comment-meta">
                      <span>{{ comment.author }}</span> · <span>{{ comment.createdAt }}</span>
                      <button class="danger-btn" @click="deleteComment(ci)">Delete</button>
                    </div>
                  </div>
                  <div class="add-comment">
                    <textarea v-model="newComment" placeholder="Add note..." class="comment-textarea"></textarea>
                    <div class="comment-actions">
                      <input v-model="changeMessage" placeholder="Change message..." class="change-input" />
                      <button class="primary-btn" @click="addComment">Add Note</button>
                    </div>
                  </div>
                </div>
              </UoSection>
            </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import UoSection from './UoSection.vue'
import UoInfoTooltip from './UoInfoTooltip.vue'
import UoManuscriptTable from './UoManuscriptTable.vue'
import { BellOff } from 'lucide-vue-next'
import { useSectionScrollSpy } from '../composables/useSectionScrollSpy'
import './UserOverviewModal.css'

defineProps({ emailInput: { type: String, default: '' } })
defineEmits(['close'])

const activeTab = ref('user1@example.com')

const tabs = [
  { email: 'user1@example.com', registered: true },
  { email: 'user2@example.com', registered: false }
]

/** Demo 默认按内部员工 + 开 APC 信息（User Overview 典型视角） */
const viewerFlags = {
  isEmployee: true,
  showScholarApcInfo: true,
  get showInvoice() { return this.isEmployee && this.showScholarApcInfo },
  get showApt() { return this.isEmployee }
}

function editorDecisionCount(list) {
  const n = list?.length || 0
  return n >= 50 ? '50+' : String(n)
}

/**
 * ManuscriptRow — 对齐 show_manuscripts macro 字段
 * titleUrl: 已发表文章官网；无则用 msidUrl（有权限时）
 */
const mockManuscripts = [
  { title: 'Symmetry Best Paper Award', titleUrl: '#', msid: 'symmetry-89457', msidUrl: null, summaryUrl: '#', journal: 'Symmetry', journalUrl: '#', status: 'Website online', submissionDate: '5 Jun 2015', invoiceHtml: 'No invoice', apt: 3, retracted: false, reviewReportUrl: '#', score: '8.5' },
  { title: 'Molecules after 20 Years', titleUrl: '#', msid: 'molecules-74916', msidUrl: null, summaryUrl: '#', journal: 'Molecules', journalUrl: '#', status: 'Website online', submissionDate: '5 Jan 2015', invoiceHtml: '1800 CHF, Paid', apt: 1, retracted: false, reviewReportUrl: null, score: null },
  { title: 'A non-enzymatic PSA assay', titleUrl: null, msid: 'molecules-433119', msidUrl: '#', summaryUrl: '#', journal: 'Molecules', journalUrl: '#', status: 'Website online', submissionDate: '9 Jan 2019', invoiceHtml: '1800 CHF, Paid', apt: 48, retracted: true, reviewReportUrl: '#', score: '7.0' },
  { title: 'Geospatial Ozone Mapping', titleUrl: '#', msid: 'ijerph-35940', msidUrl: null, summaryUrl: '#', journal: 'IJERPH', journalUrl: '#', status: 'Website online', submissionDate: '23 May 2013', invoiceHtml: 'No invoice', apt: 232, retracted: false, reviewReportUrl: '#', score: '9.0' },
  { title: 'Catalytic Oxidation of Alcohols', titleUrl: '#', msid: 'catalysts-11201', msidUrl: null, summaryUrl: '#', journal: 'Catalysts', journalUrl: '#', status: 'Published', submissionDate: '12 Mar 2018', invoiceHtml: '1600 CHF, Paid', apt: 41, retracted: false, reviewReportUrl: '#', score: '8.0' },
  { title: 'Machine Learning for Drug Discovery', titleUrl: null, msid: 'pharmaceuticals-22045', msidUrl: '#', summaryUrl: '#', journal: 'Pharmaceuticals', journalUrl: '#', status: 'Under review', submissionDate: '3 Feb 2024', invoiceHtml: 'No invoice', apt: 18, retracted: false, reviewReportUrl: null, score: null },
  { title: 'Urban Heat Island Mitigation', titleUrl: '#', msid: 'sustainability-33102', msidUrl: null, summaryUrl: '#', journal: 'Sustainability', journalUrl: '#', status: 'Website online', submissionDate: '19 Jul 2020', invoiceHtml: '2000 CHF, Paid', apt: 67, retracted: false, reviewReportUrl: '#', score: '7.5' },
  { title: 'Nanoparticle Delivery Systems', titleUrl: null, msid: 'nanomaterials-44118', msidUrl: '#', summaryUrl: '#', journal: 'Nanomaterials', journalUrl: '#', status: 'Accepted', submissionDate: '28 Nov 2023', invoiceHtml: '2200 CHF, Unpaid', apt: 29, retracted: false, reviewReportUrl: '#', score: '8.2' },
  { title: 'Soil Microbiome Diversity', titleUrl: '#', msid: 'microorganisms-55003', msidUrl: null, summaryUrl: '#', journal: 'Microorganisms', journalUrl: '#', status: 'Website online', submissionDate: '14 Apr 2021', invoiceHtml: 'No invoice', apt: 55, retracted: false, reviewReportUrl: '#', score: '6.8' },
  { title: 'Photovoltaic Efficiency Models', titleUrl: null, msid: 'energies-66077', msidUrl: '#', summaryUrl: '#', journal: 'Energies', journalUrl: '#', status: 'Major revision', submissionDate: '8 Sep 2024', invoiceHtml: 'No invoice', apt: 12, retracted: false, reviewReportUrl: null, score: null },
  { title: 'Coastal Erosion Monitoring', titleUrl: '#', msid: 'water-77091', msidUrl: null, summaryUrl: '#', journal: 'Water', journalUrl: '#', status: 'Website online', submissionDate: '21 Jan 2019', invoiceHtml: '1400 CHF, Paid', apt: 88, retracted: false, reviewReportUrl: '#', score: '7.9' },
  { title: 'Graphene Composite Sensors', titleUrl: '#', msid: 'sensors-88014', msidUrl: null, summaryUrl: '#', journal: 'Sensors', journalUrl: '#', status: 'Website online', submissionDate: '2 Jun 2022', invoiceHtml: '1900 CHF, Paid', apt: 36, retracted: false, reviewReportUrl: '#', score: '8.7' },
  { title: 'Pediatric Vaccine Hesitancy', titleUrl: null, msid: 'vaccines-99028', msidUrl: '#', summaryUrl: '#', journal: 'Vaccines', journalUrl: '#', status: 'Rejected', submissionDate: '16 Oct 2023', invoiceHtml: 'No invoice', apt: 22, retracted: false, reviewReportUrl: '#', score: '4.5' },
  { title: 'Forest Carbon Sequestration', titleUrl: '#', msid: 'forests-10133', msidUrl: null, summaryUrl: '#', journal: 'Forests', journalUrl: '#', status: 'Website online', submissionDate: '30 May 2017', invoiceHtml: 'No invoice', apt: 104, retracted: false, reviewReportUrl: '#', score: '8.1' },
  { title: 'Antibiotic Resistance Patterns', titleUrl: '#', msid: 'antibiotics-11244', msidUrl: null, summaryUrl: '#', journal: 'Antibiotics', journalUrl: '#', status: 'Website online', submissionDate: '11 Dec 2020', invoiceHtml: '1700 CHF, Paid', apt: 45, retracted: false, reviewReportUrl: '#', score: '7.2' }
]

function createEmptyData(email) {
  return {
    registered: false,
    crmLink: null,
    isNorthKorea: false,
    registeredUsers: [],
    paidInvoices: [],
    submissionScholars: [],
    editors: [],
    vouchers: [],
    voucherTotalChf: '0 CHF',
    reviewers: [],
    volunteers: [],
    authors: [],
    comments: []
  }
}

const dataByEmail = reactive({
  'user1@example.com': {
    registered: true,
    crmLink: 'https://crm.mdpi.com/u/1',
    isNorthKorea: true,
    registeredUsers: [
      {
        name: 'Shu-Kun Lin', email: 'lin@mdpi.com', isPrimary: true,
        orcid: '0000-0002-2427-540X', orcidLink: 'https://orcid.org/0000-0002-2427-540X',
        fromApp: 'SUSY', registeredTime: '2010-05-10 14:35:03',
        ioapMembership: 'IOAP Program XYZ University',
        sameScholar: ['john.scholar@other-university.edu', 'j.scholar@research-lab.org'],
        isNorthKorea: true,
        linkedEmails: [{ email: 'lin@mdpi.org', fromApp: 'SciProfiles', dateAdd: '2022-02-21', isNorthKorea: false }],
        unlinkedEmails: [{ email: 'old-lab@uni.de', removedTime: '2020-05-06' }],
        removedEmails: [{ email: 'old1@domain.com', removedTime: '2021-03-18' }],
        sameScopusEmails: [{ email: 'lin.scopus@example.com' }],
        sameOrcidEmails: [{ email: 'lin.orcid@example.com' }]
      },
      {
        name: 'Shu-Kun Lin', email: 'lin@mdpi.org', isPrimary: false,
        orcid: null, orcidLink: null,
        fromApp: 'SciProfiles', registeredTime: '2022-02-21 15:16:54',
        ioapMembership: '—', sameScholar: [],
        isNorthKorea: false,
        linkedEmails: [], unlinkedEmails: [], removedEmails: [],
        sameScopusEmails: [], sameOrcidEmails: []
      }
    ],
    paidInvoices: [
      { formattedId: 'INV-2022-00123', link: '#', amount: '1800', currency: 'CHF', paidDate: '2022-02-05' },
      { formattedId: 'INV-2021-00988', link: '#', amount: '950', currency: 'CHF', paidDate: '2021-10-10' }
    ],
    submissionScholars: [
      {
        titleString: 'Prof.', name: 'John Doe', email: 'john@example.com', createdAt: '2021-04-02',
        roles: [
          { typeName: 'Topic Editor', roleName: 'Topic Editor', reason: 'Invited by EiC' },
          { typeName: 'Guest Editor', roleName: 'Guest Editor', reason: 'Special Issue organizer' }
        ]
      },
      {
        titleString: 'Dr.', name: 'Jane Smith', email: 'jane@example.com', createdAt: '2020-12-12',
        roles: [{ typeName: 'Editorial Board Member', roleName: 'Editorial Board Member', reason: 'Long-term contributor' }]
      }
    ],
    editors: [
      {
        name: 'Shu-Kun Lin', email: 'lin@mdpi.com', isPrimaryEmail: true,
        editorialRoles: [
          { roleName: 'Publisher', journalName: 'Molecules', journalUrl: '#', section: 'Organic Chemistry', specialIssue: 'Heterocycles', specialIssueUrl: '#', siDeadline: '15 Dec 2011' },
          { roleName: 'Managing Editor', journalName: 'Sensors', journalUrl: '#', section: null, specialIssue: 'Molecular Recognition', specialIssueUrl: '#', siDeadline: '31 Jul 2008' },
          { roleName: 'Editorial Advisor', journalName: 'Molecules', journalUrl: '#', section: null, specialIssue: 'Molecular Diversity', specialIssueUrl: '#', siDeadline: null },
          { roleName: 'Guest Editor', journalName: 'Life', journalUrl: '#', section: null, specialIssue: 'Origin of Life', specialIssueUrl: '#', siDeadline: null }
        ],
        topicBoardRoles: [{ roleName: 'Topic Board Member', topicName: 'Green Chemistry', topicUrl: '#' }],
        recentDecisions: mockManuscripts.slice(0, 2),
        historyDecisions: mockManuscripts.slice(2, 4)
      }
    ],
    vouchers: [
      { code: 'MDPI-ABC123', link: '#', discount: '30%', discountChf: null, reviewerEmail: 'lin@mdpi.com', boundTo: 'molecules-123456', manuscriptLink: '#', invoiceLink: null, waiverRate: '30%', isUsed: false, validFrom: '2022-01-01', validTo: '2023-01-01' },
      { code: 'MDPI-XYZ789', link: null, discount: '150 CHF', discountChf: '150', reviewerEmail: 'lin@mdpi.com', boundTo: 'INV-2021-00988', manuscriptLink: null, invoiceLink: '#', waiverRate: '—', isUsed: true, validFrom: '2021-01-01', validTo: '2022-01-01' }
    ],
    voucherTotalChf: '150 CHF',
    reviewers: [
      {
        name: 'Shu-Kun Lin', email: 'lin@mdpi.com', onBoard: true,
        boards: [{ journalName: 'Entropy', url: '#' }, { journalName: 'Electronics', url: '#' }],
        telephone: '+41 79 000 0000', title: 'Dr.', affiliation: 'MDPI Basel',
        websiteUrl: 'https://www.mdpi.org/lin',
        scilitHIndex: 12, scilitHIndexUrl: '#',
        hIndex: 7, hIndexUrl: '#',
        country: 'China', keywords: 'Entropy; Publication; Symmetry',
        reviewedManuscripts: mockManuscripts
      }
    ],
    volunteers: [
      {
        name: 'Shu-Kun Lin', email: 'lin@mdpi.com', _expanded: false,
        volunteerRels: [
          { decision: 'Accepted as reviewer', journalReviewName: 'Sustainability', nameOfResponsibleEditor: 'Editor A', decideAt: '2023-12-12' },
          { decision: 'Rejected as reviewer', journalReviewName: 'Algorithms', nameOfResponsibleEditor: 'Editor B', decideAt: '2024-01-01' }
        ]
      }
    ],
    authors: [
      {
        name: 'Shu-Kun Lin', email: 'lin@mdpi.com',
        orcid: '0000-0002-2427-540X', orcidLink: 'https://orcid.org/0000-0002-2427-540X',
        manuscripts: mockManuscripts
      }
    ],
    comments: [
      { content: 'User contacted support requesting account merge', author: 'Admin', createdAt: '2024-01-01' },
      { content: 'Legal team requested full data export', author: 'Legal', createdAt: '2024-02-12' }
    ]
  },
  // user2：无业务数据 → Account Info + Reviewer Profile（Add as Reviewer）+ Comments
  'user2@example.com': createEmptyData('user2@example.com')
})

const data = computed(() => dataByEmail[activeTab.value] || createEmptyData(activeTab.value))

/** 各 section 是否有内容可显示 */
const sectionVisible = computed(() => {
  const d = data.value
  const hasReviewed = d.reviewers.some(r => r.reviewedManuscripts?.length)
  return {
    accountInfo: true, // Overview 邮箱头始终有（未注册仅邮箱 + 退订）
    paidInvoices: d.paidInvoices.length > 0,
    submissionScholars: d.submissionScholars.length > 0,
    editors: d.editors.length > 0,
    vouchers: d.vouchers.length > 0,
    reviewerProfile: true, // 无档案时为 Add as Reviewer
    volunteers: d.volunteers.length > 0,
    submittedManuscripts: d.authors.some(a => a.manuscripts?.length),
    reviewedManuscripts: hasReviewed,
    comments: true
  }
})

const navDefs = [
  { id: 'section-account-info', label: 'Account Info', key: 'accountInfo' },
  { id: 'section-invoices', label: 'Paid Invoices', key: 'paidInvoices' },
  { id: 'section-scholars', label: 'Submission Scholars', key: 'submissionScholars' },
  { id: 'section-editors', label: 'Editors', key: 'editors' },
  { id: 'section-vouchers', label: 'Discount Vouchers', key: 'vouchers' },
  { id: 'section-reviewer-profile', label: 'Reviewer Profile', key: 'reviewerProfile' },
  { id: 'section-volunteers', label: 'Volunteers', key: 'volunteers' },
  { id: 'section-submitted-manuscripts', label: 'Submitted Manuscripts', key: 'submittedManuscripts' },
  { id: 'section-reviewed-manuscripts', label: 'Reviewed Manuscripts', key: 'reviewedManuscripts' },
  { id: 'section-comments', label: 'Comments', key: 'comments' }
]

const visibleNavItems = computed(() => {
  const v = sectionVisible.value
  return navDefs.filter(item => v[item.key])
})

const bodyRef = ref(null)
const { activeSectionId, scrollToSection, updateActive } = useSectionScrollSpy(
  () => visibleNavItems.value.map(i => i.id),
  bodyRef
)

watch(activeTab, () => nextTick(updateActive))

const newComment = ref('')
const changeMessage = ref('')

const addComment = () => {
  if (!newComment.value.trim()) return
  dataByEmail[activeTab.value].comments.push({
    content: newComment.value,
    author: 'Current User',
    createdAt: new Date().toISOString().slice(0, 10)
  })
  newComment.value = ''
}

const deleteComment = (idx) => {
  if (confirm('Are you sure you want to delete this comment?')) {
    dataByEmail[activeTab.value].comments.splice(idx, 1)
  }
}
</script>

<style scoped>
.ov-item { padding: 8px 0; }
.ov-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
}
.ov-email {
  font-weight: 600;
  font-size: 14px;
  color: #172b4d;
}
.ov-subs { padding: 2px 0 2px 20px; }
.ov-sub {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 3px 0;
  font-size: 12px;
  line-height: 1.4;
}
.ov-sub-label {
  font-weight: 500;
  color: #555;
  font-size: 12px;
}
.ov-info-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 12px;
  color: #444;
  margin-top: 2px;
  line-height: 1.5;
}
.ov-sep { color: #ccc; margin: 0 2px; }
.ov-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 4px 0;
}
.ov-row .icon-btn,
.ov-row .link-btn { padding: 1px 8px; font-size: 11px; }
.bell-icon {
  color: #d93025;
  vertical-align: middle;
  display: inline-block;
}
.suspected-same-scholar {
  margin-top: 10px;
  padding: 8px 10px;
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 4px;
  font-size: 12px;
}
.suspected-same-scholar .ss-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #172b4d;
  margin-bottom: 2px;
}
.suspected-same-scholar .ss-refresh {
  cursor: pointer;
  color: #1a73e8;
  font-size: 12px;
  font-weight: 400;
}
.suspected-same-scholar .ss-tips {
  color: #666;
  font-size: 11px;
  margin: 2px 0 6px;
  line-height: 1.4;
}
.suspected-same-scholar .ss-email {
  display: inline-block;
  margin-right: 10px;
  color: #1a73e8;
  font-size: 12px;
  text-decoration: underline;
}
</style>

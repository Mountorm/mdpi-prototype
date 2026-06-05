<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h2>User Information Overview</h2>
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
        <!-- Anchor Navigation (only for registered users) -->
        <nav v-if="currentTabData.registered" class="anchor-nav">
          <div class="anchor-nav-title">Navigation</div>
          <a href="#section-emails" class="anchor-link" @click.prevent="scrollToSection('section-emails')">Emails</a>
          <a href="#section-registered" class="anchor-link" @click.prevent="scrollToSection('section-registered')">Registered Users</a>
          <a href="#section-invoices" class="anchor-link" @click.prevent="scrollToSection('section-invoices')">Paid Invoices</a>
          <a href="#section-scholars" class="anchor-link" @click.prevent="scrollToSection('section-scholars')">Submission Scholars</a>
          <a href="#section-editors" class="anchor-link" @click.prevent="scrollToSection('section-editors')">Editors</a>
          <a href="#section-vouchers" class="anchor-link" @click.prevent="scrollToSection('section-vouchers')">Discount Vouchers</a>
          <a href="#section-reviewers" class="anchor-link" @click.prevent="scrollToSection('section-reviewers')">Reviewer Information</a>
          <a href="#section-volunteers" class="anchor-link" @click.prevent="scrollToSection('section-volunteers')">Volunteers</a>
          <a href="#section-authors" class="anchor-link" @click.prevent="scrollToSection('section-authors')">Authors</a>
          <a href="#section-comments" class="anchor-link" @click.prevent="scrollToSection('section-comments')">Comments</a>
        </nav>

        <div class="modal-body">

        <!-- Show content based on registration status -->
        <div v-if="!currentTabData.registered" class="no-info-block">
          <h3>No Registration Found</h3>
          <p>The email <strong>{{ activeTab }}</strong> is not registered in our system.</p>
          <p class="meta">This user has not created an account yet. No information is available.</p>
        </div>

        <template v-else>
          <!-- MODULE 1: Emails -->
          <div id="section-emails">
            <UoSection title="Overview: Emails" :defaultOpen="true">
          <div v-for="(emailInfo, idx) in mockData.emails" :key="idx" class="email-block">
            <div class="email-row">
              <span class="email-text">{{ emailInfo.email }}</span>
              <span v-if="emailInfo.isPrimary" class="badge badge-primary">Primary</span>
              <a v-if="emailInfo.crmLink" :href="emailInfo.crmLink" target="_blank" class="link-btn">CRM</a>
              <button class="icon-btn unsubscribe-btn">✉ Unsubscribe</button>
              <span v-if="emailInfo.isNorthKorea" class="badge badge-danger">⚠ North Korea Alert</span>
              <UoInfoTooltip v-if="emailInfo.isNorthKorea" text="This email is flagged as North Korea sensitive" />
            </div>
            <div v-if="emailInfo.linkedEmails && emailInfo.linkedEmails.length" class="sub-list">
              <div v-for="(le, li) in emailInfo.linkedEmails" :key="li" class="sub-item">
                <span class="label">Linked email:</span>
                <strong>{{ le.email }}</strong>
                <span class="meta">from {{ le.fromApp }} · added {{ le.dateAdd }}</span>
                <button class="icon-btn unsubscribe-btn">✉ Unsubscribe</button>
                <span v-if="le.isNorthKorea" class="badge badge-danger">⚠ NK Alert</span>
              </div>
            </div>
            <div v-if="emailInfo.removedEmails && emailInfo.removedEmails.length" class="sub-list">
              <div class="sub-list-title">Removed Emails:</div>
              <div v-for="(re, ri) in emailInfo.removedEmails" :key="ri" class="sub-item">
                <span class="label">Unlinked email:</span>
                <strong>{{ re.email }}</strong>
                <span class="meta">removed from {{ re.newUserEmail }} · {{ re.removedTime }}</span>
                <button class="icon-btn unsubscribe-btn">✉ Unsubscribe</button>
                <span v-if="re.isNorthKorea" class="badge badge-danger">⚠ NK Alert</span>
              </div>
            </div>
            <div v-if="emailInfo.unlinkedEmails && emailInfo.unlinkedEmails.length" class="sub-list">
              <div class="sub-list-title">Unlinked Emails:</div>
              <div v-for="(ue, ui) in emailInfo.unlinkedEmails" :key="ui" class="sub-item">
                <span class="label">Unlinked email:</span>
                <strong>{{ ue.email }}</strong>
                <span class="meta">removed {{ ue.removedTime }}</span>
                <button class="icon-btn unsubscribe-btn">✉ Unsubscribe</button>
                <span v-if="ue.isNorthKorea" class="badge badge-danger">⚠ NK Alert</span>
              </div>
            </div>
          </div>
            </UoSection>
          </div>

          <!-- MODULE 2: Registered Users -->
          <div id="section-registered">
            <UoSection title="Registered Users" :defaultOpen="true">
          <div v-for="(user, ui) in mockData.registeredUsers" :key="ui" class="user-block">
            <div class="user-header">
              <strong>{{ user.name }}</strong>
              <span class="meta">{{ user.email }}</span>
              <span v-if="user.isPrimary" class="badge badge-primary">Primary Account</span>
            </div>
            <table class="info-table">
              <tr><td class="field-label">ORCID</td><td><a v-if="user.orcidLink" :href="user.orcidLink" target="_blank" class="link">{{ user.orcid }}</a><span v-else>—</span></td></tr>
              <tr><td class="field-label">Registered From</td><td>{{ user.fromApp }}</td></tr>
              <tr><td class="field-label">Registered Time</td><td>{{ user.registeredTime }}</td></tr>
              <tr><td class="field-label">IOAP Membership</td><td>{{ user.ioapMembership }}</td></tr>
              <tr><td class="field-label">Same Scholar</td><td>{{ user.sameScholar }}</td></tr>
            </table>
            <div class="row-actions">
              <button class="icon-btn unsubscribe-btn">✉ Unsubscribe</button>
              <span v-if="user.isNorthKorea" class="badge badge-danger">⚠ NK Alert</span>
            </div>
            <div v-if="user.linkedEmails && user.linkedEmails.length" class="sub-section">
              <div class="sub-section-title">Linked Emails (multipleUsers):</div>
              <div v-for="(le, li) in user.linkedEmails" :key="li" class="sub-item">
                <strong>{{ le.email }}</strong>
                <span class="meta">from {{ le.fromApp }} · added {{ le.dateAdd }}</span>
                <button class="icon-btn unsubscribe-btn">✉ Unsubscribe</button>
                <span v-if="le.isNorthKorea" class="badge badge-danger">⚠ NK Alert</span>
              </div>
            </div>
            <div v-if="user.unlinkedEmails && user.unlinkedEmails.length" class="sub-section">
              <div class="sub-section-title">Unlinked Emails:</div>
              <div v-for="(ue, ui2) in user.unlinkedEmails" :key="ui2" class="sub-item">
                <strong>{{ ue.email }}</strong>
                <span class="meta">removed {{ ue.removedTime }}</span>
              </div>
            </div>
            <div v-if="user.removedEmails && user.removedEmails.length" class="sub-section">
              <div class="sub-section-title">Removed Emails:</div>
              <div v-for="(re, ri) in user.removedEmails" :key="ri" class="sub-item">
                <strong>{{ re.email }}</strong>
                <span class="meta">removed {{ re.removedTime }}</span>
              </div>
            </div>
            <div class="sub-section">
              <div class="sub-section-title">Same Scopus / Same ORCID Emails:</div>
              <div v-for="(se, si) in user.sameScopusEmails" :key="'scopus-'+si" class="sub-item">
                <strong>{{ se.email }}</strong>
                <span class="badge badge-info">Same Scopus Link</span>
              </div>
              <div v-for="(oe, oi) in user.sameOrcidEmails" :key="'orcid-'+oi" class="sub-item">
                <strong>{{ oe.email }}</strong>
                <span class="badge badge-info">Same Orcid</span>
              </div>
            </div>
          </div>
            </UoSection>
          </div>

          <!-- MODULE 3: Paid Invoices -->
          <div id="section-invoices">
            <UoSection title="Paid Invoices" :defaultOpen="true">
          <div v-for="(inv, ii) in mockData.paidInvoices" :key="ii" class="invoice-item">
            <span class="label">Paid invoice {{ ii + 1 }}:</span>
            <a :href="inv.link" target="_blank" class="link">{{ inv.formattedId }}</a>
            <span class="meta">Amount: <strong>{{ inv.amount }} {{ inv.currency }}</strong></span>
            <span class="meta">Paid Date: {{ inv.paidDate }}</span>
          </div>
            </UoSection>
          </div>

          <!-- MODULE 4: Submission Scholars -->
          <div id="section-scholars">
            <UoSection title="Submission Scholars" :defaultOpen="true">
          <div v-for="(scholar, si) in mockData.submissionScholars" :key="si" class="scholar-block">
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

          <!-- MODULE 5: Editors -->
          <div id="section-editors">
            <UoSection title="Editors" :defaultOpen="true">
          <div v-for="(editor, ei) in mockData.editors" :key="ei" class="editor-block">
            <div class="editor-header">
              <strong>{{ editor.name }}</strong>
              <span class="meta">
                {{ editor.email }}
                <span class="badge" :class="editor.isPrimaryEmail ? 'badge-primary' : 'badge-secondary'">
                  {{ editor.isPrimaryEmail ? 'primary email' : 'linked email' }}
                </span>
              </span>
            </div>
            <div v-if="editor.editorialRoles && editor.editorialRoles.length" class="sub-section">
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
            <div v-if="editor.topicBoardRoles && editor.topicBoardRoles.length" class="sub-section">
              <div class="sub-section-title">Topic Board Roles:</div>
              <div v-for="(tr, tri) in editor.topicBoardRoles" :key="tri" class="sub-item">
                <strong>{{ tr.roleName }}</strong> —
                <a :href="tr.topicUrl" target="_blank" class="link">{{ tr.topicName }}</a>
              </div>
            </div>
            <div class="sub-section">
              <div class="sub-section-title">Recent Decisions (limit 50):</div>
              <UoManuscriptTable :manuscripts="editor.recentDecisions" :showReviewReport="true" :showScore="true" />
            </div>
            <div class="sub-section">
              <div class="sub-section-title">Historical Decisions (limit 50):</div>
              <UoManuscriptTable :manuscripts="editor.historyDecisions" :showReviewReport="true" :showScore="true" />
            </div>
          </div>
            </UoSection>
          </div>

          <!-- MODULE 6: Discount Vouchers -->
          <div id="section-vouchers">
            <UoSection :title="`Discount Vouchers (${mockData.vouchers.length})`" :defaultOpen="false">
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
                <tr v-for="(v, vi) in mockData.vouchers" :key="vi">
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
          <div class="total-row">Total Amount (CHF): <strong>{{ mockData.voucherTotalChf }}</strong></div>
            </UoSection>
          </div>

          <!-- MODULE 7: Reviewer Information -->
          <div id="section-reviewers">
            <UoSection title="Reviewer Information" :defaultOpen="true">
          <div v-for="(reviewer, ri) in mockData.reviewers" :key="ri" class="reviewer-block">
            <div class="reviewer-header">
              <strong>{{ reviewer.name }}</strong>
              <span class="meta">{{ reviewer.email }}</span>
              <a v-if="!reviewer.onBoard" href="#" class="link-btn">Edit Reviewer</a>
            </div>
            <div v-if="reviewer.boards && reviewer.boards.length" class="sub-section">
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
            <div class="sub-section">
              <div class="sub-section-title">Reviewed Manuscripts:</div>
              <UoManuscriptTable :manuscripts="reviewer.reviewedManuscripts" :showReviewReport="true" :showScore="true" />
            </div>
          </div>
            </UoSection>
          </div>

          <!-- MODULE 8: Volunteers -->
          <div id="section-volunteers">
            <UoSection title="Volunteers" :defaultOpen="true">
          <div v-for="(vol, vi) in mockData.volunteers" :key="vi" class="volunteer-block">
            <div class="volunteer-header">
              <strong>{{ vol.name }}</strong>
              <span class="meta">{{ vol.email }}</span>
              <button class="link-btn" @click="vol._expanded = !vol._expanded">
                {{ vol._expanded ? 'Hide' : 'Show' }} Applications
              </button>
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

          <!-- MODULE 9: Authors -->
          <div id="section-authors">
            <UoSection title="Authors (Submitted Manuscripts)" :defaultOpen="true">
          <div v-for="(author, ai) in mockData.authors" :key="ai" class="author-block">
            <div class="author-header">
              <strong>{{ author.name }}</strong>
              <span class="meta">{{ author.email }}</span>
              <a v-if="author.orcid" :href="author.orcidLink" target="_blank" class="link">ORCID: {{ author.orcid }}</a>
              <span class="meta">Manuscripts: {{ author.manuscripts.length }}</span>
            </div>
            <UoManuscriptTable :manuscripts="author.manuscripts" />
          </div>
            </UoSection>
          </div>

          <!-- MODULE 10: Reviewer Reviewed Manuscripts -->
          <div id="section-reviewer-manuscripts">
            <UoSection title="Reviewer Reviewed Manuscripts" :defaultOpen="false">
          <div v-for="(reviewer, ri) in mockData.reviewers" :key="ri" class="reviewer-block">
            <div class="reviewer-header">
              <strong>{{ reviewer.name }}</strong>
              <span class="meta">{{ reviewer.email }}</span>
              <span class="meta">Reviewed: {{ reviewer.reviewedManuscripts.length }}</span>
            </div>
            <UoManuscriptTable :manuscripts="reviewer.reviewedManuscripts" :showReviewReport="true" :showScore="true" />
          </div>
            </UoSection>
          </div>

          <!-- MODULE 12: Comments -->
          <div id="section-comments">
            <UoSection title="Comments (Internal Notes)" :defaultOpen="true">
          <div class="comments-section">
            <div v-for="(comment, ci) in comments" :key="ci" class="comment-item">
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
        </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import UoSection from './UoSection.vue'
import UoInfoTooltip from './UoInfoTooltip.vue'
import UoManuscriptTable from './UoManuscriptTable.vue'
import './UserOverviewModal.css'

defineProps({ emailInput: { type: String, default: '' } })
defineEmits(['close'])

// Tab management
const activeTab = ref('user1@example.com')

const tabs = [
  { email: 'user1@example.com', registered: true },
  { email: 'user2@example.com', registered: false }
]

const currentTabData = computed(() => {
  return tabs.find(tab => tab.email === activeTab.value) || tabs[0]
})

// Anchor navigation
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const mockManuscripts = [
  { title: 'Symmetry Best Paper Award', msid: 'symmetry-89457', link: '#', summaryLink: '#', journal: 'Symmetry', journalUrl: '#', status: 'Website online', submissionDate: '05 Jun 2015', invoice: 'No invoice', apt: 3, retracted: false, reviewReportLink: '#', score: 8.5 },
  { title: 'Molecules after 20 Years', msid: 'molecules-74916', link: '#', summaryLink: '#', journal: 'Molecules', journalUrl: '#', status: 'Website online', submissionDate: '05 Jan 2015', invoice: '1800 CHF, Paid', apt: 1, retracted: false, reviewReportLink: null, score: null },
  { title: 'A non-enzymatic PSA assay', msid: 'molecules-433119', link: '#', summaryLink: '#', journal: 'Molecules', journalUrl: '#', status: 'Website online', submissionDate: '09 Jan 2019', invoice: '1800 CHF, Paid', apt: 48, retracted: true, reviewReportLink: '#', score: 7.0 },
  { title: 'Geospatial Ozone Mapping', msid: 'ijerph-35940', link: '#', summaryLink: '#', journal: 'IJERPH', journalUrl: '#', status: 'Website online', submissionDate: '23 May 2013', invoice: 'No invoice', apt: 232, retracted: false, reviewReportLink: '#', score: 9.0 },
]

const mockData = reactive({
  hasInfo: true,
  emails: [
    {
      email: 'user1@example.com', isPrimary: false, crmLink: 'https://crm.mdpi.com/u/1', isNorthKorea: true,
      linkedEmails: [{ email: 'lin@mdpi.org', fromApp: 'SciProfiles', dateAdd: '2022-02-21 15:16:54', isNorthKorea: false }],
      removedEmails: [{ email: 'old1@domain.com', newUserEmail: 'lin@mdpi.com', removedTime: '2021-03-18 11:22:10', isNorthKorea: false }],
      unlinkedEmails: [{ email: 'old-lab@uni.de', removedTime: '2020-05-06 09:00:00', isNorthKorea: false }]
    },
    {
      email: 'lin@mdpi.org', isPrimary: false, crmLink: 'https://crm.mdpi.com/u/2', isNorthKorea: false,
      linkedEmails: [], removedEmails: [], unlinkedEmails: []
    }
  ],
  registeredUsers: [
    {
      name: 'Shu-Kun Lin', email: 'lin@mdpi.com', isPrimary: true,
      orcid: '0000-0002-2427-540X', orcidLink: 'https://orcid.org/0000-0002-2427-540X',
      fromApp: 'SUSY', registeredTime: '2010-05-10 14:35:03',
      ioapMembership: 'IOAP Program XYZ University', sameScholar: 'scholar-001',
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
      ioapMembership: '—', sameScholar: '—',
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
        { typeName: 'Topic Editor', icon: '📝', roleName: 'Topic Editor', reason: 'Invited by EiC' },
        { typeName: 'Guest Editor', icon: '👤', roleName: 'Guest Editor', reason: 'Special Issue organizer' }
      ]
    },
    {
      titleString: 'Dr.', name: 'Jane Smith', email: 'jane@example.com', createdAt: '2020-12-12',
      roles: [{ typeName: 'Editorial Board Member', icon: '🏛', roleName: 'Editorial Board Member', reason: 'Long-term contributor' }]
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
      name: 'Shu-Kun Lin', email: 'lin@mdpi.com', _expanded: true,
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
  ]
})

const comments = ref([
  { content: 'User contacted support requesting account merge', author: 'Admin', createdAt: '2024-01-01' },
  { content: 'Legal team requested full data export', author: 'Legal', createdAt: '2024-02-12' }
])
const newComment = ref('')
const changeMessage = ref('')

const addComment = () => {
  if (!newComment.value.trim()) return
  comments.value.push({ content: newComment.value, author: 'Current User', createdAt: new Date().toISOString().slice(0, 10) })
  newComment.value = ''
}

const deleteComment = (idx) => {
  if (confirm('Are you sure you want to delete this comment?')) {
    comments.value.splice(idx, 1)
  }
}
</script>

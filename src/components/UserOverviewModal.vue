<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h2>User Information Overview</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">

        <!-- MODULE 1: Emails -->
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

        <!-- MODULE 2: Registered Users -->
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

        <!-- MODULE 3: Paid Invoices -->
        <UoSection title="Paid Invoices" :defaultOpen="true">
          <div v-for="(inv, ii) in mockData.paidInvoices" :key="ii" class="invoice-item">
            <span class="label">Paid invoice {{ ii + 1 }}:</span>
            <a :href="inv.link" target="_blank" class="link">{{ inv.formattedId }}</a>
            <span class="meta">Amount: <strong>{{ inv.amount }} {{ inv.currency }}</strong></span>
            <span class="meta">Paid Date: {{ inv.paidDate }}</span>
          </div>
        </UoSection>

        <!-- MODULE 4: Submission Scholars -->
        <UoSection title="Submission Scholars" :defaultOpen="true">
          <div v-for="(scholar, si) in mockData.submissionScholars" :key="si" class="scholar-block">
            <div class="scholar-header">
              <strong>{{ scholar.titleString }} {{ scholar.name }}</strong>
              <span class="meta">{{ scholar.email }}</span>
              <span class="meta">Added: {{ scholar.createdAt }}</span>
            </div>
            <div class="role-tags">
              <span v-for="(role, ri) in scholar.roles" :key="ri" class="role-tag">
                <span class="role-icon">{{ role.icon }}</span>
                <span class="role-name">{{ role.typeName }}</span>
                <UoInfoTooltip :text="`${role.roleName}: ${role.reason}`" />
              </span>
            </div>
          </div>
        </UoSection>

        <!-- MODULE 5: Editors -->
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

        <!-- MODULE 6: Discount Vouchers -->
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

        <!-- MODULE 7: Reviewer Information -->
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

        <!-- MODULE 8: Volunteers -->
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

        <!-- MODULE 9: Authors -->
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

        <!-- MODULE 10: Reviewer Reviewed Manuscripts -->
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

        <!-- MODULE 11: No Information -->
        <div v-if="!mockData.hasInfo" class="no-info-block">
          No information found for {{ emailInput }}
        </div>

        <!-- MODULE 12: Comments -->
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import UoSection from './UoSection.vue'
import UoInfoTooltip from './UoInfoTooltip.vue'
import UoManuscriptTable from './UoManuscriptTable.vue'

defineProps({ emailInput: { type: String, default: '' } })
defineEmits(['close'])

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
      email: 'lin@mdpi.com', isPrimary: true, crmLink: 'https://crm.mdpi.com/u/1', isNorthKorea: true,
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

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex; align-items: flex-start; justify-content: center;
  padding: 24px 16px;
  overflow-y: auto;
}
.modal-container {
  background: #fff; border-radius: 8px;
  width: 100%; max-width: 1100px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; border-bottom: 1px solid #e5e7eb;
  position: sticky; top: 0; background: #fff; z-index: 10;
  border-radius: 8px 8px 0 0;
}
.modal-header h2 { margin: 0; font-size: 18px; font-weight: 700; color: #172b4d; }
.close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280; padding: 4px 8px; border-radius: 4px; }
.close-btn:hover { background: #f3f4f6; }
.modal-body { padding: 16px 24px; }

/* Badges */
.badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 6px; }
.badge-primary { background: #dbeafe; color: #1d4ed8; }
.badge-secondary { background: #f3f4f6; color: #6b7280; }
.badge-danger { background: #fee2e2; color: #dc2626; }
.badge-success { background: #dcfce7; color: #16a34a; }
.badge-info { background: #e0f2fe; color: #0369a1; }

/* Links & Buttons */
.link { color: #2563eb; text-decoration: underline; font-size: 13px; }
.link:hover { color: #1d4ed8; }
.link-btn { background: none; border: 1px solid #d1d5db; border-radius: 4px; padding: 2px 10px; font-size: 12px; cursor: pointer; color: #374151; margin-left: 6px; }
.link-btn:hover { background: #f3f4f6; }
.icon-btn { background: none; border: 1px solid #d1d5db; border-radius: 4px; padding: 2px 8px; font-size: 11px; cursor: pointer; color: #6b7280; margin-left: 6px; }
.unsubscribe-btn { color: #dc2626; border-color: #fca5a5; }
.unsubscribe-btn:hover { background: #fee2e2; }
.danger-btn { background: none; border: 1px solid #fca5a5; border-radius: 4px; padding: 2px 8px; font-size: 11px; cursor: pointer; color: #dc2626; margin-left: 8px; }
.danger-btn:hover { background: #fee2e2; }
.primary-btn { background: #2563eb; color: #fff; border: none; border-radius: 4px; padding: 6px 16px; font-size: 13px; cursor: pointer; }
.primary-btn:hover { background: #1d4ed8; }

/* Email Block */
.email-block { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.email-block:last-child { border-bottom: none; }
.email-row { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.email-text { font-weight: 600; font-size: 14px; color: #111827; }

/* Sub Lists */
.sub-list { margin-top: 8px; padding-left: 16px; }
.sub-list-title { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px; }
.sub-item { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; padding: 4px 0; font-size: 13px; }
.label { font-size: 12px; color: #6b7280; }
.meta { font-size: 12px; color: #9ca3af; margin-left: 4px; }

/* Sub Section */
.sub-section { margin-top: 12px; padding-top: 8px; border-top: 1px dashed #e5e7eb; }
.sub-section-title { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px; }

/* Blocks */
.user-block, .editor-block, .reviewer-block, .author-block, .volunteer-block, .scholar-block {
  padding: 12px 0; border-bottom: 1px solid #f3f4f6;
}
.user-block:last-child, .editor-block:last-child, .reviewer-block:last-child,
.author-block:last-child, .volunteer-block:last-child, .scholar-block:last-child { border-bottom: none; }
.user-header, .editor-header, .reviewer-header, .author-header, .volunteer-header, .scholar-header {
  display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;
}
.row-actions { margin-top: 6px; display: flex; align-items: center; gap: 6px; }

/* Tables */
.info-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
.info-table td { padding: 4px 8px; border-bottom: 1px solid #f3f4f6; }
.field-label { font-weight: 600; color: #374151; width: 160px; white-space: nowrap; }
.data-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
.data-table th { background: #f8f9fa; padding: 6px 8px; text-align: left; border: 1px solid #e5e7eb; font-weight: 600; color: #374151; }
.data-table td { padding: 5px 8px; border: 1px solid #e5e7eb; vertical-align: top; }
.data-table tr:hover td { background: #f9fafb; }

/* Invoice */
.invoice-item { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
.invoice-item:last-child { border-bottom: none; }

/* Scholar Roles */
.role-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.role-tag { display: inline-flex; align-items: center; gap: 4px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; padding: 3px 8px; font-size: 12px; }
.role-icon { font-size: 14px; }
.role-name { color: #0369a1; font-weight: 500; }

/* Voucher */
.total-row { margin-top: 8px; font-size: 13px; color: #374151; text-align: right; }

/* No Info */
.no-info-block { padding: 24px; text-align: center; color: #6b7280; font-size: 15px; background: #f9fafb; border-radius: 6px; margin-bottom: 16px; }

/* Comments */
.comments-section { display: flex; flex-direction: column; gap: 12px; }
.comment-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; }
.comment-content { font-size: 13px; color: #111827; margin-bottom: 6px; }
.comment-meta { font-size: 12px; color: #9ca3af; display: flex; align-items: center; }
.add-comment { border-top: 1px solid #e5e7eb; padding-top: 12px; }
.comment-textarea { width: 100%; min-height: 72px; border: 1px solid #d1d5db; border-radius: 4px; padding: 8px; font-size: 13px; resize: vertical; box-sizing: border-box; }
.comment-textarea:focus { outline: none; border-color: #2563eb; }
.comment-actions { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.change-input { flex: 1; border: 1px solid #d1d5db; border-radius: 4px; padding: 6px 10px; font-size: 13px; }
.change-input:focus { outline: none; border-color: #2563eb; }
</style>

// ============================================
// Shared report store — hands the AE's filled checklist over to the report
// page. The AE (GenerateView) writes on Review; the report page (ReportView)
// reads. Stored in memory only (prototype).
// ============================================
import { reactive } from 'vue'

export const reportStore = reactive({
  manuscriptId: null,
  submittedAt: null,
  // itemId -> { status, comment, numberValue }
  answers: {},
})

export const hasReport = () => Boolean(reportStore.manuscriptId)

export const setReport = (manuscriptId, answers) => {
  reportStore.manuscriptId = manuscriptId
  reportStore.submittedAt = new Date().toISOString()
  reportStore.answers = JSON.parse(JSON.stringify(answers))
}

export const resetReport = () => {
  reportStore.manuscriptId = null
  reportStore.submittedAt = null
  reportStore.answers = {}
}

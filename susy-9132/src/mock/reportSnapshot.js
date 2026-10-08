// ============================================
// Report snapshot — a fixed, realistic set of AE answers so the Report Snap
// page (/report1) can render a believable report anytime, without first going
// through the generate flow. Mirrors the shape of the generate page's answers
// (status / comment / numberValue / resultVisible / selected).
// ============================================

import { mockManuscript } from './ace.js'

// Snapshot manuscript — a distinct, believable manuscript. Detection results
// are keyed by mockManuscript.id in detectionResults.js, so the snapshot keeps
// that id to resolve the same detection data.
export const snapshotManuscript = {
  ...mockManuscript,
  title: 'Biosensing Platforms for Rapid Detection of Foodborne Pathogens: A Critical Review',
  journal: 'Biosensors',
  articleType: 'Review',
}

// Fixed answers keyed by checklist item id. resultVisible=false means the
// detection result is hidden from the report (e.g. result still processing).
export const snapshotAnswers = {
  1: { status: null, comment: '', counts: { word: 12840, figures: 8, tables: 4 }, numberValue: null, resultVisible: true, selected: true },

  4: { status: 'passed', comment: '', numberValue: null, resultVisible: true, selected: true }, // Journal Scope Match (match)
  5: { status: 'warning', comment: 'The manuscript covers point-of-care diagnostics; I could not confirm the fit with the current Special Issue assignment. Could you advise whether to proceed with this SI based on the content?', numberValue: null, resultVisible: false, selected: true }, // SI Scope (unknown)

  6: { status: 'passed', comment: '', numberValue: null, resultVisible: true, selected: true }, // Article Type (required per config)

  7: { status: 'passed', comment: 'Similarity is within the journal threshold; no action needed.', numberValue: null, resultVisible: true, selected: true }, // iThenticate
  8: { status: 'warning', comment: '15% likely AI — the phrasing in the methods section reads unusually uniform. Please advise.', numberValue: null, resultVisible: true, selected: true }, // AI Generated Content (required per config)
  9: { status: 'passed', comment: '', numberValue: null, resultVisible: true, selected: true }, // Image Manipulation (required per config)

  10: { status: 'passed', comment: '3 references fall outside the manuscript scope; the authors will be asked to remove them.', numberValue: null, resultVisible: false, selected: true }, // Out of Scope References
  11: { status: 'warning', comment: '5 references could not be validated or were not found in public databases; please ask the authors to verify or replace them.', numberValue: null, resultVisible: false, selected: true }, // Unvalidated / Not Found References
}

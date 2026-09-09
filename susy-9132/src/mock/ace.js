// ============================================
// AcE Checklist — shared mock data (config + generate)
// Flow:
//   required      —— whether the item is mandatory in the report
//   requiredLocked —— fixed mandatory items: Required cannot be toggled in config
//   flagRequired  —— whether a flag is needed (passed / warning)
//   flagMode      —— 'auto' auto determination (with rule) / 'manual' editor picks
//   rule          —— structured automation rule:
//                      numeric  —— single threshold  { type, subject, operator, value, result }
//                      boolean  —— condition        { type, subject, condition, result }
//   inUse         —— In Use (active) / Draft (not active)
// Categories are organized from the AcEd (reviewer) perspective:
//   Manuscript Information —— reference numbers only
// Categories are organized from the AcEd (reviewer) perspective:
//   Manuscript Information —— numbers, scope fit and article type
//   Reference Analysis    —— reference quality checks
//   Ethical Issues        —— red flags that need the AcEd's attention
// Detection results (what the tools return) live in detectionResults.js,
// keyed by manuscript ID — separate from this template structure.
// ============================================

// Categories (new ones can be added inline in the Edit dialog)
export const categories = [
  'Manuscript Information',
  'Reference Analysis',
  'Ethical Issues',
]

export const checklistItems = [
  // ---------- Manuscript Information: reference numbers, no flag ----------
  {
    id: 1,
    category: 'Manuscript Information',
    title: 'Word Count',
    description:
      'Total number of words in the manuscript.',
    required: true,
    requiredLocked: true,
    flagRequired: false,
    flagMode: 'manual',
    rule: null,
    inUse: true,
  },
  {
    id: 2,
    category: 'Manuscript Information',
    title: 'Figures Count',
    description:
      'Total number of figures in the manuscript.',
    required: true,
    requiredLocked: true,
    flagRequired: false,
    flagMode: 'manual',
    rule: null,
    inUse: true,
  },
  {
    id: 3,
    category: 'Manuscript Information',
    title: 'Tables Count',
    description:
      'Total number of tables in the manuscript.',
    required: true,
    requiredLocked: true,
    flagRequired: false,
    flagMode: 'manual',
    rule: null,
    inUse: true,
  },

  // ---------- Manuscript Information: scope fit & article type ----------
  {
    id: 4,
    category: 'Manuscript Information',
    title: 'Journal Scope Match',
    description:
      'Whether the manuscript topic matches the journal scope.',
    required: true,
    requiredLocked: true,
    flagRequired: true,
    flagMode: 'auto',
    rule: { type: 'boolean', subject: 'in scope', result: 'passed' },
    inUse: true,
  },
  {
    id: 5,
    category: 'Manuscript Information',
    title: 'Special Issue Scope Match',
    description:
      'Whether the manuscript topic matches the Special Issue / thematic collection scope.',
    required: true,
    requiredLocked: true,
    flagRequired: true,
    flagMode: 'auto',
    rule: { type: 'boolean', subject: 'in scope', result: 'passed' },
    inUse: true,
  },
  {
    id: 6,
    category: 'Manuscript Information',
    title: 'Article Type',
    description:
      'Whether the article type matches the journal\'s accepted types.',
    required: true,
    flagRequired: true,
    flagMode: 'manual',
    rule: { type: 'boolean', subject: 'is special type', result: 'warning' },
    inUse: true,
  },

  // ---------- Ethical Issues: red flags for the AcEd ----------
  {
    id: 7,
    category: 'Ethical Issues',
    title: 'iThenticate',
    description:
      'Similarity check result.',
    required: true,
    requiredLocked: true,
    flagRequired: true,
    flagMode: 'manual',
    rule: { type: 'numeric', subject: 'similarity', operator: '>', value: 50, result: 'warning' },
    inUse: true,
  },
  {
    id: 8,
    category: 'Ethical Issues',
    title: 'AI Generated Content',
    description:
      'Whether parts of the manuscript are likely AI-generated.',
    required: true,
    flagRequired: true,
    flagMode: 'manual',
    rule: { type: 'numeric', subject: 'likely AI percentage', operator: '>', value: 50, result: 'warning' },
    inUse: true,
  },
  {
    id: 9,
    category: 'Ethical Issues',
    title: 'Image Manipulation Detection',
    description:
      'Whether image manipulation is detected.',
    required: true,
    flagRequired: true,
    flagMode: 'auto',
    rule: { type: 'boolean', subject: 'pass', result: 'passed' },
    inUse: true,
  },

  // ---------- Reference Analysis: reference quality checks ----------
  {
    id: 10,
    category: 'Reference Analysis',
    title: 'Out of Scope References',
    description:
      'References not related to the manuscript scope.',
    required: true,
    requiredLocked: true,
    flagRequired: true,
    flagMode: 'auto',
    rule: {
      type: 'numeric',
      subject: 'Out of scope reference count',
      operator: '>',
      value: 3,
      result: 'warning',
    },
    inUse: true,
  },
  {
    id: 11,
    category: 'Reference Analysis',
    title: 'Unvalidated / Not Found References',
    description:
      'References that could not be validated or were not found in public databases.',
    required: true,
    requiredLocked: true,
    flagRequired: true,
    flagMode: 'auto',
    rule: {
      type: 'numeric',
      subject: 'Unvalidated / not found reference count',
      operator: '>',
      value: 3,
      result: 'warning',
    },
    inUse: true,
  },
]

// Pilot journals (global data source; total 562 is a decorative constant)
export const pilotJournals = [
  { name: 'Reports', checked: true },
  { name: 'Biosensors', checked: false },
  { name: 'IJMS', checked: false },
]

export const JOURNAL_TOTAL = 562

// Mock manuscript opened from SuSy — in the real system the manuscript ID
// is passed as a route parameter; here it is fixed mock data for the demo.
export const mockManuscript = {
  id: 'manuscripts-1234567',
  title: 'Recent Advances in Biosensors for Point-of-Care Diagnostics',
  journal: 'Reports',
  articleType: 'Research Article',
}

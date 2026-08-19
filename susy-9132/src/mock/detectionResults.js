// ============================================
// Detection results for the generate page.
// Keyed by manuscript ID — in the real system these come from the detection
// tools (Journal Finder, iThenticate, AI detector, Proofig, reference
// analysis). The AE views the results as-is; the checklist structure itself
// lives in ace.js (template config), separate from these results.
// ============================================

import { mockManuscript } from './ace.js'

export const detectionResults = {
  [mockManuscript.id]: {
    // Manuscript Information (numbers, AE can edit)
    1: { value: 8542 }, // Word Count
    2: { value: 5 }, // Figures Count
    3: { value: 3 }, // Tables Count

    // Scope & Article Type
    // status: 'in_scope' | 'out_of_scope' | 'unknown'
    4: { status: 'in_scope' }, // Journal Scope Match
    5: { status: 'unknown' }, // Special Issue Scope Match
    6: { articleType: 'Research Article' }, // Article Type

    // Ethical Issues
    7: { percent: 24, reportUrl: 'https://app.ithenticate.com/report/abc123' }, // iThenticate
    8: { green: 55, yellow: 30, red: 15 }, // AI Generated Content (sum = 100)
    9: { status: 'pass', reportUrl: 'https://proofig.com/report/xyz789' }, // Image Manipulation (mock shows pass)

    // Reference Analysis: split into per-dimension items, each carrying its own
    // ref list — id 10 out-of-scope refs, id 11 unvalidated / not-found refs.
    10: {
      refs: [
        { number: 12, title: 'Unrelated material science advances', doi: '10.1016/j.mat.2020.100001' },
        { number: 27, title: 'Chemistry of battery electrolytes', doi: '10.1021/ac.2019.200002' },
        { number: 41, title: 'Fluid dynamics in pipe systems', doi: '10.1016/j.fluid.2018.300003' },
      ],
    }, // Out of Scope References
    11: {
      refs: [
        { number: 21, title: 'Novel rapid PCR amplification protocol', doi: '10.1016/j.pcr.2023.600001' },
        { number: 45, title: 'Portable electrochemical detector description', doi: '10.1016/j.detect.2022.600002' },
        { number: 6, title: 'Conference proceedings on biosensing', doi: '—' },
        { number: 24, title: 'PhD thesis on nanomaterial sensors', doi: '—' },
        { number: 39, title: 'Preprint on lateral flow assays', doi: '—' },
      ],
    }, // Unvalidated / Not Found References
  },
}

// Helper: pick the result record for an item of the current manuscript
export const getDetectionResult = (manuscriptId, itemId) =>
  detectionResults[manuscriptId]?.[itemId] ?? null

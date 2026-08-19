// ============================================
// Shared item-kind helpers — used by both the generate page (AE) and the
// report page (AcEd). Classification is by item title so it stays stable
// even if the mock ids change.
// ============================================

export const isNumberItem = (item) => !item.flagRequired && !item.rule
export const isScopeItem = (item) => item.title.endsWith('Scope Match')
export const isArticleTypeItem = (item) => item.title === 'Article Type'
export const isIThenticate = (item) => item.title.toLowerCase() === 'ithenticate'
export const isAIItem = (item) => item.title === 'AI Generated Content'
export const isImageItem = (item) => item.title === 'Image Manipulation Detection'
// Reference Analysis is split into per-dimension items, each carrying its own ref list
export const isReferenceAnalysisItem = (item) => item.category === 'Reference Analysis'

// Scope status → display label + tone (used by generate & report)
// Real model: 'in_scope' | 'out_of_scope' | 'unknown'
export const scopeStatusText = (result) => {
  const map = {
    in_scope: { text: 'In Scope', tone: 'passed' },
    out_of_scope: { text: 'Out of Scope', tone: 'warning' },
    unknown: { text: 'Unknown', tone: 'warning' },
  }
  return map[result?.status] ?? { text: '—', tone: 'none' }
}

// True when a detection result is unusable (still processing or API error)
// or is a Reference Analysis structure. Such results are hidden from the
// external-editor (AcEd) report view entirely and their "show in report"
// checkbox stays disabled.
export const isResultUnavailable = (item, result) => {
  // Reference Analysis: the detailed ref structure is never exposed in the report
  if (isReferenceAnalysisItem(item)) return true
  // number items (Word/Figures/Tables) always show their value — never hide
  if (!item.flagRequired && !item.rule) return false
  if (isScopeItem(item)) {
    return ['unknown'].includes(result?.status)
  }
  // other detection kinds: no result record at all → nothing to show
  return !result
}

// Human-readable label for a scope status (e.g. used in the report list)
export const scopeStatusLabel = (result) => scopeStatusText(result).text

// One-line summary of a detection result (used as the collapsed row in the report)
export const resultSummary = (item, result, value) => {
  if (isNumberItem(item)) return value ?? '—'
  if (isScopeItem(item)) return scopeStatusLabel(result)
  if (isArticleTypeItem(item)) return result?.articleType ?? '—'
  if (isIThenticate(item)) return `${result?.percent ?? '—'}%`
  if (isAIItem(item)) {
    return `Human ${result?.green ?? 0}% · Maybe AI ${result?.yellow ?? 0}% · Likely AI ${result?.red ?? 0}%`
  }
  if (isImageItem(item)) return result?.status === 'pass' ? 'Pass' : 'Alert'
  if (isReferenceAnalysisItem(item)) {
    const total = result?.refs?.length ?? 0
    return `${total} found`
  }
  return '—'
}

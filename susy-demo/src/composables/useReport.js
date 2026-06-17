import { reactive, computed, toRaw } from 'vue'
import { detectionConfig } from '../migrated-detection/detection-config.js'

// Ethicality mock data (same as DetectionAssistant)
const ethicalityData = {
  issues_summary: {
    authors: { warning_count: 2, severe_warning_count: 1 },
    references: { warning_count: 3, severe_warning_count: 0 },
    ai_writing: { human_proportion: 0.52, maybe_ai_proportion: 0.28, likely_ai_proportion: 0.20 },
    peer_review_reports: [
      { human_proportion: 0.80, maybe_ai_proportion: 0.12, likely_ai_proportion: 0.08 },
      { human_proportion: 0.45, maybe_ai_proportion: 0.30, likely_ai_proportion: 0.25 },
    ],
  },
}

const ethicalityBData = {
  authors: [
    {
      name: 'Dr. John Smith', email: 'john.smith@example.com',
      issues: [
        { level: 'severe',  text: 'Card' },
        { level: 'warning', text: 'Poor Topic Similarity' },
      ],
    },
    {
      name: 'Prof. Li Wei', email: 'li.wei@example.com',
      issues: [{ level: 'warning', text: 'Poor Topic Similarity' }],
    },
  ],
  references: [
    {
      index: '[1]',
      title: 'Studies of the mechanism by which hepatic citrate synthase activity increases in vitamin B12 deprivation.',
      doi: '10.1042/bj0870078',
      problems: [
        { text: 'Out of scope',   level: 'warning' },
        { text: 'Out of context', level: 'warning' },
      ],
    },
    {
      index: '[12]',
      title: 'Reduced expression of citrate synthase leads to excessive superoxide formation and cell apoptosis',
      doi: '10.1038/s41419-020-2638-4',
      problems: [
        { text: 'Outdated',   level: 'warning' },
        { text: 'Corrected',  level: 'severe'  },
      ],
    },
  ],
  ai_writing: {
    maybe_ai_proportion: 0.28,
    likely_ai_proportion: 0.20,
    peer_review_reports: [
      { maybe_ai_proportion: 0.12, likely_ai_proportion: 0.08 },
      { maybe_ai_proportion: 0.18, likely_ai_proportion: 0.22 },
    ],
  },
}

// Build full sections data (same as DetectionAssistant's handleRedetectAll)
function buildAllSections() {
  const base = detectionConfig.map(s => ({
    ...s,
    items: s.items.map(i => ({ ...i })),
  }))
  base.push({
    id: 'section-eth',
    title: 'Ethicality',
    items: [
      { id: 'item-eth-v4', title: 'Ethicality Check (PDF)', status: 'error', results: [], ethicality: ethicalityData, fileName: 'peer-review-v4.pdf' },
      { id: 'item-eth-v3', title: 'Ethicality Check (Plan B)', status: 'error', results: [], ethicalityB: ethicalityBData, fileName: 'peer-review-v3.pdf' },
    ],
  })
  return base
}

// Singleton state — only used by ReportBuilder for selection state
let state = null

export function useReport() {
  if (!state) {
    const sections = buildAllSections()

    // Build flat item list with selection state
    const items = []
    sections.forEach(section => {
      section.items.forEach(item => {
        // Skip pending/failed ethicality items
        if (item.ethicalityPending || item.ethicalityFailed) return
        items.push({
          id: item.id,
          sectionId: section.id,
          sectionTitle: section.title,
          title: item.title || section.title,
          description: item.description || '',
          status: item.status,
          results: item.results || [],
          ethicality: item.ethicality || null,
          ethicalityB: item.ethicalityB || null,
          fileName: item.fileName || null,
          // Report state
          included: item.status !== 'healthy',
          annotation: {
            accurate: null,  // true | false | null
            note: '',
          },
        })
      })
    })

    state = reactive({
      manuscriptId: 'nutrients-4224751',
      journal: 'Nutrients',
      generatedAt: null,
      items,
    })
  }

  const includedItems = computed(() => state.items.filter(i => i.included))

  // All items grouped by section (for left panel selection)
  const allSections = computed(() => {
    const map = {}
    state.items.forEach(item => {
      if (!map[item.sectionId]) {
        map[item.sectionId] = {
          id: item.sectionId,
          title: item.sectionTitle,
          items: [],
        }
      }
      map[item.sectionId].items.push(item)
    })
    return Object.values(map)
  })

  // Only included items grouped by section (for report preview)
  const sections = computed(() => {
    const map = {}
    includedItems.value.forEach(item => {
      if (!map[item.sectionId]) {
        map[item.sectionId] = {
          id: item.sectionId,
          title: item.sectionTitle,
          items: [],
        }
      }
      map[item.sectionId].items.push(item)
    })
    return Object.values(map)
  })

  const stats = computed(() => {
    const all = includedItems.value
    const error = all.filter(i => i.status === 'error').length
    const warning = all.filter(i => i.status === 'warning').length
    const healthy = all.filter(i => i.status === 'healthy').length
    const flagged = all.filter(i => i.annotation.accurate === false).length
    return { error, warning, healthy, flagged, total: all.length }
  })

  function toggleItem(id) {
    const item = state.items.find(i => i.id === id)
    if (item) item.included = !item.included
  }

  function toggleSection(sectionId) {
    const sectionItems = state.items.filter(i => i.sectionId === sectionId)
    const allIncluded = sectionItems.every(i => i.included)
    sectionItems.forEach(i => { i.included = !allIncluded })
  }

  function setAnnotation(id, annotation) {
    const item = state.items.find(i => i.id === id)
    if (item) {
      item.annotation.accurate = annotation.accurate
      item.annotation.note = annotation.note
    }
  }

  function updateItem(id, updates) {
    const item = state.items.find(i => i.id === id)
    if (item) {
      if (updates.title !== undefined) item.title = updates.title
      if (updates.description !== undefined) item.description = updates.description
      if (updates.status !== undefined) item.status = updates.status
      if (updates.results !== undefined) item.results = updates.results
    }
  }

  function resetState() {
    state = null
  }

  return {
    state,
    allSections,
    sections,
    includedItems,
    stats,
    toggleItem,
    toggleSection,
    setAnnotation,
    updateItem,
    resetState,
  }
}

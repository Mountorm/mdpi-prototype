// ============================================
// Shared checklist store — the single source of truth for the checklist
// template. The Configuration page (/config) edits this store; the Generate
// and Report pages read the same live items, so journal-level config changes
// apply everywhere without a refresh.
// Seeded from ace.js on startup (prototype: in-memory only, not persisted).
// ============================================
import { reactive } from 'vue'
import {
  checklistItems as seedItems,
  categories as seedCategories,
  pilotJournals as seedJournals,
  JOURNAL_TOTAL,
} from '../mock/ace.js'

const cloneItem = (i) => ({ ...i, rule: i.rule ? { ...i.rule } : null })

export const checklistStore = reactive({
  items: seedItems.map(cloneItem),
  categories: [...seedCategories],
  journals: seedJournals.map((j) => ({ ...j })),
  JOURNAL_TOTAL,
})

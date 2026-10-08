<script setup>
// Shared Technical Precheck Report layout (report3 style).
// Parents supply the entries. Static report3 passes fixed notes and placeholder
// links; the live /report page passes the generate-page submission.
import { ref, computed } from 'vue'
import MdIcon from './MdIcon.vue'
import {
  isNumberItem, isScopeItem, isArticleTypeItem, isIThenticate, isAIItem, isImageItem,
  scopeStatusText,
} from '../utils/itemKinds.js'

const props = defineProps({
  entries: { type: Array, required: true },
  countsNote: { type: String, default: '' },
  noteOf: { type: Function, required: true },
  articleTypeOf: { type: Function, required: true },
  placeholderLinks: { type: Boolean, default: false },
  mainOnly: { type: Boolean, default: false },
})

const SECTION_ORDER = ['Manuscript Information', 'Ethical Issues', 'Reference Analysis']
const aiExpanded = ref(true)

const warningItems = computed(() => props.entries.filter((e) => e.ans.status === 'warning'))

const sections = computed(() => {
  const grouped = new Map()
  props.entries.forEach((e) => {
    if (!grouped.has(e.item.category)) grouped.set(e.item.category, [])
    grouped.get(e.item.category).push(e)
  })
  const known = SECTION_ORDER.filter((cat) => grouped.has(cat))
  const rest = [...grouped.keys()].filter((cat) => !SECTION_ORDER.includes(cat))
  return [...known, ...rest].map((cat) => ({
    key: cat,
    title: cat,
    list: grouped.get(cat),
  }))
})

const sectionItems = (section) => {
  if (section.key !== 'Manuscript Information') return { numbers: [], others: section.list }
  return {
    numbers: section.list.filter((e) => isNumberItem(e.item)),
    others: section.list.filter((e) => !isNumberItem(e.item)),
  }
}

const showBadge = (entry) => entry.item.flagRequired && entry.ans.status
const badgeLabel = (entry) => (entry.ans.status === 'passed' ? 'Passed' : 'Warning')
const showResult = (entry) => Boolean(entry.ans.resultVisible) && Boolean(entry.result)

const hrefFor = (entry) => {
  const url = entry.result?.reportUrl
  if (!url) return ''
  return props.placeholderLinks ? '#' : url
}
const onLinkClick = (event) => {
  if (props.placeholderLinks) event.preventDefault()
}

const jumpToItem = (id) => {
  document.getElementById(`r3-item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const DONUT_C = 2 * Math.PI * 32
const aiSegments = (result) => {
  const defs = [
    { key: 'green', label: 'Human', color: '#256b41' },
    { key: 'yellow', label: 'Maybe AI', color: '#e0a34e' },
    { key: 'red', label: 'Likely AI', color: '#c7352d' },
  ]
  let offset = 0
  return defs.map((d) => {
    const percent = result?.[d.key] ?? 0
    const dash = (DONUT_C * percent) / 100
    const seg = { ...d, percent, dash, offset: -offset }
    offset += dash
    return seg
  })
}
const aiSummary = (result) =>
  `Human ${result?.green ?? 0}% · Maybe AI ${result?.yellow ?? 0}% · Likely AI ${result?.red ?? 0}%`
</script>

<template>
  <section class="r3" :class="{ 'r3-main-only': mainOnly }">
    <h1 v-if="!mainOnly" class="r3-title">Technical Precheck Report</h1>

    <div class="r3-layout">
      <div class="r3-main">
        <section v-for="section in sections" :key="section.key" class="r3-panel">
          <h2 class="r3-section-title">{{ section.title }}</h2>

          <article v-if="sectionItems(section).numbers.length" class="r3-counts">
            <div v-for="e in sectionItems(section).numbers" :key="e.item.id" class="r3-counts-row">
              <div v-for="part in e.item.parts" :key="part.key" class="r3-count">
                <div class="r3-count-label">{{ part.title }}</div>
                <div class="r3-count-value">{{ e.ans.counts?.[part.key] ?? '—' }}</div>
              </div>
            </div>
            <p v-if="countsNote.trim()" class="r3-note">
              <span class="r3-note-label">Assistant Editor's Note:</span> {{ countsNote }}
            </p>
          </article>

          <article
            v-for="e in sectionItems(section).others"
            :id="`r3-item-${e.item.id}`"
            :key="e.item.id"
            class="r3-card"
          >
            <header class="r3-card-head">
              <h3 class="r3-card-title">{{ e.item.title }}</h3>
              <span v-if="showBadge(e)" class="r3-badge" :class="e.ans.status">{{ badgeLabel(e) }}</span>
            </header>
            <p class="r3-desc">{{ e.item.description }}</p>

            <p v-if="showResult(e) && isScopeItem(e.item)" class="r3-result">{{ scopeStatusText(e.result).text }}</p>
            <p v-else-if="articleTypeOf(e)" class="r3-result">{{ articleTypeOf(e) }}</p>

            <div v-else-if="showResult(e) && isIThenticate(e.item)" class="r3-result r3-inline">
              <span>Similarity: {{ e.result?.percent ?? '—' }}%</span>
              <a
                v-if="hrefFor(e)"
                class="r3-link"
                :href="hrefFor(e)"
                :target="placeholderLinks ? undefined : '_blank'"
                rel="noopener"
                @click="onLinkClick"
              >See iThenticate Report</a>
            </div>

            <div v-else-if="showResult(e) && isAIItem(e.item)" class="r3-result">
              <div class="r3-ai-row">
                <span>AI Ratio</span>
                <span>{{ aiSummary(e.result) }}</span>
                <button class="r3-less" type="button" @click="aiExpanded = !aiExpanded">
                  <MdIcon :name="aiExpanded ? 'expand_less' : 'expand_more'" :size="16" />
                  {{ aiExpanded ? 'Less' : 'Details' }}
                </button>
              </div>
              <div v-if="aiExpanded" class="r3-donut-wrap">
                <svg class="r3-donut" viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#e6e8ec" stroke-width="14" />
                  <circle
                    v-for="s in aiSegments(e.result)"
                    :key="s.key"
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    :stroke="s.color"
                    stroke-width="14"
                    :stroke-dasharray="`${s.dash} ${DONUT_C}`"
                    :stroke-dashoffset="s.offset"
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <ul class="r3-legend">
                  <li v-for="s in aiSegments(e.result)" :key="s.key">
                    <i :style="{ background: s.color }"></i>{{ s.label }} {{ s.percent }}%
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="showResult(e) && isImageItem(e.item)" class="r3-result r3-inline">
              <span>{{ e.result?.status === 'pass' ? 'Pass' : 'Alert' }}</span>
              <a
                v-if="hrefFor(e)"
                class="r3-link"
                :href="hrefFor(e)"
                :target="placeholderLinks ? undefined : '_blank'"
                rel="noopener"
                @click="onLinkClick"
              >See the report</a>
            </div>

            <p v-if="noteOf(e)" class="r3-note">
              <span class="r3-note-label">Assistant Editor's Note:</span> {{ noteOf(e) }}
            </p>
          </article>
        </section>
      </div>

      <aside
        v-if="!mainOnly"
        class="r3-warn"
        :class="{ passed: warningItems.length === 0 }"
        :aria-label="warningItems.length ? 'Warning items' : 'All checks passed'"
      >
        <template v-if="warningItems.length">
          <div class="r3-warn-title">{{ warningItems.length }} Warning Items</div>
          <ul class="r3-warn-list">
            <li v-for="e in warningItems" :key="e.item.id">
              <a class="r3-warn-link" :href="`#r3-item-${e.item.id}`" @click.prevent="jumpToItem(e.item.id)">{{ e.item.title }}</a>
            </li>
          </ul>
        </template>
        <template v-else>
          <div class="r3-pass-title">All Checks Passed</div>
          <p class="r3-pass-desc">All precheck items have passed with no warnings flagged.</p>
        </template>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.r3-main-only { padding: 0; background: transparent; }
.r3-main-only .r3-layout { display: block; }
.r3 {
  padding: 16px;
  box-sizing: border-box;
  color: #172b4d;
  background: #fff;
  font-size: 14px;
}
.r3-title {
  margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #0156ce;
  font-size: 18px;
  font-weight: 650;
}
.r3-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 16px;
  align-items: start;
}
.r3-panel {
  background: #f8f9fd;
  border: 1px solid #dcdfe4;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}
.r3-panel:last-child { margin-bottom: 0; }
.r3-section-title {
  margin: 0 0 12px;
  color: #172b4d;
  font-size: 16px;
  font-weight: 600;
}
.r3-counts {
  background: #fff;
  border: 1px solid #dcdfe4;
  border-radius: 4px;
  padding: 18px 20px;
  margin-bottom: 12px;
}
.r3-counts-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.r3-counts-row:has(+ .r3-note) { margin-bottom: 16px; }
.r3-count {
  padding: 0 20px;
  border-left: 1px solid #e3e4e6;
}
.r3-count:first-child { padding-left: 0; border-left: none; }
.r3-count-label { color: #1a2a4c; font-size: 14px; font-weight: 700; line-height: 1.3; }
.r3-count-value { margin-top: 8px; color: #172b4d; font-size: 16px; font-weight: 400; line-height: 1.3; }
.r3-card {
  background: #fff;
  border: 1px solid #dcdfe4;
  border-radius: 4px;
  padding: 14px 16px;
  margin-bottom: 12px;
  scroll-margin-top: 12px;
}
.r3-card:last-child { margin-bottom: 0; }
.r3-warn {
  position: sticky;
  top: 16px;
  box-sizing: border-box;
  width: 260px;
  background: #fefce8;
  border-left: 4px solid #eab308;
  padding: 18px 14px 18px 16px;
}
.r3-warn-title { margin: 0 0 14px; color: #1f1f1d; font-size: 15px; font-weight: 700; line-height: 1.3; }
.r3-warn-list { margin: 0; padding: 0; list-style: none; }
.r3-warn-list li { color: #172b4d; font-size: 13px; font-weight: 400; line-height: 1.35; }
.r3-warn-list li + li { margin-top: 12px; }
.r3-warn-link { color: #172b4d; text-decoration: none; }
.r3-warn-link:hover { text-decoration: underline; }
.r3-warn.passed {
  background: #f1fef8;
  border-left-color: #3cc281;
}
.r3-pass-title {
  margin: 0 0 12px;
  color: #005229;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
}
.r3-pass-desc {
  margin: 0;
  color: #005229;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}
.r3-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.r3-card-title { margin: 0; color: #000; font-size: 16px; font-weight: 600; }
.r3-badge {
  flex-shrink: 0;
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.r3-badge.passed { color: #005229; background: #bfeed7; }
.r3-badge.warning { color: #8f570d; background: #fef9c3; }
.r3-desc { margin: 4px 0 8px; color: #172b4d; font-size: 12px; font-weight: 400; }
.r3-result {
  margin: 0;
  padding: 8px 12px;
  border-radius: 4px;
  background: #f8f9fd;
  color: #172b4d;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}
.r3-note {
  margin: 8px 0 0;
  padding: 8px 12px;
  border-radius: 4px;
  background: #e6eefa;
  color: #172b4d;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  /* keep the editor's line breaks typed in the comment textarea */
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
.r3-note-label { color: #172b4d; font-size: 14px; font-weight: 600; }
.r3-counts .r3-note { margin: 0; }
.r3-inline { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.r3-link { color: #0156ce; text-decoration: underline; }
.r3-link:hover { color: #014bb5; }
.r3-ai-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.r3-less {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: none;
  background: transparent;
  color: #3e4a5a;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.r3-less:focus-visible { outline: 2px solid #0156ce; outline-offset: 2px; }
.r3-donut-wrap { display: flex; align-items: center; gap: 18px; margin-top: 12px; }
.r3-donut { width: 88px; height: 88px; flex-shrink: 0; }
.r3-legend { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
.r3-legend i { display: inline-block; width: 8px; height: 8px; margin-right: 6px; border-radius: 1px; }
@media (max-width: 900px) {
  .r3-layout { grid-template-columns: 1fr; }
  .r3-warn { width: 100%; }
  .r3-counts-row { grid-template-columns: 1fr; }
  .r3-count { padding: 12px 0; border-left: none; border-top: 1px solid #e3e4e6; }
  .r3-count:first-child { padding-top: 0; border-top: none; }
}
</style>

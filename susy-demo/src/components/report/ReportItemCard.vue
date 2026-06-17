<template>
  <div class="rp-card">
    <!-- Header -->
    <div class="rp-card__head">
      <div class="rp-card__head-left">
        <span v-if="item.annotation.note" class="rp-card__flag material-symbols-outlined">flag</span>
        <span class="rp-card__title">{{ item.title }}</span>
        <span :class="['rp-card__status', `rp-card__status--${item.status}`]">{{ statusLabel }}</span>
      </div>
    </div>

    <!-- Description -->
    <p v-if="item.description" class="rp-card__desc">{{ item.description }}</p>

    <!-- Results -->
    <div v-if="!item.ethicality && !item.ethicalityB" class="rp-card__results">
      <div v-for="(rb, ri) in item.results" :key="ri" class="rp-card__result-block">
        <p class="rp-card__result-text">
          <template v-if="rb.resultSlots">
            <template v-for="(seg, si) in parseResultSlots(rb.result, rb.resultSlots)" :key="si">
              <span v-if="seg.type === 'text'">{{ seg.content }}</span>
              <a v-else-if="seg.type === 'link'" :href="seg.href" target="_blank" class="rp-card__link">{{ seg.content }}</a>
              <el-tooltip v-else-if="seg.type === 'tooltip'" :content="seg.tooltip" placement="top">
                <span class="material-symbols-outlined rp-card__tooltip-icon">info</span>
              </el-tooltip>
            </template>
          </template>
          <template v-else>{{ rb.result }}</template>
        </p>
        <div v-if="rb.author" class="rp-card__author">
          <span class="rp-card__author-name">{{ rb.author.name }}</span>
          <span v-if="rb.author.email" class="rp-card__author-email">&lt;{{ rb.author.email }}&gt;</span>
        </div>
        <!-- Details -->
        <div v-if="rb.details?.length || rb.htmlContent" class="rp-card__details">
          <div v-if="rb.detailsType === 'html'" v-html="rb.htmlContent" />
          <ul v-else-if="rb.details">
            <li v-for="(d, di) in rb.details" :key="di">{{ d }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Ethicality (Plan A) -->
    <div v-if="item.ethicality" class="rp-card__eth">
      <div class="rp-card__eth-row">
        <span class="rp-card__eth-label">Authors</span>
        <template v-if="item.ethicality.issues_summary.authors.warning_count === 0 && item.ethicality.issues_summary.authors.severe_warning_count === 0">
          <span class="rp-card__eth-ok">No issues</span>
        </template>
        <template v-else>
          <span v-if="item.ethicality.issues_summary.authors.severe_warning_count" class="rp-card__eth-count rp-card__eth-count--severe">{{ item.ethicality.issues_summary.authors.severe_warning_count }}</span>
          <span v-if="item.ethicality.issues_summary.authors.warning_count" class="rp-card__eth-count rp-card__eth-count--warn">{{ item.ethicality.issues_summary.authors.warning_count }}</span>
        </template>
      </div>
      <div class="rp-card__eth-row">
        <span class="rp-card__eth-label">References</span>
        <template v-if="item.ethicality.issues_summary.references.warning_count === 0 && item.ethicality.issues_summary.references.severe_warning_count === 0">
          <span class="rp-card__eth-ok">No issues</span>
        </template>
        <template v-else>
          <span v-if="item.ethicality.issues_summary.references.severe_warning_count" class="rp-card__eth-count rp-card__eth-count--severe">{{ item.ethicality.issues_summary.references.severe_warning_count }}</span>
          <span v-if="item.ethicality.issues_summary.references.warning_count" class="rp-card__eth-count rp-card__eth-count--warn">{{ item.ethicality.issues_summary.references.warning_count }}</span>
        </template>
      </div>
      <div class="rp-card__eth-row rp-card__eth-row--donuts">
        <span class="rp-card__eth-label">AI Writing</span>
        <div class="rp-card__donut-row">
          <div class="rp-card__donut">
            <span class="rp-card__donut-label">Manuscript</span>
            <span class="rp-card__donut-val">{{ pct100(item.ethicality.issues_summary.ai_writing.maybe_ai_proportion) }} maybe</span>
            <span class="rp-card__donut-val">{{ pct100(item.ethicality.issues_summary.ai_writing.likely_ai_proportion) }} likely</span>
          </div>
          <div v-for="(rpt, ri) in item.ethicality.issues_summary.peer_review_reports" :key="ri" class="rp-card__donut">
            <span class="rp-card__donut-label">Report {{ ri + 1 }}</span>
            <span class="rp-card__donut-val">{{ pct100(rpt.maybe_ai_proportion) }} maybe</span>
            <span class="rp-card__donut-val">{{ pct100(rpt.likely_ai_proportion) }} likely</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Ethicality (Plan B) -->
    <div v-if="item.ethicalityB" class="rp-card__eth">
      <div class="rp-card__eth-row">
        <span class="rp-card__eth-label">Authors</span>
        <template v-if="!item.ethicalityB.authors.length">
          <span class="rp-card__eth-ok">No issues</span>
        </template>
        <template v-else>
          <span v-if="item.ethicalityB.authors.reduce((s,a)=>s+a.issues.filter(i=>i.level==='severe').length,0)" class="rp-card__eth-count rp-card__eth-count--severe">{{ item.ethicalityB.authors.reduce((s,a)=>s+a.issues.filter(i=>i.level==='severe').length,0) }}</span>
          <span v-if="item.ethicalityB.authors.reduce((s,a)=>s+a.issues.filter(i=>i.level!=='severe').length,0)" class="rp-card__eth-count rp-card__eth-count--warn">{{ item.ethicalityB.authors.reduce((s,a)=>s+a.issues.filter(i=>i.level!=='severe').length,0) }}</span>
        </template>
      </div>
      <div v-if="item.ethicalityB.authors.length" class="rp-card__eth-detail">
        <div v-for="(author, ai) in item.ethicalityB.authors" :key="ai" class="rp-card__eth-author">
          <span class="rp-card__eth-author-name">{{ author.name }}</span>
          <span v-if="author.email" class="rp-card__eth-author-email">&lt;{{ author.email }}&gt;</span>
          <span v-for="(issue, ii) in author.issues" :key="ii" :class="['rp-card__eth-issue', issue.level === 'severe' ? 'rp-card__eth-issue--severe' : 'rp-card__eth-issue--warn']">{{ issue.text }}</span>
        </div>
      </div>

      <div class="rp-card__eth-row">
        <span class="rp-card__eth-label">References</span>
        <template v-if="!item.ethicalityB.references.length">
          <span class="rp-card__eth-ok">No issues</span>
        </template>
        <template v-else>
          <span v-if="item.ethicalityB.references.flatMap(r=>r.problems).filter(p=>p.level==='severe').length" class="rp-card__eth-count rp-card__eth-count--severe">{{ item.ethicalityB.references.flatMap(r=>r.problems).filter(p=>p.level==='severe').length }}</span>
          <span v-if="item.ethicalityB.references.flatMap(r=>r.problems).filter(p=>p.level!=='severe').length" class="rp-card__eth-count rp-card__eth-count--warn">{{ item.ethicalityB.references.flatMap(r=>r.problems).filter(p=>p.level!=='severe').length }}</span>
        </template>
      </div>
      <div v-if="item.ethicalityB.references.length" class="rp-card__eth-detail">
        <div v-for="(ref, ri) in item.ethicalityB.references" :key="ri" class="rp-card__eth-ref">
          <span class="rp-card__eth-ref-idx">{{ ref.index }}</span>
          <span class="rp-card__eth-ref-title">{{ ref.title }}</span>
          <a v-if="ref.doi" :href="'https://doi.org/' + ref.doi" target="_blank" class="rp-card__link">DOI: {{ ref.doi }}</a>
          <span v-for="(p, pi) in ref.problems" :key="pi" :class="['rp-card__eth-issue', p.level === 'severe' ? 'rp-card__eth-issue--severe' : 'rp-card__eth-issue--warn']">{{ p.text }}</span>
        </div>
      </div>

      <div class="rp-card__eth-row rp-card__eth-row--donuts">
        <span class="rp-card__eth-label">AI Writing</span>
        <div class="rp-card__donut-row">
          <div class="rp-card__donut">
            <span class="rp-card__donut-label">Manuscript</span>
            <span class="rp-card__donut-val">{{ pct100(item.ethicalityB.ai_writing.maybe_ai_proportion) }} maybe</span>
            <span class="rp-card__donut-val">{{ pct100(item.ethicalityB.ai_writing.likely_ai_proportion) }} likely</span>
          </div>
          <div v-for="(rpt, ri) in item.ethicalityB.ai_writing.peer_review_reports" :key="ri" class="rp-card__donut">
            <span class="rp-card__donut-label">Report {{ ri + 1 }}</span>
            <span class="rp-card__donut-val">{{ pct100(rpt.maybe_ai_proportion) }} maybe</span>
            <span class="rp-card__donut-val">{{ pct100(rpt.likely_ai_proportion) }} likely</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Annotation -->
    <div v-if="item.annotation.note" class="rp-card__annotation">
      <div class="rp-card__annotation-head">
        <span class="material-symbols-outlined rp-card__annotation-icon">flag</span>
        <span class="rp-card__annotation-label">Editor's note</span>
      </div>
      <p class="rp-card__annotation-note">{{ item.annotation.note }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
})

const statusLabel = computed(() => {
  return { healthy: 'Passed', warning: 'Warning', error: 'Severe' }[props.item.status] || props.item.status
})

function parseResultSlots(result, slots) {
  if (!result || !slots) return [{ type: 'text', content: result || '' }]
  const parts = result.split(/({{[^}]+}})/)
  return parts.map(part => {
    const match = part.match(/^{{(.+)}}$/)
    if (match) {
      const key = match[1]
      return slots[key] ? { ...slots[key] } : { type: 'text', content: part }
    }
    return { type: 'text', content: part }
  }).filter(seg => seg.content !== '')
}

function pct100(ratio) {
  return ((ratio || 0) * 100).toFixed(0) + '%'
}
</script>

<style scoped>
.rp-card {
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
}
.rp-card:last-child { border-bottom: none; }

.rp-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}
.rp-card__head-left { display: flex; align-items: baseline; gap: 10px; min-width: 0; }

.rp-card__flag {
  font-size: 15px;
  color: #b45309;
  flex-shrink: 0;
}

.rp-card__title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.rp-card__status {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 2px 8px;
  flex-shrink: 0;
  line-height: 1.4;
}
.rp-card__status--error { color: #991b1b; background: #fef2f2; border: 1px solid #fecaca; }
.rp-card__status--warning { color: #92400e; background: #fffbeb; border: 1px solid #fde68a; }
.rp-card__status--healthy { color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; }

.rp-card__desc {
  font-size: 12.5px;
  color: #6b7280;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

/* Results */
.rp-card__results { display: flex; flex-direction: column; gap: 8px; }

.rp-card__result-block {
  padding: 10px 12px;
  background: #f9fafb;
}

.rp-card__result-text {
  font-size: 13px;
  color: #1f2937;
  margin: 0;
  line-height: 1.6;
}
.rp-card__link { color: #0156ce; text-decoration: underline; text-underline-offset: 2px; }
.rp-card__link:hover { color: #013a9e; }
.rp-card__tooltip-icon { font-size: 14px; color: #9ca3af; cursor: help; vertical-align: middle; }

.rp-card__author {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
}
.rp-card__author-name { font-weight: 600; color: #374151; }
.rp-card__author-email { color: #9ca3af; margin-left: 4px; }

.rp-card__details { margin-top: 8px; }
.rp-card__details ul { margin: 0; padding-left: 16px; }
.rp-card__details li {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.7;
  padding-left: 2px;
}

/* Ethicality */
.rp-card__eth { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.rp-card__eth-row { display: flex; align-items: center; gap: 10px; }
.rp-card__eth-row--donuts { flex-direction: column; align-items: flex-start; }
.rp-card__eth-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  min-width: 90px;
}
.rp-card__eth-ok { font-size: 12px; color: #6b7280; font-style: italic; }

.rp-card__eth-count {
  font-size: 12px;
  font-weight: 600;
  margin-right: 4px;
}
.rp-card__eth-count--severe { color: #b91c1c; }
.rp-card__eth-count--warn { color: #92400e; }

.rp-card__eth-issue {
  font-size: 11px;
  font-weight: 500;
  padding: 0 6px;
  border: 1px solid;
  line-height: 1.6;
}
.rp-card__eth-issue--severe { color: #b91c1c; border-color: #fecaca; }
.rp-card__eth-issue--warn { color: #92400e; border-color: #fde68a; }

.rp-card__eth-detail { padding-left: 100px; display: flex; flex-direction: column; gap: 6px; }
.rp-card__eth-author { font-size: 12px; color: #374151; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.rp-card__eth-author-name { font-weight: 600; }
.rp-card__eth-author-email { color: #9ca3af; }
.rp-card__eth-ref { font-size: 12px; color: #374151; display: flex; align-items: flex-start; gap: 6px; flex-wrap: wrap; }
.rp-card__eth-ref-idx { font-weight: 700; color: #0156ce; flex-shrink: 0; }
.rp-card__eth-ref-title { flex: 1; min-width: 200px; }

.rp-card__donut-row { display: flex; gap: 20px; padding-left: 100px; }
.rp-card__donut { display: flex; flex-direction: column; gap: 2px; }
.rp-card__donut-label { font-size: 11px; font-weight: 600; color: #374151; }
.rp-card__donut-val { font-size: 11px; color: #6b7280; }

/* Annotation */
.rp-card__annotation {
  margin-top: 10px;
  padding: 10px 12px;
  background: #fef3c7;
}
.rp-card__annotation-head {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
}
.rp-card__annotation-icon { font-size: 14px; color: #b45309; }
.rp-card__annotation-label { font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.3px; }
.rp-card__annotation-note { font-size: 13px; color: #78350f; margin: 0; line-height: 1.6; }
</style>

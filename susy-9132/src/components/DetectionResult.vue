<script setup>
// Shared detection-result block for one checklist item.
// - Generate page (readonly=false): AE sees the FULL result (always expanded) plus
//   a visibility toggle "show in AcEd report". Unavailable results (processing /
//   API error) are locked hidden.
// - Report page (readonly=true): shows a one-line summary, expandable to the full
//   result. Hidden entirely when the AE set visible=false.
import { ref, computed } from 'vue'
import MdIcon from './MdIcon.vue'
import {
  isNumberItem, isScopeItem, isIThenticate, isAIItem,
  isImageItem, isReferenceAnalysisItem, scopeStatusText,
  isResultUnavailable, resultSummary,
} from '../utils/itemKinds.js'

const props = defineProps({
  item: { type: Object, required: true },
  result: { type: Object, default: null },
  value: { type: [Number, String, Object], default: null },
  readonly: { type: Boolean, default: false },
  // whether the result is visible in the AcEd report (AE-controlled)
  visible: { type: Boolean, default: true },
  // when true (generate page, item selected), show the visibility toggle
  showVisibility: { type: Boolean, default: false },
})

const emit = defineEmits(['update:value', 'update:visible'])

const locked = computed(() => isResultUnavailable(props.item, props.result))

// evidence is expanded by default on both pages (generate: AE needs the full
// result; report: AcEd judges on the full evidence). "Less/Details" lets the
// reader collapse for scannability.
const expanded = ref(true)

// Only structured results have expandable details (AI donut, reference analysis).
// Single-value results (numbers, similarity %, article type, scope status, alert)
// are fully conveyed by their summary — no Details button, no hard-added expansion.
const hasDetails = computed(() =>
  isAIItem(props.item) || isReferenceAnalysisItem(props.item)
)

const summary = computed(() => resultSummary(props.item, props.result, props.value))

/* ---- AI donut ---- */
const aiActive = ref(null)
const DONUT_C = 2 * Math.PI * 32
const aiSegments = computed(() => {
  const r = props.result ?? { green: 0, yellow: 0, red: 0 }
  const defs = [
    { key: 'green', label: 'Human', color: '#256b41', active: '#1f6a40' },
    { key: 'yellow', label: 'Maybe AI', color: '#e0a34e', active: '#c9851f' },
    { key: 'red', label: 'Likely AI', color: '#c7352d', active: '#a52a20' },
  ]
  let offset = 0
  return defs.map((d) => {
    const percent = r[d.key] ?? 0
    const dash = (DONUT_C * percent) / 100
    const seg = { ...d, percent, dash, offset: -offset }
    offset += dash
    return seg
  })
})
</script>

<template>
  <!-- Report (readonly): hidden entirely when the AE chose not to show the result -->
  <div v-if="!readonly || visible" class="det-result">
    <!-- summary row (always): single-value results are fully shown here -->
    <div class="det-summary">
      <!-- scope: status text (single value, no details) -->
      <span
        v-if="isScopeItem(item)"
        class="det-summary-text"
        :class="scopeStatusText(result).tone"
      >{{ scopeStatusText(result).text }}</span>

      <!-- iThenticate: percent + report link -->
      <template v-else-if="isIThenticate(item)">
        <span class="det-summary-text">Similarity: {{ result?.percent ?? '—' }}%</span>
        <a
          v-if="result?.reportUrl"
          class="det-link"
          :href="result.reportUrl"
          target="_blank"
          rel="noopener"
        >iThenticate report<MdIcon name="chevron_right" :size="14" /></a>
      </template>

      <!-- image: pass / alert + further report link (link shown whenever a result exists) -->
      <template v-else-if="isImageItem(item)">
        <span
          class="det-summary-text"
          :class="result?.status === 'pass' ? 'passed' : 'warning'"
        >{{ result?.status === 'pass' ? 'Pass' : 'Alert' }}</span>
        <a
          v-if="result?.reportUrl"
          class="det-link"
          :href="result.reportUrl"
          target="_blank"
          rel="noopener"
        >Report<MdIcon name="chevron_right" :size="14" /></a>
      </template>

      <!-- numbers: report shows the value; generate edits it in the detail -->
      <span v-else-if="isNumberItem(item)" class="det-summary-text">{{ summary }}</span>

      <!-- article type / AI summary / reference summary: text -->
      <span v-else class="det-summary-text">{{ summary }}</span>

      <!-- expand/collapse (report only, structured results) -->
      <button
        v-if="readonly && hasDetails"
        class="det-toggle"
        type="button"
        @click="expanded = !expanded"
      >
        <MdIcon :name="expanded ? 'expand_less' : 'expand_more'" :size="14" />
        {{ expanded ? 'Less' : 'Details' }}
      </button>

      <!-- visibility toggle (generate only, once the item is selected) -->
      <label v-if="!readonly && showVisibility" class="det-vis">
        <el-checkbox
          :model-value="visible"
          :disabled="locked"
          @update:model-value="(v) => emit('update:visible', v)"
        >Show in report</el-checkbox>
      </label>
    </div>

    <!-- detail: number input (generate) and structured results (AI / reference analysis) -->
    <div
      v-show="(isNumberItem(item) && !item.parts && !readonly) || (hasDetails && expanded)"
      class="det-detail"
    >
      <!-- 1) numbers: editable input on generate -->
      <template v-if="isNumberItem(item) && !item.parts">
        <el-input-number
          :model-value="value"
          :min="0"
          :controls-position="'right'"
          class="det-num"
          @update:model-value="(v) => emit('update:value', v)"
        />
      </template>

      <!-- 2) AI donut -->
      <template v-else-if="isAIItem(item)">
        <div class="det-donut-wrap">
          <div class="det-donut-box" @mouseleave="aiActive = null">
            <svg class="det-donut" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#f0f2f5" stroke-width="14" />
              <circle
                v-for="(s, i) in aiSegments"
                :key="s.key"
                cx="40"
                cy="40"
                r="32"
                fill="none"
                :stroke="aiActive === i ? s.active : s.color"
                :stroke-width="aiActive === i ? 18 : 14"
                :stroke-dasharray="`${s.dash} ${DONUT_C}`"
                :stroke-dashoffset="s.offset"
                transform="rotate(-90 40 40)"
                class="det-donut-seg"
                @mouseenter="aiActive = i"
              />
            </svg>
          </div>
          <div class="det-donut-legend">
            <span
              v-for="(s, i) in aiSegments"
              :key="s.key"
              class="det-legend-item"
              :class="{ active: aiActive === i }"
              @mouseenter="aiActive = i"
              @mouseleave="aiActive = null"
            >
              <i class="det-legend-dot" :style="{ background: s.color }"></i>{{ s.label }} {{ s.percent }}%
            </span>
          </div>
        </div>
      </template>

      <!-- 3) Reference Analysis: per-dimension ref list -->
      <template v-else-if="isReferenceAnalysisItem(item)">
        <ul class="det-ref-list">
          <li v-for="r in result?.refs ?? []" :key="r.number">
            <span class="det-ref-num">[{{ r.number }}]</span>
            <span class="det-ref-cit">
              {{ r.title }}
              <span v-if="r.doi && r.doi !== '—'" class="det-ref-doi">DOI: {{ r.doi }}</span>
            </span>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<style scoped>
.det-result {
  padding: 8px 12px;
  border: 1px solid #eef0f3;
  border-radius: 6px;
  background: #fafbfe;
}
.det-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.det-summary-text { font-size: 13px; font-weight: 500; color: #1b3555; }
.det-summary-text.passed { color: #256b41; }
.det-summary-text.warning { color: #9a3d20; }
.det-summary-text.none { color: #5f6b7d; }
.det-toggle {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
  padding: 2px 6px;
  border: none;
  background: transparent;
  color: #0156ce;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.det-toggle:hover { text-decoration: underline; }
.det-vis {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
.det-vis .el-checkbox { margin-right: 0; }

.det-detail {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e1e5ea;
}
.det-text { font-size: 13px; font-weight: 500; color: #1b3555; }
.det-num { width: 150px; }
.det-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #0156ce;
  text-decoration: none;
}
.det-link:hover { text-decoration: underline; }

/* AI donut */
.det-donut-wrap { display: flex; align-items: center; gap: 18px; }
.det-donut-box { width: 76px; height: 76px; flex-shrink: 0; }
.det-donut { width: 100%; height: 100%; }
.det-donut-seg {
  cursor: pointer;
  transition: stroke-width 0.15s ease, stroke 0.15s ease;
}
.det-donut-legend { display: flex; flex-direction: column; gap: 6px; }
.det-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #3e4a5a;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.det-legend-item.active { background: #f0f3fb; }
.det-legend-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }

/* Reference Analysis: per-dimension ref list */
.det-ref-list {
  flex-basis: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}
.det-ref-list li { padding: 3px 0; font-size: 12.5px; color: #33445b; }
.det-ref-num { display: inline-block; min-width: 34px; font-weight: 600; color: #5f6b7d; }
.det-ref-cit { color: #33445b; }
.det-ref-doi { color: #778293; font-size: 12px; }

/* print: force full evidence, hide the collapse toggle */
@media print {
  .det-toggle { display: none !important; }
  .det-detail { display: flex !important; }
}
</style>

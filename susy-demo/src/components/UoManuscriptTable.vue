<template>
  <div class="uo-ms-table">
    <button v-if="toggleable" type="button" class="uo-ms-toggle" @click="expanded = !expanded">
      Show/Hide
    </button>

    <div v-show="!toggleable || expanded" class="uo-ms-scroll">
      <table class="uo-ms-grid">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Journal</th>
            <th scope="col">Status</th>
            <th scope="col">Submission Date</th>
            <th v-if="showReviewReport" scope="col">Review Report</th>
            <th v-if="showInvoice" scope="col">Invoice</th>
            <th v-if="showApt" scope="col">APT</th>
            <th v-if="showReviewReport" scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ms, i) in visibleRows" :key="ms.msid || i">
            <!-- Title (+ MSID + Summary + Retracted) — 与 Twig 同一列 -->
            <td class="uo-ms-title">
              <template v-if="ms.titleUrl">
                <a :href="ms.titleUrl" target="_blank" rel="noopener noreferrer" class="uo-ms-link">{{ ms.title }}</a>
                (<span class="uo-ms-msid">{{ ms.msid }}</span>)
              </template>
              <template v-else>
                {{ ms.title }} (
                <a v-if="ms.msidUrl" :href="ms.msidUrl" class="uo-ms-link"><span class="uo-ms-msid">{{ ms.msid }}</span></a>
                <span v-else class="uo-ms-msid">{{ ms.msid }}</span>
                )
              </template>
              &nbsp;(<a :href="ms.summaryUrl" class="uo-ms-link uo-ms-msid">Manuscript Summary</a>)
              <template v-if="ms.retracted">
                &nbsp;<span class="uo-ms-retracted">Retracted</span>
              </template>
            </td>

            <td>
              <a :href="ms.journalUrl" target="_blank" rel="noopener noreferrer" class="uo-ms-link">
                <i>{{ ms.journal }}</i>
              </a>
            </td>
            <td :title="'current status'">{{ ms.status }}</td>
            <td class="uo-ms-nowrap" :title="'submission date: ' + ms.submissionDate">{{ ms.submissionDate }}</td>

            <td v-if="showReviewReport">
              <a
                v-if="ms.reviewReportUrl"
                :href="ms.reviewReportUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="uo-ms-link"
              >Review report</a>
            </td>

            <td v-if="showInvoice" v-html="ms.invoiceHtml || ''"></td>

            <td v-if="showApt" class="uo-ms-num">{{ ms.apt ?? '—' }}</td>

            <td v-if="showReviewReport" class="uo-ms-num">{{ ms.score ?? '' }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="hasMore" class="uo-ms-more">
        <button type="button" class="uo-ms-more-btn" @click="loadMore">
          <span class="material-symbols-outlined uo-ms-more-icon">refresh</span>
          Load More
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 对齐 templates/UserInfo/show.html.twig → show_manuscripts macro
 *
 * 列顺序：Title | Journal | Status | Date | [Review report] | [Invoice] | [APT] | [Score]
 * - showReviewReport：Reviewed Manuscripts 为 true（同时控制 Review report + Score）
 * - showInvoice：isEmployee && show_scholar_apc_info
 * - showApt：isEmployee
 * - toggleable + 默认折叠：Editors 决策表（Twig show=false）
 */
import { ref, computed, watch } from 'vue'

const props = defineProps({
  manuscripts: { type: Array, default: () => [] },
  /** Reviewed：显示 Review report + Score */
  showReviewReport: { type: Boolean, default: false },
  /** 员工且 show_scholar_apc_info */
  showInvoice: { type: Boolean, default: true },
  /** 员工 */
  showApt: { type: Boolean, default: true },
  /** Editors 决策表：Show/Hide，默认折叠 */
  toggleable: { type: Boolean, default: false },
  defaultExpanded: { type: Boolean, default: true },
  pageSize: { type: Number, default: 10 }
})

const expanded = ref(props.defaultExpanded)
const visibleCount = ref(props.pageSize)

watch(
  () => props.manuscripts,
  () => {
    visibleCount.value = props.pageSize
  }
)

const visibleRows = computed(() => props.manuscripts.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < props.manuscripts.length)

function loadMore() {
  visibleCount.value = Math.min(
    visibleCount.value + props.pageSize,
    props.manuscripts.length
  )
}
</script>

<style scoped>
.uo-ms-table {
  margin-top: 4px;
}

.uo-ms-toggle {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  color: #0c66e4;
  cursor: pointer;
  text-decoration: underline;
  margin: 0 0 0 4px;
}

.uo-ms-toggle:hover {
  color: #0055cc;
}

.uo-ms-scroll {
  overflow-x: auto;
  margin-top: 6px;
  border: 1px solid #ddd;
  border-radius: 0;
}

.uo-ms-grid {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #333;
}

.uo-ms-grid thead th {
  background: #f8f8f8;
  color: #48516d;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
  padding: 10px 12px;
  border: none;
}

.uo-ms-grid tbody td {
  padding: 10px 12px;
  border: none;
  vertical-align: top;
}

.uo-ms-grid tbody tr:nth-child(odd) td {
  background: #fefefe;
}

.uo-ms-grid tbody tr:nth-child(even) td {
  background: #f1f1f1;
}

.uo-ms-grid tbody tr:hover td {
  background: #ffffdd;
}

.uo-ms-title {
  min-width: 220px;
  max-width: 420px;
}

.uo-ms-link {
  color: #0066cc;
  text-decoration: none;
}

.uo-ms-link:hover {
  text-decoration: underline;
}

.uo-ms-msid {
  font-size: 13px;
}

.uo-ms-retracted {
  color: #ae2a19;
  font-weight: 700;
}

.uo-ms-nowrap {
  white-space: nowrap;
}

.uo-ms-num {
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.uo-ms-more {
  display: flex;
  justify-content: center;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #ddd;
}

.uo-ms-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 4px 8px;
  font-size: 13px;
  font-weight: 400;
  color: #0066cc;
  cursor: pointer;
}

.uo-ms-more-btn:hover {
  text-decoration: underline;
}

.uo-ms-more-icon {
  font-size: 18px;
  line-height: 1;
}
</style>

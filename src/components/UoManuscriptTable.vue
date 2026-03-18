<template>
  <div>
    <button class="link-btn" @click="expanded = !expanded">
      {{ expanded ? 'Collapse' : 'Expand' }} ({{ manuscripts.length }})
    </button>
    <div v-if="expanded" style="overflow-x:auto">
      <table class="data-table">
        <thead>
          <tr>
            <th>Title</th><th>MSID</th><th>Journal</th><th>Status</th>
            <th>Submission Date</th><th>Invoice</th><th>APT</th>
            <th v-if="showReviewReport">Review Report</th>
            <th v-if="showScore">Score</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ms, i) in manuscripts" :key="i">
            <td>
              <a :href="ms.link" target="_blank" class="link">{{ ms.title }}</a>
              <span v-if="ms.retracted" class="badge badge-danger">Retracted</span>
            </td>
            <td><a :href="ms.summaryLink" target="_blank" class="link">{{ ms.msid }}</a></td>
            <td><a :href="ms.journalUrl" target="_blank" class="link">{{ ms.journal }}</a></td>
            <td>{{ ms.status }}</td>
            <td>{{ ms.submissionDate }}</td>
            <td>{{ ms.invoice }}</td>
            <td>{{ ms.apt }}</td>
            <td v-if="showReviewReport">
              <a v-if="ms.reviewReportLink" :href="ms.reviewReportLink" target="_blank" class="link">Review report</a>
              <span v-else>—</span>
            </td>
            <td v-if="showScore">{{ ms.score ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({
  manuscripts: { type: Array, default: () => [] },
  showReviewReport: { type: Boolean, default: false },
  showScore: { type: Boolean, default: false }
})
const expanded = ref(true)
</script>

<style scoped>
.link-btn {
  background: none; border: 1px solid #d1d5db; border-radius: 4px;
  padding: 2px 10px; font-size: 12px; cursor: pointer; color: #374151; margin-bottom: 6px;
}
.link-btn:hover { background: #f3f4f6; }
.link { color: #2563eb; text-decoration: underline; font-size: 13px; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 6px; }
.badge-danger { background: #fee2e2; color: #dc2626; }
.data-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
.data-table th { background: #f8f9fa; padding: 6px 8px; text-align: left; border: 1px solid #e5e7eb; font-weight: 600; color: #374151; }
.data-table td { padding: 5px 8px; border: 1px solid #e5e7eb; vertical-align: top; }
.data-table tr:hover td { background: #f9fafb; }
</style>

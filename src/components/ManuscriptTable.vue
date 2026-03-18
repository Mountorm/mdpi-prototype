<template>
  <div class="mst-wrap">
    <table v-if="manuscripts?.length" class="mst-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>MSID</th>
          <th>Journal</th>
          <th>Status</th>
          <th>Submission Date</th>
          <th v-if="showInvoice">Invoice</th>
          <th v-if="showReview">Review Report</th>
          <th v-if="showReview">Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ms in manuscripts" :key="ms.id">
          <td>
            <a :href="ms.link" target="_blank" class="mst-link">{{ ms.title }}</a>
            <span v-if="ms.isRetracted" class="mst-badge mst-badge--retracted">Retracted</span>
            <a v-if="ms.summaryLink" :href="ms.summaryLink" target="_blank" class="mst-summary-link">Summary</a>
          </td>
          <td>{{ ms.msid }}</td>
          <td>
            <a v-if="ms.journal?.link" :href="ms.journal.link" target="_blank" class="mst-link">{{ ms.journal.name }}</a>
            <span v-else>{{ ms.journal?.name || '—' }}</span>
          </td>
          <td>{{ ms.currentStatus }}</td>
          <td>{{ ms.submissionDate }}</td>
          <td v-if="showInvoice">{{ ms.invoiceInfo || '—' }}</td>
          <td v-if="showReview">
            <a v-if="ms.reviewReportLink" :href="ms.reviewReportLink" target="_blank" class="mst-link">View</a>
            <span v-else>—</span>
          </td>
          <td v-if="showReview">{{ ms.reviewRating || '—' }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else class="mst-empty">No manuscripts</div>
  </div>
</template>

<script setup>
defineProps({
  manuscripts: Array,
  showInvoice: Boolean,
  showReview: Boolean,
})
</script>

<style scoped>
.mst-wrap { overflow-x: auto; }
.mst-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.mst-table th {
  background: #f8fafc; padding: 5px 8px; text-align: left;
  font-weight: 600; color: #64748b; border: 1px solid #e5e7eb;
  white-space: nowrap;
}
.mst-table td {
  padding: 5px 8px; border: 1px solid #e5e7eb;
  color: #1e293b; vertical-align: top;
}
.mst-table tr:hover td { background: #f8fafc; }
.mst-link { color: #0156ce; text-decoration: none; font-size: 12px; }
.mst-link:hover { text-decoration: underline; }
.mst-badge {
  font-size: 10px; font-weight: 700; padding: 1px 5px;
  border-radius: 8px; margin-left: 5px; white-space: nowrap;
}
.mst-badge--retracted { background: #fee2e2; color: #dc2626; }
.mst-summary-link {
  font-size: 11px; color: #94a3b8; text-decoration: none;
  margin-left: 6px;
}
.mst-summary-link:hover { text-decoration: underline; color: #0156ce; }
.mst-empty { font-size: 12px; color: #94a3b8; padding: 4px 0; }
</style>

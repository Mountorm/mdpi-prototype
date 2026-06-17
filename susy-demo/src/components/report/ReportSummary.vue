<template>
  <div class="rp-summary">
    <div class="rp-summary__title">Summary of Detection Results</div>
    <table class="rp-summary__table">
      <thead>
        <tr>
          <th>Category</th>
          <th class="rp-summary__th-num">Count</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Severe issues</td>
          <td class="rp-summary__td-num">{{ stats.error }}</td>
        </tr>
        <tr>
          <td>Warnings</td>
          <td class="rp-summary__td-num">{{ stats.warning }}</td>
        </tr>
        <tr>
          <td>Passed checks</td>
          <td class="rp-summary__td-num">{{ stats.healthy }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td>Total items reviewed</td>
          <td class="rp-summary__td-num">{{ stats.total }}</td>
        </tr>
      </tfoot>
    </table>
    <div v-if="stats.flagged" class="rp-summary__remark">
      {{ stats.flagged }} item(s) flagged by editor — see annotations in relevant sections below.
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: { type: Object, required: true },
})
</script>

<style scoped>
.rp-summary {
  margin-bottom: 28px;
}
.rp-summary__title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
}
.rp-summary__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: #374151;
}
.rp-summary__table th,
.rp-summary__table td {
  padding: 6px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}
.rp-summary__table th {
  font-weight: 600;
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.rp-summary__table tfoot td {
  font-weight: 600;
  border-bottom: none;
  border-top: 2px solid #d1d5db;
  padding-top: 8px;
}
.rp-summary__th-num,
.rp-summary__td-num {
  text-align: right;
  width: 80px;
}
.rp-summary__remark {
  margin-top: 10px;
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}
</style>

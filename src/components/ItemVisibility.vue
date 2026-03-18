<template>
  <div class="iv-layout">
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">Visibility Rules</span>
        <span class="iv-header-hint">Control which detection items are visible to external users</span>
      </div>
      <div class="panel-body">
        <div class="table-shell">
          <div class="overflow-x-auto">
            <table class="w-full table-striped table-compact">
              <thead class="bg-gray-50 border-b border-border-color">
                <tr>
                  <th class="py-2 px-3 text-left text-xs font-semibold text-foreground">Section</th>
                  <th class="py-2 px-3 text-left text-xs font-semibold text-foreground">Item</th>
                  <th class="py-2 px-3 text-left text-xs font-semibold text-foreground">Description</th>
                  <th class="py-2 px-3 text-left text-xs font-semibold text-foreground" style="width:130px">Internal Only</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableRows" :key="row.id" class="border-b border-border-color hover:bg-gray-50">
                  <td class="py-2 px-3 text-xs text-secondary">{{ row.sectionTitle }}</td>
                  <td class="py-2 px-3 text-xs font-medium text-foreground">{{ row.title }}</td>
                  <td class="py-2 px-3 text-xs text-secondary">{{ row.description || '—' }}</td>
                  <td class="py-2 px-3">
                    <el-switch v-model="row.internalOnly" size="small" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { detectionConfig } from '../migrated-detection/detection-config.js'

// Ethicality section 作为整体一行，其余 section 每个 item 单独一行
const tableRows = ref(
  detectionConfig.flatMap(section => {
    if (section.title === 'Ethicality') {
      return [{
        id: section.id,
        sectionTitle: section.title,
        title: 'Ethicality',
        description: section.description || '',
        internalOnly: false,
      }]
    }
    return section.items.map(item => ({
      id: item.id,
      sectionTitle: section.title,
      title: item.title,
      description: item.description || '',
      internalOnly: false,
    }))
  })
)
</script>

<style scoped>
.iv-layout { padding: 0; }
.iv-header-hint { font-size: 12px; color: #94a3b8; margin-left: 10px; font-weight: 400; }
</style>

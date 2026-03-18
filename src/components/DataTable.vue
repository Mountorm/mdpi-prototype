<template>
  <div class="data-table-wrapper">
    <!-- 表格容器 -->
    <div class="data-table-container table-shell">
      <div class="overflow-x-auto">
        <table class="w-full table-striped table-compact">
          <thead class="bg-gray-50 border-b border-border-color">
            <tr>
              <th 
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'py-2 px-2 text-left text-xs font-semibold text-foreground tracking-tight',
                  column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                ]"
                :style="column.style || { width: column.width || 'auto' }"
                @click="column.sortable !== false && handleSort(column.key)"
              >
                <div class="flex items-center gap-1">
                  <span class="whitespace-normal leading-tight">{{ column.label }}</span>
                  <svg 
                    v-if="column.sortable !== false && effectiveSortKey === column.key"
                    :class="['w-3 h-3 flex-shrink-0', { 'rotate-180': effectiveSortOrder === 'desc' }]"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4"></path>
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="row in paginatedData"
              :key="row.id"
              class="border-b border-border-color hover:bg-gray-50"
            >
              <td 
                v-for="column in columns"
                :key="column.key"
                class="py-2 px-2 text-xs text-foreground"
              >
                <slot :name="`cell-${column.key}`" :row="row" :column="column">
                  {{ row[column.key] }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div v-if="paginatedData.length === 0" class="data-table-empty">
        <slot name="empty">
          <div class="text-center py-12">
            <p class="text-gray-500 font-medium">No data available</p>
          </div>
        </slot>
      </div>
    </div>

    <!-- 分页器 -->
    <div v-if="pagination" class="data-table-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="data.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  pagination: {
    type: Boolean,
    default: true
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  defaultPageSize: {
    type: Number,
    default: 10
  },
  sortKey: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['sort-change', 'page-change'])

const currentPage = ref(1)
const pageSize = ref(props.defaultPageSize)

const innerSortKey = ref('')
const innerSortOrder = ref('')

const effectiveSortKey = computed(() => props.sortKey || innerSortKey.value)
const effectiveSortOrder = computed(() => props.sortOrder || innerSortOrder.value)

const paginatedData = computed(() => {
  if (!props.pagination) return props.data
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.data.slice(start, end)
})

watch(
  () => props.data.length,
  () => {
    const maxPage = Math.max(1, Math.ceil(props.data.length / pageSize.value))
    if (currentPage.value > maxPage) currentPage.value = maxPage
  }
)

const handleSort = (key) => {
  const currentKey = effectiveSortKey.value
  const currentOrder = effectiveSortOrder.value

  let nextOrder = 'asc'
  if (currentKey === key) {
    nextOrder = currentOrder === 'asc' ? 'desc' : 'asc'
  }

  if (!props.sortKey) innerSortKey.value = key
  if (!props.sortOrder) innerSortOrder.value = nextOrder

  emit('sort-change', { key, order: nextOrder })
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  emit('page-change', { page: currentPage.value, pageSize: pageSize.value })
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  emit('page-change', { page: currentPage.value, pageSize: pageSize.value })
}
</script>

<style scoped>
.data-table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.data-table-container {
  overflow: hidden;
}

.data-table-empty {
  border-top: 1px solid var(--color-border);
}

.data-table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
}

/* Element Plus 分页器样式调整 */
:deep(.el-pagination) {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 13px;
  color: #626f86;
}

:deep(.el-pagination__total) {
  color: #626f86;
  font-size: 13px;
}

:deep(.el-pagination__sizes) {
  margin: 0;
}

/* sizes 选择器：避免 width:auto 导致看起来“空白” */
:deep(.el-pagination__sizes .el-select) {
  min-width: 110px;
}

:deep(.el-pagination__sizes .el-select .el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-pagination__sizes .el-select .el-input__inner) {
  font-size: 13px;
  color: #172b4d;
}

:deep(.el-pagination__sizes .el-select .el-input__suffix-inner) {
  color: #626f86;
}

:deep(.el-pagination__jump) {
  margin-left: 0;
}

:deep(.el-pagination button) {
  color: #626f86;
}

:deep(.el-pagination button:hover) {
  color: #0156ce;
}

:deep(.el-pagination .el-pager li) {
  font-size: 13px;
  color: #626f86;
}

:deep(.el-pagination .el-pager li:hover) {
  color: #0156ce;
}

:deep(.el-pagination .el-pager li.is-active) {
  color: #0156ce;
  font-weight: 600;
}

:deep(.el-pagination__jump .el-input__inner) {
  font-size: 13px;
  color: #172b4d;
}
</style>

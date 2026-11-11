// 组件示例用的中性数据，不含任何业务含义
export const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' },
  { label: 'Option D (disabled)', value: 'd', disabled: true },
]

export const longOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `Option ${String(i + 1).padStart(2, '0')}`,
  value: `option-${i + 1}`,
}))

export const searchScopes = [
  { label: 'All', value: 'all' },
  { label: 'Title', value: 'title' },
  { label: 'ID', value: 'id' },
]

export const radioItems = ['Option one', 'Option two', 'Option three']

export const tableRows = Array.from({ length: 5 }, (_, i) => ({
  id: `row-${i + 1}`,
  name: `Item ${String(i + 1).padStart(2, '0')}`,
  category: ['Category A', 'Category B', 'Category C'][i % 3],
  date: `2026-0${(i % 9) + 1}-1${i % 9}`,
  state: ['Active', 'Pending', 'Archived'][i % 3],
}))

export const stepperSteps = [
  { name: 'Step one', status: 'done' },
  { name: 'Step two', status: 'done' },
  { name: 'Step three', status: 'progress' },
  { name: 'Step four', status: 'waiting' },
]

export const iconNames = [
  'home',
  'search',
  'settings',
  'person',
  'notifications',
  'calendar_today',
  'download',
  'upload_file',
  'check_circle',
  'info',
  'warning',
  'error',
]

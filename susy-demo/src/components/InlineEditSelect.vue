<template>
  <div class="inline-edit-select" :class="{ 'is-editing': editing }">
    <div v-if="!editing" class="inline-edit-select__display">
      <span class="inline-edit-select__value" :title="displayText">{{ displayText }}</span>
      <button
        type="button"
        class="inline-edit-select__action"
        @click="startEdit"
        :aria-label="editAriaLabel"
        :title="editAriaLabel"
      >
        <span class="material-symbols-outlined" style="font-size: 18px;">edit</span>
      </button>
    </div>

    <div v-else class="inline-edit-select__editor">
      <el-select
        v-model="draftValue"
        size="small"
        class="inline-edit-select__select"
        :filterable="filterable"
        :placeholder="placeholder"
      >
        <el-option
          v-for="opt in options"
          :key="String(opt.value)"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <button
        type="button"
        class="inline-edit-select__action inline-edit-select__action--save"
        @click="save"
        :aria-label="saveAriaLabel"
        :title="saveAriaLabel"
      >
        <span class="material-symbols-outlined" style="font-size: 18px;">save</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object, null],
    default: null
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  filterable: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: '—'
  },
  editAriaLabel: {
    type: String,
    default: 'Edit'
  },
  saveAriaLabel: {
    type: String,
    default: 'Save'
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const editing = ref(false)
const draftValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    if (!editing.value) draftValue.value = val
  }
)

const displayText = computed(() => {
  const found = props.options.find((o) => o.value === props.modelValue)
  if (found && typeof found.label !== 'undefined') return found.label
  if (props.modelValue === null || typeof props.modelValue === 'undefined' || props.modelValue === '') return props.emptyText
  return String(props.modelValue)
})

const startEdit = () => {
  draftValue.value = props.modelValue
  editing.value = true
}

const save = () => {
  emit('update:modelValue', draftValue.value)
  emit('save', draftValue.value)
  editing.value = false
}
</script>

<style scoped>
.inline-edit-select {
  display: flex;
  align-items: center;
  max-width: 100%;
}

.inline-edit-select__display,
.inline-edit-select__editor {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  max-width: 100%;
}

.inline-edit-select__value {
  flex: 0 1 auto;
  min-width: 0;
  max-width: calc(100% - 28px);
  color: #172b4d;
  font-size: 14px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inline-edit-select__select {
  flex: 0 1 260px;
  min-width: 180px;
  max-width: 100%;
}

.inline-edit-select__action {
  border: 1px solid transparent;
  background: transparent;
  color: #626f86;
  padding: 2px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.inline-edit-select__action:hover {
  color: #0156ce;
  background-color: #f3f4f6;
}

.inline-edit-select__action--save {
  color: #0156ce;
}
</style>

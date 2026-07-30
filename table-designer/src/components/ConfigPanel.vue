<script setup>
import { FONT_OPTIONS } from '../composables/useTableDesign'

defineProps({
  global: { type: Object, required: true },
  columns: { type: Array, required: true },
})

const emit = defineEmits(['reset-column', 'reset-all'])

function fixedMode(col) {
  if (col.fixed === true) return 'fixed'
  if (col.fixed === false) return 'flex'
  return 'inherit'
}

function setFixedMode(col, mode) {
  if (mode === 'fixed') col.fixed = true
  else if (mode === 'flex') col.fixed = false
  else col.fixed = null
}

function truncateMode(col) {
  if (col.truncate === true) return 'on'
  if (col.truncate === false) return 'off'
  return 'inherit'
}

function setTruncateMode(col, mode) {
  if (mode === 'on') col.truncate = true
  else if (mode === 'off') col.truncate = false
  else col.truncate = null
}
</script>

<template>
  <aside class="panel config-panel">
    <header class="panel-head">
      <div>
        <p class="eyebrow">Configuration</p>
        <h2>表格元数据</h2>
        <p class="hint panel-hint">调字体与疏密，方便对齐观感</p>
      </div>
      <button class="ghost-btn" type="button" @click="emit('reset-all')">重置覆盖</button>
    </header>

    <section class="block">
      <h3>全局默认</h3>
      <el-form label-position="top" size="small" class="form">
        <div class="grid-2">
          <el-form-item label="行数">
            <el-input-number v-model="global.rows" :min="1" :max="50" controls-position="right" />
          </el-form-item>
          <el-form-item label="列数">
            <el-input-number v-model="global.cols" :min="1" :max="20" controls-position="right" />
          </el-form-item>
        </div>
        <el-form-item label="默认列宽 (px)">
          <el-input-number
            v-model="global.defaultWidth"
            :min="40"
            :max="800"
            :step="10"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="字体">
          <el-select v-model="global.fontFamily" placeholder="选择字体">
            <el-option
              v-for="opt in FONT_OPTIONS"
              :key="opt.label"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="默认字号 (px)">
          <el-input-number
            v-model="global.fontSize"
            :min="10"
            :max="24"
            controls-position="right"
          />
        </el-form-item>
        <div class="grid-2">
          <el-form-item label="上下内边距 (px)">
            <el-input-number
              v-model="global.cellPaddingY"
              :min="2"
              :max="28"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="左右内边距 (px)">
            <el-input-number
              v-model="global.cellPaddingX"
              :min="4"
              :max="40"
              controls-position="right"
            />
          </el-form-item>
        </div>
        <el-form-item label="行高">
          <el-slider
            v-model="global.rowLineHeight"
            :min="1.1"
            :max="2"
            :step="0.1"
            show-input
          />
        </el-form-item>
        <div class="checks">
          <el-checkbox v-model="global.fixed">默认固定宽度</el-checkbox>
          <el-checkbox v-model="global.truncate">默认文本截断</el-checkbox>
          <el-checkbox v-model="global.headerBold">表头加粗</el-checkbox>
        </div>
      </el-form>
    </section>

    <section class="block grow">
      <div class="block-title-row">
        <h3>按列覆盖</h3>
        <span class="hint">空值 = 继承全局</span>
      </div>

      <el-collapse accordion class="col-collapse">
        <el-collapse-item v-for="(col, index) in columns" :key="col.id" :name="col.id">
          <template #title>
            <div class="col-title">
              <span class="col-index">{{ index + 1 }}</span>
              <span class="col-name">{{ col.name || `Column ${index + 1}` }}</span>
            </div>
          </template>

          <el-form label-position="top" size="small" class="form">
            <el-form-item label="列名">
              <el-input v-model="col.name" placeholder="Column name" />
            </el-form-item>
            <div class="grid-2">
              <el-form-item label="列宽 (px，可清空继承)">
                <el-input-number
                  v-model="col.width"
                  :min="40"
                  :max="800"
                  :step="10"
                  controls-position="right"
                  :value-on-clear="null"
                  placeholder="继承"
                />
              </el-form-item>
              <el-form-item label="字号 (px，可清空继承)">
                <el-input-number
                  v-model="col.fontSize"
                  :min="10"
                  :max="24"
                  controls-position="right"
                  :value-on-clear="null"
                  placeholder="继承"
                />
              </el-form-item>
            </div>
            <el-form-item label="宽度模式">
              <el-radio-group
                :model-value="fixedMode(col)"
                class="mode-group"
                @update:model-value="setFixedMode(col, $event)"
              >
                <el-radio value="inherit">继承</el-radio>
                <el-radio value="fixed">固定</el-radio>
                <el-radio value="flex">自适应</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="文本截断">
              <el-radio-group
                :model-value="truncateMode(col)"
                class="mode-group"
                @update:model-value="setTruncateMode(col, $event)"
              >
                <el-radio value="inherit">继承</el-radio>
                <el-radio value="on">截断</el-radio>
                <el-radio value="off">换行</el-radio>
              </el-radio-group>
            </el-form-item>
            <button class="ghost-btn" type="button" @click="emit('reset-column', index)">
              清除本列覆盖
            </button>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </section>
  </aside>
</template>

<style scoped>
.config-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.block {
  background: var(--bg-surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 14px;
  box-shadow: var(--shadow);
}

.block.grow {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.block h3,
.block-title-row h3 {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
}

.block-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 4px;
}

.hint {
  font-size: 11px;
  color: var(--ink-muted);
}

.panel-hint {
  margin: 6px 0 0;
  line-height: 1.4;
}

.form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.form :deep(.el-input-number),
.form :deep(.el-select) {
  width: 100%;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.checks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ghost-btn {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink-soft);
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 12px;
}

.ghost-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

.col-collapse :deep(.el-collapse-item__header) {
  height: 40px;
  line-height: 40px;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.col-index {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: var(--bg);
  color: var(--ink-soft);
  font-size: 11px;
  font-family: var(--mono);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.col-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.mode-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
}
</style>

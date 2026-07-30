<script setup>
import { computed, ref } from 'vue'
import { BREAKPOINTS } from '../composables/useTableDesign'

const props = defineProps({
  activeBreakpoint: { type: String, required: true },
  containerWidth: { type: Number, required: true },
  layout: { type: Object, required: true },
  tableRows: { type: Array, required: true },
  headerBold: { type: Boolean, default: true },
  global: { type: Object, required: true },
})

const emit = defineEmits([
  'update:breakpoint',
  'update:containerWidth',
  'resize-column',
  'update-cell',
  'update-column-name',
])

const frameDragging = ref(false)
const columnDragging = ref(-1)
/** 正在编辑的单元格，编辑时关闭截断以便看全并输入 */
const editingKey = ref('')

const activeLabel = computed(() => {
  return BREAKPOINTS.find((b) => b.key === props.activeBreakpoint)?.label || '自定义'
})

function onFramePointerDown(e) {
  frameDragging.value = true
  const startX = e.clientX
  const startW = props.containerWidth

  const onMove = (ev) => {
    const delta = ev.clientX - startX
    const next = Math.max(280, Math.min(1600, Math.round(startW + delta)))
    emit('update:containerWidth', next)
  }

  const onUp = () => {
    frameDragging.value = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

function onColumnResizeStart(index, e) {
  if (editingKey.value) return
  e.preventDefault()
  e.stopPropagation()
  columnDragging.value = index
  const startX = e.clientX
  const startWidth = props.layout.columns[index]?.computedWidth || 40

  const onMove = (ev) => {
    const delta = ev.clientX - startX
    emit('resize-column', index, startWidth + delta)
  }

  const onUp = () => {
    columnDragging.value = -1
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

/** 未溢出时按比例铺满容器，避免边框导致多出 1~2px 假滚动条 */
function colWidthStyle(col) {
  if (props.layout.overflow) {
    return { width: col.computedWidth + 'px' }
  }
  const total = Math.max(props.layout.tableWidth, 1)
  return { width: `${(col.computedWidth / total) * 100}%` }
}

function cellKey(rowIndex, colIndex) {
  return `${rowIndex}-${colIndex}`
}

function onCellFocus(key, event) {
  editingKey.value = key
  const el = event.currentTarget
  // 将光标放到末尾，避免整段被意外替换观感突兀
  requestAnimationFrame(() => {
    const range = document.createRange()
    const sel = window.getSelection()
    range.selectNodeContents(el)
    range.collapse(false)
    sel?.removeAllRanges()
    sel?.addRange(range)
  })
}

function onBodyCellBlur(rowIndex, colIndex, event) {
  editingKey.value = ''
  const text = event.currentTarget.textContent ?? ''
  emit('update-cell', rowIndex, colIndex, text)
}

function onHeaderBlur(colIndex, event) {
  editingKey.value = ''
  const text = (event.currentTarget.textContent ?? '').trim() || `Column ${colIndex + 1}`
  event.currentTarget.textContent = text
  emit('update-column-name', colIndex, text)
}

function onCellKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    event.currentTarget.blur()
  }
}
</script>

<template>
  <section class="panel preview-panel">
    <header class="panel-head">
      <div>
        <p class="eyebrow">Live Preview</p>
        <h2>实时表格</h2>
      </div>
      <div class="bp-group">
        <button
          v-for="bp in BREAKPOINTS"
          :key="bp.key"
          type="button"
          class="bp-btn"
          :class="{ active: activeBreakpoint === bp.key && containerWidth === bp.width }"
          @click="emit('update:breakpoint', bp.key)"
        >
          {{ bp.label }}
          <span>{{ bp.width }}</span>
        </button>
      </div>
    </header>

    <div class="toolbar">
      <div class="meta-chip" :class="{ warn: layout.overflow }">
        <span class="material-icons-outlined">{{ layout.overflow ? 'warning' : 'check_circle' }}</span>
        <template v-if="layout.overflow">
          需要左右滑动才能看完所有列
        </template>
        <template v-else>
          完整显示 · 容器 {{ containerWidth }}px（{{ activeLabel }}）
        </template>
      </div>
      <el-slider
        class="width-slider"
        :model-value="containerWidth"
        :min="280"
        :max="1600"
        :step="1"
        @update:model-value="emit('update:containerWidth', $event)"
      />
    </div>

    <div class="stage">
      <div
        class="frame"
        :class="{ dragging: frameDragging, 'col-resizing': columnDragging >= 0 }"
        :style="{ width: containerWidth + 'px' }"
      >
        <div class="frame-label">预览区</div>
        <div class="table-scroll" :class="{ overflow: layout.overflow }">
          <table
            class="design-table"
            :style="{
              ...(layout.overflow
                ? { width: layout.tableWidth + 'px' }
                : { width: '100%' }),
              fontFamily: global.fontFamily,
              '--cell-pad-y': global.cellPaddingY + 'px',
              '--cell-pad-x': global.cellPaddingX + 'px',
              '--row-lh': String(global.rowLineHeight),
            }"
          >
            <colgroup>
              <col
                v-for="col in layout.columns"
                :key="col.id"
                :style="colWidthStyle(col)"
              />
            </colgroup>
            <thead>
              <tr>
                <th
                  v-for="(col, index) in layout.columns"
                  :key="col.id"
                  :class="{ resizing: columnDragging === index }"
                  :style="{
                    ...colWidthStyle(col),
                    fontSize: col.fontSize + 'px',
                    fontWeight: headerBold ? 600 : 500,
                  }"
                >
                  <div
                    class="cell editable"
                    :class="{
                      truncate: col.truncate && editingKey !== `h-${index}`,
                    }"
                    contenteditable="true"
                    spellcheck="false"
                    :title="col.name"
                    @focus="onCellFocus(`h-${index}`, $event)"
                    @blur="onHeaderBlur(index, $event)"
                    @keydown="onCellKeydown"
                  >
                    {{ col.name }}
                  </div>
                  <div
                    class="col-resize-handle"
                    title="拖动调整列宽"
                    @pointerdown="onColumnResizeStart(index, $event)"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rIndex) in tableRows" :key="rIndex">
                <td
                  v-for="(cell, cIndex) in row"
                  :key="cIndex"
                  :style="{
                    ...colWidthStyle(layout.columns[cIndex]),
                    fontSize: layout.columns[cIndex].fontSize + 'px',
                  }"
                >
                  <div
                    class="cell editable"
                    :class="{
                      truncate:
                        layout.columns[cIndex].truncate &&
                        editingKey !== cellKey(rIndex, cIndex),
                    }"
                    contenteditable="true"
                    spellcheck="false"
                    :title="cell"
                    @focus="onCellFocus(cellKey(rIndex, cIndex), $event)"
                    @blur="onBodyCellBlur(rIndex, cIndex, $event)"
                    @keydown="onCellKeydown"
                  >
                    {{ cell }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          class="resize-handle"
          title="拖动调整容器宽度"
          @pointerdown.prevent="onFramePointerDown"
        >
          <span></span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.preview-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  min-height: 0;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
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

.bp-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.bp-btn {
  border: 1px solid var(--line);
  background: var(--bg-surface);
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  color: var(--ink-soft);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.bp-btn span {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--ink-muted);
}

.bp-btn.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.bp-btn.active span {
  color: var(--accent);
}

.toolbar {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--bg-surface);
  border: 1px solid var(--line);
  font-size: 12px;
  color: var(--ink-soft);
  white-space: nowrap;
}

.meta-chip.warn {
  background: var(--warn-soft);
  border-color: #f0c28a;
  color: var(--warn);
}

.width-slider {
  padding: 0 4px;
}

.stage {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 18px 8px 20px;
  background:
    linear-gradient(90deg, rgba(26, 35, 50, 0.03) 1px, transparent 1px) 0 0 / 24px 24px,
    linear-gradient(rgba(26, 35, 50, 0.03) 1px, transparent 1px) 0 0 / 24px 24px,
    var(--bg-panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.frame {
  position: relative;
  min-height: 280px;
  background: var(--bg-surface);
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  box-shadow: var(--shadow);
  transition: box-shadow 0.2s ease;
}

.frame.dragging,
.frame.col-resizing {
  box-shadow: 0 0 0 2px rgba(11, 110, 79, 0.25), var(--shadow);
}

.frame-label {
  position: absolute;
  top: -10px;
  left: 12px;
  z-index: 2;
  padding: 0 6px;
  background: var(--bg-panel);
  font-size: 11px;
  color: rgba(26, 35, 50, 0.38);
  letter-spacing: 0.02em;
  pointer-events: none;
}

.table-scroll {
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(100vh - 260px);
  /* 给顶部 preview 标签留空，避免被表头盖住 */
  padding-top: 14px;
}

.table-scroll.overflow {
  overflow-x: auto;
}

.design-table {
  border-collapse: collapse;
  table-layout: fixed;
  max-width: 100%;
}

.table-scroll.overflow .design-table {
  max-width: none;
}

.design-table th,
.design-table td {
  border: 1px solid var(--line);
  padding: var(--cell-pad-y, 8px) var(--cell-pad-x, 10px);
  vertical-align: top;
  background: #fff;
}

.design-table th {
  background: #f3f5f7;
  position: relative;
  text-align: left;
  user-select: none;
}

.design-table th.resizing {
  background: var(--accent-soft);
}

.cell {
  line-height: var(--row-lh, 1.4);
  word-break: break-word;
}

.cell.editable {
  min-height: 1.4em;
  outline: none;
  border-radius: 4px;
  cursor: text;
}

.cell.editable:hover {
  background: rgba(11, 110, 79, 0.04);
}

.cell.editable:focus {
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(11, 110, 79, 0.45);
  white-space: pre-wrap;
  overflow: visible;
  text-overflow: clip;
}

.cell.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 3;
  user-select: none;
}

.col-resize-handle::after {
  content: '';
  position: absolute;
  top: 20%;
  bottom: 20%;
  left: 2px;
  width: 2px;
  border-radius: 2px;
  background: transparent;
}

.design-table th:hover .col-resize-handle::after,
.col-resize-handle:hover::after,
.design-table th.resizing .col-resize-handle::after {
  background: var(--accent);
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -6px;
  width: 12px;
  height: 100%;
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
}

.resize-handle span {
  width: 3px;
  height: 42px;
  border-radius: 999px;
  background: var(--accent);
  opacity: 0.55;
}

.resize-handle:hover span,
.frame.dragging .resize-handle span {
  opacity: 1;
}

@media (max-width: 1100px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
}
</style>

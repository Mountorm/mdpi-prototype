import { computed, reactive, ref, watch } from 'vue'

export const BREAKPOINTS = [
  { key: 'desktop', label: '桌面', width: 1440 },
  { key: 'tablet', label: '平板', width: 768 },
  { key: 'mobile', label: '手机', width: 375 },
]

export const FONT_OPTIONS = [
  {
    value: "'IBM Plex Sans', 'Segoe UI', sans-serif",
    label: 'IBM Plex Sans（默认）',
  },
  {
    value: "'Source Serif 4', Georgia, serif",
    label: 'Source Serif（衬线）',
  },
  {
    value: "'Roboto Mono', ui-monospace, monospace",
    label: 'Roboto Mono（等宽）',
  },
  {
    value: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    label: '系统默认',
  },
]

const SHORT_SAMPLES = [
  'OK',
  'Draft',
  'v2.1',
  'MDPI',
  'Yes',
  '12',
  'CN',
  'Open',
]

const LONG_SAMPLES = [
  'A comprehensive analysis of manuscript processing workflows across editorial stages',
  'Special Issue: Advances in Computational Methods for Academic Publishing Systems',
  'Corresponding author affiliation and ORCID verification pending institutional confirmation',
  'Reviewer comments require major revision with additional experimental validation data',
]

function createColumnOverride(index) {
  return {
    id: `col-${index + 1}`,
    name: `Column ${index + 1}`,
    width: null,
    fixed: null,
    fontSize: null,
    truncate: null,
  }
}

function pickSample(row, col) {
  const seed = (row + 1) * 17 + (col + 1) * 3
  if (seed % 5 === 0) return LONG_SAMPLES[seed % LONG_SAMPLES.length]
  if (seed % 3 === 0) return SHORT_SAMPLES[seed % SHORT_SAMPLES.length]
  return `Row ${row + 1} · Cell ${col + 1}`
}

function buildGrid(rows, cols, prev = []) {
  const next = []
  for (let r = 0; r < rows; r += 1) {
    const row = []
    for (let c = 0; c < cols; c += 1) {
      row.push(prev[r]?.[c] ?? pickSample(r, c))
    }
    next.push(row)
  }
  return next
}

export function useTableDesign() {
  const global = reactive({
    rows: 5,
    cols: 5,
    defaultWidth: 160,
    fixed: false,
    fontFamily: FONT_OPTIONS[0].value,
    fontSize: 13,
    cellPaddingY: 8,
    cellPaddingX: 10,
    rowLineHeight: 1.4,
    truncate: true,
    headerBold: true,
  })

  const columns = ref(Array.from({ length: global.cols }, (_, i) => createColumnOverride(i)))
  const tableRows = ref(buildGrid(global.rows, global.cols))
  const activeBreakpoint = ref('desktop')
  const containerWidth = ref(1440)

  watch(
    () => global.cols,
    (next) => {
      const n = Math.max(1, Math.min(20, Number(next) || 1))
      if (n !== global.cols) {
        global.cols = n
        return
      }
      const list = [...columns.value]
      if (n > list.length) {
        for (let i = list.length; i < n; i += 1) {
          list.push(createColumnOverride(i))
        }
      } else if (n < list.length) {
        list.splice(n)
      }
      columns.value = list
      tableRows.value = buildGrid(global.rows, n, tableRows.value)
    },
  )

  watch(
    () => global.rows,
    (next) => {
      const n = Math.max(1, Math.min(50, Number(next) || 1))
      if (n !== global.rows) {
        global.rows = n
        return
      }
      tableRows.value = buildGrid(n, global.cols, tableRows.value)
    },
  )

  function setBreakpoint(key) {
    const bp = BREAKPOINTS.find((b) => b.key === key)
    if (!bp) return
    activeBreakpoint.value = key
    containerWidth.value = bp.width
  }

  function resolveColumn(col, index) {
    return {
      id: col.id,
      index,
      name: col.name?.trim() || `Column ${index + 1}`,
      width: col.width == null || col.width === '' ? global.defaultWidth : Number(col.width),
      fixed: col.fixed == null ? global.fixed : Boolean(col.fixed),
      fontSize: col.fontSize == null || col.fontSize === '' ? global.fontSize : Number(col.fontSize),
      truncate: col.truncate == null ? global.truncate : Boolean(col.truncate),
      overridden: {
        width: col.width != null && col.width !== '',
        fixed: col.fixed != null,
        fontSize: col.fontSize != null && col.fontSize !== '',
        truncate: col.truncate != null,
      },
    }
  }

  const resolvedColumns = computed(() =>
    columns.value.map((col, index) => resolveColumn(col, index)),
  )

  const layout = computed(() => {
    const cols = resolvedColumns.value
    const cw = Math.max(200, Number(containerWidth.value) || 200)
    const fixedCols = cols.filter((c) => c.fixed)
    const flexCols = cols.filter((c) => !c.fixed)
    const fixedTotal = fixedCols.reduce((sum, c) => sum + c.width, 0)
    const flexWeightTotal = flexCols.reduce((sum, c) => sum + Math.max(1, c.width), 0)

    const widths = new Array(cols.length).fill(0)

    if (flexCols.length === 0) {
      cols.forEach((c, i) => {
        widths[i] = c.width
      })
    } else {
      const remaining = cw - fixedTotal
      const usable = Math.max(remaining, flexCols.reduce((s, c) => s + Math.max(40, c.width * 0.25), 0))

      cols.forEach((c, i) => {
        if (c.fixed) {
          widths[i] = c.width
        } else {
          const weight = Math.max(1, c.width)
          const share = (weight / flexWeightTotal) * Math.max(0, remaining)
          // when overflow, keep a readable floor based on configured width
          widths[i] = remaining > 0 ? Math.max(40, Math.round(share)) : Math.max(40, Math.round(c.width * 0.5))
          if (remaining <= 0) {
            widths[i] = Math.max(40, Math.round((weight / flexWeightTotal) * usable))
          }
        }
      })

      // Fix rounding drift for flex columns when no overflow
      if (remaining > 0) {
        const flexIndexes = cols.map((c, i) => (!c.fixed ? i : -1)).filter((i) => i >= 0)
        const flexSum = flexIndexes.reduce((s, i) => s + widths[i], 0)
        const drift = remaining - flexSum
        if (flexIndexes.length && drift !== 0) {
          widths[flexIndexes[flexIndexes.length - 1]] += drift
        }
      }
    }

    const tableWidth = widths.reduce((s, w) => s + w, 0)
    const overflow = tableWidth > cw + 0.5

    return {
      containerWidth: cw,
      tableWidth,
      overflow,
      fixedTotal,
      flexCount: flexCols.length,
      columns: cols.map((c, i) => ({
        ...c,
        computedWidth: widths[i],
      })),
    }
  })

  const briefing = computed(() => {
    const { overflow, containerWidth: cw, tableWidth, flexCount, columns: cols } = layout.value
    const avgPad = global.cellPaddingY
    const density =
      avgPad <= 6 ? '偏紧凑' : avgPad >= 14 ? '偏疏松' : '适中'

    const conclusions = []
    if (overflow) {
      conclusions.push({
        tone: 'warn',
        text: `当前宽度下表格会横向滚动（表宽 ${tableWidth}px > 容器 ${cw}px）`,
      })
    } else {
      conclusions.push({
        tone: 'ok',
        text: `当前宽度下表格可完整落入容器（${cw}px）`,
      })
    }
    conclusions.push({
      tone: 'neutral',
      text: `疏密观感：${density}（上下内边距 ${global.cellPaddingY}px · 行高 ${global.rowLineHeight}）`,
    })
    conclusions.push({
      tone: 'neutral',
      text: `字体：字号默认 ${global.fontSize}px；固定列 ${cols.length - flexCount} · 自适应列 ${flexCount}`,
    })

    return { conclusions, density }
  })

  function updateCell(rowIndex, colIndex, value) {
    const row = tableRows.value[rowIndex]
    if (!row || colIndex < 0 || colIndex >= row.length) return
    row[colIndex] = value
  }

  function resetCellContent() {
    tableRows.value = buildGrid(global.rows, global.cols)
  }

  function resetColumnOverride(index) {
    const base = createColumnOverride(index)
    base.name = columns.value[index]?.name || base.name
    columns.value[index] = base
  }

  function resetAllOverrides() {
    columns.value = Array.from({ length: global.cols }, (_, i) => {
      const next = createColumnOverride(i)
      next.name = columns.value[i]?.name || next.name
      return next
    })
  }

  /** 拖拽列宽：写入覆盖宽度，并固定该列以保证所见即所得 */
  function resizeColumnWidth(index, widthPx) {
    const col = columns.value[index]
    if (!col) return
    const next = Math.max(40, Math.min(800, Math.round(widthPx)))
    col.width = next
    col.fixed = true
  }

  return {
    global,
    columns,
    activeBreakpoint,
    containerWidth,
    resolvedColumns,
    layout,
    briefing,
    tableRows,
    setBreakpoint,
    resetColumnOverride,
    resetAllOverrides,
    resizeColumnWidth,
    updateCell,
    resetCellContent,
  }
}

<template>
  <div class="awd-cell">
    <!-- canvas + transparent overlay wrapper -->
    <div class="awd-canvas-wrap">
      <canvas ref="canvasEl" class="awd-canvas" />
      <!-- overlay captures all mouse events; never changes size, no flicker -->
      <div
        class="awd-overlay"
        @mousemove="onMove"
        @mouseleave="onLeave"
      />
    </div>

    <!-- label below canvas -->
    <span class="awd-label">{{ label }}</span>

    <!-- stats to the right of canvas+label -->
    <div class="awd-stats">
      <div
        v-for="seg in SEGS"
        :key="seg.key"
        class="awd-stat"
        :class="[
          `awd-stat--${seg.key}`,
          hovKey === seg.key ? 'awd-stat--active' : '',
          hovKey && hovKey !== seg.key ? 'awd-stat--dim' : '',
        ]"
        @mouseenter="setHov(seg.key)"
        @mouseleave="setHov(null)"
      >
        <span class="awd-stat__dot" />
        <span class="awd-stat__pct">{{ fmt(vals[seg.key]) }}</span>
        <span class="awd-stat__name">{{ seg.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  aiWriting: { type: Object, required: true },
  label:     { type: String, required: true },
})

// ── geometry (logical px) ──────────────────────────────────
const S      = 110   // canvas logical size
const CX     = S / 2
const CY     = S / 2
const R      = 46    // pie radius
const EXPLODE = 5    // hover offset distance

const COLORS = { human: '#16a34a', maybe: '#f59e0b', likely: '#dc2626' }
// slightly lighter shades for hover
const COLORS_HOV = { human: '#15803d', maybe: '#d97706', likely: '#b91c1c' }

const SEGS = [
  { key: 'human',  label: 'Low'    },
  { key: 'maybe',  label: 'Medium' },
  { key: 'likely', label: 'High'   },
]

// ── data ──────────────────────────────────────────────────
const vals = computed(() => {
  const maybe  = props.aiWriting.maybe_ai_proportion  ?? 0
  const likely = props.aiWriting.likely_ai_proportion ?? 0
  return { human: Math.max(0, 1 - maybe - likely), maybe, likely }
})

// ── canvas ref & hover state ───────────────────────────────
const canvasEl = ref(null)
const hovKey   = ref(null)   // 'human' | 'maybe' | 'likely' | null

// ── paint ─────────────────────────────────────────────────
function paint(hov) {
  const canvas = canvasEl.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const ctx  = canvas.getContext('2d')

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const v      = vals.value
  const hasHov = hov !== null

  // draw pie slices
  let angle = -Math.PI / 2
  for (const seg of SEGS) {
    const val = v[seg.key]
    if (val <= 0) continue
    const sweep = val * Math.PI * 2
    const isHov = hov === seg.key
    const mid   = angle + sweep / 2   // midpoint angle for explode direction

    // explode: shift center outward along midpoint angle
    const ox = isHov ? Math.cos(mid) * EXPLODE : 0
    const oy = isHov ? Math.sin(mid) * EXPLODE : 0

    ctx.globalAlpha = hasHov && !isHov ? 0.35 : 1
    ctx.shadowBlur  = isHov ? 12 : 0
    ctx.shadowColor = isHov ? COLORS[seg.key] : 'transparent'
    ctx.fillStyle   = isHov ? COLORS_HOV[seg.key] : COLORS[seg.key]

    ctx.beginPath()
    ctx.moveTo(CX + ox, CY + oy)
    ctx.arc(CX + ox, CY + oy, R, angle, angle + sweep)
    ctx.closePath()
    ctx.fill()

    // thin separator line between slices
    ctx.shadowBlur = 0
    ctx.strokeStyle = '#fff'
    ctx.lineWidth   = 0.1
    ctx.globalAlpha = 1
    ctx.stroke()

    angle += sweep
  }

  ctx.globalAlpha = 1
  ctx.shadowBlur  = 0
  ctx.shadowColor = 'transparent'

  // center label when hovering
  if (hov) {
    const pct   = fmt(v[hov])
    const names = { human: 'Low', maybe: 'Medium', likely: 'High' }
    ctx.globalAlpha  = 1
    ctx.shadowBlur   = 0
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle    = '#475569'
    ctx.font         = `500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.fillText(names[hov], CX, CY - 8)
    ctx.fillStyle = COLORS_HOV[hov]
    ctx.font      = `700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.fillText(pct, CX, CY + 8)
  }
}

// ── init canvas ───────────────────────────────────────────
function initCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  canvas.width  = S * dpr
  canvas.height = S * dpr
  canvas.style.width  = S + 'px'
  canvas.style.height = S + 'px'
  paint(hovKey.value)
}

onMounted(initCanvas)
watch(() => props.aiWriting, () => paint(hovKey.value), { deep: true })

// ── hit test ──────────────────────────────────────────────
function hitTest(lx, ly) {
  const dx   = lx - CX
  const dy   = ly - CY
  const dist = Math.sqrt(dx * dx + dy * dy)
  // outside pie circle
  if (dist > R + EXPLODE + 2) return null

  let angle = Math.atan2(dy, dx) + Math.PI / 2
  if (angle < 0) angle += Math.PI * 2

  const v = vals.value
  let start = 0
  for (const seg of SEGS) {
    const sweep = v[seg.key] * Math.PI * 2
    if (angle >= start && angle < start + sweep) return seg.key
    start += sweep
  }
  return null
}

// ── mouse handlers on overlay ─────────────────────────────
function onMove(e) {
  const canvas = canvasEl.value
  if (!canvas) return
  const rect  = canvas.getBoundingClientRect()
  const lx    = (e.clientX - rect.left)  * (S / rect.width)
  const ly    = (e.clientY - rect.top)   * (S / rect.height)
  const found = hitTest(lx, ly)
  if (found !== hovKey.value) {
    hovKey.value = found
    paint(found)
  }
}

function onLeave() {
  if (hovKey.value !== null) {
    hovKey.value = null
    paint(null)
  }
}

// ── stat row hover (syncs with canvas) ────────────────────
function setHov(key) {
  hovKey.value = key
  paint(key)
}

function fmt(v) { return ((v || 0) * 100).toFixed(0) + '%' }
</script>

<style scoped>
.awd-cell {
  display: grid;
  grid-template-areas:
    "canvas stats"
    "label  stats";
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: 14px;
  padding: 10px 18px 10px 10px;
  border-right: 1px solid #e2e8f0;
}
.awd-cell:last-child { border-right: none; }

/* canvas + overlay stacked */
.awd-canvas-wrap {
  grid-area: canvas;
  position: relative;
  width: 110px;
  height: 110px;
  line-height: 0;
}
.awd-canvas {
  display: block;
}
/* overlay sits on top, same size, transparent — receives all mouse events */
.awd-overlay {
  position: absolute;
  inset: 0;
  cursor: crosshair;
}

/* label centered below canvas */
.awd-label {
  grid-area: label;
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  text-align: center;
  padding-top: 5px;
  white-space: nowrap;
}

/* stats column */
.awd-stats {
  grid-area: stats;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 7px;
  align-self: center;
}

.awd-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: opacity 0.15s, transform 0.15s;
  user-select: none;
}
.awd-stat--dim    { opacity: 0.25; }
.awd-stat--active { transform: translateX(3px); }

.awd-stat__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform 0.15s;
}
.awd-stat--active .awd-stat__dot { transform: scale(1.5); }

.awd-stat--human  .awd-stat__dot { background: #16a34a; }
.awd-stat--maybe  .awd-stat__dot { background: #f59e0b; }
.awd-stat--likely .awd-stat__dot { background: #dc2626; }

.awd-stat__pct {
  font-size: 13px;
  font-weight: 700;
  min-width: 36px;
}
.awd-stat--human  .awd-stat__pct { color: #16a34a; }
.awd-stat--maybe  .awd-stat__pct { color: #d97706; }
.awd-stat--likely .awd-stat__pct { color: #dc2626; }

.awd-stat__name {
  font-size: 12px;
  color: #64748b;
}
.awd-stat--active .awd-stat__name { color: #1e293b; font-weight: 600; }
</style>

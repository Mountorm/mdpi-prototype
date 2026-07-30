<script setup>
import { computed } from 'vue'
import { BREAKPOINTS } from '../composables/useTableDesign'

const props = defineProps({
  layout: { type: Object, required: true },
  global: { type: Object, required: true },
  briefing: { type: Object, required: true },
  activeBreakpoint: { type: String, required: true },
  containerWidth: { type: Number, required: true },
})

const bpLabel = computed(() => {
  const match = BREAKPOINTS.find(
    (b) => b.key === props.activeBreakpoint && b.width === props.containerWidth,
  )
  return match ? match.label : '自定义宽度'
})

const summary = computed(() => [
  { label: '行 × 列', value: `${props.global.rows} × ${props.global.cols}` },
  { label: '当前断点', value: bpLabel.value },
  { label: '容器宽度', value: `${props.layout.containerWidth}px` },
  { label: '表格总宽', value: `${props.layout.tableWidth}px` },
  {
    label: '溢出状态',
    value: props.layout.overflow ? '横向滚动' : '适配容器',
    warn: props.layout.overflow,
  },
])
</script>

<template>
  <aside class="panel meta-panel">
    <header class="panel-head">
      <div>
        <p class="eyebrow">Briefing</p>
        <h2>讲解要点</h2>
      </div>
    </header>

    <section class="block">
      <h3>先看结论</h3>
      <ul class="conclusions">
        <li
          v-for="(item, i) in briefing.conclusions"
          :key="i"
          :class="item.tone"
        >
          {{ item.text }}
        </li>
      </ul>
    </section>

    <section class="block compact">
      <h3>数字附注</h3>
      <dl class="summary">
        <div v-for="item in summary" :key="item.label" class="summary-row">
          <dt>{{ item.label }}</dt>
          <dd :class="{ warn: item.warn }">{{ item.value }}</dd>
        </div>
      </dl>
    </section>

    <section class="block grow">
      <h3>各列宽度（对齐时备用）</h3>
      <div class="col-list">
        <article v-for="col in layout.columns" :key="col.id" class="col-card">
          <div class="col-card-head">
            <strong>{{ col.name }}</strong>
            <span class="mono accent">{{ col.computedWidth }}px</span>
          </div>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{
                width:
                  Math.min(100, (col.computedWidth / Math.max(layout.tableWidth, 1)) * 100) + '%',
              }"
            />
          </div>
          <ul class="attrs">
            <li>
              <span>配置宽</span>
              <span class="mono">
                {{ col.width }}px
                <em v-if="col.overridden.width">覆盖</em>
              </span>
            </li>
            <li>
              <span>模式</span>
              <span>
                {{ col.fixed ? '固定' : '自适应' }}
                <em v-if="col.overridden.fixed">覆盖</em>
              </span>
            </li>
            <li>
              <span>字号</span>
              <span class="mono">
                {{ col.fontSize }}px
                <em v-if="col.overridden.fontSize">覆盖</em>
              </span>
            </li>
            <li>
              <span>截断</span>
              <span>
                {{ col.truncate ? '是' : '否' }}
                <em v-if="col.overridden.truncate">覆盖</em>
              </span>
            </li>
          </ul>
        </article>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.meta-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow: hidden;
}

.panel-head .eyebrow {
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

.block.compact {
  padding: 10px 12px;
}

.block.grow {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.block h3 {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
}

.block.compact h3 {
  margin: 0 0 8px;
  font-size: 12px;
}

.conclusions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.conclusions li {
  font-size: 13px;
  line-height: 1.45;
  color: var(--ink-soft);
  padding-left: 12px;
  border-left: 3px solid var(--line);
}

.conclusions li.warn {
  color: var(--warn);
  border-left-color: var(--warn);
}

.conclusions li.ok {
  color: var(--accent);
  border-left-color: var(--accent);
}

.conclusions li.neutral {
  color: var(--ink-soft);
  border-left-color: var(--line);
}

.summary {
  margin: 0;
  display: grid;
  gap: 5px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
}

.summary-row dt {
  color: var(--ink-muted);
}

.summary-row dd {
  margin: 0;
  font-family: var(--mono);
  color: var(--ink);
}

.summary-row dd.warn {
  color: var(--warn);
}

.col-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.col-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px;
  background: #fbfcfd;
}

.col-card-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.mono {
  font-family: var(--mono);
}

.accent {
  color: var(--accent);
}

.bar-track {
  height: 4px;
  border-radius: 999px;
  background: #e7ebf0;
  overflow: hidden;
  margin-bottom: 8px;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0b6e4f, #1f9d72);
}

.attrs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 4px;
}

.attrs li {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  color: var(--ink-soft);
}

.attrs em {
  font-style: normal;
  margin-left: 4px;
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 10px;
}
</style>

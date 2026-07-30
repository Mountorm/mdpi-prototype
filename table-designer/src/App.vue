<script setup>
import ConfigPanel from './components/ConfigPanel.vue'
import PreviewPanel from './components/PreviewPanel.vue'
import MetaPanel from './components/MetaPanel.vue'
import { useTableDesign } from './composables/useTableDesign'

const {
  global,
  columns,
  activeBreakpoint,
  containerWidth,
  layout,
  briefing,
  tableRows,
  setBreakpoint,
  resetColumnOverride,
  resetAllOverrides,
  resizeColumnWidth,
  updateCell,
} = useTableDesign()

function updateColumnName(index, name) {
  if (!columns.value[index]) return
  columns.value[index].name = name
}

function onContainerWidth(width) {
  containerWidth.value = width
  if (width === 1440) activeBreakpoint.value = 'desktop'
  else if (width === 768) activeBreakpoint.value = 'tablet'
  else if (width === 375) activeBreakpoint.value = 'mobile'
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">TD</span>
        <div>
          <h1>Table Designer</h1>
          <p>SuSy 表格样式与响应式设计工具</p>
        </div>
      </div>
      <div class="top-note">
        <span class="material-icons-outlined">info</span>
        调字体与间距看疏密，切断点讲响应式；右侧是讲解结论
      </div>
    </header>

    <main class="workspace">
      <ConfigPanel
        :global="global"
        :columns="columns"
        @reset-column="resetColumnOverride"
        @reset-all="resetAllOverrides"
      />
      <PreviewPanel
        :active-breakpoint="activeBreakpoint"
        :container-width="containerWidth"
        :layout="layout"
        :table-rows="tableRows"
        :header-bold="global.headerBold"
        :global="global"
        @update:breakpoint="setBreakpoint"
        @update:container-width="onContainerWidth"
        @resize-column="resizeColumnWidth"
        @update-cell="updateCell"
        @update-column-name="updateColumnName"
      />
      <MetaPanel
        :layout="layout"
        :global="global"
        :briefing="briefing"
        :active-breakpoint="activeBreakpoint"
        :container-width="containerWidth"
      />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 18px 18px;
  gap: 14px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, #0b6e4f, #146c5f);
  color: #fff;
  font-family: var(--mono);
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 8px 20px rgba(11, 110, 79, 0.25);
}

.brand h1 {
  margin: 0;
  font-size: 20px;
  letter-spacing: -0.02em;
}

.brand p {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ink-muted);
}

.top-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--line);
  color: var(--ink-soft);
  font-size: 12px;
}

.workspace {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 300px minmax(420px, 1fr) 300px;
  gap: 14px;
}

.workspace > :deep(.panel) {
  min-height: 0;
}

@media (max-width: 1280px) {
  .workspace {
    grid-template-columns: 280px minmax(360px, 1fr);
  }

  .workspace > :last-child {
    grid-column: 1 / -1;
    max-height: 320px;
  }
}

@media (max-width: 900px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .workspace > :last-child {
    max-height: none;
  }
}
</style>

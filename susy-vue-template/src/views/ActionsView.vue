<script setup>
import { ref } from 'vue'
import { MButton, MButtonGroup, MIconButton } from '@mdpi-ui/design-system'
import DemoSection from '@/components/DemoSection.vue'
import DemoRow from '@/components/DemoRow.vue'

const loading = ref(false)

function toggleLoading() {
  loading.value = true
  setTimeout(() => (loading.value = false), 1500)
}
</script>

<template>
  <div>
    <header class="pb-8">
      <h1 class="text-[32px] font-semibold tracking-tight text-color-default">Actions</h1>
      <p class="mt-2 text-[14px] text-color-subtle">
        触发操作的控件。一个区域只放一个 primary 按钮，跳转用链接。
      </p>
    </header>

    <DemoSection
      id="mbutton"
      name="MButton"
      desc="按钮。variant 默认 tonal，size 默认 lg。左侧图标用 leftIcon，纯图标按钮请改用 MIconButton。"
    >
      <DemoRow label="Variants">
        <MButton variant="primary">Primary</MButton>
        <MButton variant="secondary">Secondary</MButton>
        <MButton variant="tertiary">Tertiary</MButton>
        <MButton variant="tertiary-subtle">Tertiary subtle</MButton>
        <MButton variant="tonal">Tonal</MButton>
        <MButton variant="accent">Accent</MButton>
      </DemoRow>

      <DemoRow label="Sizes">
        <MButton size="sm">Small</MButton>
        <MButton size="md">Medium</MButton>
        <MButton size="lg">Large</MButton>
      </DemoRow>

      <DemoRow label="With icons">
        <MButton variant="primary" left-icon="add">Create</MButton>
        <MButton variant="secondary" right-icon="chevron_right">Next</MButton>
        <MButton variant="tertiary" icon="download" />
      </DemoRow>

      <DemoRow label="States">
        <MButton disabled>Disabled</MButton>
        <MButton :loading="loading" @click="toggleLoading">
          {{ loading ? 'Loading' : 'Click to load' }}
        </MButton>
      </DemoRow>

      <DemoRow label="Block">
        <MButton variant="primary" block>Full width</MButton>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mbuttongroup"
      name="MButtonGroup"
      desc="一组相关按钮，默认插槽里放多个 MButton。用于视图切换等并列操作。"
    >
      <DemoRow label="Basic">
        <MButtonGroup>
          <MButton variant="secondary">Day</MButton>
          <MButton variant="secondary">Week</MButton>
          <MButton variant="secondary">Month</MButton>
        </MButtonGroup>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="miconbutton"
      name="MIconButton"
      desc="只有图标的按钮，a11yText 必填，供屏幕阅读器识别。"
    >
      <DemoRow label="Sizes">
        <MIconButton icon="edit" a11y-text="Edit" size="sm" />
        <MIconButton icon="edit" a11y-text="Edit" size="md" />
        <MIconButton icon="edit" a11y-text="Edit" size="lg" />
      </DemoRow>

      <DemoRow label="Variants">
        <MIconButton icon="more_horiz" a11y-text="More" />
        <MIconButton icon="delete" a11y-text="Delete" fill />
        <MIconButton icon="close" a11y-text="Close" rounded />
        <MIconButton icon="settings" a11y-text="Settings" disabled />
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mbuttonscrolltop"
      name="MButtonScrollTop"
      desc="回到顶部的悬浮按钮，固定在视口右下角（position 可选 right / left），滚动后出现。下方为静态样式预览。"
    >
      <DemoRow label="Preview">
        <div class="flex items-center gap-3 rounded border border-color-default px-6 py-6">
          <MIconButton icon="keyboard_arrow_up" a11y-text="Scroll to top" rounded fill />
          <span class="text-[13px] text-color-subtle">
            实际组件为 fixed 定位，不会出现在文档流里
          </span>
        </div>
      </DemoRow>
    </DemoSection>
  </div>
</template>

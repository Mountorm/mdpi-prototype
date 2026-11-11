<script setup>
import { MContainer } from '@mdpi-ui/design-system'
import DemoSection from '@/components/DemoSection.vue'
import DemoRow from '@/components/DemoRow.vue'
</script>

<template>
  <div>
    <header class="pb-8">
      <h1 class="text-[32px] font-semibold tracking-tight text-color-default">Layout</h1>
      <p class="mt-2 text-[14px] text-color-subtle">
        页面容器与栅格。内容最宽 1280，沟槽 16。
      </p>
    </header>

    <DemoSection
      id="mcontainer"
      name="MContainer"
      desc="页面内容容器，按栅格限制最大宽度。percentages 控制内容占比，用于窄版页面。"
    >
      <DemoRow label="Default">
        <div class="w-full rounded bg-surface-subtle p-4">
          <MContainer>
            <div class="rounded border border-color-default bg-surface-default px-4 py-8 text-center text-[13px] text-color-subtle">
              Content limited to the grid width
            </div>
          </MContainer>
        </div>
      </DemoRow>

      <DemoRow label="Narrower content">
        <div class="w-full rounded bg-surface-subtle p-4">
          <MContainer :percentages="8">
            <div class="rounded border border-color-default bg-surface-default px-4 py-8 text-center text-[13px] text-color-subtle">
              8 of 12 columns
            </div>
          </MContainer>
        </div>
      </DemoRow>
    </DemoSection>
  </div>
</template>

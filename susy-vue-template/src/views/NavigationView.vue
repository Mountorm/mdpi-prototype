<script setup>
import { ref } from 'vue'
import {
  MBreadcrumb,
  MDropdown,
  MDropdownItem,
  MPagination,
  MStepper,
  MTabHeading,
  MTabPanel,
  MTabs,
} from '@mdpi-ui/design-system'
import DemoSection from '@/components/DemoSection.vue'
import DemoRow from '@/components/DemoRow.vue'
import { stepperSteps } from '@/data/demo'

const tab = ref(0)
const page = ref(1)
const activeStep = ref(2)
</script>

<template>
  <div>
    <header class="pb-8">
      <h1 class="text-[32px] font-semibold tracking-tight text-color-default">Navigation</h1>
      <p class="mt-2 text-[14px] text-color-subtle">
        导航与页面结构。当前页不要做成链接。
      </p>
    </header>

    <DemoSection id="mbreadcrumb" name="MBreadcrumb" desc="面包屑。最后一项是当前页，用普通文本，不做链接。">
      <DemoRow label="Basic">
        <MBreadcrumb>
          <a href="#" class="text-color-link-bold hover:underline">Home</a>
          <a href="#" class="text-color-link-bold hover:underline">Section</a>
          <span>Current page</span>
        </MBreadcrumb>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mtabs"
      name="MTabs"
      desc="选项卡。header 插槽放 MTabHeading，默认插槽放 MTabPanel，v-model 绑定当前索引。"
    >
      <DemoRow label="Basic">
        <div class="w-full">
          <MTabs v-model="tab">
            <template #header>
              <MTabHeading>Overview</MTabHeading>
              <MTabHeading>Details</MTabHeading>
              <MTabHeading>History</MTabHeading>
            </template>
            <MTabPanel>
              <p class="text-[14px] text-color-subtle">Content of the overview tab.</p>
            </MTabPanel>
            <MTabPanel>
              <p class="text-[14px] text-color-subtle">Content of the details tab.</p>
            </MTabPanel>
            <MTabPanel>
              <p class="text-[14px] text-color-subtle">Content of the history tab.</p>
            </MTabPanel>
          </MTabs>
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mdropdown" name="MDropdown" desc="下拉菜单。触发器放 activator 插槽，菜单项放默认插槽。">
      <DemoRow label="Basic">
        <MDropdown label="Actions" left-icon="more_horiz">
          <template #activator>
            <button
              type="button"
              class="flex items-center gap-2 rounded border border-color-default px-3 py-2 text-[14px] text-color-default hover:bg-surface-subtle"
            >
              Actions
            </button>
          </template>
          <MDropdownItem>Edit</MDropdownItem>
          <MDropdownItem>Duplicate</MDropdownItem>
          <MDropdownItem disabled>Archive</MDropdownItem>
        </MDropdown>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mpagination" name="MPagination" desc="分页。pages 为总页数，v-model 绑定当前页。">
      <DemoRow label="Basic">
        <MPagination v-model="page" :pages="12" />
      </DemoRow>

      <DemoRow label="Small / disabled">
        <MPagination v-model="page" :pages="6" size="sm" />
        <MPagination :model-value="1" :pages="6" disabled />
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mstepper"
      name="MStepper"
      desc="步骤条。steps 为 { name, status } 数组，status 取 done / progress / waiting。"
    >
      <DemoRow label="Horizontal">
        <div class="w-full">
          <MStepper :steps="stepperSteps" @click="activeStep = $event" />
        </div>
      </DemoRow>

      <DemoRow label="Vertical">
        <div class="w-[320px]">
          <MStepper :steps="stepperSteps" is-vertical />
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mswiperpagination"
      name="MSwiperPagination"
      desc="轮播分页指示器，必须传入 Swiper 实例（instance），不能单独使用。本项目未引入 Swiper，因此这里仅作说明。"
    >
      <DemoRow label="Note">
        <div class="rounded border border-color-default px-4 py-3 text-[13px] text-color-subtle">
          使用方式：<span class="text-color-default">&lt;MSwiperPagination :instance="swiperRef.value" /&gt;</span>，
          需先在项目中安装 swiper。
        </div>
      </DemoRow>
    </DemoSection>
  </div>
</template>

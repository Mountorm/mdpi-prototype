<script setup>
import { ref } from 'vue'
import {
  MButton,
  MDisclaimerTooltip,
  MDrawer,
  MLoader,
  MModal,
  MNotification,
  MPopover,
  MToast,
  MTooltip,
} from '@mdpi-ui/design-system'
import DemoSection from '@/components/DemoSection.vue'
import DemoRow from '@/components/DemoRow.vue'

const toastOpen = ref(false)
const modalOpen = ref(false)
const drawerOpen = ref(false)
const variants = ['neutral', 'info', 'success', 'warning', 'error']
</script>

<template>
  <div>
    <header class="pb-8">
      <h1 class="text-[32px] font-semibold tracking-tight text-color-default">Feedback</h1>
      <p class="mt-2 text-[14px] text-color-subtle">
        提示与浮层。页面内提示用 MNotification，几秒后消失的用 MToast。
      </p>
    </header>

    <DemoSection
      id="mnotification"
      name="MNotification"
      desc="页面内提示条，占据文档流。variant 只用于表达语义，不能拿来装饰。"
    >
      <DemoRow label="Variants">
        <div class="flex flex-col gap-3 w-full">
          <MNotification v-for="v in variants" :key="v" :variant="v" :closable="true">
            This is a {{ v }} notification.
          </MNotification>
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mtoast"
      name="MToast"
      desc="浮动提示，默认 5 秒后自动消失。position 控制出现位置，v-model 控制显示。"
    >
      <DemoRow label="Trigger">
        <MButton @click="toastOpen = true">Show toast</MButton>
        <MToast v-model="toastOpen" variant="success" position="top-right" :timeout="3000">
          Changes saved successfully.
        </MToast>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mmodal"
      name="MModal"
      desc="对话框。header / default / footer 三个插槽，persistent 禁止点击遮罩关闭。SuSy 业务弹窗应使用 SusyModal。"
    >
      <DemoRow label="Basic">
        <MButton @click="modalOpen = true">Open modal</MButton>
        <MModal v-model="modalOpen" max-width="480px">
          <template #header>Dialog title</template>
          <p class="text-[14px] leading-6 text-color-subtle">
            A modal interrupts the flow and requires the user to act before continuing. Keep it short.
          </p>
          <template #footer>
            <div class="flex justify-end gap-2">
              <MButton variant="secondary" @click="modalOpen = false">Cancel</MButton>
              <MButton variant="primary" @click="modalOpen = false">Confirm</MButton>
            </div>
          </template>
        </MModal>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mdrawer"
      name="MDrawer"
      desc="侧边抽屉。fixedHeader / fixedFooter 让头尾在内容滚动时保持可见。"
    >
      <DemoRow label="Basic">
        <MButton @click="drawerOpen = true">Open drawer</MButton>
        <MDrawer v-model="drawerOpen" origin="right" max-width="420px">
          <template #header>Drawer title</template>
          <p class="text-[14px] leading-6 text-color-subtle">
            A drawer slides in from the edge and keeps the page context visible.
          </p>
          <template #footer>
            <div class="flex justify-end gap-2">
              <MButton variant="secondary" @click="drawerOpen = false">Close</MButton>
            </div>
          </template>
        </MDrawer>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mtooltip" name="MTooltip" desc="悬停或聚焦时出现的说明。触发元素放在 activator 插槽里。">
      <DemoRow label="Positions">
        <MTooltip label="Tooltip on top" position="top">
          <template #activator><MButton variant="secondary">Top</MButton></template>
        </MTooltip>
        <MTooltip label="Tooltip on right" position="right">
          <template #activator><MButton variant="secondary">Right</MButton></template>
        </MTooltip>
        <MTooltip label="Tooltip on bottom" position="bottom">
          <template #activator><MButton variant="secondary">Bottom</MButton></template>
        </MTooltip>
        <MTooltip label="Tooltip on left" position="left">
          <template #activator><MButton variant="secondary">Left</MButton></template>
        </MTooltip>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mpopover" name="MPopover" desc="点击后出现的浮层，内容放在默认插槽，触发器放 activator。">
      <DemoRow label="Basic">
        <MPopover label="Filters" position-horizontal="left" position-vertical="bottom">
          <template #activator>
            <MButton variant="secondary" right-icon="expand_more">Options</MButton>
          </template>
          <div class="flex flex-col gap-2 p-2 text-[14px] text-color-default">
            <span>Option one</span>
            <span>Option two</span>
            <span>Option three</span>
          </div>
        </MPopover>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mdisclaimertooltip"
      name="MDisclaimerTooltip"
      desc="带免责说明气质的提示。比 MTooltip 更轻，常用于补充解释。"
    >
      <DemoRow label="Basic">
        <MDisclaimerTooltip label="Results may vary depending on input data.">
          <span class="text-[14px] text-color-subtle underline decoration-dotted cursor-help">
            What does this mean?
          </span>
        </MDisclaimerTooltip>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mloader" name="MLoader" desc="加载旋转图标。内容占位请用 MSkeletonItem。">
      <DemoRow label="Sizes">
        <div class="flex items-center gap-6">
          <MLoader size="sm" />
          <MLoader size="md" />
          <MLoader size="lg" />
          <MLoader size="xl" />
        </div>
      </DemoRow>
    </DemoSection>
  </div>
</template>

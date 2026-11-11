<script setup>
import {
  MAccordion,
  MAccordionItem,
  MAvatar,
  MBanner,
  MCard,
  MFeature,
  MHeading,
  MIcon,
  MIconCustom,
  MList,
  MListItem,
  MSkeletonItem,
  MTable,
  MTag,
  MText,
} from '@mdpi-ui/design-system'
import DemoSection from '@/components/DemoSection.vue'
import DemoRow from '@/components/DemoRow.vue'
import { iconNames, tableRows } from '@/data/demo'

const tagStates = ['neutral', 'brand', 'info', 'success', 'warning', 'error']
</script>

<template>
  <div>
    <header class="pb-8">
      <h1 class="text-[32px] font-semibold tracking-tight text-color-default">Data display</h1>
      <p class="mt-2 text-[14px] text-color-subtle">
        展示信息的组件。状态色只用来表示状态，不做装饰。
      </p>
    </header>

    <DemoSection id="mheading" name="MHeading" desc="标题。variant 决定语义标签和字号，H1–H6 不要跳级。">
      <DemoRow label="All levels">
        <div class="flex flex-col gap-3 w-full">
          <MHeading variant="h1">Heading 1</MHeading>
          <MHeading variant="h2">Heading 2</MHeading>
          <MHeading variant="h3">Heading 3</MHeading>
          <MHeading variant="h4">Heading 4</MHeading>
          <MHeading variant="h5">Heading 5</MHeading>
          <MHeading variant="h6">Heading 6</MHeading>
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mtext" name="MText" desc="按规范字号输出文字。正文用 body，界面小字用 sm。">
      <DemoRow label="Text styles">
        <div class="flex flex-col gap-3">
          <MText text-style="body">Body — 16 / 24，用于正文段落。</MText>
          <MText text-style="base">Base — 16 / 24。</MText>
          <MText text-style="sm">Small — 14 / 20，用于界面和表格。</MText>
          <MText text-style="xs">Extra small — 12 / 20，仅用于辅助信息。</MText>
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mtag"
      name="MTag"
      desc="只读状态标签。variant 控制样式，state 控制语义颜色。可选中或可关闭的请用 MChip。"
    >
      <DemoRow label="Filled">
        <MTag v-for="s in tagStates" :key="s" :state="s" variant="filled">{{ s }}</MTag>
      </DemoRow>

      <DemoRow label="Tonal">
        <MTag v-for="s in tagStates" :key="s" :state="s" variant="tonal">{{ s }}</MTag>
      </DemoRow>

      <DemoRow label="Outline">
        <MTag v-for="s in tagStates" :key="s" :state="s" variant="outline">{{ s }}</MTag>
      </DemoRow>

      <DemoRow label="With icon / closable">
        <MTag state="success" left-icon="check_circle">Verified</MTag>
        <MTag state="warning" left-icon="warning">Pending</MTag>
        <MTag state="neutral" closable>Closable</MTag>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mcard" name="MCard" desc="内容卡片。title / subtitle / lead 可直接传，也可用插槽自定义内容与操作区。">
      <DemoRow label="Basic">
        <div class="w-[360px]">
          <MCard
            title="Card title"
            subtitle="Supporting line"
            lead="Cards group related information into a single container."
          >
            <template #actions>
              <MTag state="info" variant="tonal">Category</MTag>
            </template>
          </MCard>
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mbanner" name="MBanner" desc="页面级横幅，用于需要用户注意的整体信息。">
      <DemoRow label="Basic">
        <div class="w-full">
          <MBanner
            title="Banner title"
            subtitle="Short supporting line"
            description="Use a banner for page-level messages that apply to the whole screen."
            action-text="Learn more"
          />
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mfeature" name="MFeature" desc="图标 + 标题 + 描述，用于并列的卖点或说明。">
      <DemoRow label="Basic">
        <div class="w-[280px]">
          <MFeature icon="bolt" title="Fast" description="Short description of the benefit." />
        </div>
        <div class="w-[280px]">
          <MFeature icon="shield" title="Secure" description="Short description of the benefit." />
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="maccordion" name="MAccordion" desc="折叠段落。allowMultipleOpen 允许同时展开多项。">
      <DemoRow label="Basic">
        <div class="w-full">
          <MAccordion :allow-multiple-open="true">
            <MAccordionItem title="First section">
              Content of the first section. Keep paragraphs short.
            </MAccordionItem>
            <MAccordionItem title="Second section">
              Content of the second section.
            </MAccordionItem>
            <MAccordionItem title="Third section">
              Content of the third section.
            </MAccordionItem>
          </MAccordion>
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mlist" name="MList" desc="纵向列表。MListItem 支持左右图标、选中态和子项缩进。">
      <DemoRow label="Basic">
        <div class="w-[360px] rounded border border-color-default">
          <MList>
            <MListItem left-icon="home">Overview</MListItem>
            <MListItem left-icon="description" active>Documents</MListItem>
            <MListItem left-icon="settings" right-icon="chevron_right">Settings</MListItem>
            <MListItem left-icon="archive" disabled>Archived</MListItem>
          </MList>
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mtable" name="MTable" desc="基础表格样式。复杂数据表格用 SusyTable / vxe-table。">
      <DemoRow label="Basic">
        <div class="w-full">
          <MTable :border-bottom="true" :hover-bg="true">
            <table class="w-full text-[14px]">
              <thead>
                <tr class="text-left text-color-subtle border-b border-color-default">
                  <th class="py-3 px-4 font-semibold">Name</th>
                  <th class="py-3 px-4 font-semibold">Category</th>
                  <th class="py-3 px-4 font-semibold">Date</th>
                  <th class="py-3 px-4 font-semibold">State</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableRows" :key="row.id" class="border-b border-color-default last:border-b-0">
                  <td class="py-3 px-4 text-color-default">{{ row.name }}</td>
                  <td class="py-3 px-4 text-color-subtle">{{ row.category }}</td>
                  <td class="py-3 px-4 text-color-subtle">{{ row.date }}</td>
                  <td class="py-3 px-4">
                    <MTag variant="tonal" :state="row.state === 'Active' ? 'success' : row.state === 'Pending' ? 'warning' : 'neutral'">
                      {{ row.state }}
                    </MTag>
                  </td>
                </tr>
              </tbody>
            </table>
          </MTable>
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mavatar" name="MAvatar" desc="头像。没有图片时显示姓名首字母。">
      <DemoRow label="Sizes">
        <MAvatar name="Ada Lovelace" size="xs" />
        <MAvatar name="Ada Lovelace" size="sm" />
        <MAvatar name="Ada Lovelace" size="md" />
        <MAvatar name="Ada Lovelace" size="lg" />
        <MAvatar name="Ada Lovelace" size="xl" />
      </DemoRow>
    </DemoSection>

    <DemoSection id="micon" name="MIcon" desc="图标。名字用 Material Symbols 的 snake_case，size 为 xs–xxl。">
      <DemoRow label="Sizes">
        <MIcon name="settings" size="xs" />
        <MIcon name="settings" size="sm" />
        <MIcon name="settings" size="md" />
        <MIcon name="settings" size="lg" />
        <MIcon name="settings" size="xl" />
      </DemoRow>

      <DemoRow label="Common icons">
        <div class="flex flex-wrap items-center gap-5">
          <MIcon v-for="name in iconNames" :key="name" :name="name" size="md" />
        </div>
      </DemoRow>

      <DemoRow label="Filled">
        <MIcon name="favorite" fill />
        <MIcon name="star" fill />
        <MIcon name="bookmark" fill />
      </DemoRow>
    </DemoSection>

    <DemoSection id="miconcustom" name="MIconCustom" desc="放自定义 SVG，尺寸与 MIcon 一致。">
      <DemoRow label="Custom SVG">
        <MIconCustom size="md">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </MIconCustom>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mskeletonitem" name="MSkeletonItem" desc="骨架屏占位，加载完成前保持布局稳定。">
      <DemoRow label="Shapes">
        <div class="flex flex-col gap-3 w-[320px]">
          <MSkeletonItem width="100%" height="16px" />
          <MSkeletonItem width="70%" height="16px" />
          <div class="flex items-center gap-3">
            <MSkeletonItem circle width="40px" height="40px" />
            <MSkeletonItem pill width="120px" height="16px" />
          </div>
        </div>
      </DemoRow>
    </DemoSection>
  </div>
</template>

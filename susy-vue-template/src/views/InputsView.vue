<script setup>
import { ref } from 'vue'
import {
  MAutocomplete,
  MCalendar,
  MCheckbox,
  MChip,
  MDatePicker,
  MFileUploader,
  MInput,
  MPasswordInput,
  MRadioGroup,
  MRangeSlider,
  MSelect,
  MSelectSearch,
  MSwitch,
  MTextarea,
} from '@mdpi-ui/design-system'
import DemoSection from '@/components/DemoSection.vue'
import DemoRow from '@/components/DemoRow.vue'
import { longOptions, options, radioItems, searchScopes } from '@/data/demo'

const text = ref('')
const password = ref('')
const bio = ref('')
const single = ref(null)
const multi = ref([])
const auto = ref(null)
const autoMulti = ref([])
const scope = ref(searchScopes[0])
const query = ref('')
const checked = ref(true)
const partial = ref(false)
const radio = ref('Option one')
const toggle = ref(true)
const chip = ref(true)
const date = ref(null)
const range = ref(null)
const file = ref(null)
const slider = ref(40)
const sliderRange = ref([20, 70])
</script>

<template>
  <div>
    <header class="pb-8">
      <h1 class="text-[32px] font-semibold tracking-tight text-color-default">Inputs</h1>
      <p class="mt-2 text-[14px] text-color-subtle">
        表单控件。字段统一用 label，说明和错误用 hint 加 state，必填加 required。
      </p>
    </header>

    <DemoSection
      id="minput"
      name="MInput"
      desc="单行输入。state 只有 success / error / 空 三种，hint 用于说明或错误提示。"
    >
      <DemoRow label="Basic">
        <div class="w-[320px]">
          <MInput v-model="text" label="Label" placeholder="Enter text" hint="Helper text" />
        </div>
      </DemoRow>

      <DemoRow label="States">
        <div class="w-[320px]">
          <MInput model-value="Valid value" label="Success" state="success" hint="Looks good" />
        </div>
        <div class="w-[320px]">
          <MInput model-value="Invalid value" label="Error" state="error" hint="This field is required" />
        </div>
        <div class="w-[320px]">
          <MInput model-value="Read only" label="Read only" readonly />
        </div>
        <div class="w-[320px]">
          <MInput model-value="Disabled" label="Disabled" disabled />
        </div>
      </DemoRow>

      <DemoRow label="Sizes">
        <div class="w-[240px]"><MInput size="sm" placeholder="Small" /></div>
        <div class="w-[240px]"><MInput size="md" placeholder="Medium" /></div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mpasswordinput" name="MPasswordInput" desc="密码输入，自带显示 / 隐藏切换。">
      <DemoRow label="Basic">
        <div class="w-[320px]">
          <MPasswordInput v-model="password" label="Password" placeholder="Enter password" />
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mtextarea" name="MTextarea" desc="多行输入。设置 limit 后显示字数上限。">
      <DemoRow label="With limit">
        <div class="w-[480px]">
          <MTextarea v-model="bio" label="Description" :rows="4" :limit="200" hint="Plain text only" />
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mselect"
      name="MSelect"
      desc="下拉选择。v-model 绑定的是选中的 item 对象，多选时是数组，不是 value。"
    >
      <DemoRow label="Single">
        <div class="w-[280px]">
          <MSelect v-model="single" :items="options" label="Single select" placeholder="Select one" clearable />
        </div>
      </DemoRow>

      <DemoRow label="Multiple">
        <div class="w-[320px]">
          <MSelect
            v-model="multi"
            :items="options"
            label="Multiple select"
            placeholder="Select one or more"
            multiple
            show-select-all
            clearable
          />
        </div>
      </DemoRow>

      <DemoRow label="States">
        <div class="w-[280px]">
          <MSelect :items="options" label="Error" state="error" hint="Please choose an option" />
        </div>
        <div class="w-[280px]">
          <MSelect :items="options" label="Disabled" disabled placeholder="Disabled" />
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mautocomplete"
      name="MAutocomplete"
      desc="输入时联想。items 为候选列表，clearable 显示清除按钮；开启 multiple 即为多选 + 联想。"
    >
      <DemoRow label="Basic">
        <div class="w-[320px]">
          <MAutocomplete v-model="auto" :items="longOptions" label="Search" placeholder="Start typing" clearable />
        </div>
      </DemoRow>

      <DemoRow label="Multiple">
        <div class="w-[360px]">
          <MAutocomplete
            v-model="autoMulti"
            :items="longOptions"
            label="Multiple search"
            placeholder="Type to search and select"
            multiple
            clearable
          />
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mselectsearch"
      name="MSelectSearch"
      desc="左侧选范围、右侧输关键字的组合搜索。selectedItem 和 search 分开绑定。"
    >
      <DemoRow label="Basic">
        <div class="w-[480px]">
          <MSelectSearch
            v-model:selected-item="scope"
            v-model:search="query"
            :items="searchScopes"
            placeholder="Search keyword"
          />
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mcheckbox" name="MCheckbox" desc="复选框。indeterminate 用于表示部分选中。">
      <DemoRow label="Basic">
        <MCheckbox v-model="checked">Checked by default</MCheckbox>
        <MCheckbox :model-value="false">Unchecked</MCheckbox>
      </DemoRow>

      <DemoRow label="States">
        <MCheckbox v-model="partial" indeterminate>Indeterminate</MCheckbox>
        <MCheckbox :model-value="true" disabled>Disabled checked</MCheckbox>
        <MCheckbox :model-value="false" label-left>Label on the left</MCheckbox>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mradiogroup" name="MRadioGroup" desc="单选组。items 可以是字符串数组，也可以是 { value, label } 对象数组。">
      <DemoRow label="Basic">
        <MRadioGroup v-model="radio" :items="radioItems" label="Choose one" />
      </DemoRow>
    </DemoSection>

    <DemoSection id="mswitch" name="MSwitch" desc="开关，用于即时生效的设置项。">
      <DemoRow label="Basic">
        <MSwitch v-model="toggle" label="Notifications" />
        <MSwitch :model-value="false" label="Disabled" disabled />
      </DemoRow>
    </DemoSection>

    <DemoSection id="mchip" name="MChip" desc="可选中、可关闭的小标签。只读状态请用 MTag。">
      <DemoRow label="Basic">
        <MChip v-model="chip">Selectable chip</MChip>
        <MChip :model-value="false">Unselected</MChip>
        <MChip :model-value="true" closable>Closable</MChip>
        <MChip :model-value="true" left-icon="filter_list">With icon</MChip>
        <MChip :model-value="false" disabled>Disabled</MChip>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mdatepicker"
      name="MDatePicker"
      desc="日期输入，聚焦时弹出日历。isRange 切换为区间选择，maskInput 控制显示格式。"
    >
      <DemoRow label="Single">
        <div class="w-[300px]">
          <MDatePicker v-model="date" label="Date" mask-input="DD.MM.YYYY" />
        </div>
      </DemoRow>

      <DemoRow label="Range">
        <div class="w-[420px]">
          <MDatePicker
            v-model="range"
            label-from="From"
            label-to="To"
            is-range
            mask-input="DD.MM.YYYY"
          />
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mcalendar" name="MCalendar" desc="日历月视图，可通过 minDate / maxDate / disabledDates 限制可选范围。">
      <DemoRow label="Month view">
        <div class="w-[420px]">
          <MCalendar />
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection
      id="mfileuploader"
      name="MFileUploader"
      desc="文件上传，支持按钮或拖放区。accept 为扩展名数组，maxSize 单位为 MB。"
    >
      <DemoRow label="Basic">
        <div class="w-[480px]">
          <MFileUploader v-model="file" label="Upload file" :accept="['.pdf', '.docx', '.png']" :max-size="20" />
        </div>
      </DemoRow>
    </DemoSection>

    <DemoSection id="mrangeslider" name="MRangeSlider" desc="滑块，支持单值和区间两种模式。">
      <DemoRow label="Single">
        <div class="w-[360px]">
          <MRangeSlider v-model="slider" :min="0" :max="100" :step="5" />
        </div>
      </DemoRow>

      <DemoRow label="Range">
        <div class="w-[360px]">
          <MRangeSlider v-model="sliderRange" :min="0" :max="100" :step="5" with-tooltips />
        </div>
      </DemoRow>
    </DemoSection>
  </div>
</template>

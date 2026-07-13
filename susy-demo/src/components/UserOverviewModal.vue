<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>User Overview</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.email"
          :class="['tab-btn', { active: activeTab === tab.email }]"
          @click="activeTab = tab.email"
        >
          {{ tab.email }}
        </button>
      </div>

      <div class="modal-content">
        <nav v-if="!isLoadError" class="anchor-nav">
          <div class="anchor-nav-title">Sections</div>
          <a
            v-for="item in sections"
            :key="item.id"
            :href="'#' + item.id"
            :class="['anchor-link', { active: activeSectionId === item.id }]"
            @click.prevent="scrollToSection(item.id)"
          >{{ item.title }}</a>
        </nav>

        <div ref="bodyRef" class="modal-body">
          <div v-if="isLoadError" class="uo-load-error">
            <div class="uo-load-error-card">
              <p class="uo-load-error-desc">
                Failed to load user information.
                <a
                  href="#"
                  class="uo-load-error-retry"
                  :class="{ 'is-busy': isRetrying }"
                  @click.prevent="retryLoad"
                >
                  {{ isRetrying ? 'Trying again…' : 'Try again' }}
                  <RefreshCw :size="14" :class="{ 'uo-load-error-spin': isRetrying }" />
                </a>
              </p>
            </div>
          </div>

          <template v-else>
            <div
              v-for="item in sections"
              :id="item.id"
              :key="item.id"
            >
              <UoSection :title="item.title" :defaultOpen="true">
                <CodeRef
                  v-for="(ref, ri) in item.refs"
                  :key="ri"
                  :file="ref.file"
                  :start="ref.start"
                  :end="ref.end"
                  :first-lines="ref.firstLines"
                  :last-lines="ref.lastLines"
                />
              </UoSection>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h, watch, nextTick } from 'vue'
import UoSection from './UoSection.vue'
import { RefreshCw } from 'lucide-vue-next'
import { useSectionScrollSpy } from '../composables/useSectionScrollSpy'
import './UserOverviewModal.css'

defineProps({ emailInput: { type: String, default: '' } })
defineEmits(['close'])

function renderLine(line) {
  return [
    h('span', { class: 'code-ref-ln' }, `L${line.n}`),
    '  ',
    line.text
  ]
}

const CodeRef = defineComponent({
  name: 'CodeRef',
  props: {
    file: String,
    start: Number,
    end: Number,
    firstLines: { type: Array, default: () => [] },
    lastLines: { type: Array, default: () => [] }
  },
  setup(props) {
    return () => {
      const first = props.firstLines
      const last = props.lastLines
      const lastFirstN = first.length ? first[first.length - 1].n : 0
      const showEllipsis = last.length > 0 && last[0].n > lastFirstN + 1
      // 去重：尾部与首部重叠的行不重复渲染
      const tail = last.filter(l => l.n > lastFirstN)

      const children = []
      first.forEach((line, i) => {
        if (i > 0) children.push('\n')
        children.push(...renderLine(line))
      })
      if (showEllipsis) {
        children.push('\n')
        children.push(h('span', { class: 'code-ref-ellipsis' }, '…'))
      }
      tail.forEach((line) => {
        children.push('\n')
        children.push(...renderLine(line))
      })

      return h('div', { class: 'code-ref' }, [
        h('div', { class: 'code-ref-meta' }, [
          h('span', { class: 'code-ref-file' }, props.file),
          h('span', { class: 'code-ref-range' }, `L${props.start} → L${props.end}`)
        ]),
        h('pre', { class: 'code-ref-block' }, [
          h('code', null, children)
        ])
      ])
    }
  }
})

const activeTab = ref('user1@example.com')
const isRetrying = ref(false)

const tabs = [
  { email: 'user1@example.com' },
  { email: 'user2@example.com' },
  { email: 'error@example.com' }
]

const isLoadError = computed(() => activeTab.value === 'error@example.com')

async function retryLoad() {
  if (isRetrying.value) return
  isRetrying.value = true
  await new Promise(r => setTimeout(r, 800))
  isRetrying.value = false
}

const sections = [
  {
    id: 'section-account-info',
    title: 'Account Info',
    refs: [{
      file: 'templates/UserInfo/show.html.twig',
      start: 155,
      end: 244,
      firstLines: [
        { n: 155, text: '<h2>' },
        { n: 156, text: '    Overview:' }
      ],
      lastLines: [
        { n: 243, text: '    </div>' },
        { n: 244, text: '{% endif %}' }
      ]
    }]
  },
  {
    id: 'section-invoices',
    title: 'Paid Invoices',
    refs: [{
      file: 'templates/UserInfo/show.html.twig',
      start: 246,
      end: 262,
      firstLines: [
        { n: 246, text: '{% if paid_invoices|length > 0 and show_scholar_apc_info %}' },
        { n: 247, text: '    {% set has_info = true %}' }
      ],
      lastLines: [
        { n: 261, text: '    </div>' },
        { n: 262, text: '{% endif %}' }
      ]
    }]
  },
  {
    id: 'section-scholars',
    title: 'Submission Scholars',
    refs: [{
      file: 'templates/UserInfo/show.html.twig',
      start: 264,
      end: 297,
      firstLines: [
        { n: 264, text: '{% if submission_scholars|length > 0 %}' },
        { n: 265, text: '    {% set has_info = true %}' }
      ],
      lastLines: [
        { n: 296, text: '    </div>' },
        { n: 297, text: '{% endif %}' }
      ]
    }]
  },
  {
    id: 'section-editors',
    title: 'Editors',
    refs: [{
      file: 'templates/UserInfo/show.html.twig',
      start: 299,
      end: 384,
      firstLines: [
        { n: 299, text: '{% if editors|length > 0 %}' },
        { n: 300, text: '    {% set has_info = true %}' }
      ],
      lastLines: [
        { n: 383, text: '    </div>' },
        { n: 384, text: '{% endif %}' }
      ]
    }]
  },
  {
    id: 'section-vouchers',
    title: 'Discount Vouchers',
    refs: [
      {
        file: 'templates/UserInfo/show.html.twig',
        start: 386,
        end: 390,
        firstLines: [
          { n: 386, text: '{% if discount_vouchers and show_scholar_apc_info %}' },
          { n: 387, text: '    {% set discount_vouchers_length = discount_vouchers|length %}' }
        ],
        lastLines: [
          { n: 389, text: '    {{ helper.show_discount_vouchers(discount_vouchers) }}' },
          { n: 390, text: '{% endif %}' }
        ]
      },
      {
        file: 'templates/UserInfo/show.html.twig',
        start: 46,
        end: 123,
        firstLines: [
          { n: 46, text: '{% macro show_discount_vouchers(discount_vouchers) %}' },
          { n: 47, text: '    {% if discount_vouchers %}' }
        ],
        lastLines: [
          { n: 122, text: '    {% endif %}' },
          { n: 123, text: '{% endmacro %}' }
        ]
      }
    ]
  },
  {
    id: 'section-reviewer-profile',
    title: 'Reviewer Profile',
    refs: [{
      file: 'templates/UserInfo/show.html.twig',
      start: 392,
      end: 469,
      firstLines: [
        { n: 392, text: '{% if reviewers|length > 0 %}' },
        { n: 393, text: '    <div class="user-info-section">' }
      ],
      lastLines: [
        { n: 465, text: '{% else %}' },
        { n: 467, text: '        <a href="{{ create_reviewer_path() }}" ...>Add as Reviewer</a>' }
      ]
    }]
  },
  {
    id: 'section-volunteers',
    title: 'Volunteers',
    refs: [{
      file: 'templates/UserInfo/show.html.twig',
      start: 471,
      end: 491,
      firstLines: [
        { n: 471, text: '{% if volunteers|length > 0 %}' },
        { n: 472, text: '    <div class="user-info-section">' }
      ],
      lastLines: [
        { n: 490, text: '    </div>' },
        { n: 491, text: '{% endif %}' }
      ]
    }]
  },
  {
    id: 'section-submitted-manuscripts',
    title: 'Submitted Manuscripts',
    refs: [{
      file: 'templates/UserInfo/show.html.twig',
      start: 493,
      end: 507,
      firstLines: [
        { n: 493, text: '{% if authors|length > 0 %}' },
        { n: 494, text: '    <div class="user-info-section">' }
      ],
      lastLines: [
        { n: 506, text: '    </div>' },
        { n: 507, text: '{% endif %}' }
      ]
    }]
  },
  {
    id: 'section-reviewed-manuscripts',
    title: 'Reviewed Manuscripts',
    refs: [{
      file: 'templates/UserInfo/show.html.twig',
      start: 509,
      end: 521,
      firstLines: [
        { n: 509, text: '{% if reviewers|length > 0 %}' },
        { n: 510, text: '    <div class="user-info-section">' }
      ],
      lastLines: [
        { n: 520, text: '    </div>' },
        { n: 521, text: '{% endif %}' }
      ]
    }]
  },
  {
    id: 'section-comments',
    title: 'Comments',
    refs: [
      {
        file: 'templates/UserInfo/show.html.twig',
        start: 527,
        end: 530,
        firstLines: [
          { n: 527, text: '{% if show_comments %}' },
          { n: 528, text: '    <div id="Box" style="cursor:pointer" class = "form-notes">' }
        ],
        lastLines: [
          { n: 529, text: '    </div>' },
          { n: 530, text: '{% endif %}' }
        ]
      },
      {
        file: 'templates/UserInfo/show_comments.html.twig',
        start: 1,
        end: 23,
        firstLines: [
          { n: 1, text: '{% for user in data %}' },
          { n: 2, text: '    {% set notes = user.notes %}' }
        ],
        lastLines: [
          { n: 22, text: '    </form>' },
          { n: 23, text: '{% endfor %}' }
        ]
      }
    ]
  }
]

const bodyRef = ref(null)
const { activeSectionId, scrollToSection, updateActive } = useSectionScrollSpy(
  () => (isLoadError.value ? [] : sections.map(s => s.id)),
  bodyRef
)

watch(activeTab, () => nextTick(updateActive))
</script>

<style scoped>
:deep(.code-ref) {
  margin-bottom: 14px;
}
:deep(.code-ref:last-child) {
  margin-bottom: 0;
}
:deep(.code-ref-meta) {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
}
:deep(.code-ref-file) {
  color: #546e7a;
}
:deep(.code-ref-range) {
  font-weight: 600;
  color: #5d4037;
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 3px;
  padding: 1px 7px;
}
:deep(.code-ref-block) {
  margin: 0;
  padding: 12px 14px;
  background: #f4f5f7;
  border: 1px solid #dfe1e6;
  border-radius: 3px;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.65;
  color: #172b4d;
  overflow-x: auto;
  white-space: pre;
}
:deep(.code-ref-block code) {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  background: none;
  padding: 0;
}
:deep(.code-ref-ln) {
  color: #6b778c;
  user-select: none;
}
:deep(.code-ref-ellipsis) {
  color: #6b778c;
}
</style>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories } from '@/data/catalog'
import { scrollToId, useActiveSection } from '@/utils/scroll'

const emit = defineEmits(['expand'])

const route = useRoute()
const router = useRouter()

const isComponentsPage = computed(() => route.name === 'components')

const openMenus = ref(Object.fromEntries(categories.map((cat) => [cat.key, true])))

const { activeId } = useActiveSection(() => [
  'overview',
  ...categories.flatMap((cat) => cat.components.map((comp) => comp.id)),
])

function toggle(key) {
  openMenus.value[key] = !openMenus.value[key]
}

function goTo(id) {
  scrollToId(id)
}

// 收起状态下点主页的组件入口：展开侧栏并进入组件页
function openComponents() {
  emit('expand')
  router.push('/components')
}

function isActiveCategory(cat) {
  return cat.components.some((comp) => comp.id === activeId.value)
}
</script>

<template>
  <nav id="leftcol" aria-label="Side navigation">
    <template v-if="!isComponentsPage">
      <div class="menu-container">
        <i
          class="caption-icon ms collapse-icon"
          role="button"
          tabindex="0"
          title="Components"
          aria-label="Components"
          @click="openComponents"
          @keydown.enter.prevent="openComponents"
          @keydown.space.prevent="openComponents"
        >widgets</i>
        <div class="menu-caption">
          <router-link
            to="/components"
            class="!tw-flex tw-items-center text-caption-title menu-toggle"
          >
            <i class="caption-icon ms">widgets</i>
            <span class="!tw-p-0 tw-flex-1 tw-truncate">Components</span>
          </router-link>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="menu-container">
        <i
          class="caption-icon ms collapse-icon"
          role="button"
          tabindex="0"
          title="Overview"
          aria-label="Overview"
          @click="emit('expand', 'overview')"
          @keydown.enter.prevent="emit('expand', 'overview')"
          @keydown.space.prevent="emit('expand', 'overview')"
        >apps</i>
        <div class="menu-caption">
          <a
            href="/components"
            class="!tw-flex tw-items-center text-caption-title menu-toggle"
            @click.prevent="goTo('overview')"
          >
            <i class="caption-icon ms">apps</i>
            <span class="!tw-p-0 tw-flex-1 tw-truncate">Overview</span>
          </a>
        </div>
      </div>

      <div
        v-for="cat in categories"
        :key="cat.key"
        class="menu-container"
        :class="{ active: isActiveCategory(cat) }"
      >
        <i
          class="caption-icon ms collapse-icon"
          role="button"
          tabindex="0"
          :title="cat.title"
          :aria-label="cat.title"
          @click="emit('expand', cat.key)"
          @keydown.enter.prevent="emit('expand', cat.key)"
          @keydown.space.prevent="emit('expand', cat.key)"
        >{{ cat.icon }}</i>
        <div class="menu-caption">
          <button
            type="button"
            class="!tw-flex tw-items-center text-caption-title menu-toggle"
            :aria-expanded="openMenus[cat.key] ? 'true' : 'false'"
            :aria-controls="`menu-${cat.key}`"
            @click="toggle(cat.key)"
          >
            <i class="caption-icon ms">{{ cat.icon }}</i>
            <span class="!tw-p-0 tw-flex-1 tw-truncate" :title="cat.title">{{ cat.title }}</span>
            <i class="arrow ms ms-keyboard-arrow-down"></i>
          </button>
        </div>
        <ul v-show="openMenus[cat.key]" :id="`menu-${cat.key}`" class="menu">
          <li
            v-for="comp in cat.components"
            :key="comp.id"
            :class="{ active: activeId === comp.id }"
          >
            <a href="/components" @click.prevent="goTo(comp.id)">{{ comp.name }}</a>
          </li>
        </ul>
      </div>
    </template>
  </nav>
</template>

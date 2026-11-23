<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { categories } from '@/data/catalog'

const route = useRoute()
const activeHash = computed(() => route.hash)

const openMenus = ref(Object.fromEntries(categories.map((cat) => [cat.key, true])))

function toggle(key) {
  openMenus.value[key] = !openMenus.value[key]
}

function itemTarget(compId) {
  return { path: '/design-system', hash: `#${compId}` }
}
</script>

<template>
  <nav id="leftcol" aria-label="Side navigation">
    <div class="menu-container">
      <div class="menu-caption">
        <router-link
          :to="{ path: '/design-system' }"
          class="!tw-flex tw-items-center text-caption-title menu-toggle"
        >
          <i class="caption-icon ms">apps</i>
          <span class="!tw-p-0 tw-flex-1 tw-truncate">Overview</span>
        </router-link>
      </div>
    </div>

    <div v-for="cat in categories" :key="cat.key" class="menu-container">
      <i class="caption-icon ms collapse-icon" :title="cat.title">{{ cat.icon }}</i>
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
          :class="{ active: activeHash === `#${comp.id}` }"
        >
          <router-link :to="itemTarget(comp.id)">{{ comp.name }}</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

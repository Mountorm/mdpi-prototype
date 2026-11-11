<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { MIcon } from '@mdpi-ui/design-system'
import { categories } from '@/data/catalog'

const route = useRoute()
const activeHash = computed(() => route.hash)
const activeCategory = computed(() => route.path.replace('/', ''))
</script>

<template>
  <div class="min-h-screen bg-default">
    <!-- 顶栏 -->
    <header
      class="sticky top-0 z-20 h-14 flex items-center gap-3 px-6 border-b border-color-default bg-surface-default"
    >
      <span class="text-[18px] font-bold tracking-tight text-color-default">MDPI</span>
      <span class="w-px h-4 bg-[var(--color-border-default)]" />
      <span class="text-[14px] font-semibold text-color-default">SuSy Design System</span>
      <span class="ml-auto text-[12px] text-color-subtlest">@mdpi-ui/design-system 5.0.0-alpha.1</span>
    </header>

    <div class="flex">
      <!-- 左侧目录 -->
      <aside
        class="w-[248px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-color-default bg-surface-default px-3 py-5"
      >
        <router-link
          to="/overview"
          class="flex items-center gap-2 px-2 py-1.5 mb-4 rounded text-[13px] font-semibold"
          :class="activeCategory === 'overview' ? 'text-color-brand-bold' : 'text-color-default'"
        >
          <MIcon name="apps" size="xs" />
          <span>Overview</span>
        </router-link>

        <nav v-for="cat in categories" :key="cat.key" class="mb-5">
          <router-link
            :to="`/${cat.key}`"
            class="flex items-center gap-2 px-2 py-1.5 rounded text-[13px] font-semibold"
            :class="activeCategory === cat.key ? 'text-color-brand-bold' : 'text-color-default'"
          >
            <MIcon :name="cat.icon" size="xs" />
            <span>{{ cat.title }}</span>
          </router-link>
          <ul class="mt-1 flex flex-col">
            <li v-for="comp in cat.components" :key="comp.id">
              <router-link
                :to="`/${cat.key}#${comp.id}`"
                class="block px-2 py-1 pl-8 rounded text-[13px] truncate"
                :class="
                  activeCategory === cat.key && activeHash === `#${comp.id}`
                    ? 'text-color-brand bg-surface-selected'
                    : 'text-color-subtle hover:text-color-default hover:bg-surface-subtle'
                "
              >
                {{ comp.name }}
              </router-link>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- 内容区 -->
      <main class="flex-1 min-w-0">
        <div class="max-w-[1040px] px-10 py-8">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

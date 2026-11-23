<script setup>
import { MIcon } from '@mdpi-ui/design-system'
import { categories } from '@/data/catalog'

const total = categories.reduce((sum, cat) => sum + cat.components.length, 0)
</script>

<template>
  <div>
    <header class="pb-10">
      <h1 class="text-[32px] font-semibold tracking-tight text-color-default">Components</h1>
      <p class="mt-2 text-[14px] text-color-subtle">
        共 {{ total }} 个组件，全部来自 @mdpi-ui/design-system 5.0.0-alpha.1。
        点击任一组件查看示例。
      </p>
    </header>

    <section v-for="cat in categories" :key="cat.key" class="mb-10">
      <div class="flex items-center gap-2 mb-4">
        <MIcon :name="cat.icon" size="sm" class="text-color-subtle" />
        <h2 class="text-[18px] font-semibold text-color-default">{{ cat.title }}</h2>
        <span class="text-[13px] text-color-subtlest">{{ cat.components.length }}</span>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <router-link
          v-for="comp in cat.components"
          :key="comp.id"
          :to="{ path: '/design-system', hash: `#${comp.id}` }"
          class="flex items-center justify-between rounded border border-color-default px-4 py-3 hover:border-color-bold hover:bg-surface-subtle"
        >
          <span class="text-[14px] text-color-default">{{ comp.name }}</span>
          <MIcon name="chevron_right" size="xs" class="text-color-subtlest" />
        </router-link>
      </div>
    </section>
  </div>
</template>

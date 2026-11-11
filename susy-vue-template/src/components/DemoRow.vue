<script setup>
defineProps({
  label: { type: String, default: '' },
})
</script>

<template>
  <div>
    <p v-if="label" class="mb-3 text-[12px] font-medium uppercase tracking-wide text-color-subtlest">
      {{ label }}
    </p>
    <div class="flex flex-wrap items-center gap-3">
      <slot />
    </div>
  </div>
</template>

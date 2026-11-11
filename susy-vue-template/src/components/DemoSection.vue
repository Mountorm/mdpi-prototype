<script setup>
defineProps({
  id: { type: String, required: true },
  name: { type: String, required: true },
  desc: { type: String, default: '' },
})
</script>

<template>
  <section :id="id" class="scroll-mt-20 pt-10 pb-12 border-t border-color-default first:border-t-0 first:pt-0">
    <h2 class="text-[24px] font-semibold tracking-tight text-color-default">{{ name }}</h2>
    <p v-if="desc" class="mt-2 text-[14px] leading-6 text-color-subtle max-w-[760px]">{{ desc }}</p>
    <div class="mt-6 flex flex-col gap-8">
      <slot />
    </div>
  </section>
</template>

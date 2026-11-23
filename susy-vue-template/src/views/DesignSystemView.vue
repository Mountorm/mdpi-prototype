<script setup>
import OverviewView from '@/views/OverviewView.vue'
import ActionsView from '@/views/ActionsView.vue'
import InputsView from '@/views/InputsView.vue'
import DataDisplayView from '@/views/DataDisplayView.vue'
import FeedbackView from '@/views/FeedbackView.vue'
import NavigationView from '@/views/NavigationView.vue'
import LayoutView from '@/views/LayoutView.vue'
import { categories } from '@/data/catalog'

const views = {
  actions: ActionsView,
  inputs: InputsView,
  'data-display': DataDisplayView,
  feedback: FeedbackView,
  navigation: NavigationView,
  layout: LayoutView,
}
</script>

<template>
  <div>
    <div id="overview" class="scroll-mt-20">
      <OverviewView />
    </div>

    <div
      v-for="cat in categories"
      :id="cat.key"
      :key="cat.key"
      class="scroll-mt-20 mt-14 pt-10 border-t border-color-default"
    >
      <component :is="views[cat.key]" />
    </div>
  </div>
</template>

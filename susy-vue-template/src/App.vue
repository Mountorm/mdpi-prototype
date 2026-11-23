<script setup>
import SusyHeader from '@/layout/SusyHeader.vue'
import SusySidebar from '@/layout/SusySidebar.vue'
import SusyFooter from '@/layout/SusyFooter.vue'
</script>

<template>
  <div id="susy-prototype-app">
    <SusyHeader />

    <div class="off-canvas-wrapper">
      <div class="off-canvas-content" data-off-canvas-content>
        <div id="container">
          <div id="main" class="grid-x">
            <div id="left-menu-main-container" class="show-for-large">
              <div class="left-menu-container">
                <SusySidebar />
              </div>
              <div class="left-menu-footer">
                <span class="left-toggle-button ms ms-filled !tw-text-color-default tw-mx-4">right_panel_open</span>
              </div>
            </div>

            <div class="cell small-12 medium-12 large-auto susy-ds-content">
              <router-view />
            </div>
          </div>
        </div>

        <SusyFooter />
      </div>
    </div>
  </div>
</template>

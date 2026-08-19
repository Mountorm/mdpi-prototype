<script setup>
// App shell layout: top bar + sidebar + breadcrumb + routed content.
// Shared by the three feature pages (config / generate / report).
import { ref, computed, h } from 'vue'
import { useRoute } from 'vue-router'
import susyLogo from '../assets/img/susy-logo.png'
import MdIcon from '../components/MdIcon.vue'

const route = useRoute()
const CHECKLIST_PATH = '/config'

// Google chevron_right as the breadcrumb separator (no font / network dependency)
const ChevronRightIcon = () => h(MdIcon, { name: 'chevron_right', size: 18 })

const menuItems = [
  { label: 'Journals', href: '#' },
  { label: 'Content Management', href: '#' },
  { label: 'Settings', href: '#', active: true },
  { label: 'Permission Management', href: '#' },
]

// Sidebar collapse (Fold button at the bottom)
const sidebarCollapsed = ref(false)
const toggleSidebar = () => { sidebarCollapsed.value = !sidebarCollapsed.value }

// Menu item highlight: only the configuration page maps to the sidebar item
const activeMenu = computed(() =>
  route.path.startsWith('/config') ? CHECKLIST_PATH : ''
)

// Breadcrumb per route
const crumbs = computed(() => {
  if (route.path.startsWith('/config')) return ['Settings', 'Option Settings', 'AcE Checklist']
  if (route.path.startsWith('/generate')) return ['Generate Report']
  if (route.path.startsWith('/report')) return ['Report Page']
  return []
})
</script>

<template>
  <section class="el-container layout-container flex-center">
    <!-- ========== Top bar ========== -->
    <header class="el-header layout-header">
      <div class="layout-navbars-container">
        <div class="layout-navbars-breadcrumb-index">
          <div class="layout-logo">
            <router-link to="/" class="sidebar-logo-link">
              <img :src="susyLogo" class="layout-logo-medium-img" alt="SuSy" />
            </router-link>
          </div>
          <a
            v-for="item in menuItems"
            :key="item.label"
            :href="item.href"
            class="menu-item"
            :class="{ active: item.active }"
            @click.prevent
          >
            {{ item.label }}
          </a>
          <div class="layout-navbars-breadcrumb-user pr35" style="flex: 1 1 0%">
            <span class="layout-navbars-breadcrumb-user-link">
              <span class="layout-navbars-breadcrumb-user-link-shortName">HC</span>
              Hongqiang Cui
            </span>
          </div>
        </div>
      </div>
    </header>

    <section class="el-container layout-mian-height-60">
      <!-- ========== Sidebar ========== -->
      <div class="outSide">
        <div>
          <div class="h100 journalSidebar">
            <aside
              class="el-aside layout-aside layout-el-aside-br-color"
              :class="sidebarCollapsed ? 'layout-aside-pc-54' : 'layout-aside-pc-240'"
            >
              <el-scrollbar class="flex-auto">
                <el-menu
                  :default-active="activeMenu"
                  default-openeds="['option']"
                  :collapse="sidebarCollapsed"
                  :collapse-transition="false"
                >
                  <!-- Option Settings: collapsible group without an active highlight -->
                  <el-sub-menu index="option">
                    <template #title>
                      <MdIcon name="settings" :size="20" />
                      <span>Option Settings</span>
                      <MdIcon name="expand_more" :size="20" class="group-arrow" />
                    </template>
                    <el-menu-item :index="CHECKLIST_PATH">
                      <span class="noneChild">AcE Checklist</span>
                    </el-menu-item>
                  </el-sub-menu>
                </el-menu>
              </el-scrollbar>
              <div class="collapase-bottom" @click="toggleSidebar">
                <div class="collapase-btn">
                  <MdIcon name="menu" :size="20" />
                </div>
                <div class="fold_txt" v-show="!sidebarCollapsed">Fold</div>
              </div>
            </aside>
          </div>
        </div>

        <div class="flex-center layout-backtop">
          <!-- ========== Breadcrumb ========== -->
          <div class="layout-navbars-breadcrumb">
            <el-breadcrumb class="layout-navbars-breadcrumb-hide" :separator-icon="ChevronRightIcon">
              <el-breadcrumb-item v-for="(c, i) in crumbs" :key="i">
                <span :class="{ 'layout-navbars-breadcrumb-span': i === crumbs.length - 1 }">{{ c }}</span>
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <!-- ========== Routed content ========== -->
          <main class="el-main layout-main fix-head" style="height: calc(100% - 51px)">
            <el-scrollbar class="layout-main-scroll layout-backtop-header-fixed">
              <div class="layout-parent">
                <div class="layout-pd w100">
                  <div class="layout-title">
                    {{ route.path.startsWith('/config') ? 'AcE Checklist' : crumbs[0] || '' }}
                  </div>
                  <div class="layout-pd-outline">
                    <router-view />
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </main>
        </div>
      </div>
    </section>
  </section>
</template>

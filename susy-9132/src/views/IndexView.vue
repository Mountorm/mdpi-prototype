<script setup>
// Home page: three buttons as the entry menu
import { useRouter } from 'vue-router'
import susyLogo from '../assets/img/susy-logo.png'
import MdIcon from '../components/MdIcon.vue'

const router = useRouter()

const items = [
  { path: '/config', label: 'Configuration', icon: 'settings', desc: 'Configure the AcE checklist template' },
  { path: '/generate', label: 'Generate Report', icon: 'add', desc: 'Generate a checklist report for a manuscript' },
  { path: '/report', label: 'Report Page', icon: 'search', desc: 'Review the generated AcE report' },
]

const go = (path) => router.push(path)
</script>

<template>
  <div class="index-page">
    <div class="index-brand">
      <img :src="susyLogo" class="index-logo" alt="SuSy" />
      <h1 class="index-title">AcE Checklist</h1>
      <p class="index-sub">Academic Editor Checklist System</p>
    </div>
    <div class="index-menu">
      <button v-for="item in items" :key="item.path" class="index-btn" type="button" @click="go(item.path)">
        <MdIcon :name="item.icon" :size="28" class="index-btn-icon" />
        <span class="index-btn-text">
          <span class="index-btn-label">{{ item.label }}</span>
          <span class="index-btn-desc">{{ item.desc }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.index-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48px;
  background: #f8f9fd;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.index-brand { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.index-logo { width: 120px; }
.index-title { margin: 0; color: #1b3555; font-size: 32px; font-weight: 700; }
.index-sub { margin: 0; color: #778293; font-size: 14px; }
.index-menu { display: flex; flex-direction: column; gap: 16px; width: 360px; }
.index-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 22px;
  border: 1px solid #e1e5ea;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.index-btn:hover { border-color: #0156ce; box-shadow: 0 4px 12px rgba(1, 86, 206, 0.12); }
.index-btn-icon { color: #0156ce; }
.index-btn-text { display: flex; flex-direction: column; gap: 3px; }
.index-btn-label { color: #1b3555; font-size: 18px; font-weight: 600; }
.index-btn-desc { color: #778293; font-size: 13px; }
</style>

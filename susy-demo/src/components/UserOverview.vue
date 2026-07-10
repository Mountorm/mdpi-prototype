<template>
  <div class="user-overview-page">
    <div class="search-card">
      <h3>User Overview</h3>
      <div class="search-row">
        <input
          v-model="emailInput"
          type="email"
          placeholder="e.g. user@example.com"
          class="email-input"
          @keyup.enter="openDev"
        />
        <button class="confirm-btn" @click="openDev">Confirm</button>
        <button class="demo-btn" @click="openDemo">Demo</button>
      </div>
    </div>

    <UserOverviewModal
      v-if="showDevModal"
      :email-input="emailInput"
      @close="showDevModal = false"
    />
    <UserOverviewModalDemo
      v-if="showDemoModal"
      :email-input="emailInput"
      @close="showDemoModal = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UserOverviewModal from './UserOverviewModal.vue'
import UserOverviewModalDemo from './UserOverviewModalDemo.vue'

const emailInput = ref('')
const showDevModal = ref(false)
const showDemoModal = ref(false)

const openDev = () => {
  showDemoModal.value = false
  showDevModal.value = true
}

const openDemo = () => {
  showDevModal.value = false
  showDemoModal.value = true
}
</script>

<style scoped>
.user-overview-page {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 24px;
}
.search-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 32px 40px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.search-card h3 {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 700;
  color: #172b4d;
}
.search-row {
  display: flex;
  gap: 10px;
}
.email-input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.email-input:focus {
  border-color: #2563eb;
}
.confirm-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}
.confirm-btn:hover {
  background: #1d4ed8;
}
.demo-btn {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 20px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}
.demo-btn:hover {
  background: #f3f4f6;
}
</style>

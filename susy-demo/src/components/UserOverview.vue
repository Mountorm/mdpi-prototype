<template>
  <div class="user-overview-page">
    <div class="search-card">
      <h3>User Overview</h3>
      <p class="hint">Enter an email address to look up user information.</p>
      <div class="search-row">
        <input
          v-model="emailInput"
          type="email"
          placeholder="e.g. user@example.com"
          class="email-input"
          @keyup.enter="openModal"
        />
        <button class="confirm-btn" @click="openModal">Confirm</button>
      </div>
    </div>

    <UserOverviewModal
      v-if="showModal"
      :email-input="emailInput"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UserOverviewModal from './UserOverviewModal.vue'

const emailInput = ref('')
const showModal = ref(false)

const openModal = () => {
  showModal.value = true
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
  max-width: 480px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.search-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: #172b4d;
}
.hint {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 20px;
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
</style>

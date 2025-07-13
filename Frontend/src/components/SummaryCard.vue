<template>
  <div class="summary-card">
    <div class="summary-title">Net Worth</div>
    <div class="summary-value">{{ netWorth | currency }}</div>
    <div class="summary-details">
      <div v-for="item in details" :key="item.label" class="summary-detail">
        <span :class="['detail-label', item.type]">{{ item.label }}</span>
        <span :class="['detail-value', item.type]">{{ item.value | currency }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ netWorth: number, details: Array<{ label: string, value: number, type?: string }> }>();
</script>

<script lang="ts">
export default {
  filters: {
    currency(val: number) {
      return val?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? '';
    }
  }
}
</script>

<style scoped>
.summary-card {
  background: #232733;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  margin-bottom: 2rem;
}
.summary-title {
  font-size: 1.1rem;
  color: #6ee7b7;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.summary-value {
  font-size: 2rem;
  font-weight: bold;
  color: #e0e3e8;
  margin-bottom: 1rem;
}
.summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.detail-label {
  color: #e0e3e8;
  font-size: 0.95rem;
}
.detail-value {
  font-size: 0.95rem;
  font-weight: 500;
}
.detail-label.positive, .detail-value.positive {
  color: #6ee7b7;
}
.detail-label.negative, .detail-value.negative {
  color: #f87171;
}
</style>

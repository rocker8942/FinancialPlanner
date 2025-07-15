<template>
  <div class="summary-card">
    <div class="summary-title">Net Worth</div>
    <div class="summary-value">{{ formatCurrency(netWorth) }}</div>
    <div class="summary-details">
      <div v-for="item in details" :key="item.label" class="summary-detail">
        <div class="detail-row">
          <span :class="['detail-label', item.type]">{{ item.label }}</span>
          <span :class="['detail-value', item.type]">{{ formatCurrency(item.value) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '../utils/formatters';

defineProps<{ netWorth: number, details: Array<{ label: string, value: number, type?: string }> }>();
</script>

<style scoped>
.summary-card {
  background: #232733;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  margin-bottom: 2rem;
}
.summary-title {
  font-size: 0.9rem;
  color: #6ee7b7;
  font-weight: 600;
  margin-bottom: 0.4rem;
}
.summary-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #e0e3e8;
  margin-bottom: 0.8rem;
}
.summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.detail-label {
  color: #e0e3e8;
  font-size: 0.75rem;
}
.detail-value {
  font-size: 0.75rem;
  font-weight: 500;
}
.detail-label.positive, .detail-value.positive {
  color: #6ee7b7;
}
.detail-label.negative, .detail-value.negative {
  color: #f87171;
}
</style>

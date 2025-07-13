<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Net Wealth Plan</h1>
    </div>
    <div class="dashboard-main">
      <div class="dashboard-left">
        <NetWealthChart :projection="projection" />
        <AssetInputForm @update="fetchProjection" />
      </div>
      <div class="dashboard-right">
        <SummaryCard :netWorth="finalWealth" :details="summaryDetails" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import NetWealthChart from '../components/NetWealthChart.vue';
import AssetInputForm from '../components/AssetInputForm.vue';
import SummaryCard from '../components/SummaryCard.vue';
import { getFinancialPlan } from '../services/api';

const projection = ref([]);
const finalWealth = computed(() => projection.value.length ? projection.value[projection.value.length - 1].wealth : 0);
const summaryDetails = computed(() => [
  { label: 'Change in Net Worth', value: finalWealth.value - (projection.value[0]?.wealth ?? 0), type: (finalWealth.value - (projection.value[0]?.wealth ?? 0)) >= 0 ? 'positive' : 'negative' }
]);

async function fetchProjection() {
  try {
    console.log('Fetching financial plan...');
    const result = await getFinancialPlan();
    console.log('Financial plan result:', result);
    projection.value = result || [];
  } catch (error: any) {
    console.error('Error fetching financial plan:', error);
    
    // Check if it's a 404 error (no financial profile)
    if (error.response?.status === 404) {
      console.log('No financial profile found. User needs to set up their profile first.');
      // You might want to show a message to the user or redirect to profile setup
    }
    
    projection.value = [];
  }
}

onMounted(fetchProjection);
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.dashboard-header {
  margin-bottom: 1rem;
}
.dashboard-main {
  display: flex;
  gap: 2rem;
}
.dashboard-left {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.dashboard-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Retirement Planner</h1>
    </div>
    <div class="dashboard-main">
      <div class="dashboard-center">
        <NetWealthChart :projection="projection" />
      </div>
      <div class="dashboard-right">
        <!-- <SummaryCard :netWorth="finalWealth" :details="summaryDetailsFiltered" /> -->
        <AssetInputForm @update="onProfileUpdate" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import NetWealthChart from '../components/NetWealthChart.vue';
import AssetInputForm from '../components/AssetInputForm.vue';
// import SummaryCard from '../components/SummaryCard.vue';
import { calculateFinancialPlan } from '../utils/financialPlan';
import type { FinancialProfile } from '../utils/financialPlan';

interface ProjectionData {
  age: number;
  wealth: number;
  propertyAssets: number;
  savings: number;
  superannuationBalance: number;
  inflationAdjustedWealth: number;
  inflationAdjustedPropertyAssets: number;
  inflationAdjustedSavings: number;
  pensionIncome: number;
  totalIncome: number;
  expenses: number;
}

const projection = ref<ProjectionData[]>([]);
// const finalWealth = computed(() => projection.value.length ? projection.value[projection.value.length - 1].wealth : 0);
// const finalPropertyAssets = computed(() => projection.value.length ? projection.value[projection.value.length - 1].propertyAssets : 0);
// const finalSavings = computed(() => projection.value.length ? projection.value[projection.value.length - 1].savings : 0);
// const finalInflationAdjustedWealth = computed(() => projection.value.length ? projection.value[projection.value.length - 1].inflationAdjustedWealth : 0);
// const finalInflationAdjustedPropertyAssets = computed(() => projection.value.length ? projection.value[projection.value.length - 1].inflationAdjustedPropertyAssets : 0);
// const finalInflationAdjustedSavings = computed(() => projection.value.length ? projection.value[projection.value.length - 1].inflationAdjustedSavings : 0);

// const summaryDetails = computed(() => {
//   const initialWealth = projection.value[0]?.wealth ?? 0;
//   const initialProperty = projection.value[0]?.propertyAssets ?? 0;
//   const initialSavings = projection.value[0]?.savings ?? 0;
  
//   return [
//     { 
//       label: 'Total Change in Net Worth (Nominal)', 
//       value: finalWealth.value - initialWealth, 
//       type: (finalWealth.value - initialWealth) >= 0 ? 'positive' : 'negative' 
//     },
//     { 
//       label: 'Final Net Worth (Today\'s Value)', 
//       value: finalInflationAdjustedWealth.value, 
//       type: 'neutral' 
//     },
//     { 
//       label: 'Final Property Assets (Nominal)', 
//       value: finalPropertyAssets.value, 
//       type: 'neutral' 
//     },
//     { 
//       label: 'Final Property Assets (Today\'s Value)', 
//       value: finalInflationAdjustedPropertyAssets.value, 
//       type: 'neutral' 
//     },
//     { 
//       label: 'Final Savings (Nominal)', 
//       value: finalSavings.value, 
//       type: 'neutral' 
//     },
//     { 
//       label: 'Final Savings (Today\'s Value)', 
//       value: finalInflationAdjustedSavings.value, 
//       type: 'neutral' 
//     },
//     { 
//       label: 'Property Asset Growth (Nominal)', 
//       value: finalPropertyAssets.value - initialProperty, 
//       type: (finalPropertyAssets.value - initialProperty) >= 0 ? 'positive' : 'negative' 
//     },
//     { 
//       label: 'Savings Growth (Nominal)', 
//       value: finalSavings.value - initialSavings, 
//       type: (finalSavings.value - initialSavings) >= 0 ? 'positive' : 'negative' 
//     }
//   ];
// });

// const summaryDetailsFiltered = computed(() =>
//   summaryDetails.value.filter(item => !item.label.includes("Today's Value"))
// );

function onProfileUpdate(profile: FinancialProfile) {
  if (profile) {
    const plan = calculateFinancialPlan(profile);
    projection.value = plan.projection;
  } else {
    projection.value = [];
  }
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  height: 100vh;
  padding: 1rem;
  overflow: auto;
}
.dashboard-header {
  margin-bottom: 0.5rem;
}
.dashboard-main {
  display: flex;
  gap: 1.5rem;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.dashboard-center {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.dashboard-right {
  flex: 0 0 320px;
  min-width: 320px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .dashboard-main {
    flex-direction: column;
  }
  
  .dashboard-right {
    flex: none;
    width: 100%;
  }
  
  .dashboard-center {
    order: -1;
  }
}
</style>

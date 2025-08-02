<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="page-title">
        Retirement Planner
        <span class="beta-badge">BETA</span>
      </h1>
    </div>
    <div class="dashboard-main">
      <div class="dashboard-center">
        <SummaryCards 
          v-if="projection.length > 0"
          :projection="projection" 
          :current-age="currentProfile?.currentAge || 30"
          :retirement-age="currentProfile?.retireAge || 65"
        />
        <NetWealthChart 
          :projection="projection" 
          :current-age="currentProfile?.currentAge"
          :retirement-age="currentProfile?.retireAge"
        />
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
import SummaryCards from '../components/SummaryCards.vue';
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
const currentProfile = ref<FinancialProfile | null>(null);
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
  currentProfile.value = profile;
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
  min-height: 100vh;
  padding: 1rem;
  overflow: auto;
}
.dashboard-header {
  margin-bottom: 0.5rem;
  text-align: left;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #14b8a6;
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.beta-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow: 0 3px 10px rgba(245, 158, 11, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: pulse-beta 2s infinite;
}

@keyframes pulse-beta {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 3px 10px rgba(245, 158, 11, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4);
  }
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
  overflow: auto;
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
    gap: 1rem;
  }
  
  .dashboard-right {
    flex: none;
    width: 100%;
    min-width: auto;
    max-width: none;
    order: -1;
  }
  
  .dashboard-center {
    order: 1;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 0.5rem;
    min-height: 100svh; /* Use small viewport height for mobile */
  }
  
  .page-title {
    font-size: 2rem;
    gap: 0.5rem;
  }
  
  .beta-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
  
  .dashboard-main {
    gap: 0.75rem;
    flex: 1;
    min-height: 0;
  }
  
  .dashboard-center {
    flex: 1;
    min-height: 0;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 0.25rem;
  }
  
  .page-title {
    font-size: 1.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .beta-badge {
    align-self: flex-start;
  }
}
</style>

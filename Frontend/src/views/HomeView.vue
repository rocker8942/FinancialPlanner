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
          :cpi-growth-rate="currentProfile?.cpiGrowthRate"
        />
      </div>
      <div class="dashboard-right">
        <!-- <SummaryCard :netWorth="finalWealth" :details="summaryDetailsFiltered" /> -->
        <AssetInputForm @update="onProfileUpdate" :urlParams="urlParams" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import NetWealthChart from '../components/NetWealthChart.vue';
import AssetInputForm from '../components/AssetInputForm.vue';
import SummaryCards from '../components/SummaryCards.vue';
// import SummaryCard from '../components/SummaryCard.vue';
import { calculateFinancialPlanModular } from '../utils/calculations/financialPlanOrchestrator';
import type { FinancialProfile } from '../utils/financialPlan';
import { parseSecureUrlFragment } from '../utils/encryption';

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
const route = useRoute();
const urlParams = ref<Partial<FinancialProfile>>({});
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
    const plan = calculateFinancialPlanModular(profile);
    projection.value = plan.projection;
  } else {
    projection.value = [];
  }
}

function parseUrlParameters() {
  let params: Partial<FinancialProfile> = {};
  
  // First, try to parse encrypted fragment (new secure format)
  const fragment = window.location.hash.substring(1); // Remove # from fragment
  if (fragment) {
    try {
      const encryptedData = parseSecureUrlFragment<Partial<FinancialProfile>>(fragment);
      if (encryptedData) {
        params = encryptedData;
        console.log('Successfully parsed encrypted URL data');
        urlParams.value = params;
        return;
      }
    } catch (error) {
      console.warn('Failed to parse encrypted URL fragment, trying legacy format:', error);
    }
  }
  
  // Fallback to legacy query parameter parsing
  const query = route.query;
  
  // Parse URL parameters and convert to appropriate types
  if (query.currentAge) params.currentAge = Number(query.currentAge);
  if (query.retirementAge) params.retireAge = Number(query.retirementAge);
  if (query.retireAge) params.retireAge = Number(query.retireAge); // Support both variants
  if (query.super) params.superannuationBalance = Number(query.super);
  if (query.income) params.salary = Number(query.income);
  if (query.expense) params.expenses = Number(query.expense);
  if (query.investmentProperty) params.propertyAssets = Number(query.investmentProperty);
  if (query.partnerAge) params.partnerAge = Number(query.partnerAge);
  if (query.partnerRetirementAge) params.partnerRetireAge = Number(query.partnerRetirementAge);
  if (query.partnerRetireAge) params.partnerRetireAge = Number(query.partnerRetireAge); // Support both variants
  if (query.savings) params.savings = Number(query.savings);
  if (query.mortgage) params.mortgageBalance = Number(query.mortgage);
  if (query.partnerSalary) params.partnerSalary = Number(query.partnerSalary);
  
  // Advanced options
  if (query.deathAge) params.deathAge = Number(query.deathAge);
  if (query.propertyGrowthRate) params.propertyGrowthRate = Number(query.propertyGrowthRate) / 100;
  if (query.savingsGrowthRate) params.savingsGrowthRate = Number(query.savingsGrowthRate) / 100;
  if (query.mortgageRate) params.mortgageRate = Number(query.mortgageRate) / 100;
  if (query.superannuationRate) params.superannuationRate = Number(query.superannuationRate) / 100;
  if (query.cpiGrowthRate) params.cpiGrowthRate = Number(query.cpiGrowthRate) / 100;
  if (query.propertyRentalYield) params.propertyRentalYield = Number(query.propertyRentalYield) / 100;
  
  // Automatically set relationship status to "couple" if any partner parameters are provided
  const hasPartnerParams = query.partnerAge || query.partnerRetirementAge || query.partnerRetireAge || query.partnerSalary;
  if (hasPartnerParams) {
    params.relationshipStatus = 'couple';
  }
  
  if (Object.keys(params).length > 0) {
    console.log('Parsed legacy URL parameters');
  }
  
  urlParams.value = params;
}

onMounted(() => {
  parseUrlParameters();
});

// Watch for route changes (both query params and hash fragments).
watch(() => route.query, () => {
  parseUrlParameters();
}, { immediate: true });

watch(() => route.hash, () => {
  parseUrlParameters();
}, { immediate: true });
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
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow: 0 3px 10px rgba(59, 130, 246, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: pulse-beta 2s infinite;
}

@keyframes pulse-beta {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 3px 10px rgba(59, 130, 246, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
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

/* iPhone and narrow mobile screens */
@media (max-width: 414px) {
  .dashboard {
    padding: 0.5rem;
    /* Center the entire dashboard content */
    align-items: center;
    /* Ensure container never exceeds viewport */
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  
  .dashboard-header {
    /* Center the header content */
    text-align: center;
    width: 100%;
  }
  
  .page-title {
    font-size: 1.5rem;
    gap: 0.375rem;
    /* Center the title and badge */
    justify-content: center;
    text-align: center;
  }
  
  .beta-badge {
    padding: 0.2rem 0.4rem;
    font-size: 0.65rem;
  }
  
  .dashboard-main {
    gap: 0.5rem;
    /* Center the main content sections */
    align-items: center;
    width: 100%;
  }
  
  .dashboard-center {
    /* Center charts and summary cards */
    align-items: center;
    width: 100%;
  }
  
  .dashboard-right {
    /* Remove fixed width constraints for iPhone */
    min-width: unset;
    max-width: unset;
    width: 100%;
    /* Center the form */
    align-items: center;
    margin: 0;
    padding: 0;
  }
  
  /* Ensure the form doesn't exceed viewport but stays centered */
  .dashboard-right > * {
    max-width: 100%;
    overflow-x: hidden;
  }
}
</style>

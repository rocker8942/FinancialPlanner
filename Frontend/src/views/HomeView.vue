<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="page-title">
        {{ t('home.title') }}
      </h1>
    </div>
    <div class="dashboard-main">
      <div class="dashboard-center">
        <SummaryCards
          v-if="projection.length > 0"
          :projection="projection"
          :current-age="currentProfile?.currentAge || 30"
          :retirement-age="currentProfile?.retireAge || 65"
          :show-inflation-adjusted="showInflationAdjusted"
          :optimal-expense="optimalExpense"
          :cpi-growth-rate="currentProfile?.cpiGrowthRate ?? 0.025"
        />
        <NetWealthChart
          :projection="projection"
          :current-age="currentProfile?.currentAge"
          :retirement-age="currentProfile?.retireAge"
          :cpi-growth-rate="currentProfile?.cpiGrowthRate"
          :life-events="currentProfile?.lifeEvents || []"
          :house-purchase-plan="currentProfile?.housePurchasePlan"
          v-model:showInflationAdjusted="showInflationAdjusted"
        />
      </div>
      <div class="dashboard-right">
        <AssetInputFormRefactored @update="onProfileUpdate" :urlParams="urlParams" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import NetWealthChart from '../components/NetWealthChart.vue';
import AssetInputFormRefactored from '../components/AssetInputFormRefactored.vue';
import SummaryCards from '../components/SummaryCards.vue';
import { calculateFinancialPlanModular, auCountryConfig, krCountryConfig } from '../utils/calculations/financialPlanOrchestrator';
import { optimizeExpenseToZeroNetWorth } from '../utils/calculations/expenseOptimizer';
import { useLocaleStore } from '../store/locale';
import type { FinancialProfile } from '../utils/financialPlan';
import type { YearlyWealth } from '../utils/models/FinancialTypes';
import { parseSecureUrlFragment } from '../utils/encryption';

const projection = ref<YearlyWealth[]>([]);
const currentProfile = ref<FinancialProfile | null>(null);
const optimalExpense = ref(0);
const showInflationAdjusted = ref(true);
const route = useRoute();
const urlParams = ref<Partial<FinancialProfile>>({});
const localeStore = useLocaleStore();
const countryConfig = computed(() => localeStore.locale === 'kr' ? krCountryConfig : auCountryConfig);

function onProfileUpdate(profile: FinancialProfile) {
  currentProfile.value = profile;
  if (profile) {
      const plan = calculateFinancialPlanModular(profile, countryConfig.value);
      projection.value = plan.projection;
      optimalExpense.value = optimizeExpenseToZeroNetWorth(profile, undefined, undefined, countryConfig.value).optimalExpense;
  } else {
    projection.value = [];
    optimalExpense.value = 0;
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
  margin-bottom: 0.75rem;
  text-align: left;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent-text);
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
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
  gap: 1rem;
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
    padding: 0;
  }
  
  .page-title {
    font-size: 1.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
}

/* iPhone and narrow mobile screens */
@media (max-width: 414px) {
  .dashboard {
    padding: 0;
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

  .dashboard-main {
    gap: 0.5rem;
    /* Center the main content sections */
    align-items: center;
    width: 100%;
  }

  .dashboard-center {
    /* Full width for mobile - remove centering */
    align-items: stretch;
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

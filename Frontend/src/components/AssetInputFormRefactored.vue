<template>
  <form class="asset-form">
    <!-- Privacy Notice -->
    <div class="privacy-notice">
      <svg class="privacy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V7a2 2 0 114 0v4"></path>
      </svg>
      <span>{{ $t('form.privacy_notice') }}</span>
    </div>

    <!-- Personal Profile Section -->
    <FormSection 
      :title="$t('form.sections.personal')" 
      :is-open="sectionOpen.profile"
      section-key="profile"
      @toggle="toggleSection"
    >
      <PersonalProfileForm
        v-model="personalProfile"
        @field-change="handleFieldChange"
      />
    </FormSection>

    <!-- Assets Section -->
    <FormSection 
      :title="$t('form.sections.assets')" 
      :is-open="sectionOpen.assets"
      section-key="assets"
      @toggle="toggleSection"
    >
      <AssetsForm
        v-model="assets"
        :relationship-status="personalProfile.relationshipStatus"
        @field-change="handleFieldChange"
      />
    </FormSection>

    <!-- Income and Expenses Section -->
    <FormSection 
      :title="$t('form.sections.income')" 
      :is-open="sectionOpen.income"
      section-key="income"
      @toggle="toggleSection"
    >
      <IncomeExpensesForm
        v-model="incomeExpenses"
        @field-change="handleFieldChange"
      />
    </FormSection>

    <!-- House Purchase Plan Section -->
    <FormSection
      :title="$t('form.sections.house')"
      :is-open="sectionOpen.housePurchase"
      section-key="housePurchase"
      @toggle="toggleSection"
    >
      <HousePurchaseForm
        v-model="housePurchasePlan"
        :current-age="personalProfile.currentAge"
        :death-age="advancedOptions.deathAge"
        @field-change="handleFieldChange"
      />
    </FormSection>

    <!-- Life Events Section -->
    <FormSection
      :title="$t('form.sections.life_events')"
      :is-open="sectionOpen.lifeEvents"
      section-key="lifeEvents"
      @toggle="toggleSection"
    >
      <LifeEventsForm
        v-model="lifeEvents"
        :current-age="personalProfile.currentAge"
        :death-age="advancedOptions.deathAge"
        @update:modelValue="autoSaveToStorage"
      />
    </FormSection>

    <!-- Advanced Options Section -->
    <FormSection
      :title="$t('form.sections.advanced')"
      :is-open="sectionOpen.advanced"
      section-key="advanced"
      @toggle="toggleSection"
    >
      <AdvancedOptionsForm
        v-model="advancedOptions"
        @field-change="handleFieldChange"
        @reset-defaults="handleResetDefaults"
      />
    </FormSection>

    <!-- Auto-Optimization Info -->
    <div v-if="incomeExpenses.zeroNetWorthAtDeath" class="auto-optimize-info">
      <small class="help-text">
        {{ $t('form.auto_optimize.help') }}
      </small>
      <span class="expense-info">
        {{ $t('form.auto_optimize.label') }} {{ fmt(calculatedOptimalExpense) }}
      </span>
    </div>

    <!-- Share Button -->
    <div class="form-actions">
      <button 
        type="button" 
        :class="['share-btn', { success: shareSuccess }]" 
        @click="handleShare"
        :disabled="shareButtonDisabled"
        :title="shareButtonDisabled ? 'Enter some financial data to share' : 'Copy secure, encrypted shareable link to clipboard'"
      >
        <span class="material-icons share-icon">{{ shareSuccess ? 'check' : 'share' }}</span>
        <span>{{ shareSuccess ? $t('form.share.success') : $t('form.share.button') }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import FormSection from './forms/FormSection.vue';
import PersonalProfileForm from './forms/PersonalProfileForm.vue';
import AssetsForm from './forms/AssetsForm.vue';
import IncomeExpensesForm from './forms/IncomeExpensesForm.vue';
import AdvancedOptionsForm from './forms/AdvancedOptionsForm.vue';
import LifeEventsForm from './forms/LifeEventsForm.vue';
import HousePurchaseForm from './forms/HousePurchaseForm.vue';
import { formStorageService, type StoredFinancialData } from '../services/formStorageService';
import { calculateDisposableIncome, calculateExpenseToZeroNetWorth } from '../utils/financialPlan';
import { auCountryConfig, krCountryConfig } from '../utils/calculations/financialPlanOrchestrator';
import { formatCurrency } from '../utils/formatters';
import { useLocaleStore } from '../store/locale';
import type { FinancialProfile } from '../utils/financialPlan';
import type { LifeEvent, HousePurchasePlan } from '../utils/models/FinancialTypes';

// Props interface for URL parameters
interface Props {
  urlParams?: Partial<StoredFinancialData>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update': [profile: FinancialProfile];
}>();
const localeStore = useLocaleStore();
const countryConfig = computed(() => localeStore.locale === 'kr' ? krCountryConfig : auCountryConfig);
const fmt = (value: number) => formatCurrency(value, localeStore.locale);

// Section visibility state
const sectionOpen = ref({
  profile: true,
  assets: false,
  income: false,
  housePurchase: false,
  lifeEvents: false,
  advanced: false
});

// Form data sections
const personalProfile = ref({
  currentAge: 30,
  retireAge: 65,
  partnerAge: 30,
  partnerRetireAge: 65,
  relationshipStatus: 'single' as 'single' | 'couple',
  isHomeowner: false
});

const assets = ref({
  propertyAssets: 0,
  savings: 0,
  mortgageBalance: 0,
  superannuationBalance: 0,
  partnerSuperBalance: 0,
  krPensionBalance: 0
});

const incomeExpenses = ref({
  salary: 0,
  partnerSalary: 0,
  expenses: 0,
  zeroNetWorthAtDeath: false,
  relationshipStatus: 'single' as 'single' | 'couple',
  currentDisposableIncome: 0,
  expensesAutoCapped: false
});

const advancedOptions = ref({
  deathAge: 90,
  propertyGrowthRate: 0.03, // 3%
  propertyRentalYield: 0.033, // 3.3%
  savingsGrowthRate: 0.025, // 2.5%
  mortgageRate: 0.06, // 6%
  superannuationRate: 0.07, // 7%
  cpiGrowthRate: 0.03, // 3%
  retireAge: 65 // Needed for death age validation
});

const lifeEvents = ref<LifeEvent[]>([]);

const housePurchasePlan = ref<HousePurchasePlan>({
  enabled: false,
  purchaseAge: 35,
  purchasePrice: 0,
  downPaymentPercent: 20
});

// Share functionality state
const shareSuccess = ref(false);

// Computed properties
const shareButtonDisabled = computed(() => {
  // Button is disabled if no meaningful data is entered
  return personalProfile.value.currentAge <= 18 && 
         incomeExpenses.value.salary <= 0 && 
         assets.value.savings <= 0 && 
         assets.value.propertyAssets <= 0 && 
         assets.value.superannuationBalance <= 0;
});

const currentFinancialProfile = computed((): FinancialProfile => {
  const isKr = localeStore.locale === 'kr';
  return {
    propertyAssets: assets.value.propertyAssets,
    savings: assets.value.savings,
    mortgageBalance: assets.value.mortgageBalance,
    mortgageRate: advancedOptions.value.mortgageRate,
    superannuationBalance: assets.value.superannuationBalance + (isKr ? (assets.value.krPensionBalance ?? 0) : 0),
    partnerSuperBalance: assets.value.partnerSuperBalance,
    superannuationRate: isKr ? advancedOptions.value.savingsGrowthRate : advancedOptions.value.superannuationRate,
    salary: incomeExpenses.value.salary,
    partnerSalary: incomeExpenses.value.partnerSalary,
    expenses: incomeExpenses.value.expenses,
    currentAge: personalProfile.value.currentAge,
    retireAge: personalProfile.value.retireAge,
    deathAge: advancedOptions.value.deathAge,
    savingsGrowthRate: advancedOptions.value.savingsGrowthRate,
    propertyGrowthRate: advancedOptions.value.propertyGrowthRate,
    propertyRentalYield: advancedOptions.value.propertyRentalYield,
    cpiGrowthRate: advancedOptions.value.cpiGrowthRate,
    partnerAge: personalProfile.value.partnerAge,
    partnerRetireAge: personalProfile.value.partnerRetireAge,
    relationshipStatus: personalProfile.value.relationshipStatus,
    isHomeowner: personalProfile.value.isHomeowner,
    lifeEvents: lifeEvents.value,
    housePurchasePlan: housePurchasePlan.value
  };
});

const currentDisposableIncome = computed(() => {
  return calculateDisposableIncome(currentFinancialProfile.value);
});

const calculatedOptimalExpense = computed(() => {
  if (!incomeExpenses.value.zeroNetWorthAtDeath) return 0;
  const result = calculateExpenseToZeroNetWorth(currentFinancialProfile.value, undefined, undefined, countryConfig.value);
  return result.optimalExpense;
});

// Section management
const toggleSection = (sectionKey: string) => {
  // Close all sections first
  Object.keys(sectionOpen.value).forEach(key => {
    sectionOpen.value[key as keyof typeof sectionOpen.value] = false;
  });
  
  // Open the clicked section
  if (sectionKey in sectionOpen.value) {
    sectionOpen.value[sectionKey as keyof typeof sectionOpen.value] = true;
  }
};

// Field change handler
const handleFieldChange = (fieldName: string, value: any) => {
  // Update relationship status across forms
  if (fieldName === 'relationshipStatus') {
    incomeExpenses.value.relationshipStatus = value;
  }
  
  // Auto-save to local storage
  autoSaveToStorage();
};

// Auto-save functionality
const autoSaveToStorage = () => {
  const allData = collectAllFormData();
  formStorageService.autoSave(allData);
};

// Collect all form data into storage format
const collectAllFormData = (): StoredFinancialData => {
  return {
    propertyAssets: assets.value.propertyAssets,
    savings: assets.value.savings,
    mortgageBalance: assets.value.mortgageBalance,
    mortgageRate: advancedOptions.value.mortgageRate,
    superannuationBalance: assets.value.superannuationBalance,
    partnerSuperBalance: assets.value.partnerSuperBalance,
    superannuationRate: advancedOptions.value.superannuationRate,
    salary: incomeExpenses.value.salary,
    partnerSalary: incomeExpenses.value.partnerSalary,
    expenses: incomeExpenses.value.expenses,
    currentAge: personalProfile.value.currentAge,
    retireAge: personalProfile.value.retireAge,
    deathAge: advancedOptions.value.deathAge,
    savingsGrowthRate: advancedOptions.value.savingsGrowthRate,
    propertyGrowthRate: advancedOptions.value.propertyGrowthRate,
    propertyRentalYield: advancedOptions.value.propertyRentalYield,
    cpiGrowthRate: advancedOptions.value.cpiGrowthRate,
    pensionAmount: 0,
    pensionStartAge: 67,
    partnerPensionAmount: 0,
    partnerPensionStartAge: 67,
    partnerAge: personalProfile.value.partnerAge,
    partnerRetireAge: personalProfile.value.partnerRetireAge,
    relationshipStatus: personalProfile.value.relationshipStatus,
    isHomeowner: personalProfile.value.isHomeowner,
    zeroNetWorthAtDeath: incomeExpenses.value.zeroNetWorthAtDeath,
    lifeEvents: lifeEvents.value,
    housePurchasePlan: housePurchasePlan.value,
    krPensionBalance: assets.value.krPensionBalance
  };
};

// Load data from storage or URL params
const loadData = () => {
  // Priority: URL params > Local storage > Defaults
  if (props.urlParams && Object.keys(props.urlParams).length > 0) {
    loadFromUrlParams(props.urlParams);
  } else {
    loadFromStorage();
  }
};

const loadFromStorage = () => {
  const savedData = formStorageService.loadFromStorage();
  if (savedData) {
    populateFormsFromData(savedData);
  }
};

const loadFromUrlParams = (params: Partial<StoredFinancialData>) => {
  const defaultData = formStorageService.getDefaultValues();
  const mergedData = { ...defaultData, ...params };
  populateFormsFromData(mergedData);
  // Save to local storage after loading from URL
  autoSaveToStorage();
};

const populateFormsFromData = (data: StoredFinancialData) => {
  personalProfile.value = {
    currentAge: data.currentAge,
    retireAge: data.retireAge,
    partnerAge: data.partnerAge,
    partnerRetireAge: data.partnerRetireAge,
    relationshipStatus: data.relationshipStatus,
    isHomeowner: data.isHomeowner
  };

  assets.value = {
    propertyAssets: data.propertyAssets,
    savings: data.savings,
    mortgageBalance: data.mortgageBalance,
    superannuationBalance: data.superannuationBalance,
    partnerSuperBalance: data.partnerSuperBalance ?? 0,
    krPensionBalance: data.krPensionBalance ?? 0
  };

  incomeExpenses.value = {
    salary: data.salary,
    partnerSalary: data.partnerSalary,
    expenses: data.expenses,
    zeroNetWorthAtDeath: data.zeroNetWorthAtDeath ?? false,
    relationshipStatus: data.relationshipStatus,
    currentDisposableIncome: 0, // Will be calculated
    expensesAutoCapped: false // Reset this
  };

  advancedOptions.value = {
    deathAge: data.deathAge,
    propertyGrowthRate: data.propertyGrowthRate,
    propertyRentalYield: data.propertyRentalYield,
    savingsGrowthRate: data.savingsGrowthRate,
    mortgageRate: data.mortgageRate,
    superannuationRate: data.superannuationRate,
    cpiGrowthRate: data.cpiGrowthRate,
    retireAge: data.retireAge
  };

  lifeEvents.value = data.lifeEvents ?? [];

  if (data.housePurchasePlan) {
    housePurchasePlan.value = data.housePurchasePlan;
  }
};

// Share functionality
const handleShare = async () => {
  try {
    const allData = collectAllFormData();
    const success = await formStorageService.copyShareableUrl(allData);
    
    if (success) {
      shareSuccess.value = true;
      setTimeout(() => {
        shareSuccess.value = false;
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to share:', error);
  }
};

// Reset defaults handler
const handleResetDefaults = () => {
  const defaults = formStorageService.getDefaultValues();
  advancedOptions.value = {
    deathAge: defaults.deathAge,
    propertyGrowthRate: defaults.propertyGrowthRate,
    propertyRentalYield: defaults.propertyRentalYield,
    savingsGrowthRate: defaults.savingsGrowthRate,
    mortgageRate: defaults.mortgageRate,
    superannuationRate: defaults.superannuationRate,
    cpiGrowthRate: defaults.cpiGrowthRate,
    retireAge: personalProfile.value.retireAge
  };
  autoSaveToStorage();
};

// Watch for changes and emit updates
watch(currentFinancialProfile, (newProfile) => {
  emit('update', newProfile);
}, { deep: true });

// Update disposable income when relevant fields change
watch([
  () => incomeExpenses.value.salary,
  () => incomeExpenses.value.partnerSalary,
  () => assets.value.propertyAssets,
  () => advancedOptions.value.propertyRentalYield,
  () => personalProfile.value.relationshipStatus,
  () => personalProfile.value.isHomeowner
], () => {
  incomeExpenses.value.currentDisposableIncome = currentDisposableIncome.value;
}, { deep: true });

// Auto-update expenses when zero net worth is enabled or any input changes while enabled
watch(() => incomeExpenses.value.zeroNetWorthAtDeath, (newValue) => {
  if (newValue) {
    incomeExpenses.value.expenses = calculatedOptimalExpense.value;
  }
});

watch(calculatedOptimalExpense, (newExpense) => {
  if (incomeExpenses.value.zeroNetWorthAtDeath) {
    incomeExpenses.value.expenses = newExpense;
  }
});

// Initialize on mount
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.asset-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  color: var(--text-label);
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.privacy-notice {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.privacy-icon {
  width: 1rem;
  height: 1rem;
  color: #14b8a6;
  flex-shrink: 0;
}

.auto-optimize-info {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
}

.expense-info {
  display: block;
  font-weight: 600;
  color: var(--accent-text);
  font-size: 1rem;
  margin-top: 0.75rem;
}

.help-text {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #14b8a6;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.share-btn:hover {
  background: #0d9488;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(20, 184, 166, 0.3);
}

.share-btn:active {
  transform: translateY(0);
}

.share-btn:disabled {
  background: #6b7280;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.share-btn.success {
  background: #10b981;
}

.share-icon {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 640px) {
  .asset-form {
    padding: 0.75rem;
    margin: 0.5rem;
    max-width: none;
  }
  
  .privacy-notice {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  .share-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.8rem;
  }
}
</style>
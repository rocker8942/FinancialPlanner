<template>
  <div class="summary-cards-container">
    <div class="summary-card">
      <div class="summary-card-content">
        <div class="summary-icon wealth">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
        </div>
        <div class="summary-text">
          <h3 class="summary-title">{{ $t('summary.current_wealth') }}</h3>
          <p class="summary-value">{{ fmt(currentNetWealth) }}</p>
          <p class="summary-subtitle">{{ showInflationAdjusted ? $t('summary.real_value') : $t('summary.nominal_value') }}</p>
        </div>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-card-content">
        <div class="summary-icon retirement">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div class="summary-text">
          <h3 class="summary-title">{{ $t('summary.retirement_wealth') }}</h3>
          <p class="summary-value">{{ fmt(retirementWealth) }}</p>
          <p class="summary-subtitle">{{ $t('summary.retirement_at_age', { age: retirementAge }) }}</p>
        </div>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-card-content">
        <div class="summary-icon growth">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <div class="summary-text">
          <h3 class="summary-title">{{ $t('summary.optimal_expense') }}</h3>
          <p class="summary-value">{{ fmt(optimalExpense) }}</p>
          <p class="summary-subtitle">{{ $t('summary.optimal_subtitle') }}</p>
        </div>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-card-content">
        <div class="summary-icon pension">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <div class="summary-text">
          <h3 class="summary-title">{{ $t('summary.pension') }}</h3>
          <p class="summary-value">{{ fmt(annualPension) }}</p>
          <p class="summary-subtitle">{{ $t('summary.pension_from_age', { age: firstPensionAge }) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '../utils/formatters';
import { useLocaleStore } from '../store/locale';

interface ProjectionData {
  age: number;
  wealth: number;
  propertyAssets: number;
  savings: number;
  superannuationBalance: number;
  pensionIncome: number;
  totalIncome: number;
  expenses: number;
  inflationAdjustedWealth?: number;
  inflationAdjustedSavings?: number;
}

interface SummaryProps {
  projection: ProjectionData[];
  currentAge: number;
  retirementAge: number;
  showInflationAdjusted: boolean;
  optimalExpense: number;
  cpiGrowthRate: number;
}

const props = defineProps<SummaryProps>();
const localeStore = useLocaleStore();
const fmt = (value: number) => formatCurrency(value, localeStore.locale);

const currentNetWealth = computed(() => {
  if (!props.projection.length) return 0;
  const first = props.projection[0];
  return props.showInflationAdjusted && first.inflationAdjustedWealth !== undefined
    ? first.inflationAdjustedWealth
    : first.wealth;
});

const retirementWealth = computed(() => {
  if (!props.projection.length) return 0;
  const retirementData = props.projection.find(p => p.age === props.retirementAge);
  if (!retirementData) return 0;
  return props.showInflationAdjusted && retirementData.inflationAdjustedWealth !== undefined
    ? retirementData.inflationAdjustedWealth
    : retirementData.wealth;
});

const annualPension = computed(() => {
  if (!props.projection.length) return 0;
  const pensionData = props.projection.find(p => p.pensionIncome > 0);
  if (!pensionData) return 0;
  if (!props.showInflationAdjusted) return pensionData.pensionIncome;
  const yearsFromStart = pensionData.age - props.currentAge;
  return pensionData.pensionIncome * Math.pow(1 + props.cpiGrowthRate, -yearsFromStart);
});

const firstPensionAge = computed(() => {
  if (!props.projection.length) return 67;
  const pensionData = props.projection.find(p => p.pensionIncome > 0);
  return pensionData?.age || 67;
});
</script>

<style scoped>
.summary-cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.summary-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
}

.summary-card:hover {
  border-color: var(--accent-text);
  box-shadow: 0 4px 16px rgba(0,0,0,0.16);
}

.summary-card-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.summary-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.summary-icon.wealth {
  background: rgba(13, 148, 136, 0.1);
  color: var(--accent-text);
}

.summary-icon.retirement {
  background: rgba(100, 116, 139, 0.1);
  color: var(--text-secondary);
}

.summary-icon.growth {
  background: rgba(13, 148, 136, 0.08);
  color: var(--accent-text);
}

.summary-icon.pension {
  background: rgba(100, 116, 139, 0.1);
  color: var(--text-secondary);
}

.summary-text {
  flex: 1;
  min-width: 0;
}

.summary-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.summary-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.3;
}

/* Tablet and small laptop - 3 columns */
@media (max-width: 1024px) and (min-width: 769px) {
  .summary-cards-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.875rem;
  }
}

/* Large mobile - 2 columns */
@media (max-width: 768px) and (min-width: 481px) {
  .summary-cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
}

/* Small mobile - 1 column */
@media (max-width: 480px) {
  .summary-cards-container {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
    width: 100%;
    max-width: none;
  }

  .summary-card {
    padding: 1rem;
  }

  .summary-card-content {
    gap: 0.75rem;
  }

  .summary-icon {
    width: 2.25rem;
    height: 2.25rem;
  }

  .summary-icon svg {
    width: 1.125rem;
    height: 1.125rem;
  }

  .summary-title {
    font-size: 0.75rem;
    margin: 0 0 0.375rem 0;
  }

  .summary-value {
    font-size: 1.25rem;
    margin: 0 0 0.25rem 0;
  }

  .summary-subtitle {
    font-size: 0.6875rem;
    line-height: 1.2;
  }
}
</style>
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
          <h3 class="summary-title">Current Net Wealth</h3>
          <p class="summary-value">{{ formatCurrency(currentNetWealth) }}</p>
          <p class="summary-subtitle">Today's value</p>
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
          <h3 class="summary-title">Wealth at Retirement</h3>
          <p class="summary-value">{{ formatCurrency(retirementWealth) }}</p>
          <p class="summary-subtitle">At age {{ retirementAge }}</p>
        </div>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-card-content">
        <div class="summary-icon growth" :class="{ negative: totalGrowth < 0 }">
          <svg v-if="totalGrowth >= 0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
          <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
          </svg>
        </div>
        <div class="summary-text">
          <h3 class="summary-title">Total Growth</h3>
          <p class="summary-value" :class="{ negative: totalGrowth < 0 }">
            {{ totalGrowth >= 0 ? '+' : '' }}{{ formatCurrency(totalGrowth) }}
          </p>
          <p class="summary-subtitle">Over {{ yearsToRetirement }} years</p>
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
          <h3 class="summary-title">Age Pension</h3>
          <p class="summary-value">{{ formatCurrency(annualPension) }}</p>
          <p class="summary-subtitle">Annual from age 67</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '../utils/formatters';

interface ProjectionData {
  age: number;
  wealth: number;
  propertyAssets: number;
  savings: number;
  superannuationBalance: number;
  pensionIncome: number;
  totalIncome: number;
  expenses: number;
}

interface SummaryProps {
  projection: ProjectionData[];
  currentAge: number;
  retirementAge: number;
}

const props = defineProps<SummaryProps>();

const currentNetWealth = computed(() => {
  if (!props.projection.length) return 0;
  return props.projection[0].wealth;
});

const retirementWealth = computed(() => {
  if (!props.projection.length) return 0;
  const retirementData = props.projection.find(p => p.age === props.retirementAge);
  return retirementData?.wealth || 0;
});

const totalGrowth = computed(() => {
  if (!props.projection.length) return 0;
  return retirementWealth.value - currentNetWealth.value;
});

const yearsToRetirement = computed(() => {
  return Math.max(0, props.retirementAge - props.currentAge);
});

const annualPension = computed(() => {
  if (!props.projection.length) return 0;
  const pensionData = props.projection.find(p => p.age >= 67 && p.pensionIncome > 0);
  return pensionData?.pensionIncome || 0;
});
</script>

<style scoped>
.summary-cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.summary-card {
  background: #232733;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.summary-card:hover {
  border-color: #6ee7b7;
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
  background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%);
  color: #1f2937;
}

.summary-icon.retirement {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: #1f2937;
}

.summary-icon.growth {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: #1f2937;
}

.summary-icon.growth.negative {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.summary-icon.pension {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1f2937;
}

.summary-text {
  flex: 1;
  min-width: 0;
}

.summary-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #9ca3af;
  margin: 0 0 0.4rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1.375rem;
  font-weight: 700;
  color: #e0e3e8;
  margin: 0 0 0.2rem 0;
  line-height: 1.2;
}

.summary-value.negative {
  color: #ef4444;
}

.summary-subtitle {
  font-size: 0.7rem;
  color: #6b7280;
  margin: 0;
}

/* Tablet and small laptop - 3 columns */
@media (max-width: 1024px) and (min-width: 769px) {
  .summary-cards-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
  }
}

/* Large mobile - 2 columns */
@media (max-width: 768px) and (min-width: 481px) {
  .summary-cards-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
}

/* Small mobile - 1 column */
@media (max-width: 480px) {
  .summary-cards-container {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .summary-card {
    padding: 0.75rem;
  }
  
  .summary-card-content {
    gap: 0.6rem;
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
    margin: 0 0 0.3rem 0;
  }
  
  .summary-value {
    font-size: 1.25rem;
    margin: 0 0 0.15rem 0;
  }
  
  .summary-subtitle {
    font-size: 0.65rem;
  }
}
</style>
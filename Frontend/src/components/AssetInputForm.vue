<template>
  <form class="asset-form">
    <!-- Person Profile Group -->
    <fieldset class="form-section">
      <legend class="form-section-title clickable" @click="toggleSection('profile')">
        <span class="chevron" :class="{ open: sectionOpen.profile }">&#9660;</span>
        Person Profile
      </legend>
      <div v-show="sectionOpen.profile">
        <div class="form-group">
          <label for="currentAge">Current Age</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('currentAge', -1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('currentAge', -1)">-</button>
            <input 
              id="currentAge"
              v-model="currentAgeFormatted"
              @focus="onFocus('currentAge')"
              @blur="onBlur('currentAge')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Current Age" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('currentAge', 1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('currentAge', 1)">+</button>
          </div>
        </div>
        <div class="form-group">
          <label for="partnerAge">Partner's Age</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerAge', -1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerAge', -1)">-</button>
            <input 
              id="partnerAge"
              v-model="partnerAgeFormatted"
              @focus="onFocus('partnerAge')"
              @blur="onBlur('partnerAge')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Partner's Age" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerAge', 1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerAge', 1)">+</button>
          </div>
        </div>
        <div class="form-group">
          <label for="retireAge">Desired Retirement Age</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('retireAge', -1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('retireAge', -1)">-</button>
            <input 
              id="retireAge"
              v-model="retireAgeFormatted"
              @focus="onFocus('retireAge')"
              @blur="onBlur('retireAge')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Retirement Age" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('retireAge', 1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('retireAge', 1)">+</button>
          </div>
          <small class="help-text">Age when salary income stops</small>
        </div>
        <div class="form-group">
          <label for="partnerRetireAge">Partner's Desired Retirement Age</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerRetireAge', -1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerRetireAge', -1)">-</button>
            <input 
              id="partnerRetireAge"
              v-model="partnerRetireAgeFormatted"
              @focus="onFocus('partnerRetireAge')"
              @blur="onBlur('partnerRetireAge')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Partner's Retirement Age" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerRetireAge', 1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerRetireAge', 1)">+</button>
          </div>
        </div>
      </div>
    </fieldset>

    <!-- Assets Group -->
    <fieldset class="form-section">
      <legend class="form-section-title clickable" @click="toggleSection('assets')">
        <span class="chevron" :class="{ open: sectionOpen.assets }">&#9660;</span>
        Assets
      </legend>
      <div v-show="sectionOpen.assets">
        <div class="form-group">
          <label for="propertyAssets">Property Assets</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('propertyAssets', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('propertyAssets', -1000)">-</button>
            <input 
              id="propertyAssets"
              v-model="propertyAssetsFormatted"
              @focus="onFocus('propertyAssets')"
              @blur="onBlur('propertyAssets')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Property Assets ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('propertyAssets', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('propertyAssets', 1000)">+</button>
          </div>
          <small class="help-text">Real estate, land, and other property investments</small>
        </div>
        <div class="form-group">
          <label for="savings">Savings</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('savings', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('savings', -1000)">-</button>
            <input 
              id="savings"
              v-model="savingsFormatted"
              @focus="onFocus('savings')"
              @blur="onBlur('savings')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Savings ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('savings', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('savings', 1000)">+</button>
          </div>
          <small class="help-text">Stocks, bonds, savings, and liquid investments</small>
        </div>


        <div class="form-group">
          <label for="mortgageBalance">Mortgage Balance</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('mortgageBalance', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('mortgageBalance', -1000)">-</button>
            <input 
              id="mortgageBalance"
              v-model="mortgageBalanceFormatted"
              @focus="onFocus('mortgageBalance')"
              @blur="onBlur('mortgageBalance')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Mortgage Balance ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('mortgageBalance', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('mortgageBalance', 1000)">+</button>
          </div>
          <small class="help-text">Outstanding mortgage debt on property</small>
        </div>
        <div class="form-group">
          <label for="superannuationBalance">Superannuation Balance</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('superannuationBalance', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('superannuationBalance', -1000)">-</button>
            <input 
              id="superannuationBalance"
              v-model="superannuationBalanceFormatted"
              @focus="onFocus('superannuationBalance')"
              @blur="onBlur('superannuationBalance')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Superannuation Balance ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('superannuationBalance', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('superannuationBalance', 1000)">+</button>
          </div>
          <small class="help-text">Current superannuation fund balance</small>
        </div>
      </div>
    </fieldset>

    <!-- Income and Expenses Group -->
    <fieldset class="form-section">
      <legend class="form-section-title clickable" @click="toggleSection('income')">
        <span class="chevron" :class="{ open: sectionOpen.income }">&#9660;</span>
        Income and Expenses
      </legend>
      <div v-show="sectionOpen.income">
        <div class="form-group">
          <label for="salary">Annual Salary</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('salary', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('salary', -1000)">-</button>
            <input 
              id="salary"
              v-model="salaryFormatted"
              @focus="onFocus('salary')"
              @blur="onBlur('salary')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Annual Salary ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('salary', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('salary', 1000)">+</button>
          </div>
        </div>
        <div class="form-group">
          <label for="partnerSalary">Partner's Annual Salary</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerSalary', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerSalary', -1000)">-</button>
            <input 
              id="partnerSalary"
              v-model="partnerSalaryFormatted"
              @focus="onFocus('partnerSalary')"
              @blur="onBlur('partnerSalary')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Partner's Annual Salary ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerSalary', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerSalary', 1000)">+</button>
          </div>
        </div>
        <div class="form-group">
          <label for="expenses">Annual Expenses</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('expenses', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('expenses', -1000)" :disabled="zeroNetWorthAtDeath">-</button>
            <input 
              id="expenses"
              v-model="expensesFormatted"
              @focus="onFocus('expenses')"
              @blur="onBlur('expenses')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Annual Expenses ($)" 
              required 
              :disabled="zeroNetWorthAtDeath"
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('expenses', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('expenses', 1000)" :disabled="zeroNetWorthAtDeath">+</button>
          </div>
          <small class="help-text">{{ zeroNetWorthAtDeath ? 'Auto-calculated based on your other inputs' : 'Will be paid from financial assets only' }}</small>
        </div>
        <div class="form-group">
          <label for="pensionAmount">Pension for You (Annual Amount)</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('pensionAmount', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('pensionAmount', -1000)">-</button>
            <input 
              id="pensionAmount"
              v-model="pensionAmountFormatted"
              @focus="onFocus('pensionAmount')"
              @blur="onBlur('pensionAmount')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Pension Amount ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('pensionAmount', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('pensionAmount', 1000)">+</button>
          </div>
          <small class="help-text">Annual pension income for you</small>
        </div>
        <div class="form-group">
          <label for="partnerPensionAmount">Pension for Your Partner (Annual Amount)</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerPensionAmount', -1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerPensionAmount', -1000)">-</button>
            <input 
              id="partnerPensionAmount"
              v-model="partnerPensionAmountFormatted"
              @focus="onFocus('partnerPensionAmount')"
              @blur="onBlur('partnerPensionAmount')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Partner Pension Amount ($)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('partnerPensionAmount', 1000)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('partnerPensionAmount', 1000)">+</button>
          </div>
          <small class="help-text">Annual pension income for your partner</small>
        </div>
      </div>
    </fieldset>

    <!-- Advanced Options Group -->
    <fieldset class="form-section">
      <legend class="form-section-title clickable" @click="toggleSection('advanced')">
        <span class="chevron" :class="{ open: sectionOpen.advanced }">&#9660;</span>
        Advanced Options
      </legend>
      <div v-show="sectionOpen.advanced">
        <div class="form-group">
          <label for="deathAge">Age the plan ends</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('deathAge', -1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('deathAge', -1)">-</button>
            <input 
              id="deathAge"
              v-model="deathAgeFormatted"
              @focus="onFocus('deathAge')"
              @blur="onBlur('deathAge')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Target Age" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('deathAge', 1)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('deathAge', 1)">+</button>
          </div>
        </div>
        <div class="form-group">
          <label for="propertyGrowthRate">Property Growth Rate</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('propertyGrowthRate', -0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('propertyGrowthRate', -0.5)">-</button>
            <input 
              id="propertyGrowthRate"
              v-model="propertyGrowthRateFormatted"
              @focus="onFocus('propertyGrowthRate')"
              @blur="onBlur('propertyGrowthRate')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Growth Rate (%)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('propertyGrowthRate', 0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('propertyGrowthRate', 0.5)">+</button>
          </div>
          <small class="help-text">Historic average property appreciation (default: 4%)</small>
        </div>
        <div class="form-group">
          <label for="savingsGrowthRate">Expected Savings Growth Rate</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('savingsGrowthRate', -0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('savingsGrowthRate', -0.5)">-</button>
            <input 
              id="savingsGrowthRate"
              v-model="savingsGrowthRateFormatted"
              @focus="onFocus('savingsGrowthRate')"
              @blur="onBlur('savingsGrowthRate')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Growth Rate (%)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('savingsGrowthRate', 0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('savingsGrowthRate', 0.5)">+</button>
          </div>
          <small class="help-text">Expected annual return on your investments</small>
        </div>
        <div class="form-group">
          <label for="mortgageRate">Mortgage Interest Rate</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('mortgageRate', -0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('mortgageRate', -0.5)">-</button>
            <input 
              id="mortgageRate"
              v-model="mortgageRateFormatted"
              @focus="onFocus('mortgageRate')"
              @blur="onBlur('mortgageRate')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Mortgage Rate (%)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('mortgageRate', 0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('mortgageRate', 0.5)">+</button>
          </div>
          <small class="help-text">Annual mortgage interest rate (default: 6%)</small>
        </div>
        <div class="form-group">
          <label for="superannuationRate">Superannuation Return Rate</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('superannuationRate', -0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('superannuationRate', -0.5)">-</button>
            <input 
              id="superannuationRate"
              v-model="superannuationRateFormatted"
              @focus="onFocus('superannuationRate')"
              @blur="onBlur('superannuationRate')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Return Rate (%)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('superannuationRate', 0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('superannuationRate', 0.5)">+</button>
          </div>
          <small class="help-text">Expected annual return on superannuation (default: 7%)</small>
        </div>
        <div class="form-group">
          <label for="inflationRate">Inflation Rate</label>
          <div class="input-with-buttons">
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('inflationRate', -0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('inflationRate', -0.5)">-</button>
            <input 
              id="inflationRate"
              v-model="inflationRateFormatted"
              @focus="onFocus('inflationRate')"
              @blur="onBlur('inflationRate')"
              @keydown.enter="onEnter($event)"
              type="text" 
              placeholder="Inflation Rate (%)" 
              required 
            />
            <button type="button" class="increment-btn" @mousedown="startContinuousAdjustment('inflationRate', 0.5)" @mouseup="stopContinuousAdjustment" @mouseleave="stopContinuousAdjustment" @click="adjustValue('inflationRate', 0.5)">+</button>
          </div>
          <small class="help-text">Expected annual inflation rate (default: 3%)</small>
        </div>
      </div>
    </fieldset>

    <div class="form-group checkbox-group">
      <label>
        <input type="checkbox" v-model="zeroNetWorthAtDeath" />
        Auto-calculate expenses to reach zero net worth at the end of the plan
      </label>
      <small v-if="zeroNetWorthAtDeath" class="help-text">When enabled, your annual expenses will be automatically calculated and adjusted based on your other inputs to ensure you reach exactly zero net worth at your target age. This maximizes your lifetime spending potential.</small>
      <span v-if="zeroNetWorthAtDeath" class="expense-info">Auto-calculated annual expense: {{ formatCurrency(calculatedExpense) }}</span>
    </div>

    <!-- Button removed: calculation is now automatic on input change -->
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, watchEffect, computed } from 'vue';
import { getFinancialProfile, updateFinancialProfile } from '../services/api';
import { calculateExpenseToZeroNetWorth } from '../utils/financialPlan';
import type { FinancialProfile } from '../utils/financialPlan';
import { formatCurrency, formatNumber, parseFormattedNumber } from '../utils/formatters';

const emit = defineEmits(['update']);

const isLoaded = ref(false);

// Reactive values for the new asset structure
const propertyAssets = ref(0);
const savings = ref(0);
const salary = ref(0);
const expenses = ref(0);
const currentAge = ref(30);
const retireAge = ref(65);
const deathAge = ref(90);
const savingsGrowthRate = ref(0.07); // 7% default
const propertyGrowthRate = ref(0.03); // 3% default
const inflationRate = ref(0.03); // 3% default inflation rate
const mortgageBalance = ref(0);
const mortgageRate = ref(0.06); // 6% default
const superannuationBalance = ref(0);
const superannuationRate = ref(0.07); // 7% default

// Add new reactive variables for pension fields
const pensionAmount = ref(0);
const pensionStartAge = ref(67); // Always 67, hardcoded
const partnerPensionAmount = ref(0);
const partnerPensionStartAge = computed(() => partnerAge.value < 67 ? 67 : partnerAge.value);

// Add new reactive variables for partner's age and retirement age
const partnerAge = ref(30);
const partnerRetireAge = ref(65);
const partnerSalary = ref(0);

// Checkbox for zero net worth at death
const zeroNetWorthAtDeath = ref(false);
const calculatedExpense = ref(0);

// Formatted string representations for display
const propertyAssetsFormatted = ref('0');
const savingsFormatted = ref('0');
const salaryFormatted = ref('0');
const expensesFormatted = ref('0');
const currentAgeFormatted = ref('30');
const retireAgeFormatted = ref('65');
const deathAgeFormatted = ref('90');
const savingsGrowthRateFormatted = ref('7');
const propertyGrowthRateFormatted = ref('3');
const inflationRateFormatted = ref('3');
const pensionAmountFormatted = ref('0');
const partnerPensionAmountFormatted = ref('0');
const partnerAgeFormatted = ref('30');
const partnerRetireAgeFormatted = ref('65');
const partnerSalaryFormatted = ref('0');
const mortgageBalanceFormatted = ref('0');
const mortgageRateFormatted = ref('6');
const superannuationBalanceFormatted = ref('0');
const superannuationRateFormatted = ref('7');

// Track which fields are currently focused
const focusedFields = ref(new Set<string>());

// Continuous adjustment state
const continuousAdjustmentState = ref<{
  interval: number | null;
  fieldName: string | null;
  adjustment: number;
}>({
  interval: null,
  fieldName: null,
  adjustment: 0
});

// Collapsible section state
const sectionOpen = ref({
  profile: true,
  assets: true,
  income: true,
  advanced: false
});

function toggleSection(section: 'profile' | 'assets' | 'income' | 'advanced') {
  sectionOpen.value[section] = !sectionOpen.value[section];
}

// Parse numeric value from formatted string
function parseNumericValue(value: string): number {
  // Remove commas, dollar signs, and other non-numeric characters except decimal point
  const cleaned = value.replace(/[,$%]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Parse percentage value and convert to decimal
function parsePercentageValue(value: string): number {
  const cleaned = value.replace(/[,%]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed / 100;
}

// Update formatted strings when numeric values change
watch(propertyAssets, (newValue) => {
  if (!focusedFields.value.has('propertyAssets')) {
    propertyAssetsFormatted.value = formatCurrency(newValue);
  }
});

watch(savings, (newValue) => {
  if (!focusedFields.value.has('savings')) {
    savingsFormatted.value = formatCurrency(newValue);
  }
});

watch(salary, (newValue) => {
  if (!focusedFields.value.has('salary')) {
    salaryFormatted.value = formatCurrency(newValue);
  }
});

watch(expenses, (newValue) => {
  if (!focusedFields.value.has('expenses')) {
    expensesFormatted.value = formatCurrency(newValue);
  }
});

watch(currentAge, (newValue) => {
  if (!focusedFields.value.has('currentAge')) {
    currentAgeFormatted.value = formatNumber(newValue);
  }
});

watch(retireAge, (newValue) => {
  if (!focusedFields.value.has('retireAge')) {
    retireAgeFormatted.value = formatNumber(newValue);
  }
});

watch(deathAge, (newValue) => {
  if (!focusedFields.value.has('deathAge')) {
    deathAgeFormatted.value = formatNumber(newValue);
  }
});

watch(savingsGrowthRate, (newValue) => {
  if (!focusedFields.value.has('savingsGrowthRate')) {
    savingsGrowthRateFormatted.value = (newValue * 100).toFixed(1);
  }
});

watch(propertyGrowthRate, (newValue) => {
  if (!focusedFields.value.has('propertyGrowthRate')) {
    propertyGrowthRateFormatted.value = (newValue * 100).toFixed(1);
  }
});

watch(inflationRate, (newValue) => {
  if (!focusedFields.value.has('inflationRate')) {
    inflationRateFormatted.value = (newValue * 100).toFixed(1);
  }
});

watch(partnerAge, (newValue) => {
  if (!focusedFields.value.has('partnerAge')) {
    partnerAgeFormatted.value = formatNumber(newValue);
  }
});

watch(partnerRetireAge, (newValue) => {
  if (!focusedFields.value.has('partnerRetireAge')) {
    partnerRetireAgeFormatted.value = formatNumber(newValue);
  }
});

watch(mortgageBalance, (newValue) => {
  if (!focusedFields.value.has('mortgageBalance')) {
    mortgageBalanceFormatted.value = formatCurrency(newValue);
  }
});

watch(mortgageRate, (newValue) => {
  if (!focusedFields.value.has('mortgageRate')) {
    mortgageRateFormatted.value = (newValue * 100).toFixed(1);
  }
});

watch(superannuationBalance, (newValue) => {
  if (!focusedFields.value.has('superannuationBalance')) {
    superannuationBalanceFormatted.value = formatCurrency(newValue);
  }
});

watch(superannuationRate, (newValue) => {
  if (!focusedFields.value.has('superannuationRate')) {
    superannuationRateFormatted.value = (newValue * 100).toFixed(1);
  }
});

watch(pensionAmount, (newValue) => {
  if (!focusedFields.value.has('pensionAmount')) {
    pensionAmountFormatted.value = formatCurrency(newValue);
  }
});

watch(partnerPensionAmount, (newValue) => {
  if (!focusedFields.value.has('partnerPensionAmount')) {
    partnerPensionAmountFormatted.value = formatCurrency(newValue);
  }
});

watch(partnerSalary, (newValue) => {
  if (!focusedFields.value.has('partnerSalary')) {
    partnerSalaryFormatted.value = formatCurrency(newValue);
  }
});

// Extend onFocus/onBlur to handle new pension fields
function onFocus(fieldName: string) {
  focusedFields.value.add(fieldName);
  switch (fieldName) {
    case 'propertyAssets':
      propertyAssetsFormatted.value = propertyAssets.value.toString();
      break;
    case 'savings':
      savingsFormatted.value = savings.value.toString();
      break;
    case 'salary':
      salaryFormatted.value = salary.value.toString();
      break;
    case 'expenses':
      expensesFormatted.value = expenses.value.toString();
      break;
    case 'currentAge':
      currentAgeFormatted.value = currentAge.value.toString();
      break;
    case 'retireAge':
      retireAgeFormatted.value = retireAge.value.toString();
      break;
    case 'deathAge':
      deathAgeFormatted.value = deathAge.value.toString();
      break;
    case 'savingsGrowthRate':
      savingsGrowthRateFormatted.value = (savingsGrowthRate.value * 100).toString();
      break;
    case 'propertyGrowthRate':
      propertyGrowthRateFormatted.value = (propertyGrowthRate.value * 100).toString();
      break;
    case 'inflationRate':
      inflationRateFormatted.value = (inflationRate.value * 100).toString();
      break;
    case 'pensionAmount':
      pensionAmountFormatted.value = pensionAmount.value.toString();
      break;
    case 'partnerPensionAmount':
      partnerPensionAmountFormatted.value = partnerPensionAmount.value.toString();
      break;
    case 'partnerAge':
      partnerAgeFormatted.value = partnerAge.value.toString();
      break;
    case 'partnerRetireAge':
      partnerRetireAgeFormatted.value = partnerRetireAge.value.toString();
      break;
    case 'partnerSalary':
      partnerSalaryFormatted.value = partnerSalary.value.toString();
      break;
    case 'mortgageBalance':
      mortgageBalanceFormatted.value = mortgageBalance.value.toString();
      break;
    case 'mortgageRate':
      mortgageRateFormatted.value = (mortgageRate.value * 100).toString();
      break;
    case 'superannuationBalance':
      superannuationBalanceFormatted.value = superannuationBalance.value.toString();
      break;
    case 'superannuationRate':
      superannuationRateFormatted.value = (superannuationRate.value * 100).toString();
      break;
  }
}
function onBlur(fieldName: string) {
  focusedFields.value.delete(fieldName);
  switch (fieldName) {
    case 'propertyAssets':
      const parsedPropertyAssets = parseFormattedNumber(propertyAssetsFormatted.value)
      propertyAssets.value = parsedPropertyAssets >= 0 ? parsedPropertyAssets : 0
      propertyAssetsFormatted.value = formatCurrency(propertyAssets.value)
      break;
    case 'savings':
      const parsedFinancialAssets = parseFormattedNumber(savingsFormatted.value)
      savings.value = parsedFinancialAssets >= 0 ? parsedFinancialAssets : 0
      savingsFormatted.value = formatCurrency(savings.value)
      break;
    case 'salary':
      const parsedSalary = parseFormattedNumber(salaryFormatted.value)
      salary.value = parsedSalary >= 0 ? parsedSalary : 0
      salaryFormatted.value = formatCurrency(salary.value)
      break;
    case 'expenses':
      const parsedExpenses = parseFormattedNumber(expensesFormatted.value)
      expenses.value = parsedExpenses >= 0 ? parsedExpenses : 0
      expensesFormatted.value = formatCurrency(expenses.value)
      break;
    case 'currentAge':
      currentAge.value = parseNumericValue(currentAgeFormatted.value);
      currentAgeFormatted.value = formatNumber(currentAge.value);
      break;
    case 'retireAge':
      retireAge.value = parseNumericValue(retireAgeFormatted.value);
      retireAgeFormatted.value = formatNumber(retireAge.value);
      break;
    case 'deathAge':
      deathAge.value = parseNumericValue(deathAgeFormatted.value);
      deathAgeFormatted.value = formatNumber(deathAge.value);
      break;
    case 'savingsGrowthRate':
      savingsGrowthRate.value = parsePercentageValue(savingsGrowthRateFormatted.value);
      savingsGrowthRateFormatted.value = (savingsGrowthRate.value * 100).toFixed(1);
      break;
    case 'propertyGrowthRate':
      propertyGrowthRate.value = parsePercentageValue(propertyGrowthRateFormatted.value);
      propertyGrowthRateFormatted.value = (propertyGrowthRate.value * 100).toFixed(1);
      break;
    case 'inflationRate':
      inflationRate.value = parsePercentageValue(inflationRateFormatted.value);
      inflationRateFormatted.value = (inflationRate.value * 100).toFixed(1);
      break;
    case 'pensionAmount':
      const parsedPensionAmount = parseFormattedNumber(pensionAmountFormatted.value)
      pensionAmount.value = parsedPensionAmount >= 0 ? parsedPensionAmount : 0
      pensionAmountFormatted.value = formatCurrency(pensionAmount.value)
      break;
    case 'partnerPensionAmount':
      const parsedPartnerPensionAmount = parseFormattedNumber(partnerPensionAmountFormatted.value)
      partnerPensionAmount.value = parsedPartnerPensionAmount >= 0 ? parsedPartnerPensionAmount : 0
      partnerPensionAmountFormatted.value = formatCurrency(partnerPensionAmount.value)
      break;
    case 'partnerAge':
      partnerAge.value = parseNumericValue(partnerAgeFormatted.value);
      partnerAgeFormatted.value = formatNumber(partnerAge.value);
      break;
    case 'partnerRetireAge':
      partnerRetireAge.value = parseNumericValue(partnerRetireAgeFormatted.value);
      partnerRetireAgeFormatted.value = formatNumber(partnerRetireAge.value);
      break;
    case 'partnerSalary':
      const parsedPartnerSalary = parseFormattedNumber(partnerSalaryFormatted.value)
      partnerSalary.value = parsedPartnerSalary >= 0 ? parsedPartnerSalary : 0
      partnerSalaryFormatted.value = formatCurrency(partnerSalary.value)
      break;
    case 'mortgageBalance':
      const parsedMortgageBalance = parseFormattedNumber(mortgageBalanceFormatted.value)
      mortgageBalance.value = parsedMortgageBalance >= 0 ? parsedMortgageBalance : 0
      mortgageBalanceFormatted.value = formatCurrency(mortgageBalance.value)
      break;
    case 'mortgageRate':
      mortgageRate.value = parsePercentageValue(mortgageRateFormatted.value);
      mortgageRateFormatted.value = (mortgageRate.value * 100).toFixed(1);
      break;
    case 'superannuationBalance':
      const parsedSuperannuationBalance = parseFormattedNumber(superannuationBalanceFormatted.value)
      superannuationBalance.value = parsedSuperannuationBalance >= 0 ? parsedSuperannuationBalance : 0
      superannuationBalanceFormatted.value = formatCurrency(superannuationBalance.value)
      break;
    case 'superannuationRate':
      superannuationRate.value = parsePercentageValue(superannuationRateFormatted.value);
      superannuationRateFormatted.value = (superannuationRate.value * 100).toFixed(1);
      break;
  }
}

// When Enter is pressed, blur the input to accept value and trigger recalculation
function onEnter(event: KeyboardEvent) {
  const target = event.target as HTMLInputElement;
  if (target) {
    target.blur();
  }
}

// Adjust value with increment/decrement buttons
function adjustValue(fieldName: string, adjustment: number) {
  switch (fieldName) {
    case 'currentAge':
      currentAge.value = Math.max(0, currentAge.value + adjustment);
      break;
    case 'partnerAge':
      partnerAge.value = Math.max(0, partnerAge.value + adjustment);
      break;
    case 'retireAge':
      retireAge.value = Math.max(0, retireAge.value + adjustment);
      break;
    case 'partnerRetireAge':
      partnerRetireAge.value = Math.max(0, partnerRetireAge.value + adjustment);
      break;
    case 'deathAge':
      deathAge.value = Math.max(0, deathAge.value + adjustment);
      break;
    case 'propertyAssets':
      propertyAssets.value = Math.max(0, propertyAssets.value + adjustment);
      break;
    case 'savings':
      savings.value = Math.max(0, savings.value + adjustment);
      break;
    case 'savingsGrowthRate':
      savingsGrowthRate.value = Math.max(0, Math.min(1, savingsGrowthRate.value + adjustment / 100));
      break;
    case 'propertyGrowthRate':
      propertyGrowthRate.value = Math.max(0, Math.min(1, propertyGrowthRate.value + adjustment / 100));
      break;
    case 'inflationRate':
      inflationRate.value = Math.max(0, Math.min(1, inflationRate.value + adjustment / 100));
      break;
    case 'salary':
      salary.value = Math.max(0, salary.value + adjustment);
      break;
    case 'partnerSalary':
      partnerSalary.value = Math.max(0, partnerSalary.value + adjustment);
      break;
    case 'expenses':
      if (!zeroNetWorthAtDeath.value) {
        expenses.value = Math.max(0, expenses.value + adjustment);
      }
      break;
    case 'pensionAmount':
      pensionAmount.value = Math.max(0, pensionAmount.value + adjustment);
      break;
    case 'partnerPensionAmount':
      partnerPensionAmount.value = Math.max(0, partnerPensionAmount.value + adjustment);
      break;
    case 'mortgageBalance':
      mortgageBalance.value = Math.max(0, mortgageBalance.value + adjustment);
      break;
    case 'mortgageRate':
      mortgageRate.value = Math.max(0, Math.min(1, mortgageRate.value + adjustment / 100));
      break;
    case 'superannuationBalance':
      superannuationBalance.value = Math.max(0, superannuationBalance.value + adjustment);
      break;
    case 'superannuationRate':
      superannuationRate.value = Math.max(0, Math.min(1, superannuationRate.value + adjustment / 100));
      break;
  }
}

// Continuous adjustment functions
function startContinuousAdjustment(fieldName: string, adjustment: number) {
  // Clear any existing interval
  stopContinuousAdjustment();
  
  // Store the current adjustment state
  continuousAdjustmentState.value.fieldName = fieldName;
  continuousAdjustmentState.value.adjustment = adjustment;
  
  // Start with initial delay, then faster intervals
  const initialDelay = 500; // 500ms before starting continuous
  const fastInterval = 100; // 100ms between adjustments
  
  setTimeout(() => {
    if (continuousAdjustmentState.value.fieldName === fieldName) {
      continuousAdjustmentState.value.interval = setInterval(() => {
        adjustValue(fieldName, adjustment);
      }, fastInterval);
    }
  }, initialDelay);
}

function stopContinuousAdjustment() {
  if (continuousAdjustmentState.value.interval) {
    clearInterval(continuousAdjustmentState.value.interval);
    continuousAdjustmentState.value.interval = null;
  }
  continuousAdjustmentState.value.fieldName = null;
  continuousAdjustmentState.value.adjustment = 0;
}

// Watch for checkbox and recalculate
watch(zeroNetWorthAtDeath, (checked) => {
  if (checked) {
    const profile: FinancialProfile = {
      propertyAssets: propertyAssets.value,
      savings: savings.value,
      mortgageBalance: mortgageBalance.value,
      mortgageRate: mortgageRate.value,
      superannuationBalance: superannuationBalance.value,
      superannuationRate: superannuationRate.value,
      salary: salary.value,
      partnerSalary: partnerSalary.value,
      expenses: expenses.value,
      currentAge: currentAge.value,
      retireAge: retireAge.value,
      deathAge: deathAge.value,
      savingsGrowthRate: savingsGrowthRate.value,
      propertyGrowthRate: propertyGrowthRate.value,
      inflationRate: inflationRate.value,
      pensionAmount: pensionAmount.value,
      pensionStartAge: 67, // hardcoded
      partnerPensionAmount: partnerPensionAmount.value,
      partnerPensionStartAge: partnerPensionStartAge.value,
      partnerAge: partnerAge.value,
      partnerRetireAge: partnerRetireAge.value
    };
    calculatedExpense.value = calculateExpenseToZeroNetWorth(profile);
    expenses.value = calculatedExpense.value;
    expensesFormatted.value = formatCurrency(calculatedExpense.value);
  }
});

// If user changes any relevant field and box is checked, recalculate
watch([
  propertyAssets, savings, salary, partnerSalary, currentAge, retireAge, deathAge,
  savingsGrowthRate, propertyGrowthRate, inflationRate,
  pensionAmount, partnerPensionAmount, partnerPensionStartAge,
  partnerAge, partnerRetireAge, mortgageBalance, mortgageRate,
  superannuationBalance, superannuationRate
], () => {
  if (zeroNetWorthAtDeath.value) {
    const profile: FinancialProfile = {
      propertyAssets: propertyAssets.value,
      savings: savings.value,
      mortgageBalance: mortgageBalance.value,
      mortgageRate: mortgageRate.value,
      superannuationBalance: superannuationBalance.value,
      superannuationRate: superannuationRate.value,
      salary: salary.value,
      partnerSalary: partnerSalary.value,
      expenses: expenses.value,
      currentAge: currentAge.value,
      retireAge: retireAge.value,
      deathAge: deathAge.value,
      savingsGrowthRate: savingsGrowthRate.value,
      propertyGrowthRate: propertyGrowthRate.value,
      inflationRate: inflationRate.value,
      pensionAmount: pensionAmount.value,
      pensionStartAge: 67, // hardcoded
      partnerPensionAmount: partnerPensionAmount.value,
      partnerPensionStartAge: partnerPensionStartAge.value,
      partnerAge: partnerAge.value,
      partnerRetireAge: partnerRetireAge.value
    };
    calculatedExpense.value = calculateExpenseToZeroNetWorth(profile);
    expenses.value = calculatedExpense.value;
    expensesFormatted.value = formatCurrency(calculatedExpense.value);
  }
});

// Emit updated profile automatically on any input change
watchEffect(() => {
  if (!isLoaded.value) return;

  const profile: FinancialProfile = {
    propertyAssets: propertyAssets.value,
    savings: savings.value,
    mortgageBalance: mortgageBalance.value,
    mortgageRate: mortgageRate.value,
    superannuationBalance: superannuationBalance.value,
    superannuationRate: superannuationRate.value,
    salary: salary.value,
    partnerSalary: partnerSalary.value,
    expenses: expenses.value,
    currentAge: currentAge.value,
    retireAge: retireAge.value,
    deathAge: deathAge.value,
    savingsGrowthRate: savingsGrowthRate.value,
    propertyGrowthRate: propertyGrowthRate.value,
    inflationRate: inflationRate.value,
    pensionAmount: pensionAmount.value,
    pensionStartAge: 67, // hardcoded
    partnerPensionAmount: partnerPensionAmount.value,
    partnerPensionStartAge: partnerPensionStartAge.value,
    partnerAge: partnerAge.value,
    partnerRetireAge: partnerRetireAge.value
  };

  saveToLocalStorage(); // Save changes to local storage immediately
  emit('update', profile);

  // Auto-save to backend
  // updateFinancialProfile(profile).catch((e) => {
  //   console.error('Failed to save profile to backend:', e);
  // });
});

const LOCAL_KEY = 'financial-input';

function saveToLocalStorage() {
  const data = {
    propertyAssets: propertyAssets.value,
    savings: savings.value,
    mortgageBalance: mortgageBalance.value,
    mortgageRate: mortgageRate.value,
    superannuationBalance: superannuationBalance.value,
    superannuationRate: superannuationRate.value,
    salary: salary.value,
    partnerSalary: partnerSalary.value,
    expenses: expenses.value,
    currentAge: currentAge.value,
    retireAge: retireAge.value,
    deathAge: deathAge.value,
    savingsGrowthRate: savingsGrowthRate.value,
    propertyGrowthRate: propertyGrowthRate.value,
    inflationRate: inflationRate.value,
    pensionAmount: pensionAmount.value,
    pensionStartAge: 67, // hardcoded
    partnerPensionAmount: partnerPensionAmount.value,
    partnerAge: partnerAge.value,
    partnerRetireAge: partnerRetireAge.value
  };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem(LOCAL_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      propertyAssets.value = parsed.propertyAssets ?? 0;
      savings.value = parsed.savings ?? 0;
      mortgageBalance.value = parsed.mortgageBalance ?? 0;
      mortgageRate.value = parsed.mortgageRate ?? 0.06;
      superannuationBalance.value = parsed.superannuationBalance ?? 0;
      superannuationRate.value = parsed.superannuationRate ?? 0.07;
      salary.value = parsed.salary ?? 0;
      partnerSalary.value = parsed.partnerSalary ?? 0;
      expenses.value = parsed.expenses ?? 0;
      currentAge.value = parsed.currentAge ?? 30;
      retireAge.value = parsed.retireAge ?? 65;
      deathAge.value = parsed.deathAge ?? 90;
      savingsGrowthRate.value = parsed.savingsGrowthRate ?? 0.07;
      propertyGrowthRate.value = parsed.propertyGrowthRate ?? 0.03;
      inflationRate.value = parsed.inflationRate ?? 0.03;
      pensionAmount.value = parsed.pensionAmount ?? 0;
      pensionStartAge.value = 67; // always 67
      partnerPensionAmount.value = parsed.partnerPensionAmount ?? 0;
      partnerAge.value = parsed.partnerAge ?? 30;
      partnerRetireAge.value = parsed.partnerRetireAge ?? 65;
      
      // Update formatted values
      updateFormattedValues();
    } catch {}
  }
}

// Function to update all formatted values
function updateFormattedValues() {
  propertyAssetsFormatted.value = formatCurrency(propertyAssets.value);
  savingsFormatted.value = formatCurrency(savings.value);
  mortgageBalanceFormatted.value = formatCurrency(mortgageBalance.value);
  mortgageRateFormatted.value = (mortgageRate.value * 100).toFixed(1);
  superannuationBalanceFormatted.value = formatCurrency(superannuationBalance.value);
  superannuationRateFormatted.value = (superannuationRate.value * 100).toFixed(1);
  salaryFormatted.value = formatCurrency(salary.value);
  partnerSalaryFormatted.value = formatCurrency(partnerSalary.value);
  expensesFormatted.value = formatCurrency(expenses.value);
  currentAgeFormatted.value = formatNumber(currentAge.value);
  retireAgeFormatted.value = formatNumber(retireAge.value);
  deathAgeFormatted.value = formatNumber(deathAge.value);
  savingsGrowthRateFormatted.value = (savingsGrowthRate.value * 100).toFixed(1);
  propertyGrowthRateFormatted.value = (propertyGrowthRate.value * 100).toFixed(1);
  inflationRateFormatted.value = (inflationRate.value * 100).toFixed(1);
  pensionAmountFormatted.value = formatCurrency(pensionAmount.value);
  partnerPensionAmountFormatted.value = formatCurrency(partnerPensionAmount.value);
  partnerAgeFormatted.value = formatNumber(partnerAge.value);
  partnerRetireAgeFormatted.value = formatNumber(partnerRetireAge.value);
}

async function load() {
  const localData = localStorage.getItem(LOCAL_KEY);
  if (localData) {
    loadFromLocalStorage();
  } else {
    try {
      const profile = await getFinancialProfile();
      if (profile) {
        propertyAssets.value = profile.propertyAssets || 0;
        savings.value = profile.savings || 0;
        mortgageBalance.value = profile.mortgageBalance || 0;
        mortgageRate.value = profile.mortgageRate || 0.06;
        superannuationBalance.value = profile.superannuationBalance || 0;
        superannuationRate.value = profile.superannuationRate || 0.07;
        salary.value = profile.salary || 0;
        partnerSalary.value = profile.partnerSalary || 0;
        expenses.value = profile.expenses || 0;
        currentAge.value = profile.currentAge || 30;
        retireAge.value = profile.retireAge || 65;
        deathAge.value = profile.deathAge || 90;
        savingsGrowthRate.value = profile.savingsGrowthRate || 0.07;
        propertyGrowthRate.value = profile.propertyGrowthRate || 0.03;
        inflationRate.value = profile.inflationRate || 0.03;
        pensionAmount.value = profile.pensionAmount || 0;
        pensionStartAge.value = 67; // always 67
        partnerPensionAmount.value = profile.partnerPensionAmount || 0;
        partnerAge.value = profile.partnerAge || 30;
        partnerRetireAge.value = profile.partnerRetireAge || 65;
        updateFormattedValues();
        saveToLocalStorage();
      }
    } catch (error) {
      console.log('No existing profile found, using defaults');
    }
  }
  isLoaded.value = true;
}


onMounted(() => {
  // Expand 'person profile', close other sections on load
  sectionOpen.value = { profile: true, assets: false, income: false, advanced: false };
  load();
});

onUnmounted(() => {
  // Clean up any running intervals
  stopContinuousAdjustment();
});
</script>

<style scoped>
.asset-form {
  background: #232733;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.3rem;
  color: #6ee7b7;
  font-weight: 600;
  font-size: 0.75rem;
}

.input-with-buttons {
  display: flex;
  align-items: center;
  gap: 0;
}

.input-with-buttons input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #374151;
  border-left: none;
  border-right: none;
  background: #1f2937;
  color: #e0e3e8;
  font-size: 0.85rem;
  box-sizing: border-box;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #374151;
  border-radius: 6px;
  background: #1f2937;
  color: #e0e3e8;
  font-size: 0.85rem;
  box-sizing: border-box;
}

.increment-btn {
  width: 32px;
  height: 38px;
  background: #374151;
  border: 1px solid #374151;
  color: #e0e3e8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
  transition: background-color 0.2s;
  user-select: none;
}

.increment-btn:first-child {
  border-radius: 6px 0 0 6px;
}

.increment-btn:last-child {
  border-radius: 0 6px 6px 0;
}

.increment-btn:hover {
  background: #4b5563;
}

.increment-btn:active {
  background: #6b7280;
}

.increment-btn:disabled {
  background: #1f2937;
  color: #6b7280;
  cursor: not-allowed;
  opacity: 0.5;
}

.input-with-buttons input:disabled {
  background: #2d3748;
  color: #e0e3e8;
  cursor: not-allowed;
  border-color: #4a5568;
}

.form-group input:focus {
  outline: none;
  border-color: #6ee7b7;
  box-shadow: 0 0 0 2px rgba(110, 231, 183, 0.2);
}

.formatted-value {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.7rem;
  color: #9ca3af;
  font-style: italic;
}

.help-text {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.65rem;
  color: #6b7280;
  line-height: 1.3;
}

.submit-btn {
  width: 100%;
  padding: 0.6rem 1.2rem;
  background: #6ee7b7;
  color: #1f2937;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background: #34d399;
}

.submit-btn:active {
  background: #10b981;
}

.form-section {
  border: 1px solid #374151;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  padding: 1rem 1rem 0.5rem 1rem;
  background: #20232e;
}

.form-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #6ee7b7;
  margin-bottom: 0.7rem;
  padding: 0 0.5rem;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.form-section-title.clickable:hover {
  background: #232733;
}
.chevron {
  display: inline-block;
  margin-right: 0.5em;
  transition: transform 0.2s;
}
.chevron {
  transform: rotate(-90deg);
}
.chevron.open {
  transform: rotate(0deg);
}
.checkbox-group {
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.checkbox-group label {
  font-size: 0.9rem;
  color: #e0e3e8;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.checkbox-group input[type="checkbox"] {
  margin-right: 0.5em;
}
.expense-info {
  font-size: 0.8rem;
  color: #6ee7b7;
  margin-top: 0.2em;
}
</style>
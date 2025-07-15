<template>
  <form @submit.prevent="submit" class="asset-form">
    <!-- Person Profile Group -->
    <fieldset class="form-section">
      <legend class="form-section-title clickable" @click="toggleSection('profile')">
        <span class="chevron" :class="{ open: sectionOpen.profile }">&#9660;</span>
        Person Profile
      </legend>
      <div v-show="sectionOpen.profile">
        <div class="form-group">
          <label for="currentAge">Current Age</label>
          <input 
            id="currentAge"
            v-model="currentAgeFormatted"
            @focus="onFocus('currentAge')"
            @blur="onBlur('currentAge')"
            type="text" 
            placeholder="Current Age" 
            required 
          />
          <span class="formatted-value">{{ currentAge }} years old</span>
        </div>
        <div class="form-group">
          <label for="retireAge">Retirement Age</label>
          <input 
            id="retireAge"
            v-model="retireAgeFormatted"
            @focus="onFocus('retireAge')"
            @blur="onBlur('retireAge')"
            type="text" 
            placeholder="Retirement Age" 
            required 
          />
          <span class="formatted-value">{{ retireAge }} years old</span>
          <small class="help-text">Age when salary income stops</small>
        </div>
        <div class="form-group">
          <label for="deathAge">Retirement/Death Age</label>
          <input 
            id="deathAge"
            v-model="deathAgeFormatted"
            @focus="onFocus('deathAge')"
            @blur="onBlur('deathAge')"
            type="text" 
            placeholder="Target Age" 
            required 
          />
          <span class="formatted-value">{{ deathAge }} years old</span>
        </div>
        <div class="form-group">
          <label for="pensionStartAge">Pension for You (Start Age)</label>
          <input 
            id="pensionStartAge"
            v-model="pensionStartAgeFormatted"
            @focus="onFocus('pensionStartAge')"
            @blur="onBlur('pensionStartAge')"
            type="text" 
            placeholder="Pension Start Age" 
            required 
          />
          <span class="formatted-value">{{ pensionStartAge }} years old</span>
        </div>
        <div class="form-group">
          <label for="partnerPensionStartAge">Pension for Your Partner (Start Age)</label>
          <input 
            id="partnerPensionStartAge"
            v-model="partnerPensionStartAgeFormatted"
            @focus="onFocus('partnerPensionStartAge')"
            @blur="onBlur('partnerPensionStartAge')"
            type="text" 
            placeholder="Partner Pension Start Age" 
            required 
          />
          <span class="formatted-value">{{ partnerPensionStartAge }} years old</span>
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
          <input 
            id="propertyAssets"
            v-model="propertyAssetsFormatted"
            @focus="onFocus('propertyAssets')"
            @blur="onBlur('propertyAssets')"
            type="text" 
            placeholder="Property Assets ($)" 
            required 
          />
          <span class="formatted-value">{{ formatCurrency(propertyAssets) }}</span>
          <small class="help-text">Real estate, land, and other property investments</small>
        </div>
        <div class="form-group">
          <label for="financialAssets">Financial Assets</label>
          <input 
            id="financialAssets"
            v-model="financialAssetsFormatted"
            @focus="onFocus('financialAssets')"
            @blur="onBlur('financialAssets')"
            type="text" 
            placeholder="Financial Assets ($)" 
            required 
          />
          <span class="formatted-value">{{ formatCurrency(financialAssets) }}</span>
          <small class="help-text">Stocks, bonds, savings, and liquid investments</small>
        </div>
        <div class="form-group">
          <label for="financialAssetGrowthRate">Expected Financial Asset Growth Rate</label>
          <input 
            id="financialAssetGrowthRate"
            v-model="financialAssetGrowthRateFormatted"
            @focus="onFocus('financialAssetGrowthRate')"
            @blur="onBlur('financialAssetGrowthRate')"
            type="text" 
            placeholder="Growth Rate (%)" 
            required 
          />
          <span class="formatted-value">{{ (financialAssetGrowthRate * 100).toFixed(1) }}% annually</span>
          <small class="help-text">Expected annual return on your investments</small>
        </div>
        <div class="form-group">
          <label for="propertyGrowthRate">Property Growth Rate</label>
          <input 
            id="propertyGrowthRate"
            v-model="propertyGrowthRateFormatted"
            @focus="onFocus('propertyGrowthRate')"
            @blur="onBlur('propertyGrowthRate')"
            type="text" 
            placeholder="Growth Rate (%)" 
            required 
          />
          <span class="formatted-value">{{ (propertyGrowthRate * 100).toFixed(1) }}% annually</span>
          <small class="help-text">Historic average property appreciation (default: 3%)</small>
        </div>
        <div class="form-group">
          <label for="inflationRate">Inflation Rate</label>
          <input 
            id="inflationRate"
            v-model="inflationRateFormatted"
            @focus="onFocus('inflationRate')"
            @blur="onBlur('inflationRate')"
            type="text" 
            placeholder="Inflation Rate (%)" 
            required 
          />
          <span class="formatted-value">{{ (inflationRate * 100).toFixed(1) }}% annually</span>
          <small class="help-text">Expected annual inflation rate (default: 3%)</small>
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
          <input 
            id="salary"
            v-model="salaryFormatted"
            @focus="onFocus('salary')"
            @blur="onBlur('salary')"
            type="text" 
            placeholder="Annual Salary ($)" 
            required 
          />
          <span class="formatted-value">{{ formatCurrency(salary) }}</span>
        </div>
        <div class="form-group">
          <label for="expenses">Annual Expenses</label>
          <input 
            id="expenses"
            v-model="expensesFormatted"
            @focus="onFocus('expenses')"
            @blur="onBlur('expenses')"
            type="text" 
            placeholder="Annual Expenses ($)" 
            required 
          />
          <span class="formatted-value">{{ formatCurrency(expenses) }}</span>
          <small class="help-text">Will be paid from financial assets only</small>
        </div>
        <div class="form-group">
          <label for="pensionAmount">Pension for You (Annual Amount)</label>
          <input 
            id="pensionAmount"
            v-model="pensionAmountFormatted"
            @focus="onFocus('pensionAmount')"
            @blur="onBlur('pensionAmount')"
            type="text" 
            placeholder="Pension Amount ($)" 
            required 
          />
          <span class="formatted-value">{{ formatCurrency(pensionAmount) }}</span>
          <small class="help-text">Annual pension income for you</small>
        </div>
        <div class="form-group">
          <label for="partnerPensionAmount">Pension for Your Partner (Annual Amount)</label>
          <input 
            id="partnerPensionAmount"
            v-model="partnerPensionAmountFormatted"
            @focus="onFocus('partnerPensionAmount')"
            @blur="onBlur('partnerPensionAmount')"
            type="text" 
            placeholder="Partner Pension Amount ($)" 
            required 
          />
          <span class="formatted-value">{{ formatCurrency(partnerPensionAmount) }}</span>
          <small class="help-text">Annual pension income for your partner</small>
        </div>
      </div>
    </fieldset>

    <button type="submit" class="submit-btn">Update Financial Plan</button>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getFinancialProfile, updateFinancialProfile } from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';

const emit = defineEmits(['update']);

// Reactive values for the new asset structure
const propertyAssets = ref(0);
const financialAssets = ref(0);
const salary = ref(0);
const expenses = ref(0);
const currentAge = ref(30);
const retireAge = ref(65);
const deathAge = ref(90);
const financialAssetGrowthRate = ref(0.07); // 7% default
const propertyGrowthRate = ref(0.03); // 3% default
const inflationRate = ref(0.03); // 3% default inflation rate

// Add new reactive variables for pension fields
const pensionAmount = ref(0);
const pensionStartAge = ref(67);
const partnerPensionAmount = ref(0);
const partnerPensionStartAge = ref(67);

// Formatted string representations for display
const propertyAssetsFormatted = ref('0');
const financialAssetsFormatted = ref('0');
const salaryFormatted = ref('0');
const expensesFormatted = ref('0');
const currentAgeFormatted = ref('30');
const retireAgeFormatted = ref('65');
const deathAgeFormatted = ref('90');
const financialAssetGrowthRateFormatted = ref('7');
const propertyGrowthRateFormatted = ref('3');
const inflationRateFormatted = ref('3');
const pensionAmountFormatted = ref('0');
const pensionStartAgeFormatted = ref('67');
const partnerPensionAmountFormatted = ref('0');
const partnerPensionStartAgeFormatted = ref('67');

// Track which fields are currently focused
const focusedFields = ref(new Set<string>());

// Collapsible section state
const sectionOpen = ref({
  profile: true,
  assets: true,
  income: true
});

function toggleSection(section: 'profile' | 'assets' | 'income') {
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
    propertyAssetsFormatted.value = formatNumber(newValue);
  }
});

watch(financialAssets, (newValue) => {
  if (!focusedFields.value.has('financialAssets')) {
    financialAssetsFormatted.value = formatNumber(newValue);
  }
});

watch(salary, (newValue) => {
  if (!focusedFields.value.has('salary')) {
    salaryFormatted.value = formatNumber(newValue);
  }
});

watch(expenses, (newValue) => {
  if (!focusedFields.value.has('expenses')) {
    expensesFormatted.value = formatNumber(newValue);
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

watch(financialAssetGrowthRate, (newValue) => {
  if (!focusedFields.value.has('financialAssetGrowthRate')) {
    financialAssetGrowthRateFormatted.value = (newValue * 100).toFixed(1);
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

// Extend onFocus/onBlur to handle new pension fields
function onFocus(fieldName: string) {
  focusedFields.value.add(fieldName);
  switch (fieldName) {
    case 'propertyAssets':
      propertyAssetsFormatted.value = propertyAssets.value.toString();
      break;
    case 'financialAssets':
      financialAssetsFormatted.value = financialAssets.value.toString();
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
    case 'financialAssetGrowthRate':
      financialAssetGrowthRateFormatted.value = (financialAssetGrowthRate.value * 100).toString();
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
    case 'pensionStartAge':
      pensionStartAgeFormatted.value = pensionStartAge.value.toString();
      break;
    case 'partnerPensionAmount':
      partnerPensionAmountFormatted.value = partnerPensionAmount.value.toString();
      break;
    case 'partnerPensionStartAge':
      partnerPensionStartAgeFormatted.value = partnerPensionStartAge.value.toString();
      break;
  }
}
function onBlur(fieldName: string) {
  focusedFields.value.delete(fieldName);
  switch (fieldName) {
    case 'propertyAssets':
      propertyAssets.value = parseNumericValue(propertyAssetsFormatted.value);
      propertyAssetsFormatted.value = formatNumber(propertyAssets.value);
      break;
    case 'financialAssets':
      financialAssets.value = parseNumericValue(financialAssetsFormatted.value);
      financialAssetsFormatted.value = formatNumber(financialAssets.value);
      break;
    case 'salary':
      salary.value = parseNumericValue(salaryFormatted.value);
      salaryFormatted.value = formatNumber(salary.value);
      break;
    case 'expenses':
      expenses.value = parseNumericValue(expensesFormatted.value);
      expensesFormatted.value = formatNumber(expenses.value);
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
    case 'financialAssetGrowthRate':
      financialAssetGrowthRate.value = parsePercentageValue(financialAssetGrowthRateFormatted.value);
      financialAssetGrowthRateFormatted.value = (financialAssetGrowthRate.value * 100).toFixed(1);
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
      pensionAmount.value = parseNumericValue(pensionAmountFormatted.value);
      pensionAmountFormatted.value = formatNumber(pensionAmount.value);
      break;
    case 'pensionStartAge':
      pensionStartAge.value = parseNumericValue(pensionStartAgeFormatted.value);
      pensionStartAgeFormatted.value = formatNumber(pensionStartAge.value);
      break;
    case 'partnerPensionAmount':
      partnerPensionAmount.value = parseNumericValue(partnerPensionAmountFormatted.value);
      partnerPensionAmountFormatted.value = formatNumber(partnerPensionAmount.value);
      break;
    case 'partnerPensionStartAge':
      partnerPensionStartAge.value = parseNumericValue(partnerPensionStartAgeFormatted.value);
      partnerPensionStartAgeFormatted.value = formatNumber(partnerPensionStartAge.value);
      break;
  }
}

const LOCAL_KEY = 'financial-input';

function saveToLocalStorage() {
  const data = {
    propertyAssets: propertyAssets.value,
    financialAssets: financialAssets.value,
    salary: salary.value,
    expenses: expenses.value,
    currentAge: currentAge.value,
    retireAge: retireAge.value,
    deathAge: deathAge.value,
    financialAssetGrowthRate: financialAssetGrowthRate.value,
    propertyGrowthRate: propertyGrowthRate.value,
    inflationRate: inflationRate.value,
    pensionAmount: pensionAmount.value,
    pensionStartAge: pensionStartAge.value,
    partnerPensionAmount: partnerPensionAmount.value,
    partnerPensionStartAge: partnerPensionStartAge.value
  };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem(LOCAL_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      propertyAssets.value = parsed.propertyAssets ?? 0;
      financialAssets.value = parsed.financialAssets ?? 0;
      salary.value = parsed.salary ?? 0;
      expenses.value = parsed.expenses ?? 0;
      currentAge.value = parsed.currentAge ?? 30;
      retireAge.value = parsed.retireAge ?? 65;
      deathAge.value = parsed.deathAge ?? 90;
      financialAssetGrowthRate.value = parsed.financialAssetGrowthRate ?? 0.07;
      propertyGrowthRate.value = parsed.propertyGrowthRate ?? 0.03;
      inflationRate.value = parsed.inflationRate ?? 0.03;
      pensionAmount.value = parsed.pensionAmount ?? 0;
      pensionStartAge.value = parsed.pensionStartAge ?? 67;
      partnerPensionAmount.value = parsed.partnerPensionAmount ?? 0;
      partnerPensionStartAge.value = parsed.partnerPensionStartAge ?? 67;
      
      // Update formatted values
      updateFormattedValues();
    } catch {}
  }
}

// Function to update all formatted values
function updateFormattedValues() {
  propertyAssetsFormatted.value = formatNumber(propertyAssets.value);
  financialAssetsFormatted.value = formatNumber(financialAssets.value);
  salaryFormatted.value = formatNumber(salary.value);
  expensesFormatted.value = formatNumber(expenses.value);
  currentAgeFormatted.value = formatNumber(currentAge.value);
  retireAgeFormatted.value = formatNumber(retireAge.value);
  deathAgeFormatted.value = formatNumber(deathAge.value);
  financialAssetGrowthRateFormatted.value = (financialAssetGrowthRate.value * 100).toFixed(1);
  propertyGrowthRateFormatted.value = (propertyGrowthRate.value * 100).toFixed(1);
  inflationRateFormatted.value = (inflationRate.value * 100).toFixed(1);
  pensionAmountFormatted.value = formatNumber(pensionAmount.value);
  pensionStartAgeFormatted.value = formatNumber(pensionStartAge.value);
  partnerPensionAmountFormatted.value = formatNumber(partnerPensionAmount.value);
  partnerPensionStartAgeFormatted.value = formatNumber(partnerPensionStartAge.value);
}

async function load() {
  loadFromLocalStorage();
  try {
    const profile = await getFinancialProfile();
    if (profile) {
      propertyAssets.value = profile.propertyAssets || 0;
      financialAssets.value = profile.financialAssets || 0;
      salary.value = profile.salary || 0;
      expenses.value = profile.expenses || 0;
      currentAge.value = profile.currentAge || 30;
      retireAge.value = profile.retireAge || 65;
      deathAge.value = profile.deathAge || 90;
      financialAssetGrowthRate.value = profile.financialAssetGrowthRate || 0.07;
      propertyGrowthRate.value = profile.propertyGrowthRate || 0.03;
      inflationRate.value = profile.inflationRate || 0.03;
      pensionAmount.value = profile.pensionAmount || 0;
      pensionStartAge.value = profile.pensionStartAge || 67;
      partnerPensionAmount.value = profile.partnerPensionAmount || 0;
      partnerPensionStartAge.value = profile.partnerPensionStartAge || 67;
      updateFormattedValues();
      saveToLocalStorage();
    }
  } catch (error) {
    console.log('No existing profile found, using defaults');
  }
}

async function submit() {
  await updateFinancialProfile({ 
    propertyAssets: propertyAssets.value, 
    financialAssets: financialAssets.value,
    salary: salary.value, 
    expenses: expenses.value, 
    currentAge: currentAge.value, 
    retireAge: retireAge.value,
    deathAge: deathAge.value,
    financialAssetGrowthRate: financialAssetGrowthRate.value,
    propertyGrowthRate: propertyGrowthRate.value,
    inflationRate: inflationRate.value,
    pensionAmount: pensionAmount.value,
    pensionStartAge: pensionStartAge.value,
    partnerPensionAmount: partnerPensionAmount.value,
    partnerPensionStartAge: partnerPensionStartAge.value
  });
  saveToLocalStorage();
  emit('update');
}

onMounted(load);
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
</style>
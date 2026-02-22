<template>
  <div class="income-expenses-form">
    <FormInputWithButtons
      field-id="salary"
      label="Your Annual Salary (Include super/tax)"
      :value="salary"
      placeholder="Annual Salary ($)"
      :increment-step="1000"
      :is-valid="validation.isFieldValid('salary', salary)"
      :is-touched="validation.isFieldTouched('salary')"
      :error-message="validation.getFieldErrorMessage('salary')"
      :format-value="formatting.formatField.bind(null, 'salary')"
      :parse-value="formatting.parseField.bind(null, 'salary')"
      @update:value="updateField('salary', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <!-- Partner Salary - only visible for couples -->
    <div v-show="relationshipStatus === 'couple'">
      <FormInputWithButtons
        field-id="partnerSalary"
        label="Partner's Annual Salary"
        :value="partnerSalary"
        placeholder="Partner's Annual Salary ($)"
        :increment-step="1000"
        :is-valid="validation.isFieldValid('partnerSalary', partnerSalary)"
        :is-touched="validation.isFieldTouched('partnerSalary')"
        :error-message="validation.getFieldErrorMessage('partnerSalary')"
        :format-value="formatting.formatField.bind(null, 'partnerSalary')"
        :parse-value="formatting.parseField.bind(null, 'partnerSalary')"
        @update:value="updateField('partnerSalary', $event)"
        @focus="handleFieldFocus"
        @blur="handleFieldBlur"
        @enter="handleFieldEnter"
        @adjust="handleFieldAdjust"
      />
    </div>

    <!-- Expenses with Auto-Optimize Toggle -->
    <div class="form-group">
      <div class="label-with-toggle">
        <label for="expenses">Annual Expenses</label>
        <button 
          type="button" 
          class="toggle-switch" 
          :class="{ active: zeroNetWorthAtDeath }"
          @click="toggleAutoOptimize"
          title="Auto-optimize expenses"
        >
          <span class="toggle-slider"></span>
        </button>
      </div>
      
      <FormInputWithButtons
        field-id="expenses"
        :value="expenses"
        placeholder="Annual Expenses ($)"
        :increment-step="1000"
        :is-valid="isExpenseFieldValid"
        :is-touched="validation.isFieldTouched('expenses')"
        :error-message="expenseErrorMessage"
        :format-value="formatting.formatField.bind(null, 'expenses')"
        :parse-value="formatting.parseField.bind(null, 'expenses')"
        :show-validation="false"
        @update:value="updateField('expenses', $event)"
        @focus="handleFieldFocus"
        @blur="handleFieldBlur"
        @enter="handleFieldEnter"
        @adjust="handleFieldAdjust"
        class="expenses-input"
        :class="{ 
          'auto-optimized': zeroNetWorthAtDeath,
          'input-disabled': zeroNetWorthAtDeath
        }"
      />

      <!-- Custom validation messages for expenses -->
      <small v-if="!isExpenseFieldValid && validation.isFieldTouched('expenses')" class="validation-error">
        {{ expenseErrorMessage }}
      </small>
      <small v-if="expensesAutoCapped" class="validation-warning">
        ⚠️ Expense has been automatically adjusted to your maximum disposable income of {{ formatCurrency(currentDisposableIncome) }}
      </small>
      <small v-if="!zeroNetWorthAtDeath && currentDisposableIncome > 0" class="help-text">
        Disposable income: {{ formatCurrency(currentDisposableIncome) }} | {{ zeroNetWorthAtDeath ? 'Auto-calculated based on your other inputs' : 'Will be paid from financial assets only' }}
      </small>
      <small v-else class="help-text">
        {{ zeroNetWorthAtDeath ? 'Auto-calculated based on your other inputs' : 'Will be paid from financial assets only' }}
      </small>
    </div>

    <!-- Disposable Income Summary -->
    <div class="income-summary">
      <div class="summary-row">
        <span class="label">Current Disposable Income:</span>
        <span class="value" :class="{ negative: currentDisposableIncome < 0 }">
          {{ formatCurrency(currentDisposableIncome) }}
        </span>
      </div>
      <div v-if="relationshipStatus === 'couple'" class="summary-breakdown">
        <div class="breakdown-row">
          <span class="breakdown-label">Your Net Income:</span>
          <span class="breakdown-value">{{ formatCurrency(userNetIncome) }}</span>
        </div>
        <div class="breakdown-row">
          <span class="breakdown-label">Partner Net Income:</span>
          <span class="breakdown-value">{{ formatCurrency(partnerNetIncome) }}</span>
        </div>
      </div>
      <small class="help-text">
        Disposable income = Net salary after tax + Age pension + Rental income
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import FormInputWithButtons from './FormInputWithButtons.vue';
import { useFormValidation } from '../../composables/useFormValidation';
import { useFieldFormatting } from '../../composables/useFieldFormatting';
import { formatCurrency } from '../../utils/formatters';

interface IncomeExpensesData {
  salary: number;
  partnerSalary: number;
  expenses: number;
  zeroNetWorthAtDeath: boolean;
  relationshipStatus: 'single' | 'couple';
  currentDisposableIncome: number;
  expensesAutoCapped: boolean;
}

interface Props {
  modelValue: IncomeExpensesData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: IncomeExpensesData];
  'field-change': [fieldName: string, value: any];
}>();

// Extract individual field values for easier access
const salary = computed(() => props.modelValue.salary);
const partnerSalary = computed(() => props.modelValue.partnerSalary);
const expenses = computed(() => props.modelValue.expenses);
const zeroNetWorthAtDeath = computed(() => props.modelValue.zeroNetWorthAtDeath);
const relationshipStatus = computed(() => props.modelValue.relationshipStatus);
const currentDisposableIncome = computed(() => props.modelValue.currentDisposableIncome);
const expensesAutoCapped = computed(() => props.modelValue.expensesAutoCapped);

// Calculate net incomes (simplified approximation)
const userNetIncome = computed(() => {
  // Simple approximation: ~70% of salary is net after tax and super
  return salary.value * 0.7;
});

const partnerNetIncome = computed(() => {
  // Simple approximation: ~70% of salary is net after tax and super
  return partnerSalary.value * 0.7;
});

// Expense validation logic
const isExpenseFieldValid = computed(() => {
  return validation.isFieldValid('expenses', expenses.value, { 
    zeroNetWorthAtDeath: zeroNetWorthAtDeath.value,
    currentDisposableIncome: currentDisposableIncome.value 
  });
});

const expenseErrorMessage = computed(() => {
  if (zeroNetWorthAtDeath.value) return '';
  if (expenses.value > currentDisposableIncome.value) {
    return `Expenses cannot exceed disposable income of ${formatCurrency(currentDisposableIncome.value)}`;
  }
  return validation.getFieldErrorMessage('expenses');
});

// Setup validation
const validation = useFormValidation();
validation.setupStandardFinancialValidation({
  currentAge: computed(() => 30), // Not needed for this section
  retireAge: computed(() => 65), // Not needed for this section
  deathAge: computed(() => 90), // Not needed for this section
  disposableIncome: currentDisposableIncome,
  zeroNetWorthAtDeath: zeroNetWorthAtDeath
});

// Setup field formatting
const formatting = useFieldFormatting();
formatting.setStandardFinancialRules();

// Field update handlers
const updateField = (fieldName: string, value: any): void => {
  const updated = {
    ...props.modelValue,
    [fieldName]: value
  };
  emit('update:modelValue', updated);
  emit('field-change', fieldName, value);
};

const toggleAutoOptimize = (): void => {
  updateField('zeroNetWorthAtDeath', !zeroNetWorthAtDeath.value);
};

// Event handlers
const handleFieldFocus = (fieldName: string, _event: FocusEvent): void => {
  validation.markFieldTouched(fieldName);
};

const handleFieldBlur = (fieldName: string): void => {
  validation.markFieldTouched(fieldName);
};

const handleFieldEnter = (event: KeyboardEvent): void => {
  const target = event.target as HTMLInputElement;
  target.blur();
};

const handleFieldAdjust = (_fieldName: string, _adjustment: number): void => {
  // Additional logic if needed for adjustments
};
</script>

<style scoped>
.income-expenses-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.label-with-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
  background: var(--border-color);
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-switch.active {
  background: #14b8a6;
}

.toggle-slider {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(1.5rem);
}

.expenses-input.auto-optimized {
  opacity: 0.6;
}

.expenses-input.input-disabled {
  pointer-events: none;
}

.income-summary {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 0.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.summary-breakdown {
  border-top: 1px solid var(--border-color);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.breakdown-row:last-child {
  margin-bottom: 0;
}

.label,
.breakdown-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.breakdown-label {
  font-size: 0.75rem;
  padding-left: 1rem;
}

.value,
.breakdown-value {
  font-weight: 600;
  color: #10b981;
  font-size: 0.875rem;
}

.breakdown-value {
  font-size: 0.75rem;
}

.value.negative {
  color: #ef4444;
}

.validation-error {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #ef4444;
  line-height: 1.3;
}

.validation-warning {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #f59e0b;
  line-height: 1.3;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-label);
}

@media (max-width: 640px) {
  .income-summary {
    padding: 0.75rem;
  }
  
  .summary-row,
  .breakdown-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .value,
  .breakdown-value {
    align-self: flex-end;
  }
  
  .label-with-toggle {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .toggle-switch {
    align-self: flex-end;
  }
}
</style>
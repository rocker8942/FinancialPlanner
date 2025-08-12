<template>
  <div class="advanced-options-form">
    <FormInputWithButtons
      field-id="deathAge"
      label="Age the plan ends"
      :value="deathAge"
      placeholder="Target Age"
      :increment-step="1"
      :is-valid="validation.isFieldValid('deathAge', deathAge, { retireAge })"
      :is-touched="validation.isFieldTouched('deathAge')"
      :error-message="validation.getFieldErrorMessage('deathAge')"
      :format-value="formatting.formatField.bind(null, 'deathAge')"
      :parse-value="formatting.parseField.bind(null, 'deathAge')"
      @update:value="updateField('deathAge', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <FormInputWithButtons
      field-id="propertyGrowthRate"
      label="Property Growth Rate"
      :value="propertyGrowthRate"
      placeholder="Growth Rate (%)"
      help-text="Historic average property appreciation (default: 4%)"
      :increment-step="0.005"
      :is-valid="validation.isFieldValid('propertyGrowthRate', propertyGrowthRate)"
      :is-touched="validation.isFieldTouched('propertyGrowthRate')"
      :error-message="validation.getFieldErrorMessage('propertyGrowthRate')"
      :format-value="formatting.formatField.bind(null, 'propertyGrowthRate')"
      :parse-value="formatting.parseField.bind(null, 'propertyGrowthRate')"
      @update:value="updateField('propertyGrowthRate', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <FormInputWithButtons
      field-id="propertyRentalYield"
      label="Property Rental Yield"
      :value="propertyRentalYield"
      placeholder="Rental Yield (%)"
      help-text="Net rental return after fees and tax (Australian average: 3.3%)"
      :increment-step="0.001"
      :is-valid="validation.isFieldValid('propertyRentalYield', propertyRentalYield)"
      :is-touched="validation.isFieldTouched('propertyRentalYield')"
      :error-message="validation.getFieldErrorMessage('propertyRentalYield')"
      :format-value="formatting.formatField.bind(null, 'propertyRentalYield')"
      :parse-value="formatting.parseField.bind(null, 'propertyRentalYield')"
      @update:value="updateField('propertyRentalYield', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <FormInputWithButtons
      field-id="savingsGrowthRate"
      label="Expected Savings Growth Rate"
      :value="savingsGrowthRate"
      placeholder="Growth Rate (%)"
      help-text="Expected annual return on your investments"
      :increment-step="0.005"
      :is-valid="validation.isFieldValid('savingsGrowthRate', savingsGrowthRate)"
      :is-touched="validation.isFieldTouched('savingsGrowthRate')"
      :error-message="validation.getFieldErrorMessage('savingsGrowthRate')"
      :format-value="formatting.formatField.bind(null, 'savingsGrowthRate')"
      :parse-value="formatting.parseField.bind(null, 'savingsGrowthRate')"
      @update:value="updateField('savingsGrowthRate', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <FormInputWithButtons
      field-id="mortgageRate"
      label="Mortgage Interest Rate"
      :value="mortgageRate"
      placeholder="Mortgage Rate (%)"
      help-text="Annual mortgage interest rate (default: 6%)"
      :increment-step="0.005"
      :is-valid="validation.isFieldValid('mortgageRate', mortgageRate)"
      :is-touched="validation.isFieldTouched('mortgageRate')"
      :error-message="validation.getFieldErrorMessage('mortgageRate')"
      :format-value="formatting.formatField.bind(null, 'mortgageRate')"
      :parse-value="formatting.parseField.bind(null, 'mortgageRate')"
      @update:value="updateField('mortgageRate', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <FormInputWithButtons
      field-id="superannuationRate"
      label="Superannuation Return Rate"
      :value="superannuationRate"
      placeholder="Return Rate (%)"
      help-text="Expected annual return on superannuation (default: 7%)"
      :increment-step="0.005"
      :is-valid="validation.isFieldValid('superannuationRate', superannuationRate)"
      :is-touched="validation.isFieldTouched('superannuationRate')"
      :error-message="validation.getFieldErrorMessage('superannuationRate')"
      :format-value="formatting.formatField.bind(null, 'superannuationRate')"
      :parse-value="formatting.parseField.bind(null, 'superannuationRate')"
      @update:value="updateField('superannuationRate', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <FormInputWithButtons
      field-id="cpiGrowthRate"
      label="Consumer Price Index (CPI) Growth Rate"
      :value="cpiGrowthRate"
      placeholder="CPI Growth Rate (%)"
      help-text="Consumer Price Index growth rate for expense escalation (default: 3%)"
      :increment-step="0.005"
      :is-valid="validation.isFieldValid('cpiGrowthRate', cpiGrowthRate)"
      :is-touched="validation.isFieldTouched('cpiGrowthRate')"
      :error-message="validation.getFieldErrorMessage('cpiGrowthRate')"
      :format-value="formatting.formatField.bind(null, 'cpiGrowthRate')"
      :parse-value="formatting.parseField.bind(null, 'cpiGrowthRate')"
      @update:value="updateField('cpiGrowthRate', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <!-- Growth Rates Summary -->
    <div class="rates-summary">
      <h4 class="summary-title">Growth Assumptions Summary</h4>
      <div class="rates-grid">
        <div class="rate-item">
          <span class="rate-label">Property:</span>
          <span class="rate-value">{{ formatPercentage(propertyGrowthRate) }}</span>
        </div>
        <div class="rate-item">
          <span class="rate-label">Investments:</span>
          <span class="rate-value">{{ formatPercentage(savingsGrowthRate) }}</span>
        </div>
        <div class="rate-item">
          <span class="rate-label">Super:</span>
          <span class="rate-value">{{ formatPercentage(superannuationRate) }}</span>
        </div>
        <div class="rate-item">
          <span class="rate-label">Mortgage:</span>
          <span class="rate-value mortgage">{{ formatPercentage(mortgageRate) }}</span>
        </div>
        <div class="rate-item">
          <span class="rate-label">Inflation:</span>
          <span class="rate-value">{{ formatPercentage(cpiGrowthRate) }}</span>
        </div>
        <div class="rate-item">
          <span class="rate-label">Rental Yield:</span>
          <span class="rate-value">{{ formatPercentage(propertyRentalYield) }}</span>
        </div>
      </div>
      <small class="help-text">
        These assumptions significantly impact your projection. Consider conservative estimates for long-term planning.
      </small>
    </div>

    <!-- Reset to Defaults Button -->
    <div class="form-actions">
      <button 
        type="button" 
        class="reset-defaults-btn"
        @click="resetToDefaults"
        title="Reset all advanced options to recommended defaults"
      >
        Reset to Defaults
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import FormInputWithButtons from './FormInputWithButtons.vue';
import { useFormValidation } from '../../composables/useFormValidation';
import { useFieldFormatting } from '../../composables/useFieldFormatting';
import { formatPercentage } from '../../utils/formatters';

interface AdvancedOptionsData {
  deathAge: number;
  propertyGrowthRate: number;
  propertyRentalYield: number;
  savingsGrowthRate: number;
  mortgageRate: number;
  superannuationRate: number;
  cpiGrowthRate: number;
  retireAge: number; // Needed for death age validation
}

interface Props {
  modelValue: AdvancedOptionsData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: AdvancedOptionsData];
  'field-change': [fieldName: string, value: any];
  'reset-defaults': [];
}>();

// Extract individual field values for easier access
const deathAge = computed(() => props.modelValue.deathAge);
const propertyGrowthRate = computed(() => props.modelValue.propertyGrowthRate);
const propertyRentalYield = computed(() => props.modelValue.propertyRentalYield);
const savingsGrowthRate = computed(() => props.modelValue.savingsGrowthRate);
const mortgageRate = computed(() => props.modelValue.mortgageRate);
const superannuationRate = computed(() => props.modelValue.superannuationRate);
const cpiGrowthRate = computed(() => props.modelValue.cpiGrowthRate);
const retireAge = computed(() => props.modelValue.retireAge);

// Setup validation
const validation = useFormValidation();
validation.setupStandardFinancialValidation({
  currentAge: computed(() => 30), // Not needed for this section
  retireAge: retireAge,
  deathAge: deathAge,
  disposableIncome: computed(() => 0), // Not needed for this section
  zeroNetWorthAtDeath: computed(() => false) // Not needed for this section
});

// Add rental yield validation
validation.addValidationRule({
  fieldName: 'propertyRentalYield',
  validator: (value: number) => typeof value === 'number' && value >= 0 && value <= 0.2, // Max 20%
  errorMessage: 'Rental yield must be between 0% and 20%'
});

// Setup field formatting
const formatting = useFieldFormatting();
formatting.setStandardFinancialRules();

// Add rental yield formatting rule
formatting.updateFormattingRule('propertyRentalYield', {
  type: 'percentage',
  allowNegative: false,
  minValue: 0,
  maxValue: 0.2, // 20%
  decimalPlaces: 1
});

// Default values for reset functionality
const defaultValues = {
  propertyGrowthRate: 0.04, // 4%
  propertyRentalYield: 0.033, // 3.3%
  savingsGrowthRate: 0.025, // 2.5%
  mortgageRate: 0.06, // 6%
  superannuationRate: 0.07, // 7%
  cpiGrowthRate: 0.03, // 3%
};

// Field update handlers
const updateField = (fieldName: string, value: any): void => {
  const updated = {
    ...props.modelValue,
    [fieldName]: value
  };
  emit('update:modelValue', updated);
  emit('field-change', fieldName, value);
};

const resetToDefaults = (): void => {
  // Update multiple fields with default values
  const updated = {
    ...props.modelValue,
    ...defaultValues
  };
  emit('update:modelValue', updated);
  emit('reset-defaults');
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
.advanced-options-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rates-summary {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 0.5rem;
}

.summary-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #d1d5db;
  margin: 0 0 0.75rem 0;
  text-align: center;
}

.rates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}

.rate-label {
  font-size: 0.75rem;
  color: #9ca3af;
}

.rate-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: #10b981;
}

.rate-value.mortgage {
  color: #f59e0b; /* Different color for costs */
}

.help-text {
  display: block;
  font-size: 0.7rem;
  color: #6b7280;
  line-height: 1.4;
  text-align: center;
  font-style: italic;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #374151;
}

.reset-defaults-btn {
  background: #374151;
  border: 1px solid #6b7280;
  color: #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-defaults-btn:hover {
  background: #4b5563;
  border-color: #9ca3af;
  color: #f3f4f6;
}

.reset-defaults-btn:active {
  background: #1f2937;
  transform: translateY(1px);
}

@media (max-width: 640px) {
  .rates-grid {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .rates-summary {
    padding: 0.75rem;
  }
  
  .rate-item {
    padding: 0.125rem 0;
  }
  
  .help-text {
    font-size: 0.65rem;
  }
  
  .reset-defaults-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
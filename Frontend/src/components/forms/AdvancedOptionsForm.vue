<template>
  <div class="advanced-options-form">
    <FormInputWithButtons
      field-id="deathAge"
      :label="$t('form.advanced.death_age_label')"
      :value="deathAge"
      :placeholder="$t('form.advanced.death_age_placeholder')"
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
      :label="$t('form.advanced.property_growth_label')"
      :value="propertyGrowthRate"
      :placeholder="$t('form.advanced.property_growth_label')"
      :help-text="$t('form.advanced.property_growth_help')"
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
      :label="$t('form.advanced.rental_yield_label')"
      :value="propertyRentalYield"
      :placeholder="$t('form.advanced.rental_yield_label')"
      :help-text="$t('form.advanced.rental_yield_help')"
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
      :label="$t('form.advanced.savings_growth_label')"
      :value="savingsGrowthRate"
      :placeholder="$t('form.advanced.savings_growth_label')"
      :help-text="$t('form.advanced.savings_growth_help')"
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
      :label="$t('form.advanced.mortgage_rate_label')"
      :value="mortgageRate"
      :placeholder="$t('form.advanced.mortgage_rate_label')"
      :help-text="$t('form.advanced.mortgage_rate_help')"
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
      v-if="locale !== 'kr'"
      field-id="superannuationRate"
      :label="$t('form.advanced.super_rate_label')"
      :value="superannuationRate"
      :placeholder="$t('form.advanced.super_rate_label')"
      :help-text="$t('form.advanced.super_rate_help')"
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
      :label="$t('form.advanced.cpi_label')"
      :value="cpiGrowthRate"
      :placeholder="$t('form.advanced.cpi_label')"
      :help-text="$t('form.advanced.cpi_help')"
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

    <!-- KR-only: NPS contribution years -->
    <FormInputWithButtons
      v-if="locale === 'kr'"
      field-id="userNpsContributionYears"
      :label="$t('form.advanced.nps_years_label')"
      :value="userNpsContributionYears"
      :placeholder="$t('form.advanced.nps_years_label')"
      :help-text="$t('form.advanced.nps_years_help')"
      :increment-step="1"
      :is-valid="true"
      :is-touched="false"
      :error-message="''"
      :format-value="(v: number) => String(Math.round(v))"
      :parse-value="(v: string) => Math.max(0, Math.min(40, parseInt(v) || 0))"
      @update:value="updateField('userNpsContributionYears', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <FormInputWithButtons
      v-if="locale === 'kr' && relationshipStatus === 'couple'"
      field-id="partnerNpsContributionYears"
      :label="$t('form.advanced.partner_nps_years_label')"
      :value="partnerNpsContributionYears"
      :placeholder="$t('form.advanced.partner_nps_years_label')"
      :help-text="$t('form.advanced.partner_nps_years_help')"
      :increment-step="1"
      :is-valid="true"
      :is-touched="false"
      :error-message="''"
      :format-value="(v: number) => String(Math.round(v))"
      :parse-value="(v: string) => Math.max(0, Math.min(40, parseInt(v) || 0))"
      @update:value="updateField('partnerNpsContributionYears', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <!-- Reset to Defaults Button -->
    <div class="form-actions">
      <button 
        type="button" 
        class="reset-defaults-btn"
        @click="resetToDefaults"
        title="Reset all advanced options to recommended defaults"
      >
        {{ $t('form.advanced.reset_button') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import FormInputWithButtons from './FormInputWithButtons.vue';
import { useFormValidation } from '../../composables/useFormValidation';
import { useFieldFormatting } from '../../composables/useFieldFormatting';
import { useLocaleStore } from '../../store/locale';

const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

interface AdvancedOptionsData {
  deathAge: number;
  propertyGrowthRate: number;
  propertyRentalYield: number;
  savingsGrowthRate: number;
  mortgageRate: number;
  superannuationRate: number;
  cpiGrowthRate: number;
  retireAge: number; // Needed for death age validation
  userNpsContributionYears?: number;
  partnerNpsContributionYears?: number;
}

interface Props {
  modelValue: AdvancedOptionsData;
  relationshipStatus?: 'single' | 'couple';
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: AdvancedOptionsData];
  'field-change': [fieldName: string, value: any];
  'reset-defaults': [];
}>();

const relationshipStatus = computed(() => props.relationshipStatus ?? 'single');

// Extract individual field values for easier access
const deathAge = computed(() => props.modelValue.deathAge);
const propertyGrowthRate = computed(() => props.modelValue.propertyGrowthRate);
const propertyRentalYield = computed(() => props.modelValue.propertyRentalYield);
const savingsGrowthRate = computed(() => props.modelValue.savingsGrowthRate);
const mortgageRate = computed(() => props.modelValue.mortgageRate);
const superannuationRate = computed(() => props.modelValue.superannuationRate);
const cpiGrowthRate = computed(() => props.modelValue.cpiGrowthRate);
const retireAge = computed(() => props.modelValue.retireAge);
const userNpsContributionYears = computed(() => props.modelValue.userNpsContributionYears ?? 0);
const partnerNpsContributionYears = computed(() => props.modelValue.partnerNpsContributionYears ?? 0);

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
  propertyGrowthRate: 0.03, // 3%
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
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 0.5rem;
}

.summary-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-label);
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
  color: var(--text-secondary);
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
  color: var(--text-muted);
  line-height: 1.4;
  text-align: center;
  font-style: italic;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.reset-defaults-btn {
  background: var(--hover-bg);
  border: 1px solid var(--border-input);
  color: var(--text-label);
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-defaults-btn:hover {
  background: var(--border-input);
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

.reset-defaults-btn:active {
  background: var(--bg-card);
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
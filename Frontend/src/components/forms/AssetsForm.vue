<template>
  <div class="assets-form">
    <FormInputWithButtons
      field-id="propertyAssets"
      label="Investment Property"
      :value="propertyAssets"
      placeholder="Investment Property ($)"
      help-text="Real estate, land, and other property investments"
      :increment-step="1000"
      :is-valid="validation.isFieldValid('propertyAssets', propertyAssets)"
      :is-touched="validation.isFieldTouched('propertyAssets')"
      :error-message="validation.getFieldErrorMessage('propertyAssets')"
      :format-value="formatting.formatField.bind(null, 'propertyAssets')"
      :parse-value="formatting.parseField.bind(null, 'propertyAssets')"
      @update:value="updateField('propertyAssets', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <FormInputWithButtons
      field-id="savings"
      label="Current Savings"
      :value="savings"
      placeholder="Savings ($)"
      help-text="Stocks, bonds, savings, and liquid investments"
      :increment-step="1000"
      :is-valid="validation.isFieldValid('savings', savings)"
      :is-touched="validation.isFieldTouched('savings')"
      :error-message="validation.getFieldErrorMessage('savings')"
      :format-value="formatting.formatField.bind(null, 'savings')"
      :parse-value="formatting.parseField.bind(null, 'savings')"
      @update:value="updateField('savings', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <FormInputWithButtons
      field-id="mortgageBalance"
      label="Mortgage Balance"
      :value="mortgageBalance"
      placeholder="Mortgage Balance ($)"
      help-text="Outstanding mortgage debt on property"
      :increment-step="1000"
      :is-valid="validation.isFieldValid('mortgageBalance', mortgageBalance)"
      :is-touched="validation.isFieldTouched('mortgageBalance')"
      :error-message="validation.getFieldErrorMessage('mortgageBalance')"
      :format-value="formatting.formatField.bind(null, 'mortgageBalance')"
      :parse-value="formatting.parseField.bind(null, 'mortgageBalance')"
      @update:value="updateField('mortgageBalance', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <FormInputWithButtons
      field-id="superannuationBalance"
      label="Your Superannuation Balance"
      :value="superannuationBalance"
      placeholder="Superannuation Balance ($)"
      help-text="Current superannuation fund balance"
      :increment-step="1000"
      :is-valid="validation.isFieldValid('superannuationBalance', superannuationBalance)"
      :is-touched="validation.isFieldTouched('superannuationBalance')"
      :error-message="validation.getFieldErrorMessage('superannuationBalance')"
      :format-value="formatting.formatField.bind(null, 'superannuationBalance')"
      :parse-value="formatting.parseField.bind(null, 'superannuationBalance')"
      @update:value="updateField('superannuationBalance', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <FormInputWithButtons
      v-if="relationshipStatus === 'couple'"
      field-id="partnerSuperBalance"
      label="Partner's Superannuation Balance"
      :value="partnerSuperBalance"
      placeholder="Partner Superannuation Balance ($)"
      help-text="Partner's current superannuation fund balance"
      :increment-step="1000"
      :is-valid="validation.isFieldValid('partnerSuperBalance', partnerSuperBalance)"
      :is-touched="validation.isFieldTouched('partnerSuperBalance')"
      :error-message="validation.getFieldErrorMessage('partnerSuperBalance')"
      :format-value="formatting.formatField.bind(null, 'partnerSuperBalance')"
      :parse-value="formatting.parseField.bind(null, 'partnerSuperBalance')"
      @update:value="updateField('partnerSuperBalance', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <!-- Net Wealth Summary -->
    <div class="wealth-summary">
      <div class="summary-row">
        <span class="label">Net Property Wealth:</span>
        <span class="value" :class="{ negative: netPropertyWealth < 0 }">
          {{ formatCurrency(netPropertyWealth) }}
        </span>
      </div>
      <div class="summary-row">
        <span class="label">Total Net Wealth:</span>
        <span class="value total" :class="{ negative: totalNetWealth < 0 }">
          {{ formatCurrency(totalNetWealth) }}
        </span>
      </div>
      <small class="help-text">
        Net wealth = Assets - Mortgage + Superannuation + Savings
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

interface AssetsData {
  propertyAssets: number;
  savings: number;
  mortgageBalance: number;
  superannuationBalance: number;
  partnerSuperBalance: number;
}

interface Props {
  modelValue: AssetsData;
  relationshipStatus?: 'single' | 'couple';
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: AssetsData];
  'field-change': [fieldName: string, value: any];
}>();

// Extract individual field values for easier access
const propertyAssets = computed(() => props.modelValue.propertyAssets);
const savings = computed(() => props.modelValue.savings);
const mortgageBalance = computed(() => props.modelValue.mortgageBalance);
const superannuationBalance = computed(() => props.modelValue.superannuationBalance);
const partnerSuperBalance = computed(() => props.modelValue.partnerSuperBalance);
const relationshipStatus = computed(() => props.relationshipStatus ?? 'single');

// Calculate wealth summaries
const netPropertyWealth = computed(() => propertyAssets.value - mortgageBalance.value);
const totalNetWealth = computed(() =>
  propertyAssets.value + savings.value + superannuationBalance.value + partnerSuperBalance.value - mortgageBalance.value
);

// Setup validation
const validation = useFormValidation();
validation.setupStandardFinancialValidation({
  currentAge: computed(() => 30), // Not needed for this section
  retireAge: computed(() => 65), // Not needed for this section
  deathAge: computed(() => 90), // Not needed for this section
  disposableIncome: computed(() => 0), // Not needed for this section
  zeroNetWorthAtDeath: computed(() => false) // Not needed for this section
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
.assets-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wealth-summary {
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

.summary-row:last-of-type {
  margin-bottom: 0;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
}

.value.total {
  font-size: 1rem;
  font-weight: 700;
}

.value.negative {
  color: #ef4444;
}

.help-text {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
  font-style: italic;
  text-align: center;
}

@media (max-width: 640px) {
  .wealth-summary {
    padding: 0.75rem;
  }
  
  .summary-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .value {
    align-self: flex-end;
  }
  
  .help-text {
    font-size: 0.7rem;
  }
}
</style>
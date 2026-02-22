<template>
  <div class="personal-profile-form">
    <div class="form-group">
      <label>Relationship Status</label>
      <div class="radio-group">
        <label class="radio-label">
          <input 
            type="radio" 
            value="single" 
            :checked="relationshipStatus === 'single'"
            @change="updateRelationshipStatus('single')" 
          />
          <span>Single</span>
        </label>
        <label class="radio-label">
          <input 
            type="radio" 
            value="couple" 
            :checked="relationshipStatus === 'couple'"
            @change="updateRelationshipStatus('couple')" 
          />
          <span>Couple</span>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          :checked="isHomeowner"
          @change="updateHomeownerStatus($event)"
        />
        <span>I own my home</span>
      </label>
      <small class="help-text">Homeowner status affects age pension asset test thresholds</small>
    </div>

    <FormInputWithButtons
      field-id="currentAge"
      label="Current Age"
      :value="currentAge"
      placeholder="Current Age"
      help-text=""
      :increment-step="1"
      :is-valid="validation.isFieldValid('currentAge', currentAge)"
      :is-touched="validation.isFieldTouched('currentAge')"
      :error-message="validation.getFieldErrorMessage('currentAge')"
      :format-value="formatting.formatField.bind(null, 'currentAge')"
      :parse-value="formatting.parseField.bind(null, 'currentAge')"
      @update:value="updateField('currentAge', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <FormInputWithButtons
      field-id="retireAge"
      label="Your Retirement Age"
      :value="retireAge"
      placeholder="Retirement Age"
      help-text="Age when salary income stops"
      :increment-step="1"
      :is-valid="validation.isFieldValid('retireAge', retireAge, { currentAge })"
      :is-touched="validation.isFieldTouched('retireAge')"
      :error-message="validation.getFieldErrorMessage('retireAge')"
      :format-value="formatting.formatField.bind(null, 'retireAge')"
      :parse-value="formatting.parseField.bind(null, 'retireAge')"
      @update:value="updateField('retireAge', $event)"
      @focus="handleFieldFocus"
      @blur="handleFieldBlur"
      @enter="handleFieldEnter"
      @adjust="handleFieldAdjust"
    />

    <!-- Partner Section - only visible for couples -->
    <div v-show="relationshipStatus === 'couple'" class="partner-section">
      <FormInputWithButtons
        field-id="partnerAge"
        label="Partner's Age"
        :value="partnerAge"
        placeholder="Partner's Age"
        :increment-step="1"
        :is-valid="validation.isFieldValid('partnerAge', partnerAge)"
        :is-touched="validation.isFieldTouched('partnerAge')"
        :error-message="validation.getFieldErrorMessage('partnerAge')"
        :format-value="formatting.formatField.bind(null, 'partnerAge')"
        :parse-value="formatting.parseField.bind(null, 'partnerAge')"
        @update:value="updateField('partnerAge', $event)"
        @focus="handleFieldFocus"
        @blur="handleFieldBlur"
        @enter="handleFieldEnter"
        @adjust="handleFieldAdjust"
      />

      <FormInputWithButtons
        field-id="partnerRetireAge"
        label="Partner's Retirement Age"
        :value="partnerRetireAge"
        placeholder="Partner's Retirement Age"
        :increment-step="1"
        :is-valid="validation.isFieldValid('partnerRetireAge', partnerRetireAge, { partnerAge })"
        :is-touched="validation.isFieldTouched('partnerRetireAge')"
        :error-message="validation.getFieldErrorMessage('partnerRetireAge')"
        :format-value="formatting.formatField.bind(null, 'partnerRetireAge')"
        :parse-value="formatting.parseField.bind(null, 'partnerRetireAge')"
        @update:value="updateField('partnerRetireAge', $event)"
        @focus="handleFieldFocus"
        @blur="handleFieldBlur"
        @enter="handleFieldEnter"
        @adjust="handleFieldAdjust"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import FormInputWithButtons from './FormInputWithButtons.vue';
import { useFormValidation } from '../../composables/useFormValidation';
import { useFieldFormatting } from '../../composables/useFieldFormatting';

interface PersonalProfileData {
  currentAge: number;
  retireAge: number;
  partnerAge: number;
  partnerRetireAge: number;
  relationshipStatus: 'single' | 'couple';
  isHomeowner: boolean;
}

interface Props {
  modelValue: PersonalProfileData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: PersonalProfileData];
  'field-change': [fieldName: string, value: any];
}>();

// Extract individual field values for easier access
const currentAge = computed(() => props.modelValue.currentAge);
const retireAge = computed(() => props.modelValue.retireAge);
const partnerAge = computed(() => props.modelValue.partnerAge);
const partnerRetireAge = computed(() => props.modelValue.partnerRetireAge);
const relationshipStatus = computed(() => props.modelValue.relationshipStatus);
const isHomeowner = computed(() => props.modelValue.isHomeowner);

// Setup validation with dynamic rules based on current values
const validation = useFormValidation();
validation.setupStandardFinancialValidation({
  currentAge: currentAge,
  retireAge: retireAge,
  deathAge: computed(() => 90), // Default death age for validation
  disposableIncome: computed(() => 0), // Not needed for this section
  zeroNetWorthAtDeath: computed(() => false) // Not needed for this section
});

// Add partner-specific validation rules
validation.addValidationRule({
  fieldName: 'partnerAge',
  validator: (value: number) => typeof value === 'number' && value >= 18 && value <= 100,
  errorMessage: 'Please enter a valid partner age between 18 and 100'
});

validation.addValidationRule({
  fieldName: 'partnerRetireAge',
  validator: (value: number, allFields?: Record<string, any>) => {
    const pAge = allFields?.partnerAge || partnerAge.value;
    return typeof value === 'number' && value >= pAge && value <= 100;
  },
  errorMessage: 'Partner retirement age must be after current age and before 100'
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

const updateRelationshipStatus = (status: 'single' | 'couple'): void => {
  updateField('relationshipStatus', status);
};

const updateHomeownerStatus = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  updateField('isHomeowner', target.checked);
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
.personal-profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.partner-section {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.radio-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.form-group .radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
  color: var(--text-label);
}

.form-group .radio-label input[type="radio"] {
  width: 1rem;
  height: 1rem;
  accent-color: #14b8a6;
}

.form-group .checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
  color: var(--text-label);
}

.form-group .checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: #14b8a6;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--accent-text);
}

@media (max-width: 640px) {
  .radio-group {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .help-text {
    font-size: 0.75rem;
  }
}
</style>
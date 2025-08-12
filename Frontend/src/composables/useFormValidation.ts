import { ref, computed, type Ref } from 'vue';

export interface ValidationRule {
  fieldName: string;
  validator: (value: any, allFields?: Record<string, any>) => boolean;
  errorMessage: string;
}

export interface FormField {
  value: any;
  isValid: boolean;
  isTouched: boolean;
  errorMessage: string;
}

export function useFormValidation(_initialFields: Record<string, any> = {}) {
  const touchedFields = ref(new Set<string>());
  const validationRules = ref<ValidationRule[]>([]);
  
  // Core validation functions
  const isFieldTouched = (fieldName: string): boolean => {
    return touchedFields.value.has(fieldName);
  };
  
  const markFieldTouched = (fieldName: string): void => {
    touchedFields.value.add(fieldName);
  };
  
  const addValidationRule = (rule: ValidationRule): void => {
    const existingIndex = validationRules.value.findIndex(r => r.fieldName === rule.fieldName);
    if (existingIndex >= 0) {
      validationRules.value[existingIndex] = rule;
    } else {
      validationRules.value.push(rule);
    }
  };
  
  const addValidationRules = (rules: ValidationRule[]): void => {
    rules.forEach(rule => addValidationRule(rule));
  };
  
  const isFieldValid = (fieldName: string, value: any, allFields?: Record<string, any>): boolean => {
    const rule = validationRules.value.find(r => r.fieldName === fieldName);
    if (!rule) return true;
    return rule.validator(value, allFields);
  };
  
  const getFieldErrorMessage = (fieldName: string): string => {
    const rule = validationRules.value.find(r => r.fieldName === fieldName);
    return rule?.errorMessage || '';
  };
  
  const validateAllFields = (fields: Record<string, any>): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    for (const rule of validationRules.value) {
      const fieldValue = fields[rule.fieldName];
      if (!rule.validator(fieldValue, fields)) {
        errors[rule.fieldName] = rule.errorMessage;
        isValid = false;
      }
    }
    
    return { isValid, errors };
  };
  
  // Common validation rule factories
  const createAgeValidationRule = (fieldName: string, min: number = 18, max: number = 100): ValidationRule => ({
    fieldName,
    validator: (value: number) => typeof value === 'number' && value >= min && value <= max,
    errorMessage: `Please enter a valid age between ${min} and ${max}`
  });
  
  const createPositiveNumberRule = (fieldName: string, displayName: string): ValidationRule => ({
    fieldName,
    validator: (value: number) => typeof value === 'number' && value >= 0,
    errorMessage: `${displayName} must be a positive number`
  });
  
  const createPercentageRule = (fieldName: string, displayName: string): ValidationRule => ({
    fieldName,
    validator: (value: number) => typeof value === 'number' && value >= 0 && value <= 1,
    errorMessage: `${displayName} must be between 0% and 100%`
  });
  
  const createRetirementAgeRule = (fieldName: string, currentAgeRef: Ref<number>): ValidationRule => ({
    fieldName,
    validator: (value: number) => typeof value === 'number' && value >= currentAgeRef.value && value <= 100,
    errorMessage: 'Retirement age must be after current age and before 100'
  });
  
  const createDeathAgeRule = (fieldName: string, retireAgeRef: Ref<number>): ValidationRule => ({
    fieldName,
    validator: (value: number) => typeof value === 'number' && value >= retireAgeRef.value && value <= 120,
    errorMessage: 'Life expectancy must be after retirement age and before 120'
  });
  
  const createExpenseValidationRule = (fieldName: string, disposableIncomeRef: Ref<number>, zeroNetWorthRef: Ref<boolean>): ValidationRule => ({
    fieldName,
    validator: (value: number) => {
      return typeof value === 'number' && 
             value >= 0 && 
             (zeroNetWorthRef.value || value <= disposableIncomeRef.value);
    },
    errorMessage: computed(() => `Expenses cannot exceed disposable income of $${disposableIncomeRef.value?.toLocaleString() || 0}`).value
  });
  
  const createRelationshipStatusRule = (fieldName: string): ValidationRule => ({
    fieldName,
    validator: (value: string) => value === 'single' || value === 'couple',
    errorMessage: 'Please select a valid relationship status'
  });
  
  // Setup standard financial form validation rules
  const setupStandardFinancialValidation = (fields: {
    currentAge: Ref<number>;
    retireAge: Ref<number>;
    deathAge: Ref<number>;
    disposableIncome: Ref<number>;
    zeroNetWorthAtDeath: Ref<boolean>;
  }) => {
    const rules: ValidationRule[] = [
      createAgeValidationRule('currentAge'),
      createRetirementAgeRule('retireAge', fields.currentAge),
      createDeathAgeRule('deathAge', fields.retireAge),
      createPositiveNumberRule('propertyAssets', 'Investment Property'),
      createPositiveNumberRule('savings', 'Current Savings'),
      createPositiveNumberRule('superannuationBalance', 'Superannuation Balance'),
      createPositiveNumberRule('salary', 'Annual Salary'),
      createPositiveNumberRule('partnerSalary', 'Partner Salary'),
      createPositiveNumberRule('mortgageBalance', 'Mortgage Balance'),
      createExpenseValidationRule('expenses', fields.disposableIncome, fields.zeroNetWorthAtDeath),
      createPercentageRule('propertyGrowthRate', 'Property Growth Rate'),
      createPercentageRule('savingsGrowthRate', 'Expected Savings Growth Rate'),
      createPercentageRule('mortgageRate', 'Mortgage Interest Rate'),
      createPercentageRule('superannuationRate', 'Superannuation Return Rate'),
      createPercentageRule('cpiGrowthRate', 'Inflation Rate'),
      createRelationshipStatusRule('relationshipStatus')
    ];
    
    addValidationRules(rules);
  };
  
  return {
    touchedFields,
    validationRules,
    isFieldTouched,
    markFieldTouched,
    addValidationRule,
    addValidationRules,
    isFieldValid,
    getFieldErrorMessage,
    validateAllFields,
    createAgeValidationRule,
    createPositiveNumberRule,
    createPercentageRule,
    createRetirementAgeRule,
    createDeathAgeRule,
    createExpenseValidationRule,
    createRelationshipStatusRule,
    setupStandardFinancialValidation
  };
}
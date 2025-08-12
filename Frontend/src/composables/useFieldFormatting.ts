import { ref } from 'vue';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';

export interface FormatterConfig {
  type: 'currency' | 'number' | 'percentage' | 'text';
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  allowNegative?: boolean;
  minValue?: number;
  maxValue?: number;
}

export interface FormattingRules {
  [fieldName: string]: FormatterConfig;
}

export function useFieldFormatting(rules: FormattingRules = {}) {
  const currentFormattingRules = ref<FormattingRules>(rules);

  // Core formatting functions
  const formatValue = (value: any, config: FormatterConfig): string => {
    if (value === null || value === undefined) return '';
    
    switch (config.type) {
      case 'currency':
        return formatCurrency(Number(value));
      case 'number':
        return formatNumber(Number(value));
      case 'percentage':
        return formatPercentage(Number(value));
      case 'text':
      default:
        return String(value);
    }
  };

  const parseValue = (value: string, config: FormatterConfig): any => {
    if (!value || value.trim() === '') return config.type === 'text' ? '' : 0;
    
    switch (config.type) {
      case 'currency':
        return parseCurrencyValue(value, config);
      case 'number':
        return parseNumberValue(value, config);
      case 'percentage':
        return parsePercentageValue(value, config);
      case 'text':
      default:
        return value;
    }
  };

  // Specialized parsing functions
  const parseCurrencyValue = (value: string, config: FormatterConfig): number => {
    // Remove currency symbols, commas, spaces
    const cleaned = value.replace(/[,$\s]/g, '');
    let parsed = parseFloat(cleaned);
    
    if (isNaN(parsed)) return 0;
    
    // Apply constraints
    if (!config.allowNegative && parsed < 0) parsed = 0;
    if (config.minValue !== undefined && parsed < config.minValue) parsed = config.minValue;
    if (config.maxValue !== undefined && parsed > config.maxValue) parsed = config.maxValue;
    
    return parsed;
  };

  const parseNumberValue = (value: string, config: FormatterConfig): number => {
    // Remove commas and spaces, but keep decimal point and potential negative sign
    const cleaned = value.replace(/[,\s]/g, '');
    let parsed = parseFloat(cleaned);
    
    if (isNaN(parsed)) return 0;
    
    // Apply constraints
    if (!config.allowNegative && parsed < 0) parsed = 0;
    if (config.minValue !== undefined && parsed < config.minValue) parsed = config.minValue;
    if (config.maxValue !== undefined && parsed > config.maxValue) parsed = config.maxValue;
    
    return parsed;
  };

  const parsePercentageValue = (value: string, config: FormatterConfig): number => {
    // Remove percentage symbol, commas, spaces
    const cleaned = value.replace(/[%,\s]/g, '');
    let parsed = parseFloat(cleaned);
    
    if (isNaN(parsed)) return 0;
    
    // Convert to decimal (divide by 100)
    parsed = parsed / 100;
    
    // Apply constraints
    if (!config.allowNegative && parsed < 0) parsed = 0;
    if (config.minValue !== undefined && parsed < config.minValue) parsed = config.minValue;
    if (config.maxValue !== undefined && parsed > config.maxValue) parsed = config.maxValue;
    
    return parsed;
  };

  // Field-specific formatting
  const formatField = (fieldName: string, value: any): string => {
    const config = currentFormattingRules.value[fieldName];
    if (!config) {
      // Default formatting based on field name patterns
      return getDefaultFormat(fieldName, value);
    }
    return formatValue(value, config);
  };

  const parseField = (fieldName: string, value: string): any => {
    const config = currentFormattingRules.value[fieldName];
    if (!config) {
      // Default parsing based on field name patterns
      return getDefaultParse(fieldName, value);
    }
    return parseValue(value, config);
  };

  // Default formatting rules based on field naming conventions
  const getDefaultFormat = (fieldName: string, value: any): string => {
    const lowerFieldName = fieldName.toLowerCase();
    
    if (lowerFieldName.includes('rate') || lowerFieldName.includes('yield') || lowerFieldName.includes('growth')) {
      return formatPercentage(Number(value));
    } else if (lowerFieldName.includes('age') || lowerFieldName === 'deathage') {
      return formatNumber(Number(value));
    } else if (lowerFieldName.includes('amount') || lowerFieldName.includes('assets') || 
               lowerFieldName.includes('savings') || lowerFieldName.includes('salary') || 
               lowerFieldName.includes('expenses') || lowerFieldName.includes('balance') || 
               lowerFieldName.includes('mortgage')) {
      return formatCurrency(Number(value));
    } else {
      return String(value);
    }
  };

  const getDefaultParse = (fieldName: string, value: string): any => {
    const lowerFieldName = fieldName.toLowerCase();
    
    if (lowerFieldName.includes('rate') || lowerFieldName.includes('yield') || lowerFieldName.includes('growth')) {
      return parsePercentageValue(value, { type: 'percentage', allowNegative: false, minValue: 0, maxValue: 1 });
    } else if (lowerFieldName.includes('age') || lowerFieldName === 'deathage') {
      return parseNumberValue(value, { type: 'number', allowNegative: false, minValue: 0, maxValue: 120 });
    } else if (lowerFieldName.includes('amount') || lowerFieldName.includes('assets') || 
               lowerFieldName.includes('savings') || lowerFieldName.includes('salary') || 
               lowerFieldName.includes('expenses') || lowerFieldName.includes('balance') || 
               lowerFieldName.includes('mortgage')) {
      return parseCurrencyValue(value, { type: 'currency', allowNegative: false, minValue: 0 });
    } else {
      return value;
    }
  };

  // Standard financial form formatting rules
  const getStandardFinancialRules = (): FormattingRules => ({
    currentAge: { type: 'number', allowNegative: false, minValue: 18, maxValue: 100 },
    retireAge: { type: 'number', allowNegative: false, minValue: 18, maxValue: 100 },
    deathAge: { type: 'number', allowNegative: false, minValue: 18, maxValue: 120 },
    partnerAge: { type: 'number', allowNegative: false, minValue: 18, maxValue: 100 },
    partnerRetireAge: { type: 'number', allowNegative: false, minValue: 18, maxValue: 100 },
    propertyAssets: { type: 'currency', allowNegative: false, minValue: 0 },
    savings: { type: 'currency', allowNegative: false, minValue: 0 },
    superannuationBalance: { type: 'currency', allowNegative: false, minValue: 0 },
    salary: { type: 'currency', allowNegative: false, minValue: 0 },
    partnerSalary: { type: 'currency', allowNegative: false, minValue: 0 },
    expenses: { type: 'currency', allowNegative: false, minValue: 0 },
    mortgageBalance: { type: 'currency', allowNegative: false, minValue: 0 },
    propertyGrowthRate: { type: 'percentage', allowNegative: false, minValue: 0, maxValue: 1 },
    savingsGrowthRate: { type: 'percentage', allowNegative: false, minValue: 0, maxValue: 1 },
    mortgageRate: { type: 'percentage', allowNegative: false, minValue: 0, maxValue: 1 },
    superannuationRate: { type: 'percentage', allowNegative: false, minValue: 0, maxValue: 1 },
    cpiGrowthRate: { type: 'percentage', allowNegative: false, minValue: 0, maxValue: 1 },
    propertyRentalYield: { type: 'percentage', allowNegative: false, minValue: 0, maxValue: 1 },
    relationshipStatus: { type: 'text' }
  });

  // Validation helpers
  const validateFormattedValue = (fieldName: string, value: string): boolean => {
    const config = currentFormattingRules.value[fieldName];
    if (!config) return true;
    
    try {
      const parsed = parseValue(value, config);
      
      // Additional validation based on type
      if (config.type === 'number' || config.type === 'currency' || config.type === 'percentage') {
        const num = Number(parsed);
        if (isNaN(num)) return false;
        if (!config.allowNegative && num < 0) return false;
        if (config.minValue !== undefined && num < config.minValue) return false;
        if (config.maxValue !== undefined && num > config.maxValue) return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  const getFieldConstraints = (fieldName: string): { min?: number; max?: number; allowNegative?: boolean } => {
    const config = currentFormattingRules.value[fieldName];
    if (!config) return {};
    
    return {
      min: config.minValue,
      max: config.maxValue,
      allowNegative: config.allowNegative
    };
  };

  // Rule management
  const updateFormattingRule = (fieldName: string, config: FormatterConfig): void => {
    currentFormattingRules.value[fieldName] = config;
  };

  const updateFormattingRules = (rules: FormattingRules): void => {
    currentFormattingRules.value = { ...currentFormattingRules.value, ...rules };
  };

  const setStandardFinancialRules = (): void => {
    currentFormattingRules.value = getStandardFinancialRules();
  };

  return {
    // Core formatting
    formatValue,
    parseValue,
    formatField,
    parseField,
    
    // Specialized parsing
    parseCurrencyValue,
    parseNumberValue,
    parsePercentageValue,
    
    // Default handling
    getDefaultFormat,
    getDefaultParse,
    
    // Standard rules
    getStandardFinancialRules,
    setStandardFinancialRules,
    
    // Validation
    validateFormattedValue,
    getFieldConstraints,
    
    // Rule management
    currentFormattingRules,
    updateFormattingRule,
    updateFormattingRules
  };
}
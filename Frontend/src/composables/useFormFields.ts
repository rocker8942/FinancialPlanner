import { ref, watch, type Ref } from 'vue';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';

export interface FieldConfig {
  name: string;
  defaultValue: number | string | boolean;
  formatType: 'currency' | 'number' | 'percentage' | 'text';
  incrementStep?: number;
}

export interface FormFieldState {
  value: Ref<any>;
  formattedValue: Ref<string>;
  isFocused: boolean;
  isTouched: boolean;
}

export function useFormFields(fieldConfigs: FieldConfig[]) {
  // Core field state
  const fields = ref<Record<string, any>>({});
  const formattedFields = ref<Record<string, string>>({});
  const focusedFields = ref(new Set<string>());
  const touchedFields = ref(new Set<string>());
  
  // Continuous adjustment state
  const continuousAdjustmentState = ref<{
    interval: number | null;
    timeout: number | null;
    fieldName: string | null;
    adjustment: number;
  }>({
    interval: null,
    timeout: null,
    fieldName: null,
    adjustment: 0
  });

  // Initialize fields based on configuration
  const initializeFields = () => {
    fieldConfigs.forEach(config => {
      fields.value[config.name] = ref(config.defaultValue);
      formattedFields.value[config.name] = formatFieldValue(config.defaultValue, config.formatType);
    });
  };

  // Field formatting utilities
  const formatFieldValue = (value: any, formatType: string): string => {
    switch (formatType) {
      case 'currency':
        return typeof value === 'number' ? formatCurrency(value) : '0';
      case 'number':
        return typeof value === 'number' ? formatNumber(value) : '0';
      case 'percentage':
        return typeof value === 'number' ? formatPercentage(value) : '0%';
      case 'text':
      default:
        return String(value);
    }
  };

  const parseFieldValue = (value: string, formatType: string): any => {
    switch (formatType) {
      case 'currency':
      case 'number':
        return parseFormattedNumber(value);
      case 'percentage':
        return parsePercentageValue(value);
      case 'text':
      default:
        return value;
    }
  };

  // Parse numeric value from formatted string
  const parseFormattedNumber = (value: string): number => {
    const cleaned = value.replace(/[,$%]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Parse percentage value and convert to decimal
  const parsePercentageValue = (value: string): number => {
    const cleaned = value.replace(/[,%]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed / 100;
  };

  // Field state management
  const getFieldValue = (fieldName: string): any => {
    return fields.value[fieldName]?.value;
  };

  const setFieldValue = (fieldName: string, value: any): void => {
    if (fields.value[fieldName]) {
      fields.value[fieldName].value = value;
    }
  };

  const getFormattedValue = (fieldName: string): string => {
    return formattedFields.value[fieldName] || '';
  };

  const setFormattedValue = (fieldName: string, value: string): void => {
    formattedFields.value[fieldName] = value;
  };

  // Focus and blur handlers
  const onFocus = (fieldName: string, event: FocusEvent): void => {
    focusedFields.value.add(fieldName);
    const target = event.target as HTMLInputElement;
    target.select(); // Select all text for easy editing
  };

  const onBlur = (fieldName: string): void => {
    focusedFields.value.delete(fieldName);
    touchedFields.value.add(fieldName);
    
    const config = fieldConfigs.find(c => c.name === fieldName);
    if (!config) return;

    // Parse the formatted value and update the actual value
    const formattedValue = formattedFields.value[fieldName];
    const parsedValue = parseFieldValue(formattedValue, config.formatType);
    
    // Ensure non-negative values for numeric fields
    const validatedValue = (config.formatType === 'currency' || config.formatType === 'number') && typeof parsedValue === 'number'
      ? Math.max(0, parsedValue)
      : parsedValue;
    
    setFieldValue(fieldName, validatedValue);
    // Update formatted value with validated value
    formattedFields.value[fieldName] = formatFieldValue(validatedValue, config.formatType);
  };

  const onEnter = (event: KeyboardEvent): void => {
    const target = event.target as HTMLInputElement;
    target.blur(); // Trigger blur to accept value
  };

  // Value adjustment for increment/decrement buttons
  const adjustValue = (fieldName: string, adjustment: number): void => {
    const currentValue = getFieldValue(fieldName);
    const newValue = Math.max(0, (typeof currentValue === 'number' ? currentValue : 0) + adjustment);
    setFieldValue(fieldName, newValue);
    
    // Update formatted value if not currently focused
    if (!focusedFields.value.has(fieldName)) {
      const config = fieldConfigs.find(c => c.name === fieldName);
      if (config) {
        formattedFields.value[fieldName] = formatFieldValue(newValue, config.formatType);
      }
    }
  };

  // Continuous adjustment for held buttons
  const startContinuousAdjustment = (fieldName: string, adjustment: number): void => {
    if (continuousAdjustmentState.value.interval) return;
    
    continuousAdjustmentState.value.fieldName = fieldName;
    continuousAdjustmentState.value.adjustment = adjustment;
    
    // Start after a delay
    continuousAdjustmentState.value.timeout = window.setTimeout(() => {
      continuousAdjustmentState.value.interval = window.setInterval(() => {
        if (continuousAdjustmentState.value.fieldName) {
          adjustValue(continuousAdjustmentState.value.fieldName, continuousAdjustmentState.value.adjustment);
        }
      }, 100); // Adjust every 100ms
    }, 500); // Start after 500ms hold
  };

  const stopContinuousAdjustment = (): void => {
    if (continuousAdjustmentState.value.timeout) {
      clearTimeout(continuousAdjustmentState.value.timeout);
      continuousAdjustmentState.value.timeout = null;
    }
    if (continuousAdjustmentState.value.interval) {
      clearInterval(continuousAdjustmentState.value.interval);
      continuousAdjustmentState.value.interval = null;
    }
    continuousAdjustmentState.value.fieldName = null;
    continuousAdjustmentState.value.adjustment = 0;
  };

  // Field state utilities
  const isFieldFocused = (fieldName: string): boolean => {
    return focusedFields.value.has(fieldName);
  };

  const isFieldTouched = (fieldName: string): boolean => {
    return touchedFields.value.has(fieldName);
  };

  const markFieldTouched = (fieldName: string): void => {
    touchedFields.value.add(fieldName);
  };

  const resetField = (fieldName: string): void => {
    const config = fieldConfigs.find(c => c.name === fieldName);
    if (config) {
      setFieldValue(fieldName, config.defaultValue);
      formattedFields.value[fieldName] = formatFieldValue(config.defaultValue, config.formatType);
      focusedFields.value.delete(fieldName);
      touchedFields.value.delete(fieldName);
    }
  };

  const resetAllFields = (): void => {
    fieldConfigs.forEach(config => {
      resetField(config.name);
    });
  };

  // Watch for value changes and update formatted strings when not focused
  const setupFieldWatchers = (): void => {
    fieldConfigs.forEach(config => {
      if (fields.value[config.name]) {
        watch(fields.value[config.name], (newValue) => {
          if (!focusedFields.value.has(config.name)) {
            formattedFields.value[config.name] = formatFieldValue(newValue, config.formatType);
          }
        });
      }
    });
  };

  // Get all field values as plain object
  const getAllFieldValues = (): Record<string, any> => {
    const result: Record<string, any> = {};
    fieldConfigs.forEach(config => {
      result[config.name] = getFieldValue(config.name);
    });
    return result;
  };

  // Set multiple field values
  const setMultipleFieldValues = (values: Record<string, any>): void => {
    Object.entries(values).forEach(([fieldName, value]) => {
      setFieldValue(fieldName, value);
      const config = fieldConfigs.find(c => c.name === fieldName);
      if (config) {
        formattedFields.value[fieldName] = formatFieldValue(value, config.formatType);
      }
    });
  };

  // Initialize everything
  initializeFields();
  setupFieldWatchers();

  return {
    // Core state
    fields: fields.value,
    formattedFields: formattedFields.value,
    focusedFields,
    touchedFields,
    continuousAdjustmentState,
    
    // Field operations
    getFieldValue,
    setFieldValue,
    getFormattedValue,
    setFormattedValue,
    getAllFieldValues,
    setMultipleFieldValues,
    
    // Event handlers
    onFocus,
    onBlur,
    onEnter,
    adjustValue,
    startContinuousAdjustment,
    stopContinuousAdjustment,
    
    // Field state utilities
    isFieldFocused,
    isFieldTouched,
    markFieldTouched,
    resetField,
    resetAllFields,
    
    // Formatting utilities
    formatFieldValue,
    parseFieldValue,
    parseFormattedNumber,
    parsePercentageValue
  };
}
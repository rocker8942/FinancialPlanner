/**
 * Core financial data types and interfaces - re-exported from shared-calculations.
 * FormFieldConfig is the only Frontend-specific type kept here.
 */
export * from 'shared-calculations';

// Form field configuration for validation and formatting (Frontend-only)
export interface FormFieldConfig {
  name: string;
  type: 'currency' | 'number' | 'percentage' | 'text';
  minValue?: number;
  maxValue?: number;
  required?: boolean;
  defaultValue?: any;
}

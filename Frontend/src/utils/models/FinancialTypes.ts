/**
 * Core financial data types and interfaces
 * Extracted from financialPlan.ts for better organization
 */

// Core financial profile interface
export interface FinancialProfile {
  // Assets
  propertyAssets: number;
  savings: number;
  mortgageBalance: number;
  superannuationBalance: number;
  
  // Rates
  mortgageRate: number;
  superannuationRate: number;
  savingsGrowthRate: number;
  propertyGrowthRate: number;
  propertyRentalYield: number; // Net rental return after fees and tax
  cpiGrowthRate: number;
  
  // Income and expenses
  salary: number;
  partnerSalary: number;
  expenses: number;
  
  // Demographics
  currentAge: number;
  retireAge: number;
  deathAge: number;
  partnerAge: number; // Partner's current age
  partnerRetireAge: number; // Partner's desired retirement age
  relationshipStatus: 'single' | 'couple';
  isHomeowner: boolean;
  
  // Pension (calculated dynamically but included for completeness)
  pensionAmount: number;
  pensionStartAge: number;
  partnerPensionAmount: number;
  partnerPensionStartAge: number;
}

// Yearly wealth projection data
export interface YearlyWealth {
  age: number;
  wealth: number;
  propertyAssets: number;
  savings: number;
  rawSavings: number; // Just the savings amount without super or mortgage
  superannuationBalance: number;
  mortgageBalance: number;
  inflationAdjustedWealth: number;
  inflationAdjustedPropertyAssets: number;
  inflationAdjustedSavings: number;
  pensionIncome: number;
  totalIncome: number; // This will show gross income in the table
  expenses: number;
  
  // Internal tax tracking fields (not displayed in table)
  grossIncome?: number;
  incomeTax?: number;
  medicareLevy?: number;
  netIncome?: number;
  superContributionsTax?: number;
}

// Financial plan calculation result
export interface FinancialPlanResult {
  projection: YearlyWealth[];
  finalWealth: number;
  finalNetSavings: number;
  summary: string;
}

// Asset state for calculations
export interface AssetState {
  propertyAssets: number;
  savings: number;
  mortgageBalance: number;
  superannuationBalance: number;
}

// Income calculation components
export interface IncomeComponents {
  // Employment income
  grossEmploymentIncome: number;
  netEmploymentIncome: number;
  totalSuperContributions: number;
  totalPackageAmount: number;
  
  // Pension income
  userPension: number;
  partnerPension: number;
  totalPensionIncome: number;
  
  // Other income
  rentalIncome: number;
  
  // Total income figures
  displayTotalIncome: number; // For table display
  spendableIncome: number; // Actual spendable after tax
  
  // Tax information
  taxBreakdown: TaxBreakdown;
}

// Tax calculation breakdown
export interface TaxBreakdown {
  grossIncome: number;
  incomeTax: number;
  medicareLevy: number;
  netIncome: number;
  superContributionsTax: number;
}

// Cash flow processing result
export interface CashFlowResult {
  updatedAssets: AssetState;
  shortfall: number;
  mortgageInterestPaid: number;
  mortgagePrincipalPaid: number;
  expensesFromAssets: number;
}

// Expense optimization result
export interface OptimizationResult {
  optimalExpense: number;
  finalWealth: number;
  iterations: number;
  converged: boolean;
}

// Lifetime income calculation components
export interface LifetimeIncomeComponents {
  totalSalaryIncome: number;
  totalPartnerSalaryIncome: number;
  totalPensionIncome: number;
  totalRentalIncome: number;
  totalLifetimeIncome: number;
}

// Validation result for expenses
export interface ExpenseValidationResult {
  isReasonable: boolean;
  adjustedExpense: number;
  reason: string;
}

// Asset growth calculation result
export interface AssetGrowthResult {
  updatedAssets: AssetState;
  inflationAdjustedValues: {
    inflationAdjustmentFactor: number;
    inflationAdjustedWealth: number;
    inflationAdjustedPropertyAssets: number;
    inflationAdjustedNetSavings: number;
  };
}

// Form field configuration for validation and formatting
export interface FormFieldConfig {
  name: string;
  type: 'currency' | 'number' | 'percentage' | 'text';
  minValue?: number;
  maxValue?: number;
  required?: boolean;
  defaultValue?: any;
}

// Storage format for form data
export interface StoredFinancialData {
  propertyAssets: number;
  savings: number;
  mortgageBalance: number;
  mortgageRate: number;
  superannuationBalance: number;
  superannuationRate: number;
  salary: number;
  partnerSalary: number;
  expenses: number;
  currentAge: number;
  retireAge: number;
  deathAge: number;
  savingsGrowthRate: number;
  propertyGrowthRate: number;
  propertyRentalYield: number;
  cpiGrowthRate: number;
  pensionAmount: number;
  pensionStartAge: number;
  partnerPensionAmount: number;
  partnerPensionStartAge: number;
  partnerAge: number;
  partnerRetireAge: number;
  relationshipStatus: 'single' | 'couple';
  isHomeowner: boolean;
}
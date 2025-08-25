import type { FinancialProfile, AssetState, CashFlowResult } from '../models/FinancialTypes';

/**
 * Process expenses and cash flow for a given year
 */
export function processExpensesAndCashFlow(
  profile: FinancialProfile,
  age: number,
  assetState: AssetState,
  spendableIncome: number,
  cpiAdjustedExpenses: number,
  isFirstYear: boolean = false
): CashFlowResult {
  // For the first year, we still process income and expenses, but we only apply 
  // the net change to avoid double-counting initial assets
  const updatedAssets = { ...assetState };
  let shortfall = 0;
  let mortgageInterestPaid = 0;
  let mortgagePrincipalPaid = 0;
  let expensesFromAssets = 0;

  if (isFirstYear) {
    // Preserve initial asset state for first year
    updatedAssets.savings = assetState.savings;
    updatedAssets.mortgageBalance = assetState.mortgageBalance;
    updatedAssets.superannuationBalance = assetState.superannuationBalance;

    return {
      updatedAssets,
      shortfall,
      mortgageInterestPaid,
      mortgagePrincipalPaid,
      expensesFromAssets
    };
  }

  // Calculate disposable income after expenses using spendable income (not total package)
  let remainingDisposableIncome = Math.max(0, spendableIncome - cpiAdjustedExpenses);

  let mortgageInterest = 0;
  if (updatedAssets.mortgageBalance > 0)
  {
    // Calculate interest on net mortgage (mortgage - savings offset, but not less than 0)
    const netMortgage = Math.max(0, updatedAssets.mortgageBalance - updatedAssets.savings);
    mortgageInterest = netMortgage * profile.mortgageRate;
  }

  // Use disposable income to pay mortgage interest first
  if (mortgageInterest > 0 && remainingDisposableIncome > 0) {
    mortgageInterestPaid = Math.min(remainingDisposableIncome, mortgageInterest);
    remainingDisposableIncome -= mortgageInterestPaid;
    mortgageInterest -= mortgageInterestPaid;
  }

  const remainingMortgageInterest = mortgageInterest;

  // Use remaining disposable income to reduce mortgage principal first, then add to savings
  if (updatedAssets.mortgageBalance > 0 && remainingDisposableIncome > 0) {
    mortgagePrincipalPaid = Math.min(remainingDisposableIncome, updatedAssets.mortgageBalance);
    updatedAssets.mortgageBalance -= mortgagePrincipalPaid;
    remainingDisposableIncome -= mortgagePrincipalPaid;
  }

  // Add any remaining disposable income to savings
  updatedAssets.savings += remainingDisposableIncome;

  // If disposable income was insufficient to cover expenses, deduct shortfall from savings/super
  const expenseShortfall =   cpiAdjustedExpenses + remainingMortgageInterest - spendableIncome;
  if (expenseShortfall > 0) {
    const assetDrawdown = processExpenseShortfall(
      updatedAssets,
      expenseShortfall,
      age
    );
    
    updatedAssets.savings = assetDrawdown.updatedAssets.savings;
    updatedAssets.superannuationBalance = assetDrawdown.updatedAssets.superannuationBalance;
    shortfall = assetDrawdown.remainingShortfall;
    expensesFromAssets = assetDrawdown.expensesFromAssets;
  }

  // Ensure superannuation balance is not negative
  updatedAssets.superannuationBalance = Math.max(0, updatedAssets.superannuationBalance);

  // SPECIAL HANDLING FOR FIRST YEAR: If this is the first year, we need to preserve
  // the initial asset state but still account for the cash flow changes.
  // The issue was that first year was completely ignored, which meant that people 
  // retiring at their current age never got their income/expense processing.
  if (isFirstYear) {
    // Calculate the net cash flow change and apply only that change
    const netCashFlowChange = remainingDisposableIncome - expensesFromAssets;
    
    return {
      updatedAssets: {
        ...assetState, // Start with original state
        savings: assetState.savings + netCashFlowChange, // Apply only the net change
        mortgageBalance: updatedAssets.mortgageBalance, // Mortgage payments are real changes
        superannuationBalance: assetState.superannuationBalance // Keep original super balance in first year
      },
      shortfall,
      mortgageInterestPaid,
      mortgagePrincipalPaid,
      expensesFromAssets
    };
  }

  return {
    updatedAssets,
    shortfall,
    mortgageInterestPaid,
    mortgagePrincipalPaid,
    expensesFromAssets
  };
}

/**
 * Process expense shortfall by drawing from assets
 */
function processExpenseShortfall(
  assetState: AssetState,
  expenseShortfall: number,
  age: number,
  superAccessAge: number = 60
): {
  updatedAssets: AssetState;
  remainingShortfall: number;
  expensesFromAssets: number;
} {
  const updatedAssets = { ...assetState };
  let remainingShortfall = expenseShortfall;
  let expensesFromAssets = 0;

  // First try to cover shortfall from savings
  const expenseFromSavings = Math.max(0, Math.min(remainingShortfall, updatedAssets.savings));
  updatedAssets.savings -= expenseFromSavings;
  remainingShortfall -= expenseFromSavings;
  expensesFromAssets += expenseFromSavings;
  
  // If there are remaining expenses and superannuation is available, deduct from super
  // Note: In Australia, super can only be accessed at preservation age (60+) 
  // Early access for hardship requires special circumstances and APRA approval
  if (remainingShortfall > 0 && updatedAssets.superannuationBalance > 0 && age >= superAccessAge) {
    const expenseFromSuper = Math.min(remainingShortfall, updatedAssets.superannuationBalance);
    updatedAssets.superannuationBalance -= expenseFromSuper;
    remainingShortfall -= expenseFromSuper;
    expensesFromAssets += expenseFromSuper;
  }

  // Allow savings to go negative for the remaining shortfall (tracking debt)
  if (remainingShortfall > 0) {
    updatedAssets.savings -= remainingShortfall;
    // Note: This creates negative savings to track the debt, but we don't double-count the expense
  }

  return {
    updatedAssets,
    remainingShortfall,
    expensesFromAssets
  };
}

/**
 * Calculate CPI-adjusted expenses for a given year
 */
export function calculateCpiAdjustedExpenses(
  baseExpenses: number,
  cpiGrowthRate: number,
  yearsFromStart: number
): number {
  return baseExpenses * Math.pow(1 + cpiGrowthRate, yearsFromStart);
}

/**
 * Calculate net mortgage after savings offset
 */
export function calculateNetMortgage(mortgageBalance: number, savings: number): number {
  return Math.max(0, mortgageBalance - savings);
}

/**
 * Calculate mortgage interest for a year
 */
export function calculateMortgageInterest(
  mortgageBalance: number,
  savings: number,
  mortgageRate: number
): number {
  const netMortgage = calculateNetMortgage(mortgageBalance, savings);
  return netMortgage * mortgageRate;
}

/**
 * Check if expenses can be covered by available income and assets
 */
export function canCoverExpenses(
  spendableIncome: number,
  expenses: number,
  assetState: AssetState,
  age: number,
  superAccessAge: number = 60
): {
  canCover: boolean;
  incomeShortfall: number;
  totalAvailableForExpenses: number;
} {
  const incomeShortfall = Math.max(0, expenses - spendableIncome);
  
  if (incomeShortfall === 0) {
    return {
      canCover: true,
      incomeShortfall: 0,
      totalAvailableForExpenses: spendableIncome
    };
  }

  // Calculate total available from assets
  let availableFromAssets = assetState.savings;
  
  // Add super if accessible
  if (age >= superAccessAge) {
    availableFromAssets += assetState.superannuationBalance;
  }

  const totalAvailableForExpenses = spendableIncome + availableFromAssets;
  const canCover = totalAvailableForExpenses >= expenses;

  return {
    canCover,
    incomeShortfall,
    totalAvailableForExpenses
  };
}
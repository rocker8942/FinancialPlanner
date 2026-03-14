import type { FinancialProfile, AssetState } from '../models/FinancialTypes';

/**
 * Apply growth to assets for one year
 */
export function applyAssetGrowth(
  currentState: AssetState,
  profile: FinancialProfile,
  isFirstYear: boolean = false
): AssetState {
  // Don't apply growth in the first year
  if (isFirstYear) {
    return { ...currentState };
  }

  const newState = { ...currentState };

  // Apply property growth
  newState.propertyAssets = applyGrowthRate(currentState.propertyAssets, profile.propertyGrowthRate);

  // Apply savings growth only if net savings (savings - mortgage) is positive
  const netSavings = currentState.savings - currentState.mortgageBalance;
  if (netSavings > 0) {
    newState.savings = currentState.savings + (netSavings * profile.savingsGrowthRate);
  }

  // Apply superannuation growth (user and partner)
  newState.superannuationBalance = applyGrowthRate(currentState.superannuationBalance, profile.superannuationRate);
  newState.partnerSuperBalance = applyGrowthRate(currentState.partnerSuperBalance, profile.superannuationRate);

  return newState;
}

/**
 * Apply a growth rate to a value
 */
function applyGrowthRate(currentValue: number, growthRate: number): number {
  return currentValue * (1 + growthRate);
}

/**
 * Calculate net financial assets (savings - mortgage + super + partner super)
 */
export function calculateNetFinancialAssets(state: AssetState): number {
  return state.savings - state.mortgageBalance + state.superannuationBalance + state.partnerSuperBalance;
}

/**
 * Calculate total net wealth (property + net financial assets)
 */
export function calculateTotalNetWealth(state: AssetState): number {
  const netFinancialAssets = calculateNetFinancialAssets(state);
  return state.propertyAssets + netFinancialAssets;
}

/**
 * Calculate inflation-adjusted values
 */
export function calculateInflationAdjustedValues(
  state: AssetState,
  cpiGrowthRate: number,
  yearsFromStart: number
): {
  inflationAdjustmentFactor: number;
  inflationAdjustedWealth: number;
  inflationAdjustedPropertyAssets: number;
  inflationAdjustedNetSavings: number;
} {
  const inflationAdjustmentFactor = Math.pow(1 + cpiGrowthRate, -yearsFromStart);
  const netFinancialAssets = calculateNetFinancialAssets(state);
  const totalWealth = calculateTotalNetWealth(state);

  return {
    inflationAdjustmentFactor,
    inflationAdjustedWealth: totalWealth * inflationAdjustmentFactor,
    inflationAdjustedPropertyAssets: state.propertyAssets * inflationAdjustmentFactor,
    inflationAdjustedNetSavings: netFinancialAssets * inflationAdjustmentFactor
  };
}

/**
 * Check if assets can cover shortfall (for expense coverage)
 */
export function canCoverExpenseShortfall(
  state: AssetState,
  shortfall: number,
  age: number,
  superAccessAge: number = 60
): {
  canCover: boolean;
  fromSavings: number;
  fromSuper: number;
  remaining: number;
} {
  let remainingShortfall = shortfall;
  let fromSavings = 0;
  let fromSuper = 0;

  // First try to cover from savings
  const expenseFromSavings = Math.min(remainingShortfall, state.savings);
  fromSavings = expenseFromSavings;
  remainingShortfall -= expenseFromSavings;

  // If there are remaining expenses and superannuation is available, deduct from super
  // Note: In Australia, super can only be accessed at preservation age (60+)
  if (remainingShortfall > 0 && state.superannuationBalance > 0 && age >= superAccessAge) {
    const expenseFromSuper = Math.min(remainingShortfall, state.superannuationBalance);
    fromSuper = expenseFromSuper;
    remainingShortfall -= expenseFromSuper;
  }

  return {
    canCover: remainingShortfall <= 0,
    fromSavings,
    fromSuper,
    remaining: Math.max(0, remainingShortfall)
  };
}

/**
 * Apply expense shortfall to assets (reduce savings and super as needed)
 */
export function applyExpenseShortfall(
  state: AssetState,
  shortfall: number,
  age: number,
  superAccessAge: number = 60
): AssetState {
  const coverage = canCoverExpenseShortfall(state, shortfall, age, superAccessAge);
  
  const newState = { ...state };
  
  // Deduct from savings
  newState.savings = Math.max(0, state.savings - coverage.fromSavings);
  
  // Deduct from super if accessible
  if (age >= superAccessAge) {
    newState.superannuationBalance = Math.max(0, state.superannuationBalance - coverage.fromSuper);
  }

  return newState;
}
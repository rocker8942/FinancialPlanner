import type { FinancialProfile } from '../types.js';
import type { ICountryConfig } from '../countryConfig.js';
import { auCountryConfig } from '../countries/au/index.js';
import { optimizeExpenseToZeroNetWorth } from './expenseOptimizer.js';
import { calculateTotalAvailableResources, hasMeaningfulIncomeStreams } from './lifetimeIncomeCalculator.js';

/**
 * Calculate optimal annual expense to reach zero net worth at death
 * This is the new orchestrator version of calculateExpenseToZeroNetWorth
 */
export function calculateExpenseToZeroNetWorthModular(
  profileInput: FinancialProfile,
  countryConfig: ICountryConfig = auCountryConfig
): number {
  const years = profileInput.deathAge - profileInput.currentAge;

  // Handle edge cases
  if (years < 1) return profileInput.expenses;

  // Get total available resources
  const totalAvailableResources = calculateTotalAvailableResources(profileInput, countryConfig);

  // Handle case with no meaningful resources
  if (totalAvailableResources <= 0) {
    return 0; // Cannot spend what doesn't exist
  }

  // Special case: if no meaningful income streams or assets
  if (!hasMeaningfulIncomeStreams(profileInput, countryConfig)) {
    const base = countryConfig.defaults.currencyBaseAmount;
    const roughPensionEstimate = estimateRoughPensionIncome(profileInput, base);
    if (roughPensionEstimate < base * 1.5) {
      return Math.max(0, Math.round(roughPensionEstimate / years * 0.8));
    }
  }

  // If total available is very small, use simple calculation
  if (totalAvailableResources < countryConfig.defaults.currencyBaseAmount * 0.5) {
    return Math.max(0, Math.round(totalAvailableResources / years));
  }

  // Use the sophisticated optimization algorithm
  const optimizationResult = optimizeExpenseToZeroNetWorth(profileInput, undefined, undefined, countryConfig);

  // Return the optimized expense amount
  return optimizationResult.optimalExpense;
}

/**
 * Rough estimation of pension income for edge case handling
 */
function estimateRoughPensionIncome(profile: FinancialProfile, currencyBase: number): number {
  const pensionEligibleYears = Math.max(0, profile.deathAge - 67);
  if (pensionEligibleYears <= 0) return 0;

  let roughAnnualPension = profile.relationshipStatus === 'single'
    ? currencyBase * 2.5  // ~$25K AUD or ~₩25M KRW
    : currencyBase * 3.8; // ~$38K AUD or ~₩38M KRW

  const roughAssets = profile.savings + profile.superannuationBalance + profile.propertyAssets - profile.mortgageBalance;
  if (roughAssets > currencyBase * 50) {
    roughAnnualPension *= 0.05;
  } else if (roughAssets > currencyBase * 10) {
    roughAnnualPension *= 0.5;
  }

  return roughAnnualPension * pensionEligibleYears;
}

/**
 * Validate that the calculated expense is reasonable
 */
export function validateCalculatedExpense(
  profile: FinancialProfile,
  calculatedExpense: number,
  countryConfig: ICountryConfig = auCountryConfig
): {
  isReasonable: boolean;
  adjustedExpense: number;
  reason: string;
} {
  const totalResources = calculateTotalAvailableResources(profile, countryConfig);
  const years = profile.deathAge - profile.currentAge;

  if (years <= 0) {
    return {
      isReasonable: false,
      adjustedExpense: 0,
      reason: 'Invalid time period'
    };
  }

  // Check if expense is reasonable relative to resources
  const totalExpenseOverLifetime = calculatedExpense * years;

  // If calculated expense would consume more than 120% of available resources
  if (totalExpenseOverLifetime > totalResources * 1.2) {
    const adjustedExpense = Math.round(totalResources * 0.9 / years);
    return {
      isReasonable: false,
      adjustedExpense,
      reason: 'Calculated expense exceeds available resources'
    };
  }

  // If calculated expense is unreasonably low given resources
  if (totalExpenseOverLifetime < totalResources * 0.3 && totalResources > 50000) {
    const adjustedExpense = Math.round(totalResources * 0.6 / years);
    return {
      isReasonable: false,
      adjustedExpense,
      reason: 'Calculated expense is too conservative'
    };
  }

  return {
    isReasonable: true,
    adjustedExpense: calculatedExpense,
    reason: 'Expense calculation is reasonable'
  };
}

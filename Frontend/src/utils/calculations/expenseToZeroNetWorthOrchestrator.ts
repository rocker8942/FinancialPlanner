import type { FinancialProfile } from '../models/FinancialTypes';
import { optimizeExpenseToZeroNetWorth } from './expenseOptimizer';
import { calculateTotalAvailableResources, hasMeaningfulIncomeStreams } from './lifetimeIncomeCalculator';

/**
 * Calculate optimal annual expense to reach zero net worth at death
 * This is the new orchestrator version of calculateExpenseToZeroNetWorth
 */
export function calculateExpenseToZeroNetWorthModular(profileInput: FinancialProfile): number {
  const years = profileInput.deathAge - profileInput.currentAge;
  
  // Handle edge cases
  if (years <= 0) return profileInput.expenses;
  if (years < 1) return profileInput.expenses;
  
  // Get total available resources
  const totalAvailableResources = calculateTotalAvailableResources(profileInput);
  
  // Handle case with no meaningful resources
  if (totalAvailableResources <= 0) {
    return 0; // Cannot spend what doesn't exist
  }
  
  // Special case: if no meaningful income streams or assets
  if (!hasMeaningfulIncomeStreams(profileInput)) {
    // Even if there's some pension income, without other assets or income streams,
    // practical spendable amount might be minimal
    const roughPensionEstimate = estimateRoughPensionIncome(profileInput);
    if (roughPensionEstimate < 15000) { // Very low pension income threshold
      return Math.max(0, Math.round(roughPensionEstimate / years * 0.8)); // Conservative pension spending
    }
  }
  
  // If total available is very small (less than $5000), use simple calculation
  if (totalAvailableResources < 5000) {
    return Math.max(0, Math.round(totalAvailableResources / years));
  }
  
  // Use the sophisticated optimization algorithm
  const optimizationResult = optimizeExpenseToZeroNetWorth(profileInput);
  
  // Return the optimized expense amount
  return optimizationResult.optimalExpense;
}

/**
 * Rough estimation of pension income for edge case handling
 */
function estimateRoughPensionIncome(profile: FinancialProfile): number {
  // Very rough estimate - assume some basic age pension if eligible
  const pensionEligibleYears = Math.max(0, profile.deathAge - 67); // Pension starts at 67
  
  if (pensionEligibleYears <= 0) return 0;
  
  // Rough estimate based on relationship status
  let roughAnnualPension = 0;
  if (profile.relationshipStatus === 'single') {
    roughAnnualPension = 25000; // Rough single pension amount
  } else {
    roughAnnualPension = 38000; // Rough combined couple pension amount
  }
  
  // Reduce if significant assets (very rough asset test)
  const roughAssets = profile.savings + profile.superannuationBalance + profile.propertyAssets - profile.mortgageBalance;
  if (roughAssets > 100000) {
    roughAnnualPension *= 0.5; // Rough reduction for asset test
  }
  if (roughAssets > 500000) {
    roughAnnualPension *= 0.1; // Major reduction for high assets
  }
  
  return roughAnnualPension * pensionEligibleYears;
}

/**
 * Validate that the calculated expense is reasonable
 */
export function validateCalculatedExpense(
  profile: FinancialProfile,
  calculatedExpense: number
): {
  isReasonable: boolean;
  adjustedExpense: number;
  reason: string;
} {
  const totalResources = calculateTotalAvailableResources(profile);
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
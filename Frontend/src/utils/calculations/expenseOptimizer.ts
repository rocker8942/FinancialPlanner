import type { FinancialProfile, OptimizationResult } from '../models/FinancialTypes';
import { calculateFinancialPlanModular } from './financialPlanOrchestrator';
import { calculateTotalAvailableResources, hasMeaningfulIncomeStreams, calculateAverageAnnualIncome } from './lifetimeIncomeCalculator';

/**
 * Optimize expenses using binary search to reach zero net worth at death
 */
export function optimizeExpenseToZeroNetWorth(
  profile: FinancialProfile,
  maxIterations: number = 50,
  tolerance: number = 0.01
): OptimizationResult {
  const years = profile.deathAge - profile.currentAge;
  
  // Handle edge cases
  if (years <= 0) {
    return {
      optimalExpense: profile.expenses,
      finalWealth: 0,
      iterations: 0,
      converged: false
    };
  }

  if (years < 1) {
    return {
      optimalExpense: profile.expenses,
      finalWealth: 0,
      iterations: 0,
      converged: false
    };
  }

  // Calculate bounds for binary search
  const searchBounds = calculateOptimizationBounds(profile);
  
  if (searchBounds.low >= searchBounds.high) {
    return {
      optimalExpense: searchBounds.low,
      finalWealth: 0,
      iterations: 0,
      converged: false
    };
  }

  // Perform binary search optimization
  return performBinarySearchOptimization(
    profile,
    searchBounds.low,
    searchBounds.high,
    maxIterations,
    tolerance
  );
}

/**
 * Calculate appropriate bounds for binary search optimization
 */
function calculateOptimizationBounds(profile: FinancialProfile): { low: number; high: number } {
  const years = profile.deathAge - profile.currentAge;
  const totalAvailableResources = calculateTotalAvailableResources(profile);
  
  // Handle case with very limited resources
  if (totalAvailableResources <= 0) {
    return { low: 0, high: 0 };
  }
  
  // Special case: if total available is very small (less than $5000)
  if (totalAvailableResources < 5000) {
    const simpleAverage = Math.max(0, totalAvailableResources / years);
    return { low: 0, high: simpleAverage * 1.5 };
  }
  
  // Check for meaningful income streams
  if (!hasMeaningfulIncomeStreams(profile)) {
    // Very conservative bounds for limited income scenarios
    const conservativeHigh = Math.min(totalAvailableResources / years * 0.8, 15000);
    return { low: 0, high: conservativeHigh };
  }
  
  // Calculate reasonable bounds based on available resources and income
  const averageAnnualIncome = calculateAverageAnnualIncome(profile);
  
  // Set a reasonable upper bound that accounts for assets and income
  // Use a multiplier to allow for scenarios where we can "spend down" assets plus income
  const minimumUpperBound = Math.max(averageAnnualIncome * 1.5, 10000); // At least $10k or 1.5x average annual income
  const upperBound = Math.max(minimumUpperBound, totalAvailableResources / years * 3);
  
  return {
    low: 0,
    high: upperBound
  };
}

/**
 * Perform binary search to find optimal expense
 */
function performBinarySearchOptimization(
  profile: FinancialProfile,
  initialLow: number,
  initialHigh: number,
  maxIterations: number,
  tolerance: number
): OptimizationResult {
  let low = initialLow;
  let high = initialHigh;
  let bestExpense = 0;
  let bestFinalWealth = Infinity;
  let iterations = 0;

  for (let i = 0; i < maxIterations; i++) {
    iterations = i + 1;
    const mid = (low + high) / 2;
    
    // Test this expense level
    const testProfile = { ...profile, expenses: mid };
    const plan = calculateFinancialPlanModular(testProfile);
    
    // Check if any point goes negative during the plan (asset depletion)
    const minWealth = Math.min(...plan.projection.map(y => y.savings));
    const finalNetWorth = plan.finalNetSavings;
    
    // Track the best result so far
    if (Math.abs(finalNetWorth) < Math.abs(bestFinalWealth)) {
      bestExpense = mid;
      bestFinalWealth = finalNetWorth;
    }
    
    // Check convergence
    if (Math.abs(high - low) < tolerance) {
      break;
    }
    
    if (minWealth < 0) {
      // Went negative during the plan, spending too much
      high = mid;
    } else if (finalNetWorth > tolerance) {
      // Final net worth is positive, can afford to spend more
      bestExpense = mid;
      low = mid;
    } else if (finalNetWorth < -tolerance) {
      // Final net worth is significantly negative, spending too much
      high = mid;
    } else {
      // Final net worth is very close to zero - this could be our target
      bestExpense = mid;
      if (finalNetWorth > 0) {
        low = mid; // Try to spend a bit more
      } else {
        high = mid; // Try to spend a bit less
      }
    }
  }

  // Fallback validation
  const result = validateOptimizationResult(profile, bestExpense, bestFinalWealth);
  
  return {
    optimalExpense: result.expense,
    finalWealth: result.finalWealth,
    iterations,
    converged: Math.abs(high - low) < tolerance
  };
}

/**
 * Validate and potentially adjust optimization result
 */
function validateOptimizationResult(
  profile: FinancialProfile,
  bestExpense: number,
  bestFinalWealth: number
): { expense: number; finalWealth: number } {
  const totalAvailableResources = calculateTotalAvailableResources(profile);
  const years = profile.deathAge - profile.currentAge;
  
  // If binary search resulted in 0 but we have income, use simple calculation
  if (bestExpense <= 0 && hasMeaningfulIncomeStreams(profile)) {
    const averageIncome = calculateAverageAnnualIncome(profile);
    // Use a conservative approach: spend average annual income but preserve some buffer
    const fallbackExpense = Math.min(averageIncome * 0.8, totalAvailableResources / years * 0.9);
    return {
      expense: Math.max(0, Math.round(fallbackExpense)),
      finalWealth: 0 // Estimate
    };
  }
  
  // Final sanity check: ensure the result is reasonable
  let finalExpense = Math.max(0, Math.round(bestExpense));
  
  // Additional validation: if we still have 0 but significant resources, return a minimum
  if (finalExpense === 0 && totalAvailableResources > 10000) {
    finalExpense = Math.round(totalAvailableResources / years * 0.5); // Conservative 50% of average available per year
  }
  
  return {
    expense: finalExpense,
    finalWealth: bestFinalWealth
  };
}

/**
 * Quick validation check - can the proposed expense be supported?
 */
export function canSupportExpenseLevel(
  profile: FinancialProfile,
  proposedExpense: number
): boolean {
  const testProfile = { ...profile, expenses: proposedExpense };
  const plan = calculateFinancialPlanModular(testProfile);
  
  // Check if assets go negative at any point
  const minWealth = Math.min(...plan.projection.map(y => y.savings));
  
  return minWealth >= 0;
}

/**
 * Get expense level that would deplete assets at a specific age
 */
export function getExpenseForAssetDepletionAge(
  profile: FinancialProfile,
  targetDepletionAge: number,
  maxIterations: number = 30
): number {
  if (targetDepletionAge <= profile.currentAge || targetDepletionAge > profile.deathAge) {
    return 0;
  }
  
  // Create a modified profile with earlier death age
  const modifiedProfile = { ...profile, deathAge: targetDepletionAge };
  
  const result = optimizeExpenseToZeroNetWorth(modifiedProfile, maxIterations);
  return result.optimalExpense;
}
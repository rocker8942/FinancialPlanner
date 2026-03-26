import type { FinancialProfile, OptimizationResult } from '../types.js';
import { calculateFinancialPlanModular } from './financialPlanOrchestrator.js';
import { calculateTotalAvailableResources, hasMeaningfulIncomeStreams, calculateAverageAnnualIncome } from './lifetimeIncomeCalculator.js';

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
  
  // Calculate a reasonable upper bound that prevents unrealistic scenarios
  // For someone with a mortgage, they can't sustainably spend more than their gross income
  let upperBound = Math.max(averageAnnualIncome * 1.5, 10000); // At least $10k or 1.5x average annual income
  
  // If there are significant assets, allow higher spending by drawing down assets
  if (totalAvailableResources > averageAnnualIncome * 5) {
    upperBound = Math.max(upperBound, totalAvailableResources / years * 2);
  }
  
  // Remove the hard income cap - let the optimization algorithm find the true optimal expense
  // The debt serviceability constraints in the binary search will provide appropriate limits
  // Income caps were preventing the algorithm from truly optimizing for zero net worth at death
  
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
  let iterations = 0;
  let optimalExpense = 0;
  let optimalFinalWealth = Infinity;
  
  for (let i = 0; i < maxIterations; i++) {
    iterations = i + 1;
    const mid = (low + high) / 2;
    
    // Test this expense level
    const testProfile = { ...profile, expenses: mid };
    const plan = calculateFinancialPlanModular(testProfile);
    
    const finalNetWorth = plan.finalNetSavings;
    
    // Check cash flow sustainability during working years
    const workingYears = plan.projection.filter(y => y.age <= profile.retireAge);
    let maxAnnualDeficit = 0;
    let totalDeficit = 0;
    
    workingYears.forEach(year => {
      const deficit = Math.max(0, year.expenses - year.totalIncome);
      maxAnnualDeficit = Math.max(maxAnnualDeficit, deficit);
      totalDeficit += deficit;
    });
    
    const currentIncome = profile.salary + (profile.partnerSalary || 0);
    
    // Cash flow sustainability limits:
    // 1. Annual deficit shouldn't exceed 20% of current income
    // 2. Total cumulative deficit during working years shouldn't exceed 200% of current super balance
    const maxAllowableAnnualDeficit = currentIncome * 0.20; // 20% of income
    const maxAllowableTotalDeficit = profile.superannuationBalance * 2.0; // 200% of super
    
    const isCashFlowSustainable = maxAnnualDeficit <= maxAllowableAnnualDeficit && 
                                   totalDeficit <= maxAllowableTotalDeficit;
    
    // Track the result closest to zero net worth, but only if cash flow is sustainable
    if (isCashFlowSustainable && Math.abs(finalNetWorth) < Math.abs(optimalFinalWealth)) {
      optimalExpense = mid;
      optimalFinalWealth = finalNetWorth;
    }
    
    // Check convergence
    if (Math.abs(high - low) < tolerance) {
      break;
    }
    
    // Modified binary search logic that considers cash flow sustainability
    if (!isCashFlowSustainable) {
      // Cash flow not sustainable, reduce expense
      high = mid;
    } else if (finalNetWorth > tolerance) {
      // Cash flow sustainable and still have wealth left, can increase expense
      low = mid;
    } else if (finalNetWorth < -tolerance) {
      // Spending creates negative final wealth, reduce expense
      high = mid;
    } else {
      // Very close to zero net worth and sustainable - we found our target
      optimalExpense = mid;
      break;
    }
  }
  
  // If we couldn't find a sustainable solution, use the best compromise
  if (optimalExpense === 0) {
    optimalExpense = initialHigh * 0.8;
    optimalFinalWealth = calculateFinancialPlanModular({ ...profile, expenses: optimalExpense }).finalNetSavings;
  }

  // Fallback validation and final safety check
  const result = validateOptimizationResult(profile, optimalExpense, optimalFinalWealth);
  
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
    let fallbackExpense = Math.min(averageIncome * 0.8, totalAvailableResources / years * 0.9);
    
    // Remove income cap from fallback - let optimization work properly
    
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
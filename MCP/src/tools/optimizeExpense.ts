import type { FinancialProfile, OptimizationResult } from 'shared-calculations';
import { optimizeExpenseToZeroNetWorth, calculateExpenseToZeroNetWorthModular } from 'shared-calculations';

/**
 * Find optimal annual expense that depletes wealth to zero at death age
 */
export function optimizeExpense(profile: FinancialProfile): OptimizationResult {
  return optimizeExpenseToZeroNetWorth(profile);
}

/**
 * Quick calculation of optimal expense using the orchestrator
 */
export function findOptimalExpense(profile: FinancialProfile): number {
  return calculateExpenseToZeroNetWorthModular(profile);
}

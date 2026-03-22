import type { FinancialProfile, OptimizationResult } from '../types.js';
import { optimizeExpenseToZeroNetWorth } from '../calculations/expenseOptimizer.js';
import { calculateExpenseToZeroNetWorthModular } from '../calculations/expenseToZeroNetWorthOrchestrator.js';

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

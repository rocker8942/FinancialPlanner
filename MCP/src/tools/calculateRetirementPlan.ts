import type { FinancialProfile, FinancialPlanResult } from '../types.js';
import { calculateFinancialPlanModular } from '../calculations/financialPlanOrchestrator.js';

/**
 * Execute retirement plan calculation and return formatted result
 */
export function calculateRetirementPlan(profile: FinancialProfile): FinancialPlanResult {
  return calculateFinancialPlanModular(profile);
}

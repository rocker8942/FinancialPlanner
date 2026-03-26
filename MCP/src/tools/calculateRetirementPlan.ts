import type { FinancialProfile, FinancialPlanResult } from 'shared-calculations';
import { calculateFinancialPlanModular } from 'shared-calculations';

/**
 * Execute retirement plan calculation and return formatted result
 */
export function calculateRetirementPlan(profile: FinancialProfile): FinancialPlanResult {
  return calculateFinancialPlanModular(profile);
}

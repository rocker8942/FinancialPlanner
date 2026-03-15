import { getAgePensionAmounts } from '../services/agePensionService';
import { calculateNetIncome } from './taxCalculation';
import type { FinancialProfile } from './models/FinancialTypes';

// Re-export types for easier importing
export type { FinancialProfile, YearlyWealth, FinancialPlanResult } from './models/FinancialTypes';

// Re-export expense optimization functions
export { optimizeExpenseToZeroNetWorth as calculateExpenseToZeroNetWorth } from './calculations/expenseOptimizer';

/**
 * Calculate current disposable income (net income after taxes but before expenses)
 */
export function calculateDisposableIncome(profile: FinancialProfile): number {
  let totalDisposableIncome = 0;
  
  // Calculate user's net income from salary (after taxes)
  if (profile.salary > 0) {
    // Input salary includes super (12% of total package)
    const userSuperContributions = profile.salary * 0.12;
    const userTaxableIncome = profile.salary - userSuperContributions;
    const userNetIncome = calculateNetIncome(userTaxableIncome);
    totalDisposableIncome += userNetIncome;
  }
  
  // Calculate partner's net income from salary (after taxes)
  if (profile.relationshipStatus === 'couple' && profile.partnerSalary > 0) {
    // Input salary includes super (12% of total package)
    const partnerSuperContributions = profile.partnerSalary * 0.12;
    const partnerTaxableIncome = profile.partnerSalary - partnerSuperContributions;
    const partnerNetIncome = calculateNetIncome(partnerTaxableIncome);
    totalDisposableIncome += partnerNetIncome;
  }
  
  // Add rental income (assumed net after taxes and expenses)
  if (profile.propertyAssets > 0) {
    const rentalIncome = profile.propertyAssets * profile.propertyRentalYield;
    totalDisposableIncome += rentalIncome;
  }
  
  // Add pension income (generally tax-free due to low amounts)
  const pensionAmounts = getAgePensionAmounts({
    relationshipStatus: profile.relationshipStatus,
    isHomeowner: profile.isHomeowner,
    propertyAssets: profile.propertyAssets,
    savings: profile.savings,
    superannuation: profile.superannuationBalance,
    mortgageBalance: profile.mortgageBalance,
    userSalary: profile.salary,
    partnerSalary: profile.partnerSalary,
    userAge: profile.currentAge,
    partnerAge: profile.partnerAge
  });
  
  totalDisposableIncome += pensionAmounts.userPension + pensionAmounts.partnerPension;
  
  return Math.max(0, totalDisposableIncome);
}

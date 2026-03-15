import type { FinancialProfile, LifetimeIncomeComponents } from '../models/FinancialTypes';
import { getAgePensionAmounts } from '../../services/agePensionService';

/**
 * Calculate total lifetime income for expense optimization
 */
export function calculateLifetimeIncome(profile: FinancialProfile): LifetimeIncomeComponents {
  const years = profile.deathAge - profile.currentAge;
  
  if (years <= 0) {
    return {
      totalSalaryIncome: 0,
      totalPartnerSalaryIncome: 0,
      totalPensionIncome: 0,
      totalRentalIncome: 0,
      totalLifetimeIncome: 0
    };
  }

  // Calculate employment income with CPI growth
  const salaryIncome = calculateLifetimeSalaryIncome(profile);
  const partnerSalaryIncome = calculateLifetimePartnerSalaryIncome(profile);
  
  // Calculate approximate rental income over lifetime
  const rentalIncome = calculateLifetimeRentalIncome(profile, years);
  
  // Calculate pension income over lifetime
  const pensionIncome = calculateLifetimePensionIncome(profile);
  
  const totalLifetimeIncome = salaryIncome + partnerSalaryIncome + pensionIncome + rentalIncome;
  
  return {
    totalSalaryIncome: salaryIncome,
    totalPartnerSalaryIncome: partnerSalaryIncome,
    totalPensionIncome: pensionIncome,
    totalRentalIncome: rentalIncome,
    totalLifetimeIncome
  };
}

/**
 * Calculate lifetime salary income with CPI growth
 */
function calculateLifetimeSalaryIncome(profile: FinancialProfile): number {
  const workingYears = Math.max(0, Math.min(profile.retireAge, profile.deathAge) - profile.currentAge);
  let totalSalaryIncome = 0;
  
  // Sum CPI-adjusted salaries over working years
  for (let i = 0; i < workingYears; i++) {
    const cpiAdjustedSalary = profile.salary * Math.pow(1 + profile.cpiGrowthRate, i);
    totalSalaryIncome += cpiAdjustedSalary;
  }
  
  return totalSalaryIncome;
}

/**
 * Calculate lifetime partner salary income with CPI growth
 */
function calculateLifetimePartnerSalaryIncome(profile: FinancialProfile): number {
  if (profile.relationshipStatus !== 'couple') return 0;
  
  const partnerRetireAgeInUserTimeline = profile.currentAge + (profile.partnerRetireAge - profile.partnerAge);
  const partnerWorkingYears = Math.max(0, Math.min(partnerRetireAgeInUserTimeline, profile.deathAge) - profile.currentAge);
  let totalPartnerSalaryIncome = 0;
  
  // Sum CPI-adjusted partner salaries over working years
  for (let i = 0; i < partnerWorkingYears; i++) {
    const cpiAdjustedPartnerSalary = profile.partnerSalary * Math.pow(1 + profile.cpiGrowthRate, i);
    totalPartnerSalaryIncome += cpiAdjustedPartnerSalary;
  }
  
  return totalPartnerSalaryIncome;
}

/**
 * Calculate approximate rental income over lifetime
 * Note: This uses current property value for simplicity in optimization calculations
 */
function calculateLifetimeRentalIncome(profile: FinancialProfile, years: number): number {
  return profile.propertyAssets * profile.propertyRentalYield * years;
}

/**
 * Calculate lifetime pension income (approximation for optimization)
 */
function calculateLifetimePensionIncome(profile: FinancialProfile): number {
  let totalPensionIncome = 0;
  
  // Calculate approximate pension income over the lifetime
  for (let age = profile.currentAge; age < profile.deathAge; age++) {
    const currentPartnerAge = profile.partnerAge + (age - profile.currentAge);
    const yearsFromStart = age - profile.currentAge;
    
    // Use CPI-adjusted salaries for pension calculations
    const cpiAdjustedUserSalary = profile.salary * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
    const cpiAdjustedPartnerSalary = profile.partnerSalary * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
    
    const currentUserSalary = age <= profile.retireAge ? cpiAdjustedUserSalary : 0;
    const partnerRetireAgeInUserTimeline = profile.currentAge + (profile.partnerRetireAge - profile.partnerAge);
    const currentPartnerSalary = age <= partnerRetireAgeInUserTimeline ? cpiAdjustedPartnerSalary : 0;
    
    // Use average asset values for approximation (this is simplified for optimization)
    const avgSavings = profile.savings;
    const avgSuper = profile.superannuationBalance;
    const avgMortgage = Math.max(0, profile.mortgageBalance * (1 - (age - profile.currentAge) / (profile.deathAge - profile.currentAge)));
    
    // CPI adjustment factor for both asset test thresholds and pension amounts
    const cpiAdjustmentFactor = Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);

    const pensionAmounts = getAgePensionAmounts({
      relationshipStatus: profile.relationshipStatus,
      isHomeowner: profile.isHomeowner,
      propertyAssets: profile.propertyAssets,
      savings: avgSavings,
      superannuation: avgSuper,
      mortgageBalance: avgMortgage,
      userSalary: currentUserSalary,
      partnerSalary: currentPartnerSalary,
      userAge: age,
      partnerAge: currentPartnerAge,
      cpiAdjustmentFactor
    });

    // Apply CPI growth to pension amounts
    const annualUserPension = pensionAmounts.userPension * cpiAdjustmentFactor;
    const annualPartnerPension = pensionAmounts.partnerPension * cpiAdjustmentFactor;
    
    totalPensionIncome += annualUserPension + annualPartnerPension;
  }
  
  return totalPensionIncome;
}

/**
 * Calculate total available resources (assets + lifetime income)
 */
export function calculateTotalAvailableResources(profile: FinancialProfile): number {
  const currentAssets = profile.savings - profile.mortgageBalance + profile.superannuationBalance;
  const lifetimeIncome = calculateLifetimeIncome(profile);
  
  return Math.max(0, currentAssets + lifetimeIncome.totalLifetimeIncome);
}

/**
 * Estimate average annual income over lifetime
 */
export function calculateAverageAnnualIncome(profile: FinancialProfile): number {
  const years = profile.deathAge - profile.currentAge;
  if (years <= 0) return 0;
  
  const lifetimeIncome = calculateLifetimeIncome(profile);
  return lifetimeIncome.totalLifetimeIncome / years;
}

/**
 * Check if the profile has meaningful income streams
 */
export function hasMeaningfulIncomeStreams(profile: FinancialProfile): boolean {
  const lifetimeIncome = calculateLifetimeIncome(profile);
  const currentAssets = profile.savings - profile.mortgageBalance + profile.superannuationBalance;
  
  // Consider it meaningful if:
  // 1. Has significant salary income, OR
  // 2. Has significant pension income, OR  
  // 3. Has significant current assets, OR
  // 4. Has rental income
  return lifetimeIncome.totalSalaryIncome > 50000 || 
         lifetimeIncome.totalPartnerSalaryIncome > 50000 ||
         lifetimeIncome.totalPensionIncome > 15000 ||
         currentAssets > 10000 ||
         lifetimeIncome.totalRentalIncome > 10000;
}
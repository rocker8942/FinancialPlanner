import type { FinancialProfile, YearlyWealth } from '../models/FinancialTypes';
import { getAgePensionAmounts } from '../../services/agePensionService';
import { calculateNetIncome, getTaxBreakdown, calculateNetSuperContributions } from '../taxCalculation';

interface YearlyProjectionState {
  propertyAssets: number;
  savings: number;
  mortgageBalance: number;
  superannuationBalance: number;
}

interface YearlyProjectionResult extends YearlyProjectionState {
  projectionData: YearlyWealth;
}

/**
 * Calculate financial projection for a single year
 */
export function calculateYearlyProjection(
  profile: FinancialProfile,
  age: number,
  currentState: YearlyProjectionState
): YearlyProjectionResult {
  const yearsFromStart = age - profile.currentAge;
  const isFirstYear = age === profile.currentAge;
  
  // CPI-adjusted expenses for this year
  const cpiAdjustedExpenses = profile.expenses * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
  
  // Calculate current partner age
  const currentPartnerAge = profile.partnerAge + yearsFromStart;
  
  // Apply CPI growth to salaries each year
  const cpiAdjustedUserSalary = profile.salary * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
  const cpiAdjustedPartnerSalary = profile.partnerSalary * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
  
  // Determine if salaries are active based on retirement ages
  const currentUserSalary = age <= profile.retireAge ? cpiAdjustedUserSalary : 0;
  const partnerRetireAgeInUserTimeline = profile.currentAge + (profile.partnerRetireAge - profile.partnerAge);
  const currentPartnerSalary = age <= partnerRetireAgeInUserTimeline ? cpiAdjustedPartnerSalary : 0;
  
  // Calculate CPI adjustment factor for asset test thresholds (compound growth from base year 2025)
  const cpiAdjustmentFactor = Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
  
  // Get pension amounts for this year
  const pensionAmounts = getAgePensionAmounts(
    profile.relationshipStatus,
    profile.isHomeowner,
    currentState.propertyAssets,
    currentState.savings,
    currentState.superannuationBalance,
    currentState.mortgageBalance,
    currentUserSalary,
    currentPartnerSalary,
    age,
    currentPartnerAge,
    cpiAdjustmentFactor
  );
  
  // Apply CPI adjustment to pension amounts (age pension typically increases with CPI)
  const cpiAdjustedUserPension = pensionAmounts.userPension * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
  const cpiAdjustedPartnerPension = pensionAmounts.partnerPension * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
  const totalPensionIncome = cpiAdjustedUserPension + cpiAdjustedPartnerPension;
  
  // Calculate rental income from investment properties (based on grown property value)
  const rentalIncome = currentState.propertyAssets * profile.propertyRentalYield;
  
  // Calculate employment income - user input is total package including super
  let grossEmploymentIncome = 0; // This will be taxable income (after super carved out)
  let totalSuperContributions = 0;
  let totalPackageAmount = 0; // This will be displayed as "Total Income"
  
  // Process user salary if not retired
  if (age <= profile.retireAge && currentUserSalary > 0) {
    const userTotalPackage = currentUserSalary; // Total package amount
    // Calculate super contributions as 12% of total package
    const userSuperContributions = userTotalPackage * 0.12;
    // Taxable income = total package - super contribution
    const userTaxableIncome = userTotalPackage - userSuperContributions;
    
    grossEmploymentIncome += userTaxableIncome;
    totalSuperContributions += userSuperContributions;
    totalPackageAmount += userTotalPackage;
    
    // Add net super contributions to balance (after tax) only if not first year
    if (!isFirstYear) {
      const netSuperContributions = calculateNetSuperContributions(
        userSuperContributions, 
        userTaxableIncome
      );
      currentState.superannuationBalance += netSuperContributions;
    }
  }

  // Process partner salary if couple and not retired
  if (profile.relationshipStatus === 'couple' && age <= partnerRetireAgeInUserTimeline && currentPartnerSalary > 0) {
    const partnerTotalPackage = currentPartnerSalary; // Total package amount
    // Calculate super contributions as 12% of total package
    const partnerSuperContributions = partnerTotalPackage * 0.12;
    // Taxable income = total package - super contribution
    const partnerTaxableIncome = partnerTotalPackage - partnerSuperContributions;
    
    grossEmploymentIncome += partnerTaxableIncome;
    totalSuperContributions += partnerSuperContributions;
    totalPackageAmount += partnerTotalPackage;
    
    // Add net partner super contributions to balance (after tax) only if not first year
    if (!isFirstYear) {
      const netPartnerSuperContributions = calculateNetSuperContributions(
        partnerSuperContributions, 
        partnerTaxableIncome
      );
      currentState.superannuationBalance += netPartnerSuperContributions;
    }
  }

  // Calculate net employment income after tax (for actual spending)
  const netEmploymentIncome = grossEmploymentIncome > 0 ? calculateNetIncome(grossEmploymentIncome) : 0;
  
  // Total package income for display purposes (what shows in "Total Income" column)
  const displayTotalIncome = totalPackageAmount + totalPensionIncome + rentalIncome;
  
  // Get tax breakdown for internal tracking (using taxable employment income)
  const taxBreakdown = grossEmploymentIncome > 0 ? getTaxBreakdown(grossEmploymentIncome, totalSuperContributions) : {
    grossIncome: 0,
    incomeTax: 0,
    medicareLevy: 0,
    netIncome: 0,
    superContributionsTax: 0
  };

  // Calculate inflation adjustment factors
  const inflationAdjustmentFactor = Math.pow(1 + profile.cpiGrowthRate, -yearsFromStart);
  const netFinancialAsset = currentState.savings - currentState.mortgageBalance + currentState.superannuationBalance;
  const totalWealth = currentState.propertyAssets + netFinancialAsset;
  
  const projectionData: YearlyWealth = {
    age,
    wealth: totalWealth,
    propertyAssets: currentState.propertyAssets,
    savings: netFinancialAsset,
    superannuationBalance: currentState.superannuationBalance,
    mortgageBalance: currentState.mortgageBalance,
    inflationAdjustedWealth: totalWealth * inflationAdjustmentFactor,
    inflationAdjustedPropertyAssets: currentState.propertyAssets * inflationAdjustmentFactor,
    inflationAdjustedSavings: netFinancialAsset * inflationAdjustmentFactor,
    pensionIncome: totalPensionIncome,
    totalIncome: displayTotalIncome, // Shows total package + pension in table
    expenses: cpiAdjustedExpenses,
    // Internal tax tracking (not displayed in table)
    grossIncome: displayTotalIncome, // Total package + pension
    incomeTax: taxBreakdown.incomeTax,
    medicareLevy: taxBreakdown.medicareLevy,
    netIncome: netEmploymentIncome + totalPensionIncome,
    superContributionsTax: taxBreakdown.superContributionsTax
  };

  return {
    propertyAssets: currentState.propertyAssets,
    savings: currentState.savings,
    mortgageBalance: currentState.mortgageBalance,
    superannuationBalance: currentState.superannuationBalance,
    projectionData
  };
}
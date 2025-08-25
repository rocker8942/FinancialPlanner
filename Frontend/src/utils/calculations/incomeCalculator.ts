import type { FinancialProfile, AssetState, IncomeComponents } from '../models/FinancialTypes';
import { getAgePensionAmounts } from '../../services/agePensionService';
import { calculateNetIncome, getTaxBreakdown, calculateNetSuperContributions } from '../taxCalculation';

/**
 * Calculate all income components for a given year
 */
export function calculateIncomeComponents(
  profile: FinancialProfile,
  age: number,
  assetState: AssetState,
  isFirstYear: boolean = false
): {
  incomeComponents: IncomeComponents;
  updatedSuperBalance: number;
} {

  const yearsFromStart = age - profile.currentAge;
  const currentPartnerAge = profile.partnerAge + yearsFromStart;
  
  // Apply CPI growth to salaries each year
  const cpiAdjustedUserSalary = profile.salary * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
  const cpiAdjustedPartnerSalary = profile.partnerSalary * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
  
  // Determine if salaries are active based on retirement ages
  const currentUserSalary = age <= profile.retireAge ? cpiAdjustedUserSalary : 0;
  const partnerRetireAgeInUserTimeline = profile.currentAge + (profile.partnerRetireAge - profile.partnerAge);
  const currentPartnerSalary = age <= partnerRetireAgeInUserTimeline ? cpiAdjustedPartnerSalary : 0;
  
  let updatedSuperBalance = assetState.superannuationBalance;
  
  // Calculate employment income
  const employmentIncome = calculateEmploymentIncome(
    currentUserSalary,
    currentPartnerSalary,
    isFirstYear
  );
  
  // Update super balance with contributions (but not in first year to preserve starting point)
  if (!isFirstYear) {
    updatedSuperBalance += employmentIncome.netSuperContributions;
  }
  
  // Calculate pension income
  const pensionIncome = calculatePensionIncome(
    profile,
    age,
    currentPartnerAge,
    assetState,
    currentUserSalary,
    currentPartnerSalary,
    yearsFromStart
  );
  
  // Calculate rental income
  const rentalIncome = calculateRentalIncome(assetState.propertyAssets, profile.propertyRentalYield);
  
  // Calculate total income figures
  const displayTotalIncome = employmentIncome.totalPackageAmount + pensionIncome.totalPensionIncome + rentalIncome;
  const spendableIncome = employmentIncome.netEmploymentIncome + pensionIncome.totalPensionIncome + rentalIncome;
  
  // Get tax breakdown
  const taxBreakdown = employmentIncome.grossEmploymentIncome > 0 
    ? getTaxBreakdown(employmentIncome.grossEmploymentIncome, employmentIncome.totalSuperContributions)
    : {
        grossIncome: 0,
        incomeTax: 0,
        medicareLevy: 0,
        netIncome: 0,
        superContributionsTax: 0
      };
  
  const incomeComponents: IncomeComponents = {
    grossEmploymentIncome: employmentIncome.grossEmploymentIncome,
    netEmploymentIncome: employmentIncome.netEmploymentIncome,
    totalSuperContributions: employmentIncome.totalSuperContributions,
    totalPackageAmount: employmentIncome.totalPackageAmount,
    userPension: pensionIncome.userPension,
    partnerPension: pensionIncome.partnerPension,
    totalPensionIncome: pensionIncome.totalPensionIncome,
    rentalIncome,
    displayTotalIncome,
    spendableIncome,
    taxBreakdown
  };
  
  return {
    incomeComponents,
    updatedSuperBalance
  };
}

/**
 * Calculate employment income components
 */
function calculateEmploymentIncome(
  currentUserSalary: number,
  currentPartnerSalary: number,
  _isFirstYear: boolean
): {
  grossEmploymentIncome: number;
  netEmploymentIncome: number;
  totalSuperContributions: number;
  totalPackageAmount: number;
  netSuperContributions: number;
} {
  let grossEmploymentIncome = 0;
  let totalSuperContributions = 0;
  let totalPackageAmount = 0;
  let netSuperContributions = 0;
  
  // Process user salary
  if (currentUserSalary > 0) {
    const userTotalPackage = currentUserSalary;
    // Calculate super contributions as 12% of total package
    const userSuperContributions = userTotalPackage * 0.12;
    // Taxable income = total package - super contribution
    const userTaxableIncome = userTotalPackage - userSuperContributions;
    
    grossEmploymentIncome += userTaxableIncome;
    totalSuperContributions += userSuperContributions;
    totalPackageAmount += userTotalPackage;
    
    // Calculate net super contributions for balance update
    netSuperContributions += calculateNetSuperContributions(
      userSuperContributions,
      userTaxableIncome
    );
  }
  
  // Process partner salary
  if (currentPartnerSalary > 0) {
    const partnerTotalPackage = currentPartnerSalary;
    // Calculate super contributions as 12% of total package
    const partnerSuperContributions = partnerTotalPackage * 0.12;
    // Taxable income = total package - super contribution
    const partnerTaxableIncome = partnerTotalPackage - partnerSuperContributions;
    
    grossEmploymentIncome += partnerTaxableIncome;
    totalSuperContributions += partnerSuperContributions;
    totalPackageAmount += partnerTotalPackage;
    
    // Calculate net super contributions for balance update
    netSuperContributions += calculateNetSuperContributions(
      partnerSuperContributions,
      partnerTaxableIncome
    );
  }
  
  // Calculate net employment income after tax (for actual spending)
  const netEmploymentIncome = grossEmploymentIncome > 0 ? calculateNetIncome(grossEmploymentIncome) : 0;
  
  return {
    grossEmploymentIncome,
    netEmploymentIncome,
    totalSuperContributions,
    totalPackageAmount,
    netSuperContributions
  };
}

/**
 * Calculate pension income components
 */
function calculatePensionIncome(
  profile: FinancialProfile,
  age: number,
  currentPartnerAge: number,
  assetState: AssetState,
  currentUserSalary: number,
  currentPartnerSalary: number,
  yearsFromStart: number
): {
  userPension: number;
  partnerPension: number;
  totalPensionIncome: number;
} {
  // Calculate CPI adjustment factor for asset test thresholds (compound growth from base year 2025)
  const cpiAdjustmentFactor = Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
  
  // Get pension amounts for this year
  const pensionAmounts = getAgePensionAmounts(
    profile.relationshipStatus,
    profile.isHomeowner,
    assetState.propertyAssets,
    assetState.savings,
    assetState.superannuationBalance,
    assetState.mortgageBalance,
    currentUserSalary,
    currentPartnerSalary,
    age,
    currentPartnerAge,
    cpiAdjustmentFactor
  );
  
  // Apply CPI adjustment to pension amounts (age pension typically increases with CPI)
  const userPension = pensionAmounts.userPension * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
  const partnerPension = pensionAmounts.partnerPension * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
  const totalPensionIncome = userPension + partnerPension;
  
  return {
    userPension,
    partnerPension,
    totalPensionIncome
  };
}

/**
 * Calculate rental income from investment properties
 */
function calculateRentalIncome(propertyAssets: number, rentalYield: number): number {
  return propertyAssets * rentalYield;
}

/**
 * Calculate disposable income after basic expenses
 */
export function calculateDisposableIncomeAfterExpenses(
  incomeComponents: IncomeComponents,
  expenses: number
): number {
  return Math.max(0, incomeComponents.spendableIncome - expenses);
}
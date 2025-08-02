import { getAgePensionAmounts } from '../services/agePensionService';
import { calculateNetIncome, getTaxBreakdown, calculateNetSuperContributions } from './taxCalculation';

// Types for financial plan calculation
export interface FinancialProfile {
  propertyAssets: number;
  savings: number;
  mortgageBalance: number;
  mortgageRate: number;
  superannuationBalance: number;
  superannuationRate: number;
  salary: number;
  partnerSalary: number;
  expenses: number;
  currentAge: number;
  retireAge: number;
  deathAge: number;
  savingsGrowthRate: number;
  propertyGrowthRate: number;
  propertyRentalYield: number; // Net rental return after fees and tax
  cpiGrowthRate: number;
  pensionAmount: number;
  pensionStartAge: number;
  partnerPensionAmount: number;
  partnerPensionStartAge: number;
  partnerAge: number; // Partner's current age
  partnerRetireAge: number; // Partner's desired retirement age
  // Age pension calculation fields
  relationshipStatus: 'single' | 'couple';
  isHomeowner: boolean;
}

export interface YearlyWealth {
  age: number;
  wealth: number;
  propertyAssets: number;
  savings: number;
  superannuationBalance: number;
  inflationAdjustedWealth: number;
  inflationAdjustedPropertyAssets: number;
  inflationAdjustedSavings: number;
  pensionIncome: number;
  totalIncome: number; // This will show gross income in the table
  expenses: number;
  // Internal tax tracking fields (not displayed in table)
  grossIncome?: number;
  incomeTax?: number;
  medicareLevy?: number;
  netIncome?: number;
  superContributionsTax?: number;
}

export interface FinancialPlanResult {
  projection: YearlyWealth[];
  finalWealth: number;
  finalNetSavings: number;
  summary: string;
}

function applyGrowth(currentValue: number, growthRate: number): number {
  return currentValue * (1 + growthRate);
}

function generateSummary(
  retireAge: number,
  deathAge: number,
  finalWealth: number,
  finalInflationAdjustedWealth: number,
  propertyAssets: number,
  savings: number
): string {
  return `Retiring at age ${retireAge}, with projected net wealth of $${finalWealth.toLocaleString(undefined, {maximumFractionDigits: 0})} at age ${deathAge} ` +
    `($${finalInflationAdjustedWealth.toLocaleString(undefined, {maximumFractionDigits: 0})} in today's purchasing power). ` +
    `Property assets: $${propertyAssets.toLocaleString(undefined, {maximumFractionDigits: 0})}, Savings: $${savings.toLocaleString(undefined, {maximumFractionDigits: 0})}.`;
}

export function calculateFinancialPlan(profile: FinancialProfile): FinancialPlanResult {
  const projection: YearlyWealth[] = [];
  let propertyAssets = profile.propertyAssets;
  let savings = profile.savings;
  let mortgageBalance = profile.mortgageBalance;
  let superannuationBalance = profile.superannuationBalance;

  // Calculate the partner's pension start offset (the age in the user's timeline when partner turns 67)
  // const partnerPensionStartOffset = profile.partnerAge - profile.currentAge;
  // const partnerPensionStartUserAge = profile.currentAge + (67 - profile.partnerAge);

  for (let age = profile.currentAge; age <= profile.deathAge; age++) {
    let pensionIncomeThisYear = 0;
    let totalIncome = 0;
    let originalTotalIncome = 0;
    
    // Calculate CPI-adjusted expenses for this year
    const yearsFromStart = age - profile.currentAge;
    const cpiAdjustedExpenses = profile.expenses * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
    
    // Asset growth
    if (age > profile.currentAge) {
      // Apply growth rates
      propertyAssets = applyGrowth(propertyAssets, profile.propertyGrowthRate);
      // Only apply savings growth if net savings (savings - mortgage) is positive
      if ((savings - mortgageBalance) > 0) {
        savings += (savings - mortgageBalance) * profile.savingsGrowthRate;
      }
      superannuationBalance = applyGrowth(superannuationBalance, profile.superannuationRate);
    }

    // Calculate current age pension entitlement based on current assets and income
    const currentPartnerAge = profile.partnerAge + (age - profile.currentAge);
    const currentUserSalary = age <= profile.retireAge ? profile.salary : 0;
    const partnerRetireAgeInUserTimeline = profile.currentAge + (profile.partnerRetireAge - profile.partnerAge);
    const currentPartnerSalary = age <= partnerRetireAgeInUserTimeline ? profile.partnerSalary : 0;
    
    // Calculate CPI adjustment factor for asset test thresholds (compound growth from base year 2025)
    const cpiAdjustmentFactor = Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
    
    const pensionAmounts = getAgePensionAmounts(
      profile.relationshipStatus,
      profile.isHomeowner,
      propertyAssets,
      savings,
      superannuationBalance,
      mortgageBalance,
      currentUserSalary,
      currentPartnerSalary,
      age,
      currentPartnerAge,
      cpiAdjustmentFactor
    );
    
    // Apply CPI adjustment to pension amounts (age pension typically increases with CPI)
    const cpiAdjustedUserPension = pensionAmounts.userPension * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);
    const cpiAdjustedPartnerPension = pensionAmounts.partnerPension * Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);

    // Calculate rental income from investment properties (based on grown property value)
    const rentalIncome = propertyAssets * profile.propertyRentalYield;
    
    // Calculate employment income - user input is total package including super
    let grossEmploymentIncome = 0; // This will be taxable income (after super carved out)
    let totalSuperContributions = 0;
    let totalPackageAmount = 0; // This will be displayed as "Total Income"
    
    // Add user salary if not retired (input is total employment package including super)
    if (age <= profile.retireAge) {
      const userTotalPackage = profile.salary; // Total package amount
      // Carve out super from total package: super = package / 1.12 * 0.12
      const userSuperContributions = userTotalPackage * (12 / 112);
      // Taxable income = total package - super contribution
      const userTaxableIncome = userTotalPackage - userSuperContributions;
      
      grossEmploymentIncome += userTaxableIncome;
      totalSuperContributions += userSuperContributions;
      totalPackageAmount += userTotalPackage;
      
      // Add net super contributions to balance (after tax) only if not current year
      if (age > profile.currentAge) {
        const netSuperContributions = calculateNetSuperContributions(
          userSuperContributions, 
          userTaxableIncome
        );
        superannuationBalance += netSuperContributions;
      }
    }

    // Add partner salary if not retired (input is total employment package including super)
    if (age <= partnerRetireAgeInUserTimeline) {
      const partnerTotalPackage = profile.partnerSalary; // Total package amount
      // Carve out super from total package: super = package / 1.12 * 0.12
      const partnerSuperContributions = partnerTotalPackage * (12 / 112);
      // Taxable income = total package - super contribution
      const partnerTaxableIncome = partnerTotalPackage - partnerSuperContributions;
      
      grossEmploymentIncome += partnerTaxableIncome;
      totalSuperContributions += partnerSuperContributions;
      totalPackageAmount += partnerTotalPackage;
      
      // Add net partner super contributions to balance (after tax) only if not current year
      if (age > profile.currentAge) {
        const netPartnerSuperContributions = calculateNetSuperContributions(
          partnerSuperContributions, 
          partnerTaxableIncome
        );
        superannuationBalance += netPartnerSuperContributions;
      }
    }

    // Calculate net employment income after tax (for actual spending)
    const netEmploymentIncome = grossEmploymentIncome > 0 ? calculateNetIncome(grossEmploymentIncome) : 0;
    
    // Add dynamically calculated pension income (generally tax-free due to low amounts)
    pensionIncomeThisYear = cpiAdjustedUserPension + cpiAdjustedPartnerPension;
    
    // Total package income for display purposes (what shows in "Total Income" column)
    const displayTotalIncome = totalPackageAmount + pensionIncomeThisYear + rentalIncome;
    
    // Income available for expenses/savings (net employment income + pension + rental income)
    totalIncome = netEmploymentIncome + pensionIncomeThisYear + rentalIncome;
    
    // Store the total package income for reporting (this shows in table as "Total Income")
    originalTotalIncome = displayTotalIncome;

    // Apply income and expenses only if not current year
    if (age > profile.currentAge) {
      // Use income to pay mortgage interest first
      if (mortgageBalance > 0 && totalIncome > 0) {
        // Calculate interest on net mortgage (mortgage - savings, but not less than 0)
        const netMortgage = Math.max(0, mortgageBalance - savings);
        const mortgageInterest = netMortgage * profile.mortgageRate;
        const mortgageInterestPaymentFromIncome = Math.min(totalIncome, mortgageInterest);
        totalIncome -= mortgageInterestPaymentFromIncome;
      }

      // Use remaining income to reduce mortgage principal first, then add to savings
      if (mortgageBalance > 0 && totalIncome > 0) {
        const mortgagePrincipalPayment = Math.min(totalIncome, mortgageBalance);
        mortgageBalance -= mortgagePrincipalPayment;
        totalIncome -= mortgagePrincipalPayment;
      }

      // Add any remaining income to savings
      savings += totalIncome;
      
      // Access superannuation at age 60+
      // if (age >= 60 && superannuationBalance > 0) {
      //   // Transfer superannuation to savings at retirement age
      //   if (age === Math.max(profile.retireAge, profile.currentAge + (profile.partnerRetireAge - profile.partnerAge))) {
      //     savings += superannuationBalance;
      //     superannuationBalance = 0;
      //   }
      // }

      // Subtract CPI-adjusted expenses from savings first, then from super if needed
      const remainingExpenses = Math.max(0, cpiAdjustedExpenses - savings);
      savings = Math.max(0, savings - cpiAdjustedExpenses);
      
      // If there are remaining expenses and superannuation is available, deduct from super
      // Note: In Australia, super can only be accessed at preservation age (60+) 
      // Early access for hardship requires special circumstances and APRA approval
      if (remainingExpenses > 0 && superannuationBalance > 0 && age >= 60) {
        superannuationBalance = Math.max(0, superannuationBalance - remainingExpenses);
      }

      // Ensure superannuation balance is not negative
      if (superannuationBalance < 0) {
        superannuationBalance = 0;
      }
    }

    const netFinancialAsset = savings - mortgageBalance + superannuationBalance;
    const totalWealth = propertyAssets + netFinancialAsset;
    const yearsFromNow = age - profile.currentAge;
    const inflationAdjustmentFactor = Math.pow(1 + profile.cpiGrowthRate, -yearsFromNow);
    const inflationAdjustedWealth = totalWealth * inflationAdjustmentFactor;
    const inflationAdjustedPropertyAssets = propertyAssets * inflationAdjustmentFactor;
    const inflationAdjustedNetSavings = netFinancialAsset * inflationAdjustmentFactor;

    // Get tax breakdown for internal tracking (using taxable employment income)
    const taxBreakdown = grossEmploymentIncome > 0 ? getTaxBreakdown(grossEmploymentIncome, totalSuperContributions) : {
      grossIncome: 0,
      incomeTax: 0,
      medicareLevy: 0,
      netIncome: 0,
      superContributionsTax: 0
    };

    projection.push({
      age,
      wealth: totalWealth,
      propertyAssets: propertyAssets,
      savings: netFinancialAsset,
      superannuationBalance: superannuationBalance,
      inflationAdjustedWealth,
      inflationAdjustedPropertyAssets: inflationAdjustedPropertyAssets,
      inflationAdjustedSavings: inflationAdjustedNetSavings,
      pensionIncome: pensionIncomeThisYear,
      totalIncome: originalTotalIncome, // Shows total package + pension in table
      expenses: cpiAdjustedExpenses,
      // Internal tax tracking (not displayed in table)
      grossIncome: displayTotalIncome, // Total package + pension
      incomeTax: taxBreakdown.incomeTax,
      medicareLevy: taxBreakdown.medicareLevy,
      netIncome: netEmploymentIncome + pensionIncomeThisYear,
      superContributionsTax: taxBreakdown.superContributionsTax
    });
  }

  const finalNetSavings = savings - mortgageBalance + superannuationBalance;
  const finalWealth = propertyAssets + finalNetSavings;
  const finalYearsFromNow = profile.deathAge - profile.currentAge;
  const finalInflationAdjustmentFactor = Math.pow(1 + profile.cpiGrowthRate, -finalYearsFromNow);
  const finalInflationAdjustedWealth = finalWealth * finalInflationAdjustmentFactor;

  return {
    projection,
    finalWealth,
    finalNetSavings,
    summary: generateSummary(
      profile.retireAge,
      profile.deathAge,
      finalWealth,
      finalInflationAdjustedWealth,
      propertyAssets,
      finalNetSavings
    )
  };
}

// Calculate optimal annual expense to reach zero net worth at death
export function calculateExpenseToZeroNetWorth(profileInput: FinancialProfile): number {
  const years = profileInput.deathAge - profileInput.currentAge;
  if (years <= 0) return profileInput.expenses;
  const netSavings = profileInput.savings - profileInput.mortgageBalance;
  const assets = netSavings + profileInput.superannuationBalance;
  const salaryIncome = profileInput.salary * Math.max(0, Math.min(profileInput.retireAge, profileInput.deathAge) - profileInput.currentAge);
  // Convert partner's retirement age to main user's timeline
  const partnerRetireAgeInUserTimeline = profileInput.currentAge + (profileInput.partnerRetireAge - profileInput.partnerAge);
  const partnerSalaryIncome = profileInput.partnerSalary * Math.max(0, Math.min(partnerRetireAgeInUserTimeline, profileInput.deathAge) - profileInput.currentAge);
  // Approximate rental income over lifetime (property value may grow, but using current value for simplicity)
  const approximateRentalIncome = profileInput.propertyAssets * profileInput.propertyRentalYield * years;
  let pensionIncome = 0;
  // Calculate approximate pension income over the lifetime
  for (let age = profileInput.currentAge; age < profileInput.deathAge; age++) {
    const currentPartnerAge = profileInput.partnerAge + (age - profileInput.currentAge);
    const currentUserSalary = age <= profileInput.retireAge ? profileInput.salary : 0;
    const currentPartnerSalary = age <= partnerRetireAgeInUserTimeline ? profileInput.partnerSalary : 0;
    
    // Use average asset values for approximation
    const avgSavings = profileInput.savings;
    const avgSuper = profileInput.superannuationBalance;
    const avgMortgage = Math.max(0, profileInput.mortgageBalance * (1 - (age - profileInput.currentAge) / (profileInput.deathAge - profileInput.currentAge)));
    
    // Calculate CPI adjustment factor for this year in the approximation
    const yearCpiAdjustmentFactor = Math.pow(1 + profileInput.cpiGrowthRate, age - profileInput.currentAge);
    
    const pensionAmounts = getAgePensionAmounts(
      profileInput.relationshipStatus,
      profileInput.isHomeowner,
      profileInput.propertyAssets,
      avgSavings,
      avgSuper,
      avgMortgage,
      currentUserSalary,
      currentPartnerSalary,
      age,
      currentPartnerAge,
      yearCpiAdjustmentFactor
    );
    
    pensionIncome += pensionAmounts.userPension + pensionAmounts.partnerPension;
  }
  let low = 0, high = (assets + salaryIncome + partnerSalaryIncome + pensionIncome + approximateRentalIncome) / years * 5;
  const tolerance = 0.01;
  let bestExpense = 0;
  for (let i = 0; i < 50; i++) {
    let mid = (low + high) / 2;
    const profile = { ...profileInput, expenses: mid };
    const plan = calculateFinancialPlan(profile);
    const minWealth = Math.min(...plan.projection.map(y => y.savings));
    let net = plan.finalNetSavings;
    if (Math.abs(high - low) < tolerance) {
      break;
    }
    if (minWealth > 0 && net > 0) {
      // Acceptable: never negative, and ends positive or zero
      bestExpense = mid;
      low = mid;
    } else {
      high = mid;
    }
  }
  // After search, pick the bestExpense found
  return Math.max(0, Math.round(bestExpense));
} 
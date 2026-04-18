import type { FinancialProfile, AssetState, IncomeComponents } from '../types.js';
import type { ICountryConfig } from '../countryConfig.js';
import { auCountryConfig } from '../countries/au/index.js';

/**
 * Calculate all income components for a given year
 */
export function calculateIncomeComponents(
  profile: FinancialProfile,
  age: number,
  assetState: AssetState,
  isFirstYear: boolean = false,
  countryConfig: ICountryConfig = auCountryConfig
): {
  incomeComponents: IncomeComponents;
  updatedSuperBalance: number;
  updatedPartnerSuperBalance: number;
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
  let updatedPartnerSuperBalance = assetState.partnerSuperBalance;

  // Calculate employment income (user and partner separately for super tracking)
  const superRate = countryConfig.defaults.superContributionRate;
  const userEmploymentIncome = currentUserSalary > 0
    ? processSalaryPackage(currentUserSalary, superRate, countryConfig)
    : { taxableIncome: 0, superContributions: 0, netSuperContributions: 0 };
  const partnerEmploymentIncome = currentPartnerSalary > 0
    ? processSalaryPackage(currentPartnerSalary, superRate, countryConfig)
    : { taxableIncome: 0, superContributions: 0, netSuperContributions: 0 };

  const employmentIncome = calculateEmploymentIncome(
    currentUserSalary,
    currentPartnerSalary,
    countryConfig
  );

  // Update super balances with contributions (but not in first year to preserve starting point).
  // netSuperContributions: salary-deductible contributions (AU super; KR returns 0 since NPS is
  // a defined benefit scheme and does not accumulate in a personal account).
  // employerRetirementContributionRate: employer-paid DC contributions not deducted from salary
  // (e.g. KR 퇴직급여 ~8.33% of salary credited to the employee's IRP/DC account).
  if (!isFirstYear) {
    const employerIrpRate = countryConfig.defaults.employerRetirementContributionRate ?? 0;
    updatedSuperBalance += userEmploymentIncome.netSuperContributions
      + (currentUserSalary > 0 ? currentUserSalary * employerIrpRate : 0);
    updatedPartnerSuperBalance += partnerEmploymentIncome.netSuperContributions
      + (currentPartnerSalary > 0 ? currentPartnerSalary * employerIrpRate : 0);
  }

  // Calculate pension income
  const pensionIncome = calculatePensionIncome(
    profile,
    age,
    currentPartnerAge,
    assetState,
    currentUserSalary,
    currentPartnerSalary,
    yearsFromStart,
    countryConfig
  );

  // Calculate rental income
  const rentalIncome = calculateRentalIncome(assetState.propertyAssets, profile.propertyRentalYield);

  // Calculate total income figures
  const displayTotalIncome = employmentIncome.totalPackageAmount + pensionIncome.totalPensionIncome + rentalIncome;
  const spendableIncome = employmentIncome.netEmploymentIncome + pensionIncome.totalPensionIncome + rentalIncome;

  // Get tax breakdown
  const taxBreakdown = employmentIncome.grossEmploymentIncome > 0
    ? countryConfig.tax.getTaxBreakdown(employmentIncome.grossEmploymentIncome, employmentIncome.totalSuperContributions)
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
    updatedSuperBalance,
    updatedPartnerSuperBalance
  };
}

/**
 * Break down a total salary package into taxable income, super contributions, and net super
 */
function processSalaryPackage(
  totalPackage: number,
  superRate: number,
  countryConfig: ICountryConfig
): {
  taxableIncome: number;
  superContributions: number;
  netSuperContributions: number;
} {
  const superContributions = totalPackage * superRate;
  const taxableIncome = totalPackage - superContributions;
  const netSuper = countryConfig.tax.calculateNetSuperContributions(superContributions, taxableIncome);
  return { taxableIncome, superContributions, netSuperContributions: netSuper };
}

/**
 * Calculate employment income components
 */
function calculateEmploymentIncome(
  currentUserSalary: number,
  currentPartnerSalary: number,
  countryConfig: ICountryConfig
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

  const superRate = countryConfig.defaults.superContributionRate;
  for (const salary of [currentUserSalary, currentPartnerSalary]) {
    if (salary > 0) {
      const breakdown = processSalaryPackage(salary, superRate, countryConfig);
      grossEmploymentIncome += breakdown.taxableIncome;
      totalSuperContributions += breakdown.superContributions;
      totalPackageAmount += salary;
      netSuperContributions += breakdown.netSuperContributions;
    }
  }

  const netEmploymentIncome = grossEmploymentIncome > 0
    ? countryConfig.tax.calculateNetIncome(grossEmploymentIncome)
    : 0;

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
  yearsFromStart: number,
  countryConfig: ICountryConfig
): {
  userPension: number;
  partnerPension: number;
  totalPensionIncome: number;
} {
  // CPI adjustment factor for both asset test thresholds and pension amounts
  const cpiAdjustmentFactor = Math.pow(1 + profile.cpiGrowthRate, yearsFromStart);

  // Pass base salaries (today's dollars); cpiAdjustmentFactor applied to pension output below.
  const userPreRetirementSalary = profile.salary;
  const partnerPreRetirementSalary = profile.partnerSalary;

  const currentYear = new Date().getFullYear();
  const pensionAmounts = countryConfig.pension.getPensionAmounts({
    relationshipStatus: profile.relationshipStatus,
    isHomeowner: profile.isHomeowner,
    propertyAssets: assetState.propertyAssets,
    savings: assetState.savings,
    superannuation: assetState.superannuationBalance,
    mortgageBalance: assetState.mortgageBalance,
    userSalary: currentUserSalary,
    partnerSalary: currentPartnerSalary,
    userPreRetirementSalary,
    partnerPreRetirementSalary,
    userAge: age,
    partnerAge: currentPartnerAge,
    userBirthYear: currentYear - profile.currentAge,
    partnerBirthYear: currentYear - profile.partnerAge,
    cpiAdjustmentFactor,
    partnerSuperBalance: assetState.partnerSuperBalance
  });

  // Apply CPI adjustment to pension amounts (age pension typically increases with CPI)
  const userPension = pensionAmounts.userPension * cpiAdjustmentFactor;
  const partnerPension = pensionAmounts.partnerPension * cpiAdjustmentFactor;
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

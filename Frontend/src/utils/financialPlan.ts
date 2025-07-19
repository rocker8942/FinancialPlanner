// Types for financial plan calculation
export interface FinancialProfile {
  propertyAssets: number;
  financialAssets: number;
  salary: number;
  partnerSalary: number;
  expenses: number;
  currentAge: number;
  retireAge: number;
  deathAge: number;
  financialAssetGrowthRate: number;
  propertyGrowthRate: number;
  inflationRate: number;
  pensionAmount: number;
  pensionStartAge: number;
  partnerPensionAmount: number;
  partnerPensionStartAge: number;
  partnerAge: number; // Partner's current age
  partnerRetireAge: number; // Partner's desired retirement age
}

export interface YearlyWealth {
  age: number;
  wealth: number;
  propertyAssets: number;
  financialAssets: number;
  inflationAdjustedWealth: number;
  inflationAdjustedPropertyAssets: number;
  inflationAdjustedFinancialAssets: number;
  pensionIncome: number;
}

export interface FinancialPlanResult {
  projection: YearlyWealth[];
  finalWealth: number;
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
  financialAssets: number
): string {
  return `Retiring at age ${retireAge}, with projected net wealth of $${finalWealth.toLocaleString(undefined, {maximumFractionDigits: 0})} at age ${deathAge} ` +
    `($${finalInflationAdjustedWealth.toLocaleString(undefined, {maximumFractionDigits: 0})} in today's purchasing power). ` +
    `Property assets: $${propertyAssets.toLocaleString(undefined, {maximumFractionDigits: 0})}, Financial assets: $${financialAssets.toLocaleString(undefined, {maximumFractionDigits: 0})}.`;
}

export function calculateFinancialPlan(profile: FinancialProfile): FinancialPlanResult {
  const projection: YearlyWealth[] = [];
  let propertyAssets = profile.propertyAssets;
  let financialAssets = profile.financialAssets;

  // Calculate the partner's pension start offset (the age in the user's timeline when partner turns 67)
  const partnerPensionStartOffset = profile.partnerAge - profile.currentAge;
  const partnerPensionStartUserAge = profile.currentAge + (67 - profile.partnerAge);

  for (let age = profile.currentAge; age <= profile.deathAge; age++) {
    let pensionIncomeThisYear = 0;
    if (age > profile.currentAge) {
      // Apply growth rates
      propertyAssets = applyGrowth(propertyAssets, profile.propertyGrowthRate);
      financialAssets = applyGrowth(financialAssets, profile.financialAssetGrowthRate);

      // Add salary to financial assets only if not retired
      if (age <= profile.retireAge) {
        financialAssets += profile.salary;
      }

      // Add partner salary to financial assets only if partner is not retired
      // Convert partner's retirement age to main user's timeline
      const partnerRetireAgeInUserTimeline = profile.currentAge + (profile.partnerRetireAge - profile.partnerAge);
      if (age <= partnerRetireAgeInUserTimeline) {
        financialAssets += profile.partnerSalary;
      }

      // Add pension income for user if at or after pension start age
      if (age >= profile.pensionStartAge) {
        financialAssets += profile.pensionAmount;
        pensionIncomeThisYear += profile.pensionAmount;
      }
      // Add pension income for partner if partner has turned 67
      if ((age - profile.currentAge + profile.partnerAge) >= 67) {
        financialAssets += profile.partnerPensionAmount;
        pensionIncomeThisYear += profile.partnerPensionAmount;
      }

      // Subtract expenses from financial assets only
      financialAssets -= profile.expenses;

      // Ensure financial assets don't go negative
      if (financialAssets < 0) {
        financialAssets = 0;
      }
    }

    const totalWealth = propertyAssets + financialAssets;
    const yearsFromNow = age - profile.currentAge;
    const inflationAdjustmentFactor = Math.pow(1 + profile.inflationRate, -yearsFromNow);
    const inflationAdjustedWealth = totalWealth * inflationAdjustmentFactor;
    const inflationAdjustedPropertyAssets = propertyAssets * inflationAdjustmentFactor;
    const inflationAdjustedFinancialAssets = financialAssets * inflationAdjustmentFactor;

    projection.push({
      age,
      wealth: totalWealth,
      propertyAssets,
      financialAssets,
      inflationAdjustedWealth,
      inflationAdjustedPropertyAssets,
      inflationAdjustedFinancialAssets,
      pensionIncome: pensionIncomeThisYear
    });
  }

  const finalWealth = propertyAssets + financialAssets;
  const finalYearsFromNow = profile.deathAge - profile.currentAge;
  const finalInflationAdjustmentFactor = Math.pow(1 + profile.inflationRate, -finalYearsFromNow);
  const finalInflationAdjustedWealth = finalWealth * finalInflationAdjustmentFactor;

  return {
    projection,
    finalWealth,
    summary: generateSummary(
      profile.retireAge,
      profile.deathAge,
      finalWealth,
      finalInflationAdjustedWealth,
      propertyAssets,
      financialAssets
    )
  };
}

// Calculate optimal annual expense to reach zero net worth at death
export function calculateExpenseToZeroNetWorth(profileInput: FinancialProfile): number {
  const years = profileInput.deathAge - profileInput.currentAge;
  if (years <= 0) return profileInput.expenses;
  const assets = profileInput.propertyAssets + profileInput.financialAssets;
  const salaryIncome = profileInput.salary * Math.max(0, Math.min(profileInput.retireAge, profileInput.deathAge) - profileInput.currentAge);
  // Convert partner's retirement age to main user's timeline
  const partnerRetireAgeInUserTimeline = profileInput.currentAge + (profileInput.partnerRetireAge - profileInput.partnerAge);
  const partnerSalaryIncome = profileInput.partnerSalary * Math.max(0, Math.min(partnerRetireAgeInUserTimeline, profileInput.deathAge) - profileInput.currentAge);
  let pensionIncome = 0;
  for (let age = profileInput.currentAge; age < profileInput.deathAge; age++) {
    if (age >= profileInput.pensionStartAge) pensionIncome += profileInput.pensionAmount;
    // Partner's pension starts when partner turns 67
    if ((age - profileInput.currentAge + profileInput.partnerAge) >= 67) pensionIncome += profileInput.partnerPensionAmount;
  }
  let low = 0, high = (assets + salaryIncome + partnerSalaryIncome + pensionIncome) / years * 1.5;
  const tolerance = 0.01;
  let bestExpense = 0;
  for (let i = 0; i < 50; i++) {
    let mid = (low + high) / 2;
    const profile = { ...profileInput, expenses: mid };
    const plan = calculateFinancialPlan(profile);
    const minWealth = Math.min(...plan.projection.map(y => y.wealth));
    let net = plan.finalWealth;
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
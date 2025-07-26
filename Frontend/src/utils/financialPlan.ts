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
  savings: number;
  superannuationBalance: number;
  inflationAdjustedWealth: number;
  inflationAdjustedPropertyAssets: number;
  inflationAdjustedSavings: number;
  pensionIncome: number;
  totalIncome: number;
  expenses: number;
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

    // Calculate total annual income (for all years including current)
    // Add salary if not retired
    if (age <= profile.retireAge) {
      totalIncome += profile.salary;
      // Add superannuation contributions (12% of salary) only if not current year
      if (age > profile.currentAge) {
        superannuationBalance += profile.salary * 0.12;
      }
    }

    // Add partner salary if partner is not retired
    // Convert partner's retirement age to main user's timeline
    const partnerRetireAgeInUserTimeline = profile.currentAge + (profile.partnerRetireAge - profile.partnerAge);
    if (age <= partnerRetireAgeInUserTimeline) {
      totalIncome += profile.partnerSalary;
      // Add partner superannuation contributions (12% of salary) only if not current year
      if (age > profile.currentAge) {
        superannuationBalance += profile.partnerSalary * 0.12;
      }
    }

    // Add pension income for user if at or after pension start age
    if (age >= profile.pensionStartAge) {
      totalIncome += profile.pensionAmount;
      pensionIncomeThisYear += profile.pensionAmount;
    }
    // Add pension income for partner if partner has turned 67
    if ((age - profile.currentAge + profile.partnerAge) >= 67) {
      totalIncome += profile.partnerPensionAmount;
      pensionIncomeThisYear += profile.partnerPensionAmount;
    }

    // Store the original total income for reporting
    originalTotalIncome = totalIncome;

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

      // Subtract expenses from savings first, then from super if needed
      const remainingExpenses = Math.max(0, profile.expenses - savings);
      savings = Math.max(0, savings - profile.expenses);
      
      // If there are remaining expenses and superannuation is available, deduct from super
      if (remainingExpenses > 0 && superannuationBalance > 0) {
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
    const inflationAdjustmentFactor = Math.pow(1 + profile.inflationRate, -yearsFromNow);
    const inflationAdjustedWealth = totalWealth * inflationAdjustmentFactor;
    const inflationAdjustedPropertyAssets = propertyAssets * inflationAdjustmentFactor;
    const inflationAdjustedNetSavings = netFinancialAsset * inflationAdjustmentFactor;

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
      totalIncome: originalTotalIncome,
      expenses: profile.expenses
    });
  }

  const finalNetSavings = savings - mortgageBalance + superannuationBalance;
  const finalWealth = propertyAssets + finalNetSavings;
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
      finalNetSavings
    )
  };
}

// Calculate optimal annual expense to reach zero net worth at death
export function calculateExpenseToZeroNetWorth(profileInput: FinancialProfile): number {
  const years = profileInput.deathAge - profileInput.currentAge;
  if (years <= 0) return profileInput.expenses;
  const netSavings = profileInput.savings - profileInput.mortgageBalance;
  const assets = profileInput.propertyAssets + netSavings + profileInput.superannuationBalance;
  const salaryIncome = profileInput.salary * Math.max(0, Math.min(profileInput.retireAge, profileInput.deathAge) - profileInput.currentAge);
  // Convert partner's retirement age to main user's timeline
  const partnerRetireAgeInUserTimeline = profileInput.currentAge + (profileInput.partnerRetireAge - profileInput.partnerAge);
  const partnerSalaryIncome = profileInput.partnerSalary * Math.max(0, Math.min(partnerRetireAgeInUserTimeline, profileInput.deathAge) - profileInput.currentAge);
  let pensionIncome = 0;
  for (let age = profileInput.currentAge; age < profileInput.deathAge; age++) {
    if (age >= profileInput.pensionStartAge) pensionIncome += profileInput.pensionAmount;
    // Partner's pension starts when partner turns 67
    if (profileInput.partnerAge >= 67) pensionIncome += profileInput.partnerPensionAmount;
  }
  let low = 0, high = (assets + salaryIncome + partnerSalaryIncome + pensionIncome) / years * 5;
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
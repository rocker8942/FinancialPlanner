import type { FinancialProfile, YearlyWealth, FinancialPlanResult } from '../models/FinancialTypes';
import { applyAssetGrowth, calculateTotalNetWealth, calculateNetFinancialAssets, calculateInflationAdjustedValues } from './assetGrowthCalculator';
import { calculateIncomeComponents } from './incomeCalculator';
import { processExpensesAndCashFlow, calculateCpiAdjustedExpenses } from './expenseProcessor';

/**
 * Calculate complete financial plan using modular calculators
 * This is the new orchestrator version of calculateFinancialPlan
 */
export function calculateFinancialPlanModular(profile: FinancialProfile): FinancialPlanResult {
  const projection: YearlyWealth[] = [];
  
  // Initialize asset state
  let assetState = {
    propertyAssets: profile.propertyAssets,
    savings: profile.savings,
    mortgageBalance: profile.mortgageBalance,
    superannuationBalance: profile.superannuationBalance
  };

  // Process each year from current age to death age
  for (let age = profile.currentAge; age <= profile.deathAge; age++) {
    const isFirstYear = age === profile.currentAge;
    const yearsFromStart = age - profile.currentAge;
    
    // Apply asset growth (except for first year)
    assetState = applyAssetGrowth(assetState, profile, isFirstYear);
    
    // Calculate CPI-adjusted expenses for this year
    const cpiAdjustedExpenses = calculateCpiAdjustedExpenses(
      profile.expenses, 
      profile.cpiGrowthRate, 
      yearsFromStart
    );
    
    // Calculate income components and update super balance
    const incomeResult = calculateIncomeComponents(
      profile,
      age,
      assetState,
      isFirstYear
    );
    
    // Update superannuation balance with contributions
    assetState.superannuationBalance = incomeResult.updatedSuperBalance;
    
    // Process expenses and cash flow (except for first year)
    const cashFlowResult = processExpensesAndCashFlow(
      profile,
      age,
      assetState,
      incomeResult.incomeComponents.spendableIncome,
      cpiAdjustedExpenses,
      isFirstYear
    );
    
    // Update asset state with cash flow changes
    assetState = cashFlowResult.updatedAssets;
    
    // Calculate wealth metrics
    const netFinancialAsset = calculateNetFinancialAssets(assetState);
    const totalWealth = calculateTotalNetWealth(assetState);
    
    // Calculate inflation adjustments
    const inflationData = calculateInflationAdjustedValues(
      assetState,
      profile.cpiGrowthRate,
      yearsFromStart
    );
    
    // Create yearly wealth record
    const yearlyWealth: YearlyWealth = {
      age,
      wealth: totalWealth,
      propertyAssets: assetState.propertyAssets,
      savings: netFinancialAsset,
      superannuationBalance: assetState.superannuationBalance,
      inflationAdjustedWealth: inflationData.inflationAdjustedWealth,
      inflationAdjustedPropertyAssets: inflationData.inflationAdjustedPropertyAssets,
      inflationAdjustedSavings: inflationData.inflationAdjustedNetSavings,
      pensionIncome: incomeResult.incomeComponents.totalPensionIncome,
      totalIncome: incomeResult.incomeComponents.displayTotalIncome,
      expenses: cpiAdjustedExpenses,
      // Internal tax tracking (not displayed in table)
      grossIncome: incomeResult.incomeComponents.displayTotalIncome,
      incomeTax: incomeResult.incomeComponents.taxBreakdown.incomeTax,
      medicareLevy: incomeResult.incomeComponents.taxBreakdown.medicareLevy,
      netIncome: incomeResult.incomeComponents.taxBreakdown.netIncome,
      superContributionsTax: incomeResult.incomeComponents.taxBreakdown.superContributionsTax
    };
    
    projection.push(yearlyWealth);
  }

  // Calculate final results
  const finalNetSavings = calculateNetFinancialAssets(assetState);
  const finalWealth = calculateTotalNetWealth(assetState);
  
  // Calculate final inflation-adjusted wealth
  const finalYearsFromNow = profile.deathAge - profile.currentAge;
  const finalInflationAdjustmentFactor = Math.pow(1 + profile.cpiGrowthRate, -finalYearsFromNow);
  const finalInflationAdjustedWealth = finalWealth * finalInflationAdjustmentFactor;

  // Generate summary
  const summary = generateSummary(
    profile.retireAge,
    profile.deathAge,
    finalWealth,
    finalInflationAdjustedWealth,
    assetState.propertyAssets,
    finalNetSavings
  );

  return {
    projection,
    finalWealth,
    finalNetSavings,
    summary
  };
}

/**
 * Generate summary text for financial plan results
 */
function generateSummary(
  retireAge: number,
  deathAge: number,
  finalWealth: number,
  finalInflationAdjustedWealth: number,
  propertyAssets: number,
  netSavings: number
): string {
  return `Retiring at age ${retireAge}, with projected net wealth of $${finalWealth.toLocaleString(undefined, {maximumFractionDigits: 0})} at age ${deathAge} ` +
    `($${finalInflationAdjustedWealth.toLocaleString(undefined, {maximumFractionDigits: 0})} in today's purchasing power). ` +
    `Property assets: $${propertyAssets.toLocaleString(undefined, {maximumFractionDigits: 0})}, Savings: $${netSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}.`;
}
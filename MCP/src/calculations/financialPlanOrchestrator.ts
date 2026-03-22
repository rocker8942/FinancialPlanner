import type { FinancialProfile, YearlyWealth, FinancialPlanResult, LifeEvent, AssetState } from '../types.js';
import { applyAssetGrowth, calculateTotalNetWealth, calculateNetFinancialAssets, calculateInflationAdjustedValues } from './assetGrowthCalculator.js';
import { calculateIncomeComponents } from './incomeCalculator.js';
import { processExpensesAndCashFlow, calculateCpiAdjustedExpenses } from './expenseProcessor.js';

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
    superannuationBalance: profile.superannuationBalance,
    partnerSuperBalance: profile.partnerSuperBalance ?? 0
  };

  // Track homeowner status (may change mid-plan if house purchase is planned)
  let effectiveIsHomeowner = profile.isHomeowner;
  // Fraction of propertyAssets that is the primary home (no rental income, exempt from pension assets test).
  // Using a ratio means it stays correct as all property grows at the same rate.
  let primaryHomeRatio = 0;

  // Process each year from current age to death age
  for (let age = profile.currentAge; age <= profile.deathAge; age++) {
    const isFirstYear = age === profile.currentAge;
    const yearsFromStart = age - profile.currentAge;

    // Apply asset growth (except for first year)
    assetState = applyAssetGrowth(assetState, profile, isFirstYear);

    // Apply house purchase at the specified age
    let housePurchaseOccurred = false;
    const plan = profile.housePurchasePlan;
    if (plan?.enabled && age === plan.purchaseAge) {
      const downPayment = plan.purchasePrice * (plan.downPaymentPercent / 100);
      assetState = {
        ...assetState,
        savings: assetState.savings - downPayment,
        propertyAssets: assetState.propertyAssets + plan.purchasePrice,
        mortgageBalance: assetState.mortgageBalance + (plan.purchasePrice - downPayment)
      };
      effectiveIsHomeowner = true;
      // Compute ratio: primary home as fraction of total property after purchase.
      // For a renter (propertyAssets was 0), this is always 1.0.
      primaryHomeRatio = plan.purchasePrice / assetState.propertyAssets;
      housePurchaseOccurred = true;
    }

    // Build effective profile for this year (isHomeowner may have changed)
    const effectiveProfile = effectiveIsHomeowner !== profile.isHomeowner
      ? { ...profile, isHomeowner: effectiveIsHomeowner }
      : profile;

    // For income calculation, exclude primary home from investment property assets:
    // - Primary home earns no rental income
    // - Primary home is exempt from age pension assets test
    const investmentPropertyAssets = Math.round(assetState.propertyAssets * (1 - primaryHomeRatio));
    const assetStateForIncome = primaryHomeRatio > 0
      ? { ...assetState, propertyAssets: investmentPropertyAssets }
      : assetState;

    // Calculate CPI-adjusted expenses for this year
    const cpiAdjustedExpenses = calculateCpiAdjustedExpenses(
      profile.expenses,
      profile.cpiGrowthRate,
      yearsFromStart
    );

    // Calculate income components and update super balance
    const incomeResult = calculateIncomeComponents(
      effectiveProfile,
      age,
      assetStateForIncome,
      isFirstYear
    );

    // Update superannuation balances with contributions
    assetState.superannuationBalance = incomeResult.updatedSuperBalance;
    assetState.partnerSuperBalance = incomeResult.updatedPartnerSuperBalance;

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

    // Apply life events for this year
    const { updatedAssets: assetsAfterEvents, lifeEventImpact } = applyLifeEvents(
      assetState,
      age,
      profile.lifeEvents || []
    );
    assetState = assetsAfterEvents;

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
      rawSavings: assetState.savings,
      superannuationBalance: assetState.superannuationBalance + assetState.partnerSuperBalance,
      mortgageBalance: assetState.mortgageBalance,
      inflationAdjustedWealth: inflationData.inflationAdjustedWealth,
      inflationAdjustedPropertyAssets: inflationData.inflationAdjustedPropertyAssets,
      inflationAdjustedSavings: inflationData.inflationAdjustedNetSavings,
      pensionIncome: incomeResult.incomeComponents.totalPensionIncome,
      totalIncome: incomeResult.incomeComponents.displayTotalIncome,
      expenses: cpiAdjustedExpenses,
      lifeEventImpact,
      housePurchaseOccurred: housePurchaseOccurred || undefined,
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
 * Apply life events (lump sum income/expense) for a given year
 */
function applyLifeEvents(
  assetState: AssetState,
  age: number,
  lifeEvents: LifeEvent[]
): { updatedAssets: AssetState; lifeEventImpact: number } {
  const eventsThisYear = lifeEvents.filter(e => e.age === age);
  if (eventsThisYear.length === 0) {
    return { updatedAssets: assetState, lifeEventImpact: 0 };
  }

  const updatedAssets = { ...assetState };
  let lifeEventImpact = 0;

  for (const event of eventsThisYear) {
    if (event.type === 'income') {
      updatedAssets.savings += event.amount;
      lifeEventImpact += event.amount;
    } else {
      // Deduct from savings first
      const fromSavings = Math.min(event.amount, Math.max(0, updatedAssets.savings));
      let remaining = event.amount - fromSavings;
      updatedAssets.savings -= fromSavings;

      // Then from super if accessible (age 60+)
      if (remaining > 0 && age >= 60 && updatedAssets.superannuationBalance > 0) {
        const fromSuper = Math.min(remaining, updatedAssets.superannuationBalance);
        updatedAssets.superannuationBalance -= fromSuper;
        remaining -= fromSuper;
      }

      // Any remainder tracked as negative savings (debt)
      if (remaining > 0) {
        updatedAssets.savings -= remaining;
      }

      lifeEventImpact -= event.amount;
    }
  }

  return { updatedAssets, lifeEventImpact };
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
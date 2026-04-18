// Korean retirement pension calculations.
// Models National Pension (국민연금) and Basic Old-Age Pension (기초연금).

import type { ICountryPensionInput } from '../../countryConfig.js';

// National Pension eligibility age. The legal age is rising from 63 (2024) to 65 by 2033;
// we keep 63 as the default for current projections.
const NPS_ELIGIBILITY_AGE = 63;

// Basic Old-Age Pension eligibility age (recipients must also be in the bottom 70%
// income/asset bracket). Single max benefit ≈ 334,810 KRW/month (2024).
const BASIC_PENSION_ELIGIBILITY_AGE = 65;
const BASIC_PENSION_MAX_MONTHLY_KRW = 334_810;
const BASIC_PENSION_MAX_ANNUAL_KRW = BASIC_PENSION_MAX_MONTHLY_KRW * 12; // ≈ 4,017,720
// Couples receive ~80% of double the single benefit (statutory couple discount).
const BASIC_PENSION_COUPLE_FACTOR = 0.8;

// Approximate financial-asset means-test cut-off (KRW) above which a recipient
// drops out of the bottom 70%. Public 2024 cut-off was ~213,000,000 KRW for singles.
const BASIC_PENSION_ASSET_CUTOFF_SINGLE = 213_000_000;
const BASIC_PENSION_ASSET_CUTOFF_COUPLE = 340_800_000;

// National Pension replacement rate after 40 years of contributions (~40% of pre-retirement income).
// Real benefit is computed from the A-value (national average income) and B-value (personal average).
// We use a simple replacement-rate model since detailed contribution history is not in the profile.
const NPS_FULL_REPLACEMENT_RATE = 0.40;
const NPS_FULL_CONTRIBUTION_YEARS = 40;
const NPS_MIN_CONTRIBUTION_YEARS = 10;

// Estimate annual NPS benefit at the user's current age, given a CPI factor for indexation.
function estimateNpsBenefit(
  preRetirementSalary: number,
  age: number,
  cpiAdjustmentFactor: number
): number {
  if (age < NPS_ELIGIBILITY_AGE) return 0;
  if (preRetirementSalary <= 0) return 0;

  // Assume the participant has at least the minimum 10 years to qualify; scale up to 40.
  // Without explicit contribution history, default to a 30-year working life as a midpoint.
  const assumedContributionYears = Math.min(NPS_FULL_CONTRIBUTION_YEARS, Math.max(NPS_MIN_CONTRIBUTION_YEARS, 30));
  const replacementRate = NPS_FULL_REPLACEMENT_RATE * (assumedContributionYears / NPS_FULL_CONTRIBUTION_YEARS);

  return preRetirementSalary * replacementRate * cpiAdjustmentFactor;
}

// Estimate annual Basic Old-Age Pension. Reduced when financial assets push the recipient
// out of the bottom 70% bracket, and reduced (per statute) when NPS benefits are high.
function estimateBasicPension(
  age: number,
  financialAssets: number,
  isCouple: boolean,
  npsAnnualBenefit: number,
  cpiAdjustmentFactor: number
): number {
  if (age < BASIC_PENSION_ELIGIBILITY_AGE) return 0;

  const cutoff = isCouple ? BASIC_PENSION_ASSET_CUTOFF_COUPLE : BASIC_PENSION_ASSET_CUTOFF_SINGLE;
  if (financialAssets >= cutoff) return 0;

  let baseAnnual = BASIC_PENSION_MAX_ANNUAL_KRW;
  if (isCouple) {
    // Couple receives ~80% of (single benefit * 2). Per-person share returned later.
    baseAnnual = BASIC_PENSION_MAX_ANNUAL_KRW * 2 * BASIC_PENSION_COUPLE_FACTOR;
  }

  // NPS-linked reduction: when NPS annual benefit exceeds 1.5x the basic pension,
  // the basic pension is gradually clawed back. Simple linear taper.
  const reductionThreshold = BASIC_PENSION_MAX_ANNUAL_KRW * 1.5;
  if (npsAnnualBenefit > reductionThreshold) {
    const overage = npsAnnualBenefit - reductionThreshold;
    const reduction = Math.min(baseAnnual * 0.5, overage * 0.5);
    baseAnnual = Math.max(0, baseAnnual - reduction);
  }

  return baseAnnual * cpiAdjustmentFactor;
}

export function getKoreanPensionAmounts(
  input: ICountryPensionInput
): { userPension: number; partnerPension: number } {
  const {
    relationshipStatus,
    savings,
    superannuation,
    mortgageBalance,
    userSalary,
    partnerSalary,
    userAge,
    partnerAge,
    cpiAdjustmentFactor = 1.0,
    partnerSuperBalance = 0
  } = input;

  const isCouple = relationshipStatus === 'couple';
  const financialAssets = savings + superannuation + (isCouple ? partnerSuperBalance : 0) - mortgageBalance;

  // Use the salaries passed in as a proxy for pre-retirement earnings.
  // When a person has retired, salary is 0; we still want to estimate NPS based on
  // their working-life income, so callers should pass the most recent active salary.
  const userNps = estimateNpsBenefit(userSalary, userAge, cpiAdjustmentFactor);
  const partnerNps = isCouple ? estimateNpsBenefit(partnerSalary, partnerAge, cpiAdjustmentFactor) : 0;

  const userBasic = estimateBasicPension(userAge, financialAssets, isCouple, userNps, cpiAdjustmentFactor);
  const partnerBasic = isCouple
    ? estimateBasicPension(partnerAge, financialAssets, true, partnerNps, cpiAdjustmentFactor)
    : 0;

  // Couples share the basic pension half-half; singles get the full amount.
  const userBasicShare = isCouple ? userBasic / 2 : userBasic;
  const partnerBasicShare = isCouple ? partnerBasic / 2 : 0;

  return {
    userPension: Math.max(0, userNps + userBasicShare),
    partnerPension: Math.max(0, partnerNps + partnerBasicShare)
  };
}

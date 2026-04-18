// Korean retirement pension calculations.
// Models National Pension (국민연금) and Basic Old-Age Pension (기초연금).
//
// ─────────────────────────────────────────────────────────────────────────────
// NPS (국민연금) BENEFIT CALCULATION
// ─────────────────────────────────────────────────────────────────────────────
// Official formula (National Pension Act):
//
//   월 기본연금액 = 소득대체율 × (A값 + B값) / 2 × (기여연수 / 40)
//
//   A값   : 연금 수급 전 3년간 전체 가입자 평균소득월액의 평균액
//           = national average monthly income of all NPS subscribers,
//             averaged over the 3 years before the pension start year.
//             Updated annually by NPS. 2026 value: 3,193,511 KRW/month.
//             This component makes NPS redistributive — lower earners receive
//             proportionally more relative to their own salary.
//
//   B값   : 가입자 개인의 가입기간 중 기준소득월액의 평균액
//           = individual subscriber's average monthly standard income
//             over their entire contribution period.
//             Approximated here as profile.salary (today's KRW).
//
//   소득대체율 : income replacement rate for 40 contribution years.
//             Historical rates: 70% (1988-1998) → 60% (1999-2007)
//             → declining 0.5%p/yr from 50% (2008) → 43% (2026+ reform).
//
//   기여연수 : actual contribution years, clamped to [10, 40].
//             Minimum 10 years required to receive any NPS pension.
//             Fixed at NPS eligibility age − 25 (work-start assumption)
//             so the benefit does not grow artificially after retirement.
//
// CPI INDEXATION
//   estimateNpsBenefit() returns the benefit in TODAY's KRW.
//   The caller (calculatePensionIncome in incomeCalculator.ts) multiplies
//   by cpiAdjustmentFactor = (1 + cpi)^yearsFromStart to convert to the
//   nominal amount for the projection year.
//
// NPS ELIGIBILITY AGE (by birth year, per National Pension Act schedule)
//   ≤1960: 61 | 1961–1964: 63 | 1965–1968: 64 | ≥1969: 65
//
// ─────────────────────────────────────────────────────────────────────────────
// BASIC OLD-AGE PENSION (기초연금)
// ─────────────────────────────────────────────────────────────────────────────
// Eligibility: age ≥ 65, bottom 70% by income/assets.
// 2024 single max: 334,810 KRW/month. Couples: 80% of (2 × single).
// Reduced when NPS benefit is high (statutory table; approximated here).
// Asset means-test cutoff CPI-adjusted over the projection period.
// NPS eligibility age by birth year (National Pension Act schedule).
function getNpsEligibilityAge(birthYear) {
    if (birthYear <= 1960)
        return 61;
    if (birthYear <= 1964)
        return 63;
    if (birthYear <= 1968)
        return 64;
    return 65;
}
// Official A값 for Dec 2025 – Nov 2026 (연금수급 전 3년 전체 가입자 평균소득월액).
// Updated annually by NPS; CPI indexation in the projection handles future years.
const NPS_A_VALUE_MONTHLY_KRW = 3_193_511;
const NPS_A_VALUE_ANNUAL_KRW = NPS_A_VALUE_MONTHLY_KRW * 12; // 38,322,132
// 소득대체율 43% for 2026+ per 2024 pension reform (full 40-year benefit).
const NPS_REPLACEMENT_RATE = 0.43;
const NPS_FULL_CONTRIBUTION_YEARS = 40;
const NPS_MIN_CONTRIBUTION_YEARS = 10;
// Basic Old-Age Pension (기초연금) — eligibility age 65, bottom 70% income/asset bracket.
// Single max benefit: 334,810 KRW/month (2024). Couple statutory discount: 80% of 2×single.
const BASIC_PENSION_ELIGIBILITY_AGE = 65;
const BASIC_PENSION_MAX_ANNUAL_KRW = 334_810 * 12; // ≈ 4,017,720
const BASIC_PENSION_COUPLE_FACTOR = 0.8;
// Approximate asset means-test cut-off (KRW). 2024 public figures.
const BASIC_PENSION_ASSET_CUTOFF_SINGLE = 213_000_000;
const BASIC_PENSION_ASSET_CUTOFF_COUPLE = 340_800_000;
// Compute annual NPS benefit in today's KRW (caller applies CPI indexation).
// Contribution years are fixed at NPS eligibility age (assumes work from 25 until eligibility).
function estimateNpsBenefit(individualAnnualSalary, // B값 in today's KRW
age, birthYear) {
    const eligibilityAge = getNpsEligibilityAge(birthYear);
    if (age < eligibilityAge)
        return 0;
    if (individualAnnualSalary <= 0)
        return 0;
    // Contribution years clamped to [10, 40], fixed at eligibility age so benefit
    // does not grow artificially in post-retirement projection years.
    const contributionYears = Math.min(NPS_FULL_CONTRIBUTION_YEARS, Math.max(NPS_MIN_CONTRIBUTION_YEARS, eligibilityAge - 25));
    // Official formula: 소득대체율 × (A값 + B값) / 2 × (P / 40)
    return NPS_REPLACEMENT_RATE * (NPS_A_VALUE_ANNUAL_KRW + individualAnnualSalary) / 2
        * (contributionYears / NPS_FULL_CONTRIBUTION_YEARS);
}
// Compute annual Basic Old-Age Pension benefit in today's KRW (caller applies CPI indexation).
// CPI factor is used only for CPI-adjusting the asset means-test cut-off.
function estimateBasicPension(age, financialAssets, isCouple, npsAnnualBenefit, cpiAdjustmentFactor) {
    if (age < BASIC_PENSION_ELIGIBILITY_AGE)
        return 0;
    const cutoff = (isCouple ? BASIC_PENSION_ASSET_CUTOFF_COUPLE : BASIC_PENSION_ASSET_CUTOFF_SINGLE)
        * cpiAdjustmentFactor;
    if (financialAssets >= cutoff)
        return 0;
    let baseAnnual = BASIC_PENSION_MAX_ANNUAL_KRW;
    if (isCouple) {
        baseAnnual = BASIC_PENSION_MAX_ANNUAL_KRW * 2 * BASIC_PENSION_COUPLE_FACTOR;
    }
    // NPS-linked reduction: statutory table compares NPS vs A-value; this is a planning approximation.
    const reductionThreshold = BASIC_PENSION_MAX_ANNUAL_KRW * 1.5;
    if (npsAnnualBenefit > reductionThreshold) {
        const overage = npsAnnualBenefit - reductionThreshold;
        const reduction = Math.min(baseAnnual * 0.5, overage * 0.5);
        baseAnnual = Math.max(0, baseAnnual - reduction);
    }
    return baseAnnual;
}
export function getKoreanPensionAmounts(input) {
    const { relationshipStatus, savings, superannuation, mortgageBalance, userSalary, partnerSalary, userPreRetirementSalary, partnerPreRetirementSalary, userAge, partnerAge, userBirthYear, partnerBirthYear, cpiAdjustmentFactor = 1.0, partnerSuperBalance = 0 } = input;
    const currentYear = new Date().getFullYear();
    const resolvedUserBirthYear = userBirthYear ?? currentYear - userAge;
    const resolvedPartnerBirthYear = partnerBirthYear ?? currentYear - partnerAge;
    const isCouple = relationshipStatus === 'couple';
    const financialAssets = savings + superannuation + (isCouple ? partnerSuperBalance : 0) - mortgageBalance;
    // Use pre-retirement salary (today's KRW) as B값; fall back to current salary if not provided.
    const userBValue = userPreRetirementSalary ?? userSalary;
    const partnerBValue = partnerPreRetirementSalary ?? partnerSalary;
    const userNps = estimateNpsBenefit(userBValue, userAge, resolvedUserBirthYear);
    const partnerNps = isCouple
        ? estimateNpsBenefit(partnerBValue, partnerAge, resolvedPartnerBirthYear)
        : 0;
    const userBasic = estimateBasicPension(userAge, financialAssets, isCouple, userNps, cpiAdjustmentFactor);
    const partnerBasic = isCouple
        ? estimateBasicPension(partnerAge, financialAssets, true, partnerNps, cpiAdjustmentFactor)
        : 0;
    // Couples split basic pension equally; singles receive the full amount.
    const userBasicShare = isCouple ? userBasic / 2 : userBasic;
    const partnerBasicShare = isCouple ? partnerBasic / 2 : 0;
    return {
        userPension: Math.max(0, userNps + userBasicShare),
        partnerPension: Math.max(0, partnerNps + partnerBasicShare)
    };
}
//# sourceMappingURL=pensionService.js.map
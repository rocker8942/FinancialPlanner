// Korean retirement pension calculations.
// Models National Pension (국민연금) and Basic Old-Age Pension (기초연금).
//
// ═════════════════════════════════════════════════════════════════════════════
// NPS (국민연금) BENEFIT CALCULATION
// ═════════════════════════════════════════════════════════════════════════════
// Official formula (National Pension Act):
//
//   월 기본연금액 = 소득대체율 × (A값 + B값) / 2 × (기여연수 / 40)
//
//   A값   : 연금 수급 전 3년간 전체 가입자 평균소득월액의 평균액
//           2026 값: 3,193,511 KRW/월. NPS가 매년 갱신.
//           이 성분이 NPS를 재분배적으로 만듦 — 저소득자가 상대적으로 더 수령.
//
//   B값   : 가입자 개인의 가입기간 중 기준소득월액의 평균액
//           여기서는 profile.salary(오늘의 KRW)로 근사.
//
//   소득대체율: 40년 가입 기준 소득대체율.
//           1988-1998: 70% → 1999-2007: 60% → 2008~: 연 0.5%p 감소
//           2026 기준: 43% (2024 연금개혁).
//
//   기여연수: [10, 40]년 클램프. 최소 10년 미만이면 NPS 지급 없음.
//           NPS 수급연령 - 25(입사 가정)로 고정, 은퇴 후 인위적 증가 방지.
//
// NPS를 A급여와 B급여로 분해 (기초연금 연계감액 계산에 필요):
//   A급여(월) = 소득대체율 × A값/2 × (기여연수/40)  ← 재분배 성분
//   B급여(월) = 소득대체율 × B값/2 × (기여연수/40)  ← 개인 기여 성분
//   합계      = A급여 + B급여 = 위 공식과 동일
//
// CPI 인플레이션 반영:
//   estimateNpsComponents()는 오늘의 KRW로 반환.
//   호출자(incomeCalculator.ts)가 (1+cpi)^연도 를 곱해 명목금액으로 변환.
//
// NPS 수급연령 (생년 기준, 국민연금법 일정):
//   ≤1956: 61세 | 1957-1960: 62세 | 1961-1964: 63세 | 1965-1968: 64세 | ≥1969: 65세
//
// ═════════════════════════════════════════════════════════════════════════════
// BASIC OLD-AGE PENSION (기초연금) — 2026년 기준
// ═════════════════════════════════════════════════════════════════════════════
//
// [수급 자격]
//   - 만 65세 이상
//   - 소득인정액이 선정기준액 이하인 하위 70%
//     단독가구 2026 선정기준액: 월 247만원 (소득인정액 기준)
//     * 소득인정액 = 소득평가액 + 재산의 소득환산액 (복잡한 산정식)
//     * 이 코드에서는 금융자산 + (일반재산 - 기본재산공제) 합계로 근사
//
// [기준연금액 (최대 급여)]
//   연도별 기준연금액 (물가 연동 매년 인상):
//     2024: 334,810원/월
//     2025: 342,510원/월
//     2026: 349,700원/월  ← 현재 적용값
//   이 코드는 오늘의 KRW로 반환; 호출자가 CPI 팩터를 곱해 미래 명목값으로 변환.
//
// [부부 감액]
//   부부 모두 수급 시 각각 20% 감액:
//     단독 최대: 349,700원/월
//     부부 각각 최대: 279,760원/월 (= 349,700 × 0.8)
//
// [국민연금 연계감액 (A급여 연계)]
//   NPS를 많이 받는 고소득 수급자의 기초연금을 감액하는 제도 (기초연금법 §8).
//   목적: 기초연금 재정 효율화 + NPS 성실 가입 인센티브 유지.
//
//   2026년 연계감액 발동 조건 (두 조건 모두 충족 시):
//     ① NPS 월수령액 > 524,550원 (= 기준연금액 349,700 × 1.5)
//     ② A급여 월액    > 262,270원 (= 기준연금액 349,700 × 0.75)
//
//   감액 계산 (일 계획 용도 근사; 실제는 NPS 법정 산정표 기준):
//     감액분 = min(기초연금액 × 50%, (A급여월 - 발동기준) × 2/3)
//     기초연금액 = max(기초연금최저보장, 기초연금액 - 감액분)
//
//   최저보장: 기준연금액 × 10% = 34,970원/월 (기초연금법 §8④)
//   * 정확한 금액은 NPS 고객센터(☎1355) 또는 복지로(bokjiro.go.kr) 모의계산 이용.
//
// 출처:
//   보건복지부 2026년 기초연금 보도자료 (2026.02.11)
//   기초연금 제도안내: basicpension.mohw.go.kr
//   NPS 국민연금공단: nps.or.kr

import type { ICountryPensionInput } from '../../countryConfig.js';

// NPS eligibility age by birth year (National Pension Act schedule).
function getNpsEligibilityAge(birthYear: number): number {
  if (birthYear <= 1956) return 61;
  if (birthYear <= 1960) return 62;
  if (birthYear <= 1964) return 63;
  if (birthYear <= 1968) return 64;
  return 65;
}

function getContributionYears(
  eligibilityAge: number,
  npsContributionYearsToDate?: number,
): number {
  if (npsContributionYearsToDate !== undefined) {
    return Math.min(NPS_FULL_CONTRIBUTION_YEARS, npsContributionYearsToDate);
  }
  return Math.min(NPS_FULL_CONTRIBUTION_YEARS,
    Math.max(NPS_MIN_CONTRIBUTION_YEARS, eligibilityAge - 25));
}

// Official A값 for Dec 2025 – Nov 2026 (연금수급 전 3년 전체 가입자 평균소득월액).
const NPS_A_VALUE_MONTHLY_KRW = 3_193_511;
const NPS_A_VALUE_ANNUAL_KRW = NPS_A_VALUE_MONTHLY_KRW * 12;

// 소득대체율 43% for 2026+ per 2024 pension reform.
const NPS_REPLACEMENT_RATE = 0.43;
const NPS_FULL_CONTRIBUTION_YEARS = 40;
const NPS_MIN_CONTRIBUTION_YEARS = 10;

// 기준소득월액 상한/하한 (2026): B값 계산 전 소득을 클램프.
const NPS_INCOME_CEILING_ANNUAL_KRW = 6_590_000 * 12; // 79,080,000
const NPS_INCOME_FLOOR_ANNUAL_KRW = 390_000 * 12;     // 4,680,000

// 기초연금 기준연금액 (2026) — 매년 물가 연동 인상.
const BASIC_PENSION_ELIGIBILITY_AGE = 65;
const BASIC_PENSION_MAX_MONTHLY_KRW = 349_700;             // 2026 기준

// 부부 감액: 각자 20% 차감 → 0.8 배율.
const BASIC_PENSION_COUPLE_FACTOR = 0.8;

// 국민연금 연계감액 발동 기준 (2026, 기준연금액 비율).
const NPS_LINK_REDUCTION_NPS_RATIO = 1.5;  // NPS월 > 기준연금액 × 1.5
const NPS_LINK_REDUCTION_A_RATIO = 0.75;   // A급여월 > 기준연금액 × 0.75

// 최저보장연금: 기준연금액의 10% (기초연금법 §8④).
const BASIC_PENSION_MIN_GUARANTEE_RATIO = 0.1;

// 재산 기준 (소득인정액 산정의 재산 컷오프 근사, 단위: KRW). 2024년 공표 수치.
// 실제는 소득인정액(소득+재산환산액) 기준이므로 이 수치는 계획 용도 근사값.
const BASIC_PENSION_ASSET_CUTOFF_SINGLE = 213_000_000;
const BASIC_PENSION_ASSET_CUTOFF_COUPLE = 340_800_000;

// 기본재산공제: 일반재산(투자부동산 포함)에서 공제하는 지역별 기준액. 대도시 기준 적용 (계획 용도).
// 대도시 135,000,000 | 중소도시 85,000,000 | 농어촌 72,500,000
const BASIC_PENSION_PROPERTY_DEDUCTION = 135_000_000;

// Returns { totalAnnual, aComponentMonthly } in today's KRW.
// aComponentMonthly: 기초연금 연계감액 계산에 사용되는 A급여 월액.
function estimateNpsComponents(
  individualAnnualSalary: number,
  age: number,
  birthYear: number,
  npsContributionYearsToDate?: number
): { totalAnnual: number; aComponentMonthly: number } {
  const eligibilityAge = getNpsEligibilityAge(birthYear);
  if (age < eligibilityAge) {
    return { totalAnnual: 0, aComponentMonthly: 0 };
  }

  // When NPS years not explicitly provided, require salary > 0 to infer employment history.
  if (npsContributionYearsToDate === undefined && individualAnnualSalary <= 0) {
    return { totalAnnual: 0, aComponentMonthly: 0 };
  }

  const years = getContributionYears(eligibilityAge, npsContributionYearsToDate);
  if (years < NPS_MIN_CONTRIBUTION_YEARS) {
    return { totalAnnual: 0, aComponentMonthly: 0 };
  }
  const yearRatio = years / NPS_FULL_CONTRIBUTION_YEARS;

  // A급여(월) = 소득대체율 × A값(월) / 2 × (기여연수/40)
  const aComponentMonthly = NPS_REPLACEMENT_RATE * NPS_A_VALUE_MONTHLY_KRW / 2 * yearRatio;

  // B값: 기준소득월액 상한/하한 클램프
  const bValue = Math.min(NPS_INCOME_CEILING_ANNUAL_KRW,
    Math.max(NPS_INCOME_FLOOR_ANNUAL_KRW, individualAnnualSalary));

  // 총 NPS 연간 = 소득대체율 × (A값연 + B값연) / 2 × 연수비율
  const totalAnnual = NPS_REPLACEMENT_RATE * (NPS_A_VALUE_ANNUAL_KRW + bValue) / 2 * yearRatio;

  return { totalAnnual, aComponentMonthly };
}

// Compute annual Basic Old-Age Pension in today's KRW (caller applies CPI indexation).
// cpiAdjustmentFactor is used only for CPI-adjusting the asset means-test cutoff.
function estimateBasicPension(
  age: number,
  financialAssets: number,
  isCouple: boolean,
  npsTotalMonthly: number,    // NPS 총 월수령액 (연계감액 발동 조건 ①)
  npsAComponentMonthly: number, // A급여 월액 (연계감액 발동 조건 ②)
  cpiAdjustmentFactor: number
): number {
  if (age < BASIC_PENSION_ELIGIBILITY_AGE) return 0;

  const cutoff = (isCouple ? BASIC_PENSION_ASSET_CUTOFF_COUPLE : BASIC_PENSION_ASSET_CUTOFF_SINGLE)
    * cpiAdjustmentFactor;
  if (financialAssets >= cutoff) return 0;

  // 부부 감액: 각자 20% 차감
  const baseMonthly = BASIC_PENSION_MAX_MONTHLY_KRW * (isCouple ? BASIC_PENSION_COUPLE_FACTOR : 1);

  // 국민연금 연계감액: 두 조건 모두 충족 시 적용
  const npsThresholdMonthly = BASIC_PENSION_MAX_MONTHLY_KRW * NPS_LINK_REDUCTION_NPS_RATIO; // 524,550
  const aThresholdMonthly = BASIC_PENSION_MAX_MONTHLY_KRW * NPS_LINK_REDUCTION_A_RATIO;    // 262,275
  const minGuaranteeMonthly = BASIC_PENSION_MAX_MONTHLY_KRW * BASIC_PENSION_MIN_GUARANTEE_RATIO; // 34,970

  let adjustedMonthly = baseMonthly;
  if (npsTotalMonthly > npsThresholdMonthly && npsAComponentMonthly > aThresholdMonthly) {
    const reduction = Math.min(baseMonthly * 0.5, (npsAComponentMonthly - aThresholdMonthly) * (2 / 3));
    adjustedMonthly = Math.max(minGuaranteeMonthly, baseMonthly - reduction);
  }

  return adjustedMonthly * 12;
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
    userPreRetirementSalary,
    partnerPreRetirementSalary,
    userAge,
    partnerAge,
    userBirthYear,
    partnerBirthYear,
    cpiAdjustmentFactor = 1.0,
    partnerSuperBalance = 0,
    userNpsContributionYearsToDate,
    partnerNpsContributionYearsToDate
  } = input;

  const currentYear = new Date().getFullYear();
  const resolvedUserBirthYear = userBirthYear ?? currentYear - userAge;
  const resolvedPartnerBirthYear = partnerBirthYear ?? currentYear - partnerAge;

  const isCouple = relationshipStatus === 'couple';
  const adjustedProperty = Math.max(0, (input.propertyAssets ?? 0) - BASIC_PENSION_PROPERTY_DEDUCTION);
  const financialAssets = savings + superannuation + (isCouple ? partnerSuperBalance : 0) - mortgageBalance + adjustedProperty;

  const userBValue = userPreRetirementSalary ?? userSalary;
  const partnerBValue = partnerPreRetirementSalary ?? partnerSalary;

  const userNps = estimateNpsComponents(userBValue, userAge, resolvedUserBirthYear,
    userNpsContributionYearsToDate);
  const partnerNps = isCouple
    ? estimateNpsComponents(partnerBValue, partnerAge, resolvedPartnerBirthYear,
        partnerNpsContributionYearsToDate)
    : { totalAnnual: 0, aComponentMonthly: 0 };

  const userNpsMonthly = userNps.totalAnnual / 12;
  const partnerNpsMonthly = partnerNps.totalAnnual / 12;

  // 부부감액(20%)은 두 사람 모두 기초연금을 실제 수급할 때만 적용 (기초연금법 §8②).
  // 파트너가 아직 65세 미만이면 유저는 단독 기준(감액 없음)으로 수급.
  const partnerBasicEligible = isCouple && partnerAge >= BASIC_PENSION_ELIGIBILITY_AGE;
  const applyCoupleFactor = isCouple && userAge >= BASIC_PENSION_ELIGIBILITY_AGE && partnerBasicEligible;

  const userBasic = estimateBasicPension(
    userAge, financialAssets, applyCoupleFactor,
    userNpsMonthly, userNps.aComponentMonthly, cpiAdjustmentFactor
  );
  const partnerBasic = partnerBasicEligible
    ? estimateBasicPension(
        partnerAge, financialAssets, applyCoupleFactor,
        partnerNpsMonthly, partnerNps.aComponentMonthly, cpiAdjustmentFactor
      )
    : 0;

  return {
    userPension: Math.max(0, userNps.totalAnnual + userBasic),
    partnerPension: Math.max(0, partnerNps.totalAnnual + partnerBasic)
  };
}

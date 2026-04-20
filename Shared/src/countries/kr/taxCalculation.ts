// Korean Tax Calculation Utilities (2024)
// Income tax (소득세) brackets, local income tax (지방소득세 = 10% of income tax),
// national health insurance, long-term care insurance, and employment insurance.

import type { TaxBreakdown } from '../../types.js';

// 2024 Korean income tax brackets (KRW). Rates apply progressively.
const TAX_BRACKETS = [
  { min: 0,             max: 14_000_000,   rate: 0.06 },
  { min: 14_000_000,   max: 50_000_000,   rate: 0.15 },
  { min: 50_000_000,   max: 88_000_000,   rate: 0.24 },
  { min: 88_000_000,   max: 150_000_000,  rate: 0.35 },
  { min: 150_000_000,  max: 300_000_000,  rate: 0.38 },
  { min: 300_000_000,  max: 500_000_000,  rate: 0.40 },
  { min: 500_000_000,  max: 1_000_000_000, rate: 0.42 },
  { min: 1_000_000_000, max: Infinity,    rate: 0.45 }
];

// Local income tax (지방소득세) is a flat 10% surcharge on national income tax.
const LOCAL_INCOME_TAX_RATE = 0.10;

// Statutory employee-paid social insurance rates (approximate 2024 figures).
const HEALTH_INSURANCE_EMPLOYEE_RATE = 0.03545; // ~3.545% of salary (employee share of ~7.09%)
const LONG_TERM_CARE_RATE = 0.1295; // 12.95% of the health insurance premium
const EMPLOYMENT_INSURANCE_EMPLOYEE_RATE = 0.009; // ~0.9% employee share

// National Pension Service (국민연금) employee contribution rate.
// Employer contributes another 4.5% (total 9%).
const NPS_EMPLOYEE_RATE = 0.045;

// 2024 근로소득공제 (earned income deduction) — applied to gross before bracket calc.
// Maximum deduction is capped at ₩20,000,000.
function calculateEarnedIncomeDeduction(grossIncome: number): number {
  const DEDUCTION_TABLE = [
    { min: 0,           max: 5_000_000,   base: 0,          rate: 0.70 },
    { min: 5_000_000,   max: 15_000_000,  base: 3_500_000,  rate: 0.40 },
    { min: 15_000_000,  max: 45_000_000,  base: 7_500_000,  rate: 0.15 },
    { min: 45_000_000,  max: 100_000_000, base: 12_000_000, rate: 0.05 },
    { min: 100_000_000, max: Infinity,    base: 14_750_000, rate: 0.02 },
  ];
  const MAX_DEDUCTION = 20_000_000;

  for (const row of DEDUCTION_TABLE) {
    if (grossIncome <= row.max) {
      const deduction = row.base + (grossIncome - row.min) * row.rate;
      return Math.min(deduction, MAX_DEDUCTION);
    }
  }
  return MAX_DEDUCTION;
}

// The orchestrator deducts NPS (4.5%) from the salary package before calling these functions,
// so all exported tax functions receive postNpsIncome = salary * (1 - NPS_EMPLOYEE_RATE).
// We reverse this to obtain the true gross salary so that:
//   1. 근로소득공제 is applied to the correct (pre-NPS) gross base
//   2. NPS itself is also deducted from the taxable base (it is a 소득공제 item)
//   3. Social insurance (건강보험 등) is calculated on the true gross salary (보수월액)
function recoverGross(postNpsIncome: number): number {
  return postNpsIncome / (1 - NPS_EMPLOYEE_RATE);
}

// Computes income tax given the true pre-NPS gross salary.
function incomeTaxFromGross(grossSalary: number): number {
  const npsDeduction = Math.round(grossSalary * NPS_EMPLOYEE_RATE);
  const taxableIncome = Math.max(0, grossSalary - calculateEarnedIncomeDeduction(grossSalary) - npsDeduction);
  let tax = 0;
  let processed = 0;
  for (const bracket of TAX_BRACKETS) {
    if (processed >= taxableIncome) break;
    const end = Math.min(bracket.max, taxableIncome);
    if (end > bracket.min) {
      tax += (end - Math.max(bracket.min, processed)) * bracket.rate;
      processed = end;
    }
  }
  return Math.round(tax);
}

export function calculateIncomeTax(postNpsIncome: number): number {
  if (postNpsIncome <= 0) return 0;
  return incomeTaxFromGross(recoverGross(postNpsIncome));
}

// Local income tax = 10% of national income tax.
export function calculateLocalIncomeTax(postNpsIncome: number): number {
  if (postNpsIncome <= 0) return 0;
  return Math.round(calculateIncomeTax(postNpsIncome) * LOCAL_INCOME_TAX_RATE);
}

// Social insurance (health + LTC + employment) on true gross salary (보수월액 기준).
export function calculateSocialInsurance(postNpsIncome: number): number {
  if (postNpsIncome <= 0) return 0;
  const grossSalary = recoverGross(postNpsIncome);
  const health = grossSalary * HEALTH_INSURANCE_EMPLOYEE_RATE;
  const longTermCare = health * LONG_TERM_CARE_RATE;
  const employment = grossSalary * EMPLOYMENT_INSURANCE_EMPLOYEE_RATE;
  return Math.round(health + longTermCare + employment);
}

export function calculateNetIncome(postNpsIncome: number): number {
  if (postNpsIncome <= 0) return 0;
  const incomeTax = calculateIncomeTax(postNpsIncome);
  const localTax = calculateLocalIncomeTax(postNpsIncome);
  const socialInsurance = calculateSocialInsurance(postNpsIncome);
  return Math.max(0, postNpsIncome - incomeTax - localTax - socialInsurance);
}

// `medicareLevy` carries combined local-tax + social-insurance for KR display.
export function getTaxBreakdown(
  postNpsIncome: number,
  _superContributions: number = 0
): TaxBreakdown {
  if (postNpsIncome <= 0) {
    return { grossIncome: 0, incomeTax: 0, medicareLevy: 0, netIncome: 0, superContributionsTax: 0 };
  }
  const grossSalary = recoverGross(postNpsIncome);
  const incomeTax = calculateIncomeTax(postNpsIncome);
  const localTax = calculateLocalIncomeTax(postNpsIncome);
  const socialInsurance = calculateSocialInsurance(postNpsIncome);
  const otherDeductions = localTax + socialInsurance;
  const netIncome = postNpsIncome - incomeTax - otherDeductions;

  return {
    grossIncome: Math.round(grossSalary),
    incomeTax: Math.round(incomeTax),
    medicareLevy: Math.round(otherDeductions),
    netIncome: Math.round(Math.max(0, netIncome)),
    superContributionsTax: 0
  };
}

// NPS (국민연금) is a defined benefit scheme — employee contributions go to the national
// pension pool, not a personal account. Return 0 so the contribution reduces take-home
// income (via the pre-tax deduction in processSalaryPackage) without being added to the
// personal IRP/superannuation balance. The NPS pension is modelled separately via the
// defined-benefit formula in pensionService.ts.
export function calculateNetSuperContributions(
  _grossSuperContributions: number,
  _totalGrossIncome: number
): number {
  return 0;
}

// Helper exposed for orchestrators that need the employee NPS contribution amount.
export function getNpsEmployeeContribution(salary: number): number {
  if (salary <= 0) return 0;
  return Math.round(salary * NPS_EMPLOYEE_RATE);
}

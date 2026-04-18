// Korean Tax Calculation Utilities (2024)
// Income tax (소득세) brackets, local income tax (지방소득세 = 10% of income tax),
// national health insurance, long-term care insurance, and employment insurance.

import type { TaxBreakdown } from '../../types.js';

// 2024 Korean income tax brackets (KRW). Rates apply progressively.
const TAX_BRACKETS = [
  { min: 0, max: 14_000_000, rate: 0.06 },
  { min: 14_000_001, max: 50_000_000, rate: 0.15 },
  { min: 50_000_001, max: 88_000_000, rate: 0.24 },
  { min: 88_000_001, max: 150_000_000, rate: 0.35 },
  { min: 150_000_001, max: 300_000_000, rate: 0.38 },
  { min: 300_000_001, max: 500_000_000, rate: 0.40 },
  { min: 500_000_001, max: 1_000_000_000, rate: 0.42 },
  { min: 1_000_000_001, max: Infinity, rate: 0.45 }
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

export function calculateIncomeTax(grossIncome: number): number {
  if (grossIncome <= 0) return 0;

  let tax = 0;
  let processedIncome = 0;

  for (const bracket of TAX_BRACKETS) {
    if (processedIncome >= grossIncome) break;

    const bracketStart = Math.max(bracket.min, processedIncome);
    const bracketEnd = Math.min(bracket.max, grossIncome);

    if (bracketEnd > bracketStart) {
      const incomeInBracket = bracketEnd - bracketStart;
      tax += incomeInBracket * bracket.rate;
      processedIncome = bracketEnd;
    }
  }

  return Math.round(tax);
}

// Local income tax = 10% of national income tax. Returned separately so callers can
// surface it in summaries; the primary tax calculation includes both layers.
export function calculateLocalIncomeTax(grossIncome: number): number {
  if (grossIncome <= 0) return 0;
  return Math.round(calculateIncomeTax(grossIncome) * LOCAL_INCOME_TAX_RATE);
}

// Combined social insurance deductions (health + LTC + employment).
// NPS is treated separately as the "super contributions" equivalent in the orchestrator.
export function calculateSocialInsurance(grossIncome: number): number {
  if (grossIncome <= 0) return 0;
  const health = grossIncome * HEALTH_INSURANCE_EMPLOYEE_RATE;
  const longTermCare = health * LONG_TERM_CARE_RATE;
  const employment = grossIncome * EMPLOYMENT_INSURANCE_EMPLOYEE_RATE;
  return Math.round(health + longTermCare + employment);
}

export function calculateNetIncome(grossIncome: number): number {
  if (grossIncome <= 0) return 0;

  const incomeTax = calculateIncomeTax(grossIncome);
  const localTax = calculateLocalIncomeTax(grossIncome);
  const socialInsurance = calculateSocialInsurance(grossIncome);

  return Math.max(0, grossIncome - incomeTax - localTax - socialInsurance);
}

// Adapter to the shared TaxBreakdown shape so the rest of the orchestrator stays generic.
// `medicareLevy` is repurposed to carry the combined local-tax-plus-social-insurance figure
// for Korea so it surfaces as a single non-income-tax deduction in summaries.
export function getTaxBreakdown(
  grossIncome: number,
  superContributions: number = 0
): TaxBreakdown {
  const incomeTax = calculateIncomeTax(grossIncome);
  const localTax = calculateLocalIncomeTax(grossIncome);
  const socialInsurance = calculateSocialInsurance(grossIncome);
  const otherDeductions = localTax + socialInsurance;
  const netIncome = grossIncome - incomeTax - otherDeductions;
  // For KR, NPS contributions are deducted from the employee's gross before being paid in.
  // There is no equivalent of Australia's super contributions tax, so we report 0 here.
  const superContributionsTax = superContributions > 0 ? 0 : 0;

  return {
    grossIncome: Math.round(grossIncome),
    incomeTax: Math.round(incomeTax),
    medicareLevy: Math.round(otherDeductions),
    netIncome: Math.round(Math.max(0, netIncome)),
    superContributionsTax
  };
}

// Korea has no concessional contributions tax. The employee NPS contribution is
// deducted pre-tax from the salary package but the contribution itself is not taxed,
// so the net super contribution equals the gross.
export function calculateNetSuperContributions(
  grossSuperContributions: number,
  _totalGrossIncome: number
): number {
  if (grossSuperContributions <= 0) return 0;
  return Math.max(0, grossSuperContributions);
}

// Helper exposed for orchestrators that need the employee NPS contribution amount.
export function getNpsEmployeeContribution(salary: number): number {
  if (salary <= 0) return 0;
  return Math.round(salary * NPS_EMPLOYEE_RATE);
}

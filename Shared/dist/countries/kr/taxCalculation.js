// Korean Tax Calculation Utilities (2024)
// Income tax (소득세) brackets, local income tax (지방소득세 = 10% of income tax),
// national health insurance, long-term care insurance, and employment insurance.
// 2024 Korean income tax brackets (KRW). Rates apply progressively.
const TAX_BRACKETS = [
    { min: 0, max: 14_000_000, rate: 0.06 },
    { min: 14_000_000, max: 50_000_000, rate: 0.15 },
    { min: 50_000_000, max: 88_000_000, rate: 0.24 },
    { min: 88_000_000, max: 150_000_000, rate: 0.35 },
    { min: 150_000_000, max: 300_000_000, rate: 0.38 },
    { min: 300_000_000, max: 500_000_000, rate: 0.40 },
    { min: 500_000_000, max: 1_000_000_000, rate: 0.42 },
    { min: 1_000_000_000, max: Infinity, rate: 0.45 }
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
function calculateEarnedIncomeDeduction(grossIncome) {
    const DEDUCTION_TABLE = [
        { min: 0, max: 5_000_000, base: 0, rate: 0.70 },
        { min: 5_000_000, max: 15_000_000, base: 3_500_000, rate: 0.40 },
        { min: 15_000_000, max: 45_000_000, base: 7_500_000, rate: 0.15 },
        { min: 45_000_000, max: 100_000_000, base: 12_000_000, rate: 0.05 },
        { min: 100_000_000, max: Infinity, base: 14_750_000, rate: 0.02 },
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
export function calculateIncomeTax(grossIncome) {
    if (grossIncome <= 0)
        return 0;
    const taxableIncome = Math.max(0, grossIncome - calculateEarnedIncomeDeduction(grossIncome));
    let tax = 0;
    let processed = 0;
    for (const bracket of TAX_BRACKETS) {
        if (processed >= taxableIncome)
            break;
        const end = Math.min(bracket.max, taxableIncome);
        if (end > bracket.min) {
            tax += (end - Math.max(bracket.min, processed)) * bracket.rate;
            processed = end;
        }
    }
    return Math.round(tax);
}
// Local income tax = 10% of national income tax. Returned separately so callers can
// surface it in summaries; the primary tax calculation includes both layers.
export function calculateLocalIncomeTax(grossIncome) {
    if (grossIncome <= 0)
        return 0;
    return Math.round(calculateIncomeTax(grossIncome) * LOCAL_INCOME_TAX_RATE);
}
// Combined social insurance deductions (health + LTC + employment).
// NPS is treated separately as the "super contributions" equivalent in the orchestrator.
export function calculateSocialInsurance(grossIncome) {
    if (grossIncome <= 0)
        return 0;
    const health = grossIncome * HEALTH_INSURANCE_EMPLOYEE_RATE;
    const longTermCare = health * LONG_TERM_CARE_RATE;
    const employment = grossIncome * EMPLOYMENT_INSURANCE_EMPLOYEE_RATE;
    return Math.round(health + longTermCare + employment);
}
export function calculateNetIncome(grossIncome) {
    if (grossIncome <= 0)
        return 0;
    const incomeTax = calculateIncomeTax(grossIncome);
    const localTax = calculateLocalIncomeTax(grossIncome);
    const socialInsurance = calculateSocialInsurance(grossIncome);
    return Math.max(0, grossIncome - incomeTax - localTax - socialInsurance);
}
// Adapter to the shared TaxBreakdown shape so the rest of the orchestrator stays generic.
// `medicareLevy` is repurposed to carry the combined local-tax-plus-social-insurance figure
// for Korea so it surfaces as a single non-income-tax deduction in summaries.
export function getTaxBreakdown(grossIncome, _superContributions = 0) {
    const incomeTax = calculateIncomeTax(grossIncome);
    const localTax = calculateLocalIncomeTax(grossIncome);
    const socialInsurance = calculateSocialInsurance(grossIncome);
    const otherDeductions = localTax + socialInsurance;
    const netIncome = grossIncome - incomeTax - otherDeductions;
    // For KR, NPS contributions are deducted from the employee's gross before being paid in.
    // There is no equivalent of Australia's super contributions tax, so we report 0 here.
    const superContributionsTax = 0;
    return {
        grossIncome: Math.round(grossIncome),
        incomeTax: Math.round(incomeTax),
        medicareLevy: Math.round(otherDeductions),
        netIncome: Math.round(Math.max(0, netIncome)),
        superContributionsTax
    };
}
// NPS (국민연금) is a defined benefit scheme — employee contributions go to the national
// pension pool, not a personal account. Return 0 so the contribution reduces take-home
// income (via the pre-tax deduction in processSalaryPackage) without being added to the
// personal IRP/superannuation balance. The NPS pension is modelled separately via the
// defined-benefit formula in pensionService.ts.
export function calculateNetSuperContributions(_grossSuperContributions, _totalGrossIncome) {
    return 0;
}
// Helper exposed for orchestrators that need the employee NPS contribution amount.
export function getNpsEmployeeContribution(salary) {
    if (salary <= 0)
        return 0;
    return Math.round(salary * NPS_EMPLOYEE_RATE);
}
//# sourceMappingURL=taxCalculation.js.map
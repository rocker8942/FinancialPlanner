// Australian Tax Calculation Utilities (2024-25 and 2025-26 Financial Years)
// Australian Income Tax Brackets for 2024-25 and 2025-26 (Stage 3 tax cuts)
const TAX_BRACKETS = [
    { min: 0, max: 18200, rate: 0.00 },
    { min: 18201, max: 45000, rate: 0.16 },
    { min: 45001, max: 135000, rate: 0.30 },
    { min: 135001, max: 190000, rate: 0.37 },
    { min: 190001, max: Infinity, rate: 0.45 }
];
const MEDICARE_LEVY_RATE = 0.02;
const MEDICARE_LEVY_THRESHOLD_SINGLE = 27222;
const MEDICARE_LEVY_PHASE_IN_END = 34027;
const SUPER_CONTRIBUTIONS_TAX_RATE = 0.15;
const DIVISION_293_THRESHOLD = 250000;
const DIVISION_293_ADDITIONAL_TAX = 0.15;
const LISTO_INCOME_THRESHOLD = 37000;
const LISTO_MAX_REFUND = 500;
export function calculateIncomeTax(grossIncome) {
    if (grossIncome <= 0)
        return 0;
    let tax = 0;
    let processedIncome = 0;
    for (const bracket of TAX_BRACKETS) {
        if (processedIncome >= grossIncome)
            break;
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
export function calculateMedicareLevy(grossIncome) {
    if (grossIncome <= 0)
        return 0;
    if (grossIncome <= MEDICARE_LEVY_THRESHOLD_SINGLE) {
        return 0;
    }
    if (grossIncome <= MEDICARE_LEVY_PHASE_IN_END) {
        const excessIncome = grossIncome - MEDICARE_LEVY_THRESHOLD_SINGLE;
        return Math.round(excessIncome * 0.10);
    }
    return Math.round(grossIncome * MEDICARE_LEVY_RATE);
}
export function calculateSuperContributionsTax(superContributions, totalGrossIncome) {
    if (superContributions <= 0)
        return 0;
    let superTax = superContributions * SUPER_CONTRIBUTIONS_TAX_RATE;
    if (totalGrossIncome + superContributions > DIVISION_293_THRESHOLD) {
        const excessIncome = (totalGrossIncome + superContributions) - DIVISION_293_THRESHOLD;
        const division293Amount = Math.min(excessIncome, superContributions);
        superTax += division293Amount * DIVISION_293_ADDITIONAL_TAX;
    }
    return Math.round(superTax);
}
export function calculateLISTO(grossIncome, superContributions) {
    if (grossIncome > LISTO_INCOME_THRESHOLD || superContributions <= 0) {
        return 0;
    }
    const listoAmount = superContributions * SUPER_CONTRIBUTIONS_TAX_RATE;
    return Math.min(listoAmount, LISTO_MAX_REFUND);
}
export function calculateNetIncome(grossIncome) {
    if (grossIncome <= 0)
        return 0;
    const incomeTax = calculateIncomeTax(grossIncome);
    const medicareLevy = calculateMedicareLevy(grossIncome);
    return Math.max(0, grossIncome - incomeTax - medicareLevy);
}
export function getTaxBreakdown(grossIncome, superContributions = 0) {
    const incomeTax = calculateIncomeTax(grossIncome);
    const medicareLevy = calculateMedicareLevy(grossIncome);
    const superContributionsTax = calculateSuperContributionsTax(superContributions, grossIncome);
    const netIncome = grossIncome - incomeTax - medicareLevy;
    return {
        grossIncome: Math.round(grossIncome),
        incomeTax: Math.round(incomeTax),
        medicareLevy: Math.round(medicareLevy),
        netIncome: Math.round(Math.max(0, netIncome)),
        superContributionsTax: Math.round(superContributionsTax)
    };
}
export function calculateNetSuperContributions(grossSuperContributions, totalGrossIncome) {
    if (grossSuperContributions <= 0)
        return 0;
    const superTax = calculateSuperContributionsTax(grossSuperContributions, totalGrossIncome);
    const listo = calculateLISTO(totalGrossIncome, grossSuperContributions);
    return Math.max(0, grossSuperContributions - superTax + listo);
}
//# sourceMappingURL=taxCalculation.js.map
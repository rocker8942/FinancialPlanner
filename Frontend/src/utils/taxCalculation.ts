// Australian Tax Calculation Utilities (2024-25 and 2025-26 Financial Years — brackets unchanged)

export interface TaxBreakdown {
  grossIncome: number;
  incomeTax: number;
  medicareLevy: number;
  netIncome: number;
  superContributionsTax: number;
}

// Australian Income Tax Brackets for 2024-25 and 2025-26 (Stage 3 tax cuts — unchanged for both years)
const TAX_BRACKETS = [
  { min: 0, max: 18200, rate: 0.00 },
  { min: 18201, max: 45000, rate: 0.16 },
  { min: 45001, max: 135000, rate: 0.30 },
  { min: 135001, max: 190000, rate: 0.37 },
  { min: 190001, max: Infinity, rate: 0.45 }
];

// Medicare Levy Constants
const MEDICARE_LEVY_RATE = 0.02; // 2%
const MEDICARE_LEVY_THRESHOLD_SINGLE = 27222;
const MEDICARE_LEVY_PHASE_IN_END = 34027;

// Superannuation Tax Constants
const SUPER_CONTRIBUTIONS_TAX_RATE = 0.15; // 15%
const DIVISION_293_THRESHOLD = 250000;
const DIVISION_293_ADDITIONAL_TAX = 0.15; // Additional 15%
const LISTO_INCOME_THRESHOLD = 37000;
const LISTO_MAX_REFUND = 500;

/**
 * Calculate Australian income tax based on 2024-25 tax brackets
 */
export function calculateIncomeTax(grossIncome: number): number {
  if (grossIncome <= 0) return 0;
  
  let tax = 0;
  let processedIncome = 0;
  
  for (const bracket of TAX_BRACKETS) {
    if (processedIncome >= grossIncome) break;
    
    // Determine the income range for this bracket
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

/**
 * Calculate Medicare Levy with low income thresholds
 */
export function calculateMedicareLevy(grossIncome: number): number {
  if (grossIncome <= 0) return 0;
  
  // No Medicare levy if below threshold
  if (grossIncome <= MEDICARE_LEVY_THRESHOLD_SINGLE) {
    return 0;
  }
  
  // Phase-in rate between threshold and phase-in end
  if (grossIncome <= MEDICARE_LEVY_PHASE_IN_END) {
    const excessIncome = grossIncome - MEDICARE_LEVY_THRESHOLD_SINGLE;
    return Math.round(excessIncome * 0.10); // 10 cents per dollar above threshold
  }
  
  // Full Medicare levy
  return Math.round(grossIncome * MEDICARE_LEVY_RATE);
}

/**
 * Calculate tax on superannuation contributions
 */
export function calculateSuperContributionsTax(
  superContributions: number, 
  totalGrossIncome: number
): number {
  if (superContributions <= 0) return 0;
  
  // Standard 15% tax on concessional contributions
  let superTax = superContributions * SUPER_CONTRIBUTIONS_TAX_RATE;
  
  // Division 293 tax for high income earners
  if (totalGrossIncome + superContributions > DIVISION_293_THRESHOLD) {
    const excessIncome = (totalGrossIncome + superContributions) - DIVISION_293_THRESHOLD;
    const division293Amount = Math.min(excessIncome, superContributions);
    superTax += division293Amount * DIVISION_293_ADDITIONAL_TAX;
  }
  
  return Math.round(superTax);
}

/**
 * Calculate Low Income Super Tax Offset (LISTO)
 */
export function calculateLISTO(grossIncome: number, superContributions: number): number {
  if (grossIncome > LISTO_INCOME_THRESHOLD || superContributions <= 0) {
    return 0;
  }
  
  // LISTO is 15% of super contributions, capped at $500
  const listoAmount = superContributions * SUPER_CONTRIBUTIONS_TAX_RATE;
  return Math.min(listoAmount, LISTO_MAX_REFUND);
}

/**
 * Calculate net income after all taxes
 */
export function calculateNetIncome(grossIncome: number): number {
  if (grossIncome <= 0) return 0;
  
  const incomeTax = calculateIncomeTax(grossIncome);
  const medicareLevy = calculateMedicareLevy(grossIncome);
  
  return Math.max(0, grossIncome - incomeTax - medicareLevy);
}

/**
 * Get comprehensive tax breakdown for display purposes
 */
export function getTaxBreakdown(
  grossIncome: number, 
  superContributions: number = 0
): TaxBreakdown {
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

/**
 * Calculate net superannuation contributions after tax
 */
export function calculateNetSuperContributions(
  grossSuperContributions: number,
  totalGrossIncome: number
): number {
  if (grossSuperContributions <= 0) return 0;
  
  const superTax = calculateSuperContributionsTax(grossSuperContributions, totalGrossIncome);
  const listo = calculateLISTO(totalGrossIncome, grossSuperContributions);
  
  // Net amount added to super = gross contributions - tax + LISTO refund
  return Math.max(0, grossSuperContributions - superTax + listo);
}
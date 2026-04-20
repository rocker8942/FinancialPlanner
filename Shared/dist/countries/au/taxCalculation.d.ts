import type { TaxBreakdown } from '../../types.js';
export declare function calculateIncomeTax(grossIncome: number): number;
export declare function calculateMedicareLevy(grossIncome: number): number;
export declare function calculateSuperContributionsTax(superContributions: number, totalGrossIncome: number): number;
export declare function calculateLISTO(grossIncome: number, superContributions: number): number;
export declare function calculateNetIncome(grossIncome: number): number;
export declare function getTaxBreakdown(grossIncome: number, superContributions?: number): TaxBreakdown;
export declare function calculateNetSuperContributions(grossSuperContributions: number, totalGrossIncome: number): number;
//# sourceMappingURL=taxCalculation.d.ts.map
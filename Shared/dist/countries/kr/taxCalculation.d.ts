import type { TaxBreakdown } from '../../types.js';
export declare function calculateIncomeTax(grossIncome: number): number;
export declare function calculateLocalIncomeTax(grossIncome: number): number;
export declare function calculateSocialInsurance(grossIncome: number): number;
export declare function calculateNetIncome(grossIncome: number): number;
export declare function getTaxBreakdown(grossIncome: number, _superContributions?: number): TaxBreakdown;
export declare function calculateNetSuperContributions(_grossSuperContributions: number, _totalGrossIncome: number): number;
export declare function getNpsEmployeeContribution(salary: number): number;
//# sourceMappingURL=taxCalculation.d.ts.map
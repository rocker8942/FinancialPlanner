import type { TaxBreakdown } from '../../types.js';
export declare function calculateIncomeTax(postNpsIncome: number): number;
export declare function calculateLocalIncomeTax(postNpsIncome: number): number;
export declare function calculateSocialInsurance(postNpsIncome: number): number;
export declare function calculateNetIncome(postNpsIncome: number): number;
export declare function getTaxBreakdown(postNpsIncome: number, _superContributions?: number): TaxBreakdown;
export declare function calculateNetSuperContributions(_grossSuperContributions: number, _totalGrossIncome: number): number;
export declare function getNpsEmployeeContribution(salary: number): number;
//# sourceMappingURL=taxCalculation.d.ts.map
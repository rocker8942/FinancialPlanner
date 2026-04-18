import type { TaxBreakdown } from './types.js';
export type LocaleCode = 'au' | 'kr';
export interface ICountryTaxService {
    calculateIncomeTax(grossIncome: number): number;
    calculateNetIncome(grossIncome: number): number;
    getTaxBreakdown(grossIncome: number, superContributions?: number): TaxBreakdown;
    calculateNetSuperContributions(grossSuperContributions: number, totalGrossIncome: number): number;
}
export interface ICountryPensionInput {
    relationshipStatus: 'single' | 'couple';
    isHomeowner: boolean;
    propertyAssets: number;
    savings: number;
    superannuation: number;
    mortgageBalance: number;
    userSalary: number;
    partnerSalary: number;
    userPreRetirementSalary?: number;
    partnerPreRetirementSalary?: number;
    userAge: number;
    partnerAge: number;
    userBirthYear?: number;
    partnerBirthYear?: number;
    cpiAdjustmentFactor?: number;
    partnerSuperBalance?: number;
}
export interface ICountryPensionService {
    getPensionAmounts(input: ICountryPensionInput): {
        userPension: number;
        partnerPension: number;
    };
}
export interface ICountryDefaults {
    locale: LocaleCode;
    currencyCode: string;
    currencySymbol: string;
    pensionEligibilityAge: number;
    superContributionRate: number;
    superPreservationAge: number;
    defaultPropertyGrowthRate: number;
    defaultSavingsGrowthRate: number;
    defaultMortgageRate: number;
    defaultSuperannuationRate: number;
    defaultCpiGrowthRate: number;
    defaultPropertyRentalYield: number;
    employerRetirementContributionRate?: number;
}
export interface ICountryConfig {
    tax: ICountryTaxService;
    pension: ICountryPensionService;
    defaults: ICountryDefaults;
}
//# sourceMappingURL=countryConfig.d.ts.map
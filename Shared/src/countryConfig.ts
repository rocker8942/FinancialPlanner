// Country configuration interface for locale-aware financial calculations.
// Each locale (au, kr, ...) provides a tax module, pension service, and defaults.

import type { TaxBreakdown } from './types.js';

export type LocaleCode = 'au' | 'kr';

// Tax service interface (must be implemented per locale)
export interface ICountryTaxService {
  calculateIncomeTax(grossIncome: number): number;
  calculateNetIncome(grossIncome: number): number;
  getTaxBreakdown(grossIncome: number, superContributions?: number): TaxBreakdown;
  // Net amount of mandatory retirement contributions after their own tax/levy.
  // For AU this is super after contributions tax; for KR this is the net IRP/NPS contribution.
  calculateNetSuperContributions(grossSuperContributions: number, totalGrossIncome: number): number;
}

// Pension service interface (must be implemented per locale)
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
  // KR-specific: years already contributed to NPS as of today (userCurrentAge).
  // When provided, overrides the default "started at age 25" assumption.
  userNpsContributionYearsToDate?: number;
  partnerNpsContributionYearsToDate?: number;
  userCurrentAge?: number;
}

export interface ICountryPensionService {
  getPensionAmounts(input: ICountryPensionInput): { userPension: number; partnerPension: number };
}

// Defaults shared across the app for a given locale
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
  // Employer-paid retirement contribution added to personal DC account (e.g. KR 퇴직급여 8.33%).
  // Unlike superContributionRate this is NOT deducted from employee salary.
  // Omit or set to 0 for locales where employer contributions are already captured in superContributionRate.
  employerRetirementContributionRate?: number;
  // Approximate "one year of minimum meaningful expenses" in this currency.
  // Used to scale algorithm constants so they work correctly across currencies (AUD vs KRW etc).
  currencyBaseAmount: number;
}

// Country config bundles tax, pension, and defaults for a single locale
export interface ICountryConfig {
  tax: ICountryTaxService;
  pension: ICountryPensionService;
  defaults: ICountryDefaults;
}

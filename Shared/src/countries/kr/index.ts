// Korean country config bundle

import type { ICountryConfig, ICountryPensionInput, ICountryPensionService, ICountryTaxService } from '../../countryConfig.js';
import {
  calculateIncomeTax,
  calculateNetIncome,
  calculateNetSuperContributions,
  getTaxBreakdown
} from './taxCalculation.js';
import { getKoreanPensionAmounts } from './pensionService.js';
import { KR_RETIREMENT_DEFAULTS } from './retirementConfig.js';

const krTaxService: ICountryTaxService = {
  calculateIncomeTax,
  calculateNetIncome,
  getTaxBreakdown,
  calculateNetSuperContributions
};

const krPensionService: ICountryPensionService = {
  getPensionAmounts(input: ICountryPensionInput) {
    return getKoreanPensionAmounts(input);
  }
};

export const krCountryConfig: ICountryConfig = {
  tax: krTaxService,
  pension: krPensionService,
  defaults: KR_RETIREMENT_DEFAULTS
};

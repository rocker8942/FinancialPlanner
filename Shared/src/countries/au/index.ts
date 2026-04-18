// Australian country config bundle
// Wires the AU tax module + pension service + defaults into the ICountryConfig contract.

import type { ICountryConfig, ICountryPensionInput, ICountryPensionService, ICountryTaxService } from '../../countryConfig.js';
import {
  calculateIncomeTax,
  calculateNetIncome,
  calculateNetSuperContributions,
  getTaxBreakdown
} from './taxCalculation.js';
import { getAgePensionAmounts } from './pensionService.js';
import { AU_RETIREMENT_DEFAULTS } from './retirementConfig.js';

const auTaxService: ICountryTaxService = {
  calculateIncomeTax,
  calculateNetIncome,
  getTaxBreakdown,
  calculateNetSuperContributions
};

const auPensionService: ICountryPensionService = {
  getPensionAmounts(input: ICountryPensionInput) {
    return getAgePensionAmounts(input);
  }
};

export const auCountryConfig: ICountryConfig = {
  tax: auTaxService,
  pension: auPensionService,
  defaults: AU_RETIREMENT_DEFAULTS
};

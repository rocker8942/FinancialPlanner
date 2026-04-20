// Australian country config bundle
// Wires the AU tax module + pension service + defaults into the ICountryConfig contract.
import { calculateIncomeTax, calculateNetIncome, calculateNetSuperContributions, getTaxBreakdown } from './taxCalculation.js';
import { getAgePensionAmounts } from './pensionService.js';
import { AU_RETIREMENT_DEFAULTS } from './retirementConfig.js';
const auTaxService = {
    calculateIncomeTax,
    calculateNetIncome,
    getTaxBreakdown,
    calculateNetSuperContributions
};
const auPensionService = {
    getPensionAmounts(input) {
        return getAgePensionAmounts(input);
    }
};
export const auCountryConfig = {
    tax: auTaxService,
    pension: auPensionService,
    defaults: AU_RETIREMENT_DEFAULTS
};
//# sourceMappingURL=index.js.map
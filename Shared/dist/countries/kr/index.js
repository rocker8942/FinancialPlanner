// Korean country config bundle
import { calculateIncomeTax, calculateNetIncome, calculateNetSuperContributions, getTaxBreakdown } from './taxCalculation.js';
import { getKoreanPensionAmounts } from './pensionService.js';
import { KR_RETIREMENT_DEFAULTS } from './retirementConfig.js';
const krTaxService = {
    calculateIncomeTax,
    calculateNetIncome,
    getTaxBreakdown,
    calculateNetSuperContributions
};
const krPensionService = {
    getPensionAmounts(input) {
        return getKoreanPensionAmounts(input);
    }
};
export const krCountryConfig = {
    tax: krTaxService,
    pension: krPensionService,
    defaults: KR_RETIREMENT_DEFAULTS
};
//# sourceMappingURL=index.js.map
// Korean retirement defaults and constants

export const KR_RETIREMENT_DEFAULTS = {
  locale: 'kr' as const,
  currencyCode: 'KRW',
  currencySymbol: '₩',
  pensionEligibilityAge: 63, // National Pension; rises to 65 by 2033
  superContributionRate: 0.09, // National Pension 9% (employer 4.5% + employee 4.5%)
  superPreservationAge: 55, // IRP withdrawals typically allowed from 55
  defaultPropertyGrowthRate: 0.025,
  defaultSavingsGrowthRate: 0.03,
  defaultMortgageRate: 0.045,
  defaultSuperannuationRate: 0.05, // IRP / pension fund return assumption
  defaultCpiGrowthRate: 0.025,
  defaultPropertyRentalYield: 0.025
};

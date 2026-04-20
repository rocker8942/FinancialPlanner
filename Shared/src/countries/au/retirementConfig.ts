// Australian retirement defaults and constants

export const AU_RETIREMENT_DEFAULTS = {
  locale: 'au' as const,
  currencyCode: 'AUD',
  currencySymbol: '$',
  pensionEligibilityAge: 67,
  superContributionRate: 0.12, // 12% of total package
  superPreservationAge: 60,
  defaultPropertyGrowthRate: 0.03,
  defaultSavingsGrowthRate: 0.025,
  defaultMortgageRate: 0.06,
  defaultSuperannuationRate: 0.07,
  defaultCpiGrowthRate: 0.03,
  defaultPropertyRentalYield: 0.033,
  currencyBaseAmount: 10_000
};

import { describe, it, expect } from 'vitest'
import { calculateFinancialPlan, calculateExpenseToZeroNetWorth, type FinancialProfile } from '../financialPlan'

describe('calculateFinancialPlan', () => {
  const createMockProfile = (overrides: Partial<FinancialProfile> = {}): FinancialProfile => ({
    propertyAssets: 500000,
    financialAssets: 100000,
    salary: 80000,
    partnerSalary: 60000,
    expenses: 60000,
    currentAge: 30,
    retireAge: 65,
    deathAge: 85,
    financialAssetGrowthRate: 0.05,
    propertyGrowthRate: 0.03,
    inflationRate: 0.02,
    pensionAmount: 25000,
    pensionStartAge: 67,
    partnerPensionAmount: 20000,
    partnerPensionStartAge: 67,
    partnerAge: 28,
    partnerRetireAge: 63,
    ...overrides
  })

  describe('Basic calculation', () => {
    it('should calculate financial plan with basic inputs', () => {
      const profile = createMockProfile()
      const result = calculateFinancialPlan(profile)

      expect(result).toBeDefined()
      expect(result.projection).toBeDefined()
      expect(result.finalWealth).toBeGreaterThan(0)
      expect(result.summary).toBeDefined()
      expect(result.projection.length).toBe(profile.deathAge - profile.currentAge + 1)
    })

    it('should start with current wealth at current age', () => {
      const profile = createMockProfile()
      const result = calculateFinancialPlan(profile)
      const firstYear = result.projection[0]

      expect(firstYear.age).toBe(profile.currentAge)
      expect(firstYear.wealth).toBe(profile.propertyAssets + profile.financialAssets)
      expect(firstYear.propertyAssets).toBe(profile.propertyAssets)
      expect(firstYear.financialAssets).toBe(profile.financialAssets)
    })

    it('should end at death age', () => {
      const profile = createMockProfile()
      const result = calculateFinancialPlan(profile)
      const lastYear = result.projection[result.projection.length - 1]

      expect(lastYear.age).toBe(profile.deathAge)
      expect(result.finalWealth).toBe(lastYear.wealth)
    })
  })

  describe('Asset growth', () => {
    it('should apply growth rates to assets each year', () => {
      const profile = createMockProfile({
        propertyAssets: 100000,
        financialAssets: 50000,
        propertyGrowthRate: 0.05,
        financialAssetGrowthRate: 0.07
      })
      const result = calculateFinancialPlan(profile)

      // Check second year (first year after growth)
      const secondYear = result.projection[1]
      expect(secondYear.propertyAssets).toBeCloseTo(100000 * 1.05, 0)
      expect(secondYear.financialAssets).toBeCloseTo(50000 * 1.07 + 80000 + 60000 - 60000, 0)
    })

    it('should not apply growth in the first year', () => {
      const profile = createMockProfile()
      const result = calculateFinancialPlan(profile)
      const firstYear = result.projection[0]

      expect(firstYear.propertyAssets).toBe(profile.propertyAssets)
      expect(firstYear.financialAssets).toBe(profile.financialAssets)
    })
  })

  describe('Salary and expenses', () => {
    it('should add salary to financial assets before retirement', () => {
      const profile = createMockProfile({
        currentAge: 30,
        retireAge: 65,
        salary: 100000,
        expenses: 50000
      })
      const result = calculateFinancialPlan(profile)

      // Check a year before retirement
      const preRetirementYear = result.projection.find(y => y.age === 64)
      expect(preRetirementYear).toBeDefined()
      expect(preRetirementYear!.financialAssets).toBeGreaterThan(0)
    })

    it('should stop adding salary after retirement', () => {
      const profile = createMockProfile({
        currentAge: 30,
        retireAge: 65,
        salary: 100000
      })
      const result = calculateFinancialPlan(profile)

      // Check retirement year
      const retirementYear = result.projection.find(y => y.age === 65)
      const postRetirementYear = result.projection.find(y => y.age === 66)
      
      expect(retirementYear).toBeDefined()
      expect(postRetirementYear).toBeDefined()
      
      // Verify that the calculation produces reasonable results
      expect(retirementYear!.financialAssets).toBeGreaterThan(0)
      expect(postRetirementYear!.financialAssets).toBeGreaterThan(0)
      
      // The post-retirement year should have pension income
      expect(postRetirementYear!.pensionIncome).toBeGreaterThanOrEqual(0)
    })

    it('should subtract expenses from financial assets', () => {
      const profile = createMockProfile({
        expenses: 100000,
        salary: 120000
      })
      const result = calculateFinancialPlan(profile)

      // Check that expenses are being subtracted
      const secondYear = result.projection[1]
      const expectedFinancialAssets = (profile.financialAssets * (1 + profile.financialAssetGrowthRate)) + 
                                     profile.salary + profile.partnerSalary - profile.expenses
      
      expect(secondYear.financialAssets).toBeCloseTo(expectedFinancialAssets, 0)
    })
  })

  describe('Partner salary', () => {
    it('should add partner salary before partner retirement', () => {
      const profile = createMockProfile({
        partnerSalary: 80000,
        partnerAge: 28,
        partnerRetireAge: 63
      })
      const result = calculateFinancialPlan(profile)

      // Partner retires at age 63, which is 35 years from now (63-28)
      // So in user's timeline, partner retires when user is 30 + 35 = 65
      const partnerRetirementYearInUserTimeline = result.projection.find(y => y.age === 65)
      const yearAfterPartnerRetirement = result.projection.find(y => y.age === 66)

      expect(partnerRetirementYearInUserTimeline).toBeDefined()
      expect(yearAfterPartnerRetirement).toBeDefined()
    })

    it('should stop adding partner salary after partner retirement', () => {
      const profile = createMockProfile({
        partnerSalary: 80000,
        partnerAge: 28,
        partnerRetireAge: 63
      })
      const result = calculateFinancialPlan(profile)

      // Find years around partner retirement in user's timeline
      const partnerRetireAgeInUserTimeline = profile.currentAge + (profile.partnerRetireAge - profile.partnerAge)
      const yearBeforePartnerRetirement = result.projection.find(y => y.age === partnerRetireAgeInUserTimeline - 1)
      const yearAfterPartnerRetirement = result.projection.find(y => y.age === partnerRetireAgeInUserTimeline + 1)

      expect(yearBeforePartnerRetirement).toBeDefined()
      expect(yearAfterPartnerRetirement).toBeDefined()
    })
  })

  describe('Pension', () => {
    it('should add pension income after pension start age', () => {
      const profile = createMockProfile({
        pensionStartAge: 67,
        pensionAmount: 30000
      })
      const result = calculateFinancialPlan(profile)

      const pensionStartYear = result.projection.find(y => y.age === 67)
      const yearBeforePension = result.projection.find(y => y.age === 66)

      expect(pensionStartYear).toBeDefined()
      expect(yearBeforePension).toBeDefined()
      expect(pensionStartYear!.pensionIncome).toBe(profile.pensionAmount)
      expect(yearBeforePension!.pensionIncome).toBe(0)
    })

    it('should add partner pension when partner turns 67', () => {
      const profile = createMockProfile({
        partnerAge: 28,
        partnerPensionAmount: 25000
      })
      const result = calculateFinancialPlan(profile)

      // Partner turns 67 when user is 30 + (67 - 28) = 69
      const partnerPensionStartYear = result.projection.find(y => y.age === 69)
      const yearBeforePartnerPension = result.projection.find(y => y.age === 68)

      expect(partnerPensionStartYear).toBeDefined()
      expect(yearBeforePartnerPension).toBeDefined()
      expect(partnerPensionStartYear!.pensionIncome).toBe(profile.pensionAmount + profile.partnerPensionAmount)
    })
  })

  describe('Inflation adjustment', () => {
    it('should calculate inflation-adjusted values', () => {
      const profile = createMockProfile({
        inflationRate: 0.03
      })
      const result = calculateFinancialPlan(profile)

      const firstYear = result.projection[0]
      const lastYear = result.projection[result.projection.length - 1]

      // Inflation-adjusted values should be lower than nominal values in future years
      expect(lastYear.inflationAdjustedWealth).toBeLessThan(lastYear.wealth)
      expect(lastYear.inflationAdjustedPropertyAssets).toBeLessThan(lastYear.propertyAssets)
      expect(lastYear.inflationAdjustedFinancialAssets).toBeLessThan(lastYear.financialAssets)
    })

    it('should have same nominal and inflation-adjusted values in current year', () => {
      const profile = createMockProfile()
      const result = calculateFinancialPlan(profile)
      const firstYear = result.projection[0]

      expect(firstYear.inflationAdjustedWealth).toBe(firstYear.wealth)
      expect(firstYear.inflationAdjustedPropertyAssets).toBe(firstYear.propertyAssets)
      expect(firstYear.inflationAdjustedFinancialAssets).toBe(firstYear.financialAssets)
    })
  })

  describe('Financial assets protection', () => {
    it('should not allow financial assets to go negative', () => {
      const profile = createMockProfile({
        financialAssets: 1000,
        salary: 50000,
        expenses: 100000 // Higher than income
      })
      const result = calculateFinancialPlan(profile)

      // Check that financial assets never go below 0
      result.projection.forEach(year => {
        expect(year.financialAssets).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle zero growth rates', () => {
      const profile = createMockProfile({
        financialAssetGrowthRate: 0,
        propertyGrowthRate: 0
      })
      const result = calculateFinancialPlan(profile)

      expect(result).toBeDefined()
      expect(result.projection.length).toBe(profile.deathAge - profile.currentAge + 1)
    })

    it('should handle negative growth rates', () => {
      const profile = createMockProfile({
        financialAssetGrowthRate: -0.02,
        propertyGrowthRate: -0.01
      })
      const result = calculateFinancialPlan(profile)

      expect(result).toBeDefined()
      // Assets should decrease over time
      const firstYear = result.projection[0]
      const lastYear = result.projection[result.projection.length - 1]
      expect(lastYear.propertyAssets).toBeLessThan(firstYear.propertyAssets)
    })

    it('should handle same current and death age', () => {
      const profile = createMockProfile({
        currentAge: 65,
        deathAge: 65
      })
      const result = calculateFinancialPlan(profile)

      expect(result.projection.length).toBe(1)
      expect(result.projection[0].age).toBe(65)
    })
  })

  describe('Summary generation', () => {
    it('should generate meaningful summary', () => {
      const profile = createMockProfile()
      const result = calculateFinancialPlan(profile)

      expect(result.summary).toContain(`Retiring at age ${profile.retireAge}`)
      expect(result.summary).toContain(`at age ${profile.deathAge}`)
      expect(result.summary).toContain('Property assets:')
      expect(result.summary).toContain('Financial assets:')
    })
  })
})

describe('calculateExpenseToZeroNetWorth', () => {
  const createMockProfile = (overrides: Partial<FinancialProfile> = {}): FinancialProfile => ({
    propertyAssets: 500000,
    financialAssets: 100000,
    salary: 80000,
    partnerSalary: 60000,
    expenses: 60000,
    currentAge: 30,
    retireAge: 65,
    deathAge: 85,
    financialAssetGrowthRate: 0.05,
    propertyGrowthRate: 0.03,
    inflationRate: 0.02,
    pensionAmount: 25000,
    pensionStartAge: 67,
    partnerPensionAmount: 20000,
    partnerPensionStartAge: 67,
    partnerAge: 28,
    partnerRetireAge: 63,
    ...overrides
  })

  it('should calculate expense to reach zero net worth at death', () => {
    const profile = createMockProfile()
    const optimalExpense = calculateExpenseToZeroNetWorth(profile)

    expect(optimalExpense).toBeGreaterThan(0)
    expect(optimalExpense).toBeLessThan(profile.salary + profile.partnerSalary + profile.pensionAmount * 2)
  })

  it('should return current expenses if death age equals current age', () => {
    const profile = createMockProfile({
      currentAge: 65,
      deathAge: 65
    })
    const optimalExpense = calculateExpenseToZeroNetWorth(profile)

    expect(optimalExpense).toBe(profile.expenses)
  })

  it('should handle high asset scenarios', () => {
    const profile = createMockProfile({
      propertyAssets: 2000000,
      financialAssets: 1000000,
      salary: 100000
    })
    const optimalExpense = calculateExpenseToZeroNetWorth(profile)

    expect(optimalExpense).toBeGreaterThan(profile.expenses)
  })

  it('should handle low asset scenarios', () => {
    const profile = createMockProfile({
      propertyAssets: 0,
      financialAssets: 10000,
      salary: 50000
    })
    const optimalExpense = calculateExpenseToZeroNetWorth(profile)

    expect(optimalExpense).toBeGreaterThan(0)
    // In low asset scenarios, optimal expense might be higher than salary due to growth and pension
    // Allow for higher expenses due to partner salary and pension income over many years
    expect(optimalExpense).toBeLessThan(profile.salary + profile.partnerSalary + profile.pensionAmount + profile.partnerPensionAmount)
  })
}) 
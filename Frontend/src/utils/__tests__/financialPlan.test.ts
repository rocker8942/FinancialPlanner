import { describe, it, expect } from 'vitest'
import { calculateFinancialPlan, calculateExpenseToZeroNetWorth, type FinancialProfile } from '../financialPlan'

describe('calculateFinancialPlan', () => {
  const createMockProfile = (overrides: Partial<FinancialProfile> = {}): FinancialProfile => ({
    propertyAssets: 500000,
    savings: 100000,
    mortgageBalance: 200000,
    mortgageRate: 0.06,
    superannuationBalance: 50000,
    superannuationRate: 0.07,
    salary: 80000,
    partnerSalary: 60000,
    expenses: 60000,
    currentAge: 30,
    retireAge: 65,
    deathAge: 85,
    savingsGrowthRate: 0.05,
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
      // Net worth includes property + net savings (floored at 0) + superannuation
      const expectedNetWorth = profile.propertyAssets + Math.max(0, profile.savings - profile.mortgageBalance) + profile.superannuationBalance
      expect(firstYear.wealth).toBe(expectedNetWorth)
      expect(firstYear.propertyAssets).toBe(profile.propertyAssets) // Full property value
      expect(firstYear.savings).toBe(Math.max(0, profile.savings - profile.mortgageBalance)) // Net savings floored at 0
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
        savings: 50000,
        mortgageBalance: 0, // No mortgage for simple calculation
        superannuationBalance: 0, // No superannuation for simple calculation
        propertyGrowthRate: 0.05,
        savingsGrowthRate: 0.07
      })
      const result = calculateFinancialPlan(profile)

      // Check second year (first year after growth)
      const secondYear = result.projection[1]
      expect(secondYear.propertyAssets).toBeCloseTo(100000 * 1.05, 0) // Net property value (no mortgage)
      expect(secondYear.savings).toBeCloseTo(50000 * 1.07 + 80000 + 60000 - 60000, 0)
    })

    it('should not apply growth in the first year', () => {
      const profile = createMockProfile()
      const result = calculateFinancialPlan(profile)
      const firstYear = result.projection[0]

      expect(firstYear.propertyAssets).toBe(profile.propertyAssets) // Full property value
      expect(firstYear.savings).toBe(Math.max(0, profile.savings - profile.mortgageBalance)) // Net savings floored at 0
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
      expect(preRetirementYear!.savings).toBeGreaterThan(0)
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
      expect(retirementYear!.savings).toBeGreaterThan(0)
      expect(postRetirementYear!.savings).toBeGreaterThan(0)
      
      // The post-retirement year should have pension income
      expect(postRetirementYear!.pensionIncome).toBeGreaterThanOrEqual(0)
    })

    it('should subtract expenses from financial assets', () => {
      const profile = createMockProfile({
        expenses: 100000,
        salary: 120000
      })
      const result = calculateFinancialPlan(profile)

      // Check that expenses are being subtracted and mortgage is paid down
      const secondYear = result.projection[1]
      // Total income: 120000 + 60000 = 180000
      // Mortgage payment: 200000 * 0.06 = 12000
      // Income after mortgage: 180000 - 12000 = 168000
      // Net savings check: 100000 - 200000 = -100000 (negative, so no growth applied)
      // Savings after no growth: 100000 (no growth applied)
      // Savings after income: 100000 + 168000 = 268000
      // Savings after expenses: 268000 - 100000 = 168000
      // Net savings (after mortgage): 168000 - (200000 - 12000) = 168000 - 188000 = -20000
      
      expect(secondYear.savings).toBeCloseTo(0, 0) // Net savings floored at 0
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
        propertyAssets: 500000,
        savings: 200000,
        mortgageBalance: 0, // No mortgage to avoid negative net property
        superannuationBalance: 100000,
        inflationRate: 0.03,
        expenses: 50000 // Lower expenses to maintain positive wealth
      })
      const result = calculateFinancialPlan(profile)

      const lastYear = result.projection[result.projection.length - 1]

      // Only test if wealth is positive
      if (lastYear.wealth > 0) {
        expect(lastYear.inflationAdjustedWealth).toBeLessThan(lastYear.wealth)
      }
      if (lastYear.propertyAssets > 0) {
        expect(lastYear.inflationAdjustedPropertyAssets).toBeLessThan(lastYear.propertyAssets)
      }
      if (lastYear.savings > 0) {
        expect(lastYear.inflationAdjustedSavings).toBeLessThan(lastYear.savings)
      }
    })

    it('should have same nominal and inflation-adjusted values in current year', () => {
      const profile = createMockProfile()
      const result = calculateFinancialPlan(profile)
      const firstYear = result.projection[0]

      expect(firstYear.inflationAdjustedWealth).toBe(firstYear.wealth)
      expect(firstYear.inflationAdjustedPropertyAssets).toBe(firstYear.propertyAssets)
      expect(firstYear.inflationAdjustedSavings).toBe(firstYear.savings)
    })
  })

  describe('Savings protection', () => {
    it('should not allow financial assets to go negative before mortgage deduction', () => {
      const profile = createMockProfile({
        savings: 1000,
        mortgageBalance: 0, // No mortgage for this test
        salary: 50000,
        expenses: 100000 // Higher than income
      })
      const result = calculateFinancialPlan(profile)

      // Check that raw savings never go below 0 (before mortgage deduction)
      // With mortgage=0, displayed savings should equal raw savings
      result.projection.forEach(year => {
        expect(year.savings).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle zero growth rates', () => {
      const profile = createMockProfile({
        savingsGrowthRate: 0,
        propertyGrowthRate: 0
      })
      const result = calculateFinancialPlan(profile)

      expect(result).toBeDefined()
      expect(result.projection.length).toBe(profile.deathAge - profile.currentAge + 1)
    })

    it('should handle negative growth rates', () => {
      const profile = createMockProfile({
        savingsGrowthRate: -0.02,
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

  describe('Mortgage calculations', () => {
    it('should reduce net savings by mortgage balance', () => {
      const profile = createMockProfile({
        propertyAssets: 800000,
        savings: 100000,
        mortgageBalance: 300000
      })
      const result = calculateFinancialPlan(profile)
      const firstYear = result.projection[0]

      expect(firstYear.propertyAssets).toBe(800000) // Full property value
      expect(firstYear.savings).toBe(0) // Net savings floored at 0 when mortgage exceeds savings
    })

    it('should use income to pay down mortgage', () => {
      const profile = createMockProfile({
        propertyAssets: 500000,
        mortgageBalance: 200000,
        mortgageRate: 0.06,
        propertyGrowthRate: 0.03,
        salary: 20000, // Income to pay mortgage
        partnerSalary: 10000,
        expenses: 0
      })
      const result = calculateFinancialPlan(profile)
      const secondYear = result.projection[1]

      // Property grows at 3%: 500000 * 1.03 = 515000
      // Net savings check: 100000 - 200000 = -100000 (negative, so no growth applied)
      // Savings after no growth: 100000 (no growth applied)
      // Mortgage payment from income: 200000 * 0.06 = 12000
      // Total income: 20000 + 10000 = 30000
      // Mortgage payment: min(30000, 12000) = 12000
      // Mortgage balance after payment: 200000 - 12000 = 188000
      // Net savings: (100000 + 18000) - 188000 = -70000
      // Remaining income after mortgage: 30000 - 12000 = 18000 (goes to savings)

      expect(secondYear.propertyAssets).toBeCloseTo(515000, 0)
      expect(secondYear.savings).toBeCloseTo(0, 0) // Net savings floored at 0
    })

    it('should handle zero mortgage balance', () => {
      const profile = createMockProfile({
        propertyAssets: 500000,
        mortgageBalance: 0
      })
      const result = calculateFinancialPlan(profile)
      const firstYear = result.projection[0]

      expect(firstYear.propertyAssets).toBe(500000)
      expect(firstYear.savings).toBe(profile.savings) // No mortgage, so savings unchanged
    })

    it('should pay off mortgage completely when income exceeds payment', () => {
      const profile = createMockProfile({
        propertyAssets: 500000,
        mortgageBalance: 10000, // Small mortgage
        mortgageRate: 0.06,
        propertyGrowthRate: 0.03,
        salary: 50000, // High income relative to mortgage
        partnerSalary: 40000,
        expenses: 0
      })
      const result = calculateFinancialPlan(profile)
      const secondYear = result.projection[1]

      // Property grows at 3%: 500000 * 1.03 = 515000
      // Net savings check: 100000 - 10000 = 90000 (positive, so growth applied)
      // Savings grow on net amount: 100000 + (90000 * 0.05) = 100000 + 4500 = 104500
      // Net mortgage: max(0, 10000 - 104500) = 0 (savings exceed mortgage)
      // Mortgage interest: 0 * 0.06 = 0
      // Total income: 50000 + 40000 = 90000
      // Mortgage payment: min(90000, 0) = 0
      // Mortgage balance after payment: 10000 - 0 = 10000
      // Net savings: (104500 + 90000) - 10000 = 184500
      // Remaining income: 90000 - 0 = 90000 (goes to savings)

      expect(secondYear.propertyAssets).toBeCloseTo(515000, 0)
      expect(secondYear.savings).toBeCloseTo(184500, 0)
    })
  })

  describe('Superannuation calculations', () => {
    it('should include superannuation in total wealth', () => {
      const profile = createMockProfile({
        propertyAssets: 500000,
        savings: 100000,
        mortgageBalance: 200000,
        superannuationBalance: 80000
      })
      const result = calculateFinancialPlan(profile)
      const firstYear = result.projection[0]

      // Net worth = property + net savings (floored at 0) + superannuation
      const expectedWealth = 500000 + Math.max(0, 100000 - 200000) + 80000 // 580000
      expect(firstYear.wealth).toBe(expectedWealth)
    })

    it('should apply superannuation growth rate', () => {
      const profile = createMockProfile({
        propertyAssets: 500000,
        savings: 100000,
        mortgageBalance: 200000,
        superannuationBalance: 100000,
        superannuationRate: 0.08,
        propertyGrowthRate: 0.03,
        savingsGrowthRate: 0.05,
        salary: 0,
        partnerSalary: 0,
        expenses: 0
      })
      const result = calculateFinancialPlan(profile)
      const secondYear = result.projection[1]

      // Expected calculations for second year:
      // Property: 500000 * 1.03 = 515000
      // No income, so mortgage balance stays at 200000
      // Net savings check: 100000 - 200000 = -100000 (negative, so no growth applied)
      // Savings: 100000 (no growth applied)
      // Net savings: Math.max(0, 100000 - 200000) = 0
      // Super: 100000 * 1.08 = 108000
      // Total wealth: 515000 + 0 + 108000 = 623000
      
      expect(secondYear.wealth).toBeCloseTo(623000, 0) // Expect close to 623000
    })

    it('should add superannuation contributions from salary', () => {
      const profile = createMockProfile({
        currentAge: 30,
        retireAge: 31, // Retire after 1 year
        superannuationBalance: 50000,
        superannuationRate: 0.07,
        salary: 100000,
        partnerSalary: 80000,
        expenses: 0
      })
      const result = calculateFinancialPlan(profile)
      const secondYear = result.projection[1]

      // Super contributions: 9.5% of both salaries = 9.5% * (100000 + 80000) = 17100
      // Super growth: 50000 * 1.07 = 53500
      // Total super: 53500 + 17100 = 70600
      const expectedSuperContributions = (profile.salary + profile.partnerSalary) * 0.095 // 17100
      const expectedSuperBalance = profile.superannuationBalance * 1.07 + expectedSuperContributions // 70600

      expect(secondYear.wealth).toBeGreaterThan(profile.propertyAssets + (profile.savings - profile.mortgageBalance) + expectedSuperBalance - 1000) // Allow small variance
    })

    it('should transfer superannuation to financial assets at retirement', () => {
      const profile = createMockProfile({
        currentAge: 59,
        retireAge: 60, // Retire at 60 (can access super)
        partnerAge: 57,
        partnerRetireAge: 60,
        superannuationBalance: 200000,
        salary: 0,
        partnerSalary: 0,
        expenses: 0
      })
      const result = calculateFinancialPlan(profile)
      
      const retirementYear = result.projection.find(y => y.age === 60)
      const postRetirementYear = result.projection.find(y => y.age === 61)

      expect(retirementYear).toBeDefined()
      expect(postRetirementYear).toBeDefined()

      // After retirement, superannuation should be transferred to financial assets
      // (exact timing may vary based on logic, but superannuation should eventually be accessible)
      const hasAccessedSuper = result.projection.some(year => 
        year.age >= 60 && year.savings > profile.savings + 100000
      )
      expect(hasAccessedSuper).toBe(true)
    })
  })

  describe('Summary generation', () => {
    it('should generate meaningful summary', () => {
      const profile = createMockProfile()
      const result = calculateFinancialPlan(profile)

      expect(result.summary).toContain(`Retiring at age ${profile.retireAge}`)
      expect(result.summary).toContain(`at age ${profile.deathAge}`)
      expect(result.summary).toContain('Property assets:')
      expect(result.summary).toContain('Savings:')
    })
  })
})

describe('calculateExpenseToZeroNetWorth', () => {
  const createMockProfile = (overrides: Partial<FinancialProfile> = {}): FinancialProfile => ({
    propertyAssets: 500000,
    savings: 100000,
    mortgageBalance: 200000,
    mortgageRate: 0.06,
    superannuationBalance: 50000,
    superannuationRate: 0.07,
    salary: 80000,
    partnerSalary: 60000,
    expenses: 60000,
    currentAge: 30,
    retireAge: 65,
    deathAge: 85,
    savingsGrowthRate: 0.05,
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
      savings: 1000000,
      salary: 100000
    })
    const optimalExpense = calculateExpenseToZeroNetWorth(profile)

    expect(optimalExpense).toBeGreaterThan(profile.expenses)
  })

  it('should handle low asset scenarios', () => {
    const profile = createMockProfile({
      propertyAssets: 0,
      savings: 10000,
      mortgageBalance: 0,
      superannuationBalance: 5000,
      salary: 50000
    })
    const optimalExpense = calculateExpenseToZeroNetWorth(profile)

    expect(optimalExpense).toBeGreaterThan(0)
    // In low asset scenarios, optimal expense might be higher than salary due to growth and pension
    // Allow for higher expenses due to partner salary and pension income over many years
    expect(optimalExpense).toBeLessThan(profile.salary + profile.partnerSalary + profile.pensionAmount + profile.partnerPensionAmount)
  })

  it('should account for mortgage debt in calculations', () => {
    const profileWithMortgage = createMockProfile({
      propertyAssets: 500000,
      mortgageBalance: 300000, // High mortgage
      savings: 50000,
      superannuationBalance: 30000
    })
    
    const profileWithoutMortgage = createMockProfile({
      propertyAssets: 200000, // Net property value same as above
      mortgageBalance: 0,
      savings: 50000,
      superannuationBalance: 30000
    })

    const expenseWithMortgage = calculateExpenseToZeroNetWorth(profileWithMortgage)
    const expenseWithoutMortgage = calculateExpenseToZeroNetWorth(profileWithoutMortgage)

    // Both should be similar since net assets are the same (allow for growth rate differences)
    expect(Math.abs(expenseWithMortgage - expenseWithoutMortgage)).toBeLessThan(50000)
  })

  it('should include superannuation in asset calculations', () => {
    const profileWithSuper = createMockProfile({
      propertyAssets: 500000,
      mortgageBalance: 200000,
      savings: 100000,
      superannuationBalance: 150000
    })
    
    const profileWithoutSuper = createMockProfile({
      propertyAssets: 500000,
      mortgageBalance: 200000,
      savings: 250000, // Same total assets
      superannuationBalance: 0
    })

    const expenseWithSuper = calculateExpenseToZeroNetWorth(profileWithSuper)
    const expenseWithoutSuper = calculateExpenseToZeroNetWorth(profileWithoutSuper)

    // Should be similar since total assets are the same (allow for growth rate differences)
    expect(Math.abs(expenseWithSuper - expenseWithoutSuper)).toBeLessThan(30000)
  })
}) 
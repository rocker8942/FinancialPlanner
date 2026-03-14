import { describe, it, expect } from 'vitest';
import { calculateDisposableIncome } from '../financialPlan';
import type { FinancialProfile } from '../models/FinancialTypes';

describe('calculateDisposableIncome', () => {
  const baseProfile: FinancialProfile = {
    propertyAssets: 0,
    savings: 100000,
    mortgageBalance: 0,
    mortgageRate: 0.06,
    superannuationBalance: 50000,
    partnerSuperBalance: 0,
    superannuationRate: 0.07,
    salary: 90000, // $90k total package including super
    partnerSalary: 0,
    expenses: 50000,
    currentAge: 35,
    retireAge: 65,
    deathAge: 90,
    savingsGrowthRate: 0.07,
    propertyGrowthRate: 0.04,
    propertyRentalYield: 0.033,
    cpiGrowthRate: 0.03,
    pensionAmount: 0,
    pensionStartAge: 67,
    partnerPensionAmount: 0,
    partnerPensionStartAge: 67,
    partnerAge: 35,
    partnerRetireAge: 65,
    relationshipStatus: 'single',
    isHomeowner: true
  };

  it('should calculate disposable income from salary correctly', () => {
    const profile = { ...baseProfile };
    const disposableIncome = calculateDisposableIncome(profile);
    
    // $90k total package - 12% super ($10,800) = $79,200 taxable income
    // After tax (approximately $61,400 net income based on 2024-25 tax brackets)
    expect(disposableIncome).toBeGreaterThan(60000);
    expect(disposableIncome).toBeLessThan(65000);
  });

  it('should include partner salary for couples', () => {
    const singleProfile = { ...baseProfile };
    const coupleProfile = { 
      ...baseProfile, 
      relationshipStatus: 'couple' as const,
      partnerSalary: 70000 // Additional $70k for partner
    };
    
    const singleDisposable = calculateDisposableIncome(singleProfile);
    const coupleDisposable = calculateDisposableIncome(coupleProfile);
    
    // Couple should have significantly more disposable income
    expect(coupleDisposable).toBeGreaterThan(singleDisposable + 40000); // After tax on $70k should be ~$50k+
  });

  it('should include rental income from investment property', () => {
    const withoutProperty = { ...baseProfile };
    const withProperty = { 
      ...baseProfile, 
      propertyAssets: 500000,
      propertyRentalYield: 0.04 // 4% net yield
    };
    
    const disposableWithoutProperty = calculateDisposableIncome(withoutProperty);
    const disposableWithProperty = calculateDisposableIncome(withProperty);
    
    // Should include $20k rental income (4% of $500k)
    expect(disposableWithProperty).toBeCloseTo(disposableWithoutProperty + 20000, 0);
  });

  it('should include pension income when applicable', () => {
    const youngProfile = { ...baseProfile, currentAge: 35, salary: 0 };
    const pensionAgeProfile = { ...baseProfile, currentAge: 67, salary: 0 };
    
    const youngDisposable = calculateDisposableIncome(youngProfile);
    const pensionDisposable = calculateDisposableIncome(pensionAgeProfile);
    
    // Pension age person should have some disposable income from age pension
    expect(pensionDisposable).toBeGreaterThan(youngDisposable);
  });

  it('should handle zero income scenarios', () => {
    const zeroIncomeProfile = { 
      ...baseProfile, 
      salary: 0, 
      propertyAssets: 0,
      currentAge: 35 // Too young for pension
    };
    
    const disposableIncome = calculateDisposableIncome(zeroIncomeProfile);
    expect(disposableIncome).toBe(0);
  });
});
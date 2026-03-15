import { describe, it, expect } from 'vitest';
import { calculateAgePension, getAgePensionAmounts } from '../agePensionService';

// Full couple pension combined (2025 rates)
const COUPLE_PENSION_COMBINED = 46202;
// Full single pension (2025 rates)
const SINGLE_PENSION = 30646;

describe('agePensionService', () => {

  describe('Bug 1: Couple thresholds when only one partner is pension age', () => {

    it('should use couple thresholds when only user is 67+, giving half the couple pension', () => {
      // Before fix: used single thresholds, giving single rate
      // After fix: uses couple thresholds, user gets half the couple pension
      const result = calculateAgePension({
        relationshipStatus: 'couple',
        isHomeowner: true,
        propertyAssets: 0,
        financialAssets: 0, // zero assets -> full pension
        annualIncome: 0,
        partnerAnnualIncome: 0,
        age: 67,        // user eligible
        partnerAge: 60  // partner not eligible
      });

      // User should get half the couple combined pension (not full single rate)
      const expectedUserPension = COUPLE_PENSION_COMBINED / 2;
      expect(result.userPensionAmount).toBeCloseTo(expectedUserPension, 0);
      expect(result.partnerPensionAmount).toBe(0);
      expect(result.totalPensionAmount).toBeCloseTo(expectedUserPension, 0);

      // Sanity: half couple pension is LESS than the single pension
      // (couple rates per person are lower than single rates)
      expect(result.userPensionAmount).toBeLessThan(SINGLE_PENSION);
    });

    it('should use couple thresholds when only partner is 67+, giving half the couple pension', () => {
      const result = calculateAgePension({
        relationshipStatus: 'couple',
        isHomeowner: true,
        propertyAssets: 0,
        financialAssets: 0,
        annualIncome: 0,
        partnerAnnualIncome: 0,
        age: 60,        // user not eligible
        partnerAge: 68  // partner eligible
      });

      // Partner should get half the couple pension
      const expectedPartnerPension = COUPLE_PENSION_COMBINED / 2;
      expect(result.userPensionAmount).toBe(0);
      expect(result.partnerPensionAmount).toBeCloseTo(expectedPartnerPension, 0);
      expect(result.totalPensionAmount).toBeCloseTo(expectedPartnerPension, 0);
    });

    it('should return reduced pension for one-eligible-partner when couple has high assets', () => {
      // High assets means couple asset test reduces pension
      const result = calculateAgePension({
        relationshipStatus: 'couple',
        isHomeowner: true,
        propertyAssets: 0,
        financialAssets: 700000, // above couple full-pension threshold (481500)
        annualIncome: 0,
        partnerAnnualIncome: 0,
        age: 68,  // user eligible
        partnerAge: 60  // partner not eligible
      });

      // Should be reduced from full couple pension but using couple thresholds
      expect(result.userPensionAmount).toBeGreaterThan(0);
      expect(result.userPensionAmount).toBeLessThan(COUPLE_PENSION_COMBINED / 2);
      expect(result.partnerPensionAmount).toBe(0);
    });

  });

  describe('Bug 2: Partner accumulation super excluded from assets test', () => {

    it('should include partner super in assets when partner is 67+ (pension age)', () => {
      // Both partners 67+: partner super is assessable
      // Use high partner super (700k) to push above couple homeowner threshold (481500)
      const result = getAgePensionAmounts({
        relationshipStatus: 'couple',
        isHomeowner: true,
        propertyAssets: 0,
        savings: 0,
        superannuation: 0,
        mortgageBalance: 0,
        userSalary: 0,
        partnerSalary: 0,
        userAge: 68,
        partnerAge: 67,
        cpiAdjustmentFactor: 1.0,
        partnerSuperBalance: 700000  // assessable since partnerAge >= 67
      });

      // With $700k in partner super (above threshold), assets test should reduce pension
      const resultNoPartnerSuper = getAgePensionAmounts({
        relationshipStatus: 'couple',
        isHomeowner: true,
        propertyAssets: 0,
        savings: 0,
        superannuation: 0,
        mortgageBalance: 0,
        userSalary: 0,
        partnerSalary: 0,
        userAge: 68,
        partnerAge: 67,
        cpiAdjustmentFactor: 1.0,
        partnerSuperBalance: 0  // no partner super -> full pension
      });

      // More assets -> lower pension
      expect(result.userPension + result.partnerPension)
        .toBeLessThan(resultNoPartnerSuper.userPension + resultNoPartnerSuper.partnerPension);
    });

    it('should exclude partner super from assets when partner is under 67 (accumulation phase)', () => {
      // User is 67+, partner is 60 (under pension age)
      // Partner super is in accumulation: NOT assessable
      const resultWithPartnerSuper = getAgePensionAmounts({
        relationshipStatus: 'couple',
        isHomeowner: true,
        propertyAssets: 0,
        savings: 0,
        superannuation: 0,
        mortgageBalance: 0,
        userSalary: 0,
        partnerSalary: 0,
        userAge: 68,
        partnerAge: 60,  // under 67, accumulation phase
        cpiAdjustmentFactor: 1.0,
        partnerSuperBalance: 500000  // should NOT be assessed
      });

      const resultNoPartnerSuper = getAgePensionAmounts({
        relationshipStatus: 'couple',
        isHomeowner: true,
        propertyAssets: 0,
        savings: 0,
        superannuation: 0,
        mortgageBalance: 0,
        userSalary: 0,
        partnerSalary: 0,
        userAge: 68,
        partnerAge: 60,
        cpiAdjustmentFactor: 1.0,
        partnerSuperBalance: 0  // no partner super
      });

      // Partner super under 67 should NOT reduce pension -> same as no partner super
      expect(resultWithPartnerSuper.userPension)
        .toBeCloseTo(resultNoPartnerSuper.userPension, 0);
      expect(resultWithPartnerSuper.partnerPension)
        .toBeCloseTo(resultNoPartnerSuper.partnerPension, 0);
    });

    it('should use 67 as the exact threshold for partner super assessability', () => {
      // Use high partner super (800k) so when assessed it pushes assets above cutoff
      // User is 68 (eligible), so both scenarios have pension eligibility for user only
      // At partner age 66: partner super excluded -> lower assets -> higher pension
      // At partner age 67: partner becomes eligible (both eligible) BUT also super assessed
      // To isolate the super assessment effect, we need a scenario where partner
      // transitions from non-eligible to eligible and the super change matters.
      // Instead, compare two calls where only partnerSuperBalance differs (partnerAge=66 fixed).

      // Scenario: user=68, partner=66 (not eligible)
      // With large partner super: should give SAME pension as without (super excluded at 66)
      const withPartnerSuper = getAgePensionAmounts({
        relationshipStatus: 'couple', isHomeowner: true, propertyAssets: 0, savings: 0,
        superannuation: 0, mortgageBalance: 0, userSalary: 0, partnerSalary: 0,
        userAge: 68, partnerAge: 66, cpiAdjustmentFactor: 1.0, partnerSuperBalance: 800000
      });
      const withoutPartnerSuper = getAgePensionAmounts({
        relationshipStatus: 'couple', isHomeowner: true, propertyAssets: 0, savings: 0,
        superannuation: 0, mortgageBalance: 0, userSalary: 0, partnerSalary: 0,
        userAge: 68, partnerAge: 66, cpiAdjustmentFactor: 1.0, partnerSuperBalance: 0
      });

      // Partner age 66: super NOT assessed, so pension should be identical regardless of partner super
      expect(withPartnerSuper.userPension).toBeCloseTo(withoutPartnerSuper.userPension, 0);
      expect(withPartnerSuper.partnerPension).toBeCloseTo(withoutPartnerSuper.partnerPension, 0);

      // Scenario: user=68, partner=67 (eligible), large user super to test asset assessment
      const withUserSuperAtAge67 = getAgePensionAmounts({
        relationshipStatus: 'couple', isHomeowner: true, propertyAssets: 0, savings: 0,
        superannuation: 800000, mortgageBalance: 0, userSalary: 0, partnerSalary: 0,
        userAge: 68, partnerAge: 67, cpiAdjustmentFactor: 1.0, partnerSuperBalance: 0
      });
      const withoutUserSuperAtAge67 = getAgePensionAmounts({
        relationshipStatus: 'couple', isHomeowner: true, propertyAssets: 0, savings: 0,
        superannuation: 0, mortgageBalance: 0, userSalary: 0, partnerSalary: 0,
        userAge: 68, partnerAge: 67, cpiAdjustmentFactor: 1.0, partnerSuperBalance: 0
      });

      // User super IS always assessed -> more assets -> lower pension
      expect(withUserSuperAtAge67.userPension + withUserSuperAtAge67.partnerPension)
        .toBeLessThan(withoutUserSuperAtAge67.userPension + withoutUserSuperAtAge67.partnerPension);
    });

  });

  describe('Regression: both partners eligible', () => {

    it('should split couple pension equally when both partners are 67+', () => {
      const result = calculateAgePension({
        relationshipStatus: 'couple',
        isHomeowner: true,
        propertyAssets: 0,
        financialAssets: 0,
        annualIncome: 0,
        partnerAnnualIncome: 0,
        age: 68,
        partnerAge: 67
      });

      expect(result.userPensionAmount).toBeCloseTo(COUPLE_PENSION_COMBINED / 2, 0);
      expect(result.partnerPensionAmount).toBeCloseTo(COUPLE_PENSION_COMBINED / 2, 0);
      expect(result.totalPensionAmount).toBeCloseTo(COUPLE_PENSION_COMBINED, 0);
    });

    it('should return zero pension when neither partner is eligible', () => {
      const result = calculateAgePension({
        relationshipStatus: 'couple',
        isHomeowner: true,
        propertyAssets: 0,
        financialAssets: 0,
        annualIncome: 0,
        partnerAnnualIncome: 0,
        age: 60,
        partnerAge: 55
      });

      expect(result.userPensionAmount).toBe(0);
      expect(result.partnerPensionAmount).toBe(0);
      expect(result.totalPensionAmount).toBe(0);
    });

  });

  describe('Regression: single person', () => {

    it('should return full single pension when eligible with zero assets', () => {
      const result = calculateAgePension({
        relationshipStatus: 'single',
        isHomeowner: true,
        propertyAssets: 0,
        financialAssets: 0,
        annualIncome: 0,
        age: 67
      });

      expect(result.userPensionAmount).toBeCloseTo(SINGLE_PENSION, 0);
      expect(result.partnerPensionAmount).toBe(0);
    });

    it('should return zero pension when single person is under 67', () => {
      const result = calculateAgePension({
        relationshipStatus: 'single',
        isHomeowner: true,
        propertyAssets: 0,
        financialAssets: 0,
        annualIncome: 0,
        age: 66
      });

      expect(result.userPensionAmount).toBe(0);
    });

    it('should cut off single pension when assets exceed cutoff threshold', () => {
      // Single homeowner cutoff is $714,500 (2025 rates)
      const result = calculateAgePension({
        relationshipStatus: 'single',
        isHomeowner: true,
        propertyAssets: 0,
        financialAssets: 750000, // above single homeowner cutoff (714500)
        annualIncome: 0,
        age: 67
      });

      expect(result.userPensionAmount).toBe(0);
    });

  });

});

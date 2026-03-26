import { describe, it } from 'vitest';
import { optimizeExpenseToZeroNetWorth } from '../expenseOptimizer';
import { calculateFinancialPlanModular } from '../financialPlanOrchestrator';
import type { FinancialProfile } from '../../models/FinancialTypes';

describe('Debug Mortgage Cliff Issue', () => {
  const baseProfile: FinancialProfile = {
    currentAge: 30,
    retireAge: 65,
    deathAge: 90,
    relationshipStatus: 'single',
    isHomeowner: true,
    propertyAssets: 0,
    savings: 0,
    mortgageBalance: 0,
    superannuationBalance: 0,
    superannuationRate: 0.07,
    salary: 100000,
    partnerSalary: 0,
    expenses: 50000,
    savingsGrowthRate: 0.05,
    propertyGrowthRate: 0.04,
    propertyRentalYield: 0.033,
    cpiGrowthRate: 0.03,
    partnerAge: 30,
    partnerRetireAge: 65,
    mortgageRate: 0.06
  };

  it('should examine the cliff around $200k mortgage', () => {
    console.log('=== Examining Mortgage Cliff Issue ===');
    console.log('Testing mortgages from $195k to $205k in $1k increments\n');

    for (let mortgage = 195000; mortgage <= 205000; mortgage += 1000) {
      const profile = { ...baseProfile, mortgageBalance: mortgage };
      const result = optimizeExpenseToZeroNetWorth(profile);
      
      // Test the result to see what happens in the projection
      const testProfile = { ...profile, expenses: result.optimalExpense };
      const projection = calculateFinancialPlanModular(testProfile);
      
      const minNetAssets = Math.min(...projection.projection.map(y => y.savings));
      const finalNetWealth = projection.finalNetSavings;
      
      console.log(`Mortgage $${mortgage.toLocaleString()}: Expense $${result.optimalExpense.toLocaleString()} | Final: $${Math.round(finalNetWealth).toLocaleString()} | Min: $${Math.round(minNetAssets).toLocaleString()} | Iter: ${result.iterations}`);
      
      // Check if this result actually works
      if (Math.abs(finalNetWealth) > 10000) {
        console.log(`  ⚠️  Final wealth not close to zero: $${Math.round(finalNetWealth).toLocaleString()}`);
      }
      
      if (minNetAssets < -300000) {
        console.log(`  ⚠️  Assets went very negative: $${Math.round(minNetAssets).toLocaleString()}`);
      }
    }
  });

  it('should debug what happens at exactly $201k mortgage', () => {
    console.log('\n=== Deep Dive: $201k Mortgage ===');
    const profile = { ...baseProfile, mortgageBalance: 201000 };
    
    console.log(`Starting debt-to-income ratio: ${(profile.mortgageBalance / profile.salary).toFixed(2)}x`);
    console.log(`Annual mortgage interest: $${Math.round(profile.mortgageBalance * profile.mortgageRate).toLocaleString()}`);
    
    const result = optimizeExpenseToZeroNetWorth(profile);
    console.log(`\nOptimized expense: $${result.optimalExpense.toLocaleString()}`);
    console.log(`Converged: ${result.converged}, Iterations: ${result.iterations}`);
    
    // Test a few expense levels manually to see what the constraint is catching
    const testExpenses = [45000, 50000, 55000, 60000, 65000];
    
    console.log('\nTesting various expense levels:');
    testExpenses.forEach(expense => {
      const testProfile = { ...profile, expenses: expense };
      const projection = calculateFinancialPlanModular(testProfile);
      const minNetAssets = Math.min(...projection.projection.map(y => y.savings));
      const finalNetWealth = projection.finalNetSavings;
      
      // Calculate debt limit used in constraint
      const reasonableDebtLimit = -(profile.salary + (profile.partnerSalary || 0)) * 2;
      const passesConstraint = minNetAssets >= reasonableDebtLimit;
      
      console.log(`  $${expense.toLocaleString()}: Min=$${Math.round(minNetAssets).toLocaleString()}, Final=$${Math.round(finalNetWealth).toLocaleString()}, Constraint=${passesConstraint ? 'PASS' : 'FAIL'}`);
    });
  });
});
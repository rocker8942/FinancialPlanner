using FinancialPlanner.Backend.DTOs;
using FinancialPlanner.Backend.Models;

namespace FinancialPlanner.Backend.Services
{
    public class FinancialCalculationService
    {
        /// <summary>
        /// Calculates financial projections based on separate property and savings
        /// </summary>
        /// <param name="profile">The financial profile containing user data</param>
        /// <returns>Financial plan result with year-by-year projections</returns>
        public FinancialPlanResultDto CalculateFinancialPlan(FinancialProfile profile)
        {
            var projection = new List<YearlyWealthDto>();
            decimal propertyAssets = profile.PropertyAssets;
            decimal savings = profile.Savings;
            decimal mortgageBalance = profile.MortgageBalance;
            decimal superannuationBalance = profile.SuperannuationBalance;
            
            for (int age = profile.CurrentAge; age <= profile.DeathAge; age++)
            {
                decimal pensionIncomeThisYear = 0;
                if (age > profile.CurrentAge)
                {
                    // Apply growth rates
                    propertyAssets = ApplyGrowth(propertyAssets, profile.PropertyGrowthRate);
                    savings = ApplyGrowth(savings, profile.SavingsGrowthRate);
                    superannuationBalance = ApplyGrowth(superannuationBalance, profile.SuperannuationRate);
                    
                    // Calculate total annual income
                    decimal totalIncome = 0;
                    
                    // Add salary if not retired
                    if (age <= profile.RetireAge)
                    {
                        totalIncome += profile.Salary;
                        // Add superannuation contributions (9.5% of salary)
                        superannuationBalance += profile.Salary * 0.095m;
                    }
                    
                    // Add partner salary if partner is not retired
                    if (age <= profile.PartnerRetireAge)
                    {
                        totalIncome += profile.PartnerSalary;
                        // Add partner superannuation contributions (9.5% of salary)
                        superannuationBalance += profile.PartnerSalary * 0.095m;
                    }
                    
                    // Add pension income for user if at or after pension start age
                    if (age >= profile.PensionStartAge)
                    {
                        totalIncome += profile.PensionAmount;
                        pensionIncomeThisYear += profile.PensionAmount;
                    }
                    // Add pension income for partner if at or after partner pension start age
                    if (age >= profile.PartnerPensionStartAge)
                    {
                        totalIncome += profile.PartnerPensionAmount;
                        pensionIncomeThisYear += profile.PartnerPensionAmount;
                    }
                    
                    // Use income to pay mortgage first, then add remainder to financial assets
                    if (mortgageBalance > 0 && totalIncome > 0)
                    {
                        decimal mortgagePayment = mortgageBalance * profile.MortgageRate;
                        decimal mortgagePaymentFromIncome = Math.Min(totalIncome, mortgagePayment);
                        mortgageBalance -= mortgagePaymentFromIncome;
                        totalIncome -= mortgagePaymentFromIncome;
                    }
                    
                    // Add remaining income to savings
                    savings += totalIncome;
                    
                    // Access superannuation at age 60+
                    if (age >= 60 && superannuationBalance > 0)
                    {
                        // Transfer superannuation to savings at retirement age
                        if (age == Math.Max(profile.RetireAge, profile.PartnerRetireAge))
                        {
                            savings += superannuationBalance;
                            superannuationBalance = 0;
                        }
                    }

                    // Subtract expenses from savings only
                    savings -= profile.Expenses;
                }
                
                decimal netSavings = savings - mortgageBalance;
                decimal totalWealth = propertyAssets + netSavings + superannuationBalance;
                
                // Calculate inflation-adjusted values (in today's purchasing power)
                int yearsFromNow = age - profile.CurrentAge;
                decimal inflationAdjustmentFactor = (decimal)Math.Pow((double)(1 + profile.InflationRate), -yearsFromNow);
                
                decimal inflationAdjustedWealth = totalWealth * inflationAdjustmentFactor;
                decimal inflationAdjustedPropertyAssets = propertyAssets * inflationAdjustmentFactor;
                decimal inflationAdjustedNetSavings = netSavings * inflationAdjustmentFactor;
                
                projection.Add(new YearlyWealthDto 
                { 
                    Age = age, 
                    Wealth = totalWealth,
                    PropertyAssets = propertyAssets,
                    Savings = netSavings,
                    SuperannuationBalance = superannuationBalance,
                    InflationAdjustedWealth = inflationAdjustedWealth,
                    InflationAdjustedPropertyAssets = inflationAdjustedPropertyAssets,
                    InflationAdjustedSavings = inflationAdjustedNetSavings,
                    PensionIncome = pensionIncomeThisYear
                });
            }
            
            decimal finalNetSavings = savings - mortgageBalance;
            decimal finalWealth = propertyAssets + finalNetSavings + superannuationBalance;
            
            // Calculate inflation-adjusted final wealth
            int finalYearsFromNow = profile.DeathAge - profile.CurrentAge;
            decimal finalInflationAdjustmentFactor = (decimal)Math.Pow((double)(1 + profile.InflationRate), -finalYearsFromNow);
            decimal finalInflationAdjustedWealth = finalWealth * finalInflationAdjustmentFactor;
            
            var result = new FinancialPlanResultDto
            {
                Projection = projection,
                FinalWealth = finalWealth,
                Summary = GenerateSummary(profile.RetireAge, profile.DeathAge, finalWealth, finalInflationAdjustedWealth, propertyAssets, finalNetSavings)
            };
            
            return result;
        }
        
        /// <summary>
        /// Applies compound growth to an asset value
        /// </summary>
        /// <param name="currentValue">Current asset value</param>
        /// <param name="growthRate">Annual growth rate (e.g., 0.03 for 3%)</param>
        /// <returns>Asset value after growth</returns>
        private static decimal ApplyGrowth(decimal currentValue, decimal growthRate)
        {
            return currentValue * (1 + growthRate);
        }
        
        /// <summary>
        /// Generates a summary message for the financial plan
        /// </summary>
        private static string GenerateSummary(int retireAge, int deathAge, decimal finalWealth, decimal finalInflationAdjustedWealth, decimal propertyAssets, decimal savings)
        {
            return $"Retiring at age {retireAge}, with projected net wealth of {finalWealth:C} at age {deathAge} " +
                   $"({finalInflationAdjustedWealth:C} in today's purchasing power). " +
                   $"Property assets: {propertyAssets:C}, Savings: {savings:C}.";
        }
    }
}

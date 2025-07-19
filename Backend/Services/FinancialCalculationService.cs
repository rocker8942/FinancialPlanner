using FinancialPlanner.Backend.DTOs;
using FinancialPlanner.Backend.Models;

namespace FinancialPlanner.Backend.Services
{
    public class FinancialCalculationService
    {
        /// <summary>
        /// Calculates financial projections based on separate property and financial assets
        /// </summary>
        /// <param name="profile">The financial profile containing user data</param>
        /// <returns>Financial plan result with year-by-year projections</returns>
        public FinancialPlanResultDto CalculateFinancialPlan(FinancialProfile profile)
        {
            var projection = new List<YearlyWealthDto>();
            decimal propertyAssets = profile.PropertyAssets;
            decimal financialAssets = profile.FinancialAssets;
            
            for (int age = profile.CurrentAge; age <= profile.DeathAge; age++)
            {
                decimal pensionIncomeThisYear = 0;
                if (age > profile.CurrentAge)
                {
                    // Apply growth rates
                    propertyAssets = ApplyGrowth(propertyAssets, profile.PropertyGrowthRate);
                    financialAssets = ApplyGrowth(financialAssets, profile.FinancialAssetGrowthRate);
                    
                    // Add salary to financial assets only if not retired
                    if (age <= profile.RetireAge)
                    {
                        financialAssets += profile.Salary;
                    }
                    
                    // Add partner salary to financial assets only if partner is not retired
                    if (age <= profile.PartnerRetireAge)
                    {
                        financialAssets += profile.PartnerSalary;
                    }
                    
                    // Add pension income for user if at or after pension start age
                    if (age >= profile.PensionStartAge)
                    {
                        financialAssets += profile.PensionAmount;
                        pensionIncomeThisYear += profile.PensionAmount;
                    }
                    // Add pension income for partner if at or after partner pension start age
                    if (age >= profile.PartnerPensionStartAge)
                    {
                        financialAssets += profile.PartnerPensionAmount;
                        pensionIncomeThisYear += profile.PartnerPensionAmount;
                    }

                    // Subtract expenses from financial assets only
                    financialAssets -= profile.Expenses;
                    
                    // Ensure financial assets don't go negative
                    if (financialAssets < 0)
                    {
                        financialAssets = 0;
                    }
                }
                
                decimal totalWealth = propertyAssets + financialAssets;
                
                // Calculate inflation-adjusted values (in today's purchasing power)
                int yearsFromNow = age - profile.CurrentAge;
                decimal inflationAdjustmentFactor = (decimal)Math.Pow((double)(1 + profile.InflationRate), -yearsFromNow);
                
                decimal inflationAdjustedWealth = totalWealth * inflationAdjustmentFactor;
                decimal inflationAdjustedPropertyAssets = propertyAssets * inflationAdjustmentFactor;
                decimal inflationAdjustedFinancialAssets = financialAssets * inflationAdjustmentFactor;
                
                projection.Add(new YearlyWealthDto 
                { 
                    Age = age, 
                    Wealth = totalWealth,
                    PropertyAssets = propertyAssets,
                    FinancialAssets = financialAssets,
                    InflationAdjustedWealth = inflationAdjustedWealth,
                    InflationAdjustedPropertyAssets = inflationAdjustedPropertyAssets,
                    InflationAdjustedFinancialAssets = inflationAdjustedFinancialAssets,
                    PensionIncome = pensionIncomeThisYear
                });
            }
            
            decimal finalWealth = propertyAssets + financialAssets;
            
            // Calculate inflation-adjusted final wealth
            int finalYearsFromNow = profile.DeathAge - profile.CurrentAge;
            decimal finalInflationAdjustmentFactor = (decimal)Math.Pow((double)(1 + profile.InflationRate), -finalYearsFromNow);
            decimal finalInflationAdjustedWealth = finalWealth * finalInflationAdjustmentFactor;
            
            var result = new FinancialPlanResultDto
            {
                Projection = projection,
                FinalWealth = finalWealth,
                Summary = GenerateSummary(profile.RetireAge, profile.DeathAge, finalWealth, finalInflationAdjustedWealth, propertyAssets, financialAssets)
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
        private static string GenerateSummary(int retireAge, int deathAge, decimal finalWealth, decimal finalInflationAdjustedWealth, decimal propertyAssets, decimal financialAssets)
        {
            return $"Retiring at age {retireAge}, with projected net wealth of {finalWealth:C} at age {deathAge} " +
                   $"({finalInflationAdjustedWealth:C} in today's purchasing power). " +
                   $"Property assets: {propertyAssets:C}, Financial assets: {financialAssets:C}.";
        }
    }
}

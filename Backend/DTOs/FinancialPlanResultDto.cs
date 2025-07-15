using System.Collections.Generic;

namespace FinancialPlanner.Backend.DTOs
{
    public class FinancialPlanResultDto
    {
        public List<YearlyWealthDto> Projection { get; set; } = new();
        public decimal FinalWealth { get; set; }
        public string Summary { get; set; } = string.Empty;
    }

    public class YearlyWealthDto
    {
        public int Age { get; set; }
        public decimal Wealth { get; set; }
        public decimal PropertyAssets { get; set; }
        public decimal FinancialAssets { get; set; }
        public decimal InflationAdjustedWealth { get; set; }
        public decimal InflationAdjustedPropertyAssets { get; set; }
        public decimal InflationAdjustedFinancialAssets { get; set; }
        public decimal PensionIncome { get; set; }
    }
}

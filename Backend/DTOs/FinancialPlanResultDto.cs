using System.Collections.Generic;

namespace FinancialPlanner.Backend.DTOs
{
    public class FinancialPlanResultDto
    {
        public List<YearlyWealthDto> Projection { get; set; } = new();
        public decimal FinalWealth { get; set; }
        public string Summary { get; set; }
    }

    public class YearlyWealthDto
    {
        public int Age { get; set; }
        public decimal Wealth { get; set; }
    }
}

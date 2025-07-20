namespace FinancialPlanner.Backend.DTOs
{
    public class FinancialProfileDto
    {
        public decimal PropertyAssets { get; set; }
        public decimal Savings { get; set; }
        public decimal MortgageBalance { get; set; }
        public decimal MortgageRate { get; set; } = 0.06m; // Default 6% mortgage rate
        public decimal SuperannuationBalance { get; set; }
        public decimal SuperannuationRate { get; set; } = 0.07m; // Default 7% superannuation return rate
        public decimal Salary { get; set; }
        public decimal PartnerSalary { get; set; }
        public decimal Expenses { get; set; }
        public int CurrentAge { get; set; }
        public int RetireAge { get; set; }
        public int DeathAge { get; set; }
        public decimal SavingsGrowthRate { get; set; }
        public decimal PropertyGrowthRate { get; set; } = 0.03m; // 3% default
        public decimal InflationRate { get; set; } = 0.03m; // 3% default inflation rate
        public decimal PensionAmount { get; set; }
        public int PensionStartAge { get; set; }
        public decimal PartnerPensionAmount { get; set; }
        public int PartnerPensionStartAge { get; set; }
        // Add partner age fields
        public int PartnerAge { get; set; }
        public int PartnerRetireAge { get; set; }
    }
}

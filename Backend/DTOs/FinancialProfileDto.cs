namespace FinancialPlanner.Backend.DTOs
{
    public class FinancialProfileDto
    {
        public decimal PropertyAssets { get; set; }
        public decimal FinancialAssets { get; set; }
        public decimal Salary { get; set; }
        public decimal PartnerSalary { get; set; }
        public decimal Expenses { get; set; }
        public int CurrentAge { get; set; }
        public int RetireAge { get; set; }
        public int DeathAge { get; set; }
        public decimal FinancialAssetGrowthRate { get; set; }
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

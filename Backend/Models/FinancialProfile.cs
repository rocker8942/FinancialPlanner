using System.ComponentModel.DataAnnotations;

namespace FinancialPlanner.Backend.Models
{
    public class FinancialProfile
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        
        // Separate assets into property and financial
        public decimal PropertyAssets { get; set; }
        public decimal FinancialAssets { get; set; }
        
        public decimal Salary { get; set; }
        public decimal Expenses { get; set; }
        public int CurrentAge { get; set; }
        public int RetireAge { get; set; }
        public int DeathAge { get; set; }
        
        // Growth rates
        public decimal FinancialAssetGrowthRate { get; set; } // User input rate
        public decimal PropertyGrowthRate { get; set; } = 0.03m; // Historic average (3% default)
        public decimal InflationRate { get; set; } = 0.03m; // Default 3% inflation rate
        
        // Pension fields
        public decimal PensionAmount { get; set; }
        public int PensionStartAge { get; set; }
        public decimal PartnerPensionAmount { get; set; }
        public int PartnerPensionStartAge { get; set; }
        public User User { get; set; } = null!;
    }
}

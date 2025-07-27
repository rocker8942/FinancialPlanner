using System.ComponentModel.DataAnnotations;

namespace FinancialPlanner.Backend.Models
{
    public class FinancialProfile
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        
        // Separate assets into property and savings
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
        
        // Growth rates
        public decimal SavingsGrowthRate { get; set; } // User input rate
        public decimal PropertyGrowthRate { get; set; } = 0.04m; // Historic average (4% default)
        public decimal InflationRate { get; set; } = 0.03m; // Default 3% inflation rate
        
        // Pension fields
        public decimal PensionAmount { get; set; }
        public int PensionStartAge { get; set; }
        public decimal PartnerPensionAmount { get; set; }
        public int PartnerPensionStartAge { get; set; }
        // Add partner age fields
        public int PartnerAge { get; set; }
        public int PartnerRetireAge { get; set; }
        
        // Age pension calculation fields
        public string RelationshipStatus { get; set; } = "single"; // "single" or "couple"
        public bool IsHomeowner { get; set; } = true;
        
        public User User { get; set; } = null!;
    }
}

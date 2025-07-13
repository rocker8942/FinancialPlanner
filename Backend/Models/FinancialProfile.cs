using System.ComponentModel.DataAnnotations;

namespace FinancialPlanner.Backend.Models
{
    public class FinancialProfile
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal Assets { get; set; }
        public decimal Salary { get; set; }
        public decimal Expenses { get; set; }
        public int CurrentAge { get; set; }
        public int DeathAge { get; set; }
        public User User { get; set; }
    }
}

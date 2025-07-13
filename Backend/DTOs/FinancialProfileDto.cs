namespace FinancialPlanner.Backend.DTOs
{
    public class FinancialProfileDto
    {
        public decimal Assets { get; set; }
        public decimal Salary { get; set; }
        public decimal Expenses { get; set; }
        public int CurrentAge { get; set; }
        public int DeathAge { get; set; }
    }
}

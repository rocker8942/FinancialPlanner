namespace FinancialPlanner.Backend.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public string Email { get; set; }
        public string? Name { get; set; }
    }
}

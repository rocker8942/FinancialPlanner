using FinancialPlanner.Backend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FinancialPlanner.Backend.Services
{
    public class JwtService
    {
        private readonly IConfiguration _config;
        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(User user)
        {
            try
            {
                if (user == null)
                    throw new ArgumentNullException(nameof(user));

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                    new Claim("name", user.Name ?? "")
                };

                // Get JWT key from config or use a development fallback that's at least 256 bits (32 bytes)
                var jwtKey = _config["Jwt:Key"] ?? "ThisIsAVeryLongSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm";
                
                if (string.IsNullOrEmpty(jwtKey))
                    throw new InvalidOperationException("JWT key cannot be null or empty");
                
                // Ensure the key is at least 256 bits (32 bytes) when encoded to UTF8
                var keyBytes = Encoding.UTF8.GetBytes(jwtKey);
                if (keyBytes.Length < 32)
                    throw new InvalidOperationException($"JWT key must be at least 32 bytes when UTF8 encoded. Current key is {keyBytes.Length} bytes.");

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: _config["Jwt:Issuer"] ?? "FinancialPlannerAPI",
                    audience: _config["Jwt:Audience"] ?? "FinancialPlannerClient",
                    claims: claims,
                    expires: DateTime.UtcNow.AddDays(7),
                    signingCredentials: creds
                );

                var tokenHandler = new JwtSecurityTokenHandler();
                var tokenString = tokenHandler.WriteToken(token);
                
                if (string.IsNullOrEmpty(tokenString))
                    throw new InvalidOperationException("Failed to generate JWT token");

                return tokenString;
            }
            catch (Exception ex)
            {
                // Log the exception (you might want to inject ILogger<JwtService> for proper logging)
                throw new InvalidOperationException($"Failed to generate JWT token: {ex.Message}", ex);
            }
        }
    }
}

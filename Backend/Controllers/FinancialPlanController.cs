using FinancialPlanner.Backend.Data;
using FinancialPlanner.Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinancialPlanner.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FinancialPlanController : ControllerBase
    {
        private readonly AppDbContext _context;
        public FinancialPlanController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<FinancialPlanResultDto>> GetPlan()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var profile = await _context.FinancialProfiles.FirstOrDefaultAsync(fp => fp.UserId == userId);
            if (profile == null)
                return NotFound("Financial profile not found.");

            var projection = new List<YearlyWealthDto>();
            decimal wealth = profile.Assets;
            for (int age = profile.CurrentAge; age <= profile.DeathAge; age++)
            {
                if (age > profile.CurrentAge)
                {
                    wealth += profile.Salary - profile.Expenses;
                }
                projection.Add(new YearlyWealthDto { Age = age, Wealth = wealth });
            }
            var result = new FinancialPlanResultDto
            {
                Projection = projection,
                FinalWealth = wealth,
                Summary = $"At age {profile.DeathAge}, your projected net wealth is {wealth:C}."
            };
            return Ok(result);
        }
    }
}

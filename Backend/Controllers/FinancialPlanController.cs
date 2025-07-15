using FinancialPlanner.Backend.Data;
using FinancialPlanner.Backend.DTOs;
using FinancialPlanner.Backend.Services;
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
        private readonly FinancialCalculationService _calculationService;
        
        public FinancialPlanController(AppDbContext context, FinancialCalculationService calculationService)
        {
            _context = context;
            _calculationService = calculationService;
        }

        [HttpGet]
        public async Task<ActionResult<FinancialPlanResultDto>> GetPlan()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var profile = await _context.FinancialProfiles.FirstOrDefaultAsync(fp => fp.UserId == userId);
            if (profile == null)
                return NotFound("Financial profile not found.");

            var result = _calculationService.CalculateFinancialPlan(profile);
            return Ok(result);
        }
    }
}

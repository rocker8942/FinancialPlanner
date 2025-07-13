using FinancialPlanner.Backend.Data;
using FinancialPlanner.Backend.DTOs;
using FinancialPlanner.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinancialPlanner.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FinancialProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        public FinancialProfileController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<FinancialProfileDto>> Get()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var profile = await _context.FinancialProfiles.FirstOrDefaultAsync(fp => fp.UserId == userId);
            if (profile == null) return NotFound();
            return new FinancialProfileDto
            {
                Assets = profile.Assets,
                Salary = profile.Salary,
                Expenses = profile.Expenses,
                CurrentAge = profile.CurrentAge,
                DeathAge = profile.DeathAge
            };
        }

        [HttpPost]
        public async Task<IActionResult> Upsert(FinancialProfileDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var profile = await _context.FinancialProfiles.FirstOrDefaultAsync(fp => fp.UserId == userId);
            if (profile == null)
            {
                profile = new FinancialProfile
                {
                    UserId = userId,
                    Assets = dto.Assets,
                    Salary = dto.Salary,
                    Expenses = dto.Expenses,
                    CurrentAge = dto.CurrentAge,
                    DeathAge = dto.DeathAge
                };
                _context.FinancialProfiles.Add(profile);
            }
            else
            {
                profile.Assets = dto.Assets;
                profile.Salary = dto.Salary;
                profile.Expenses = dto.Expenses;
                profile.CurrentAge = dto.CurrentAge;
                profile.DeathAge = dto.DeathAge;
            }
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}

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
                PropertyAssets = profile.PropertyAssets,
                Savings = profile.Savings,
                MortgageBalance = profile.MortgageBalance,
                MortgageRate = profile.MortgageRate,
                SuperannuationBalance = profile.SuperannuationBalance,
                SuperannuationRate = profile.SuperannuationRate,
                Salary = profile.Salary,
                Expenses = profile.Expenses,
                CurrentAge = profile.CurrentAge,
                RetireAge = profile.RetireAge,
                DeathAge = profile.DeathAge,
                SavingsGrowthRate = profile.SavingsGrowthRate,
                PropertyGrowthRate = profile.PropertyGrowthRate,
                InflationRate = profile.InflationRate,
                PensionAmount = profile.PensionAmount,
                PensionStartAge = profile.PensionStartAge,
                PartnerPensionAmount = profile.PartnerPensionAmount,
                PartnerPensionStartAge = profile.PartnerPensionStartAge,
                // Add partner age fields
                PartnerAge = profile.PartnerAge,
                PartnerRetireAge = profile.PartnerRetireAge
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
                    PropertyAssets = dto.PropertyAssets,
                    Savings = dto.Savings,
                    MortgageBalance = dto.MortgageBalance,
                    MortgageRate = dto.MortgageRate,
                    SuperannuationBalance = dto.SuperannuationBalance,
                    SuperannuationRate = dto.SuperannuationRate,
                    Salary = dto.Salary,
                    Expenses = dto.Expenses,
                    CurrentAge = dto.CurrentAge,
                    RetireAge = dto.RetireAge,
                    DeathAge = dto.DeathAge,
                    SavingsGrowthRate = dto.SavingsGrowthRate,
                    PropertyGrowthRate = dto.PropertyGrowthRate,
                    InflationRate = dto.InflationRate,
                    PensionAmount = dto.PensionAmount,
                    PensionStartAge = dto.PensionStartAge,
                    PartnerPensionAmount = dto.PartnerPensionAmount,
                    PartnerPensionStartAge = dto.PartnerPensionStartAge,
                    // Add partner age fields
                    PartnerAge = dto.PartnerAge,
                    PartnerRetireAge = dto.PartnerRetireAge
                };
                _context.FinancialProfiles.Add(profile);
            }
            else
            {
                profile.PropertyAssets = dto.PropertyAssets;
                profile.Savings = dto.Savings;
                profile.MortgageBalance = dto.MortgageBalance;
                profile.MortgageRate = dto.MortgageRate;
                profile.SuperannuationBalance = dto.SuperannuationBalance;
                profile.SuperannuationRate = dto.SuperannuationRate;
                profile.Salary = dto.Salary;
                profile.Expenses = dto.Expenses;
                profile.CurrentAge = dto.CurrentAge;
                profile.RetireAge = dto.RetireAge;
                profile.DeathAge = dto.DeathAge;
                profile.SavingsGrowthRate = dto.SavingsGrowthRate;
                profile.PropertyGrowthRate = dto.PropertyGrowthRate;
                profile.InflationRate = dto.InflationRate;
                profile.PensionAmount = dto.PensionAmount;
                profile.PensionStartAge = dto.PensionStartAge;
                profile.PartnerPensionAmount = dto.PartnerPensionAmount;
                profile.PartnerPensionStartAge = dto.PartnerPensionStartAge;
                // Add partner age fields
                profile.PartnerAge = dto.PartnerAge;
                profile.PartnerRetireAge = dto.PartnerRetireAge;
            }
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}

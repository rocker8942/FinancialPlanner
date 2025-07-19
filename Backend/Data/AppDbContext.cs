using Microsoft.EntityFrameworkCore;
using FinancialPlanner.Backend.Models;

namespace FinancialPlanner.Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<FinancialProfile> FinancialProfiles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<FinancialProfile>()
                .HasOne(fp => fp.User)
                .WithMany()
                .HasForeignKey(fp => fp.UserId);
                
            // Configure decimal precision for financial values
            modelBuilder.Entity<FinancialProfile>()
                .Property(fp => fp.PropertyAssets)
                .HasPrecision(18, 2);
                
            modelBuilder.Entity<FinancialProfile>()
                .Property(fp => fp.FinancialAssets)
                .HasPrecision(18, 2);
                
            modelBuilder.Entity<FinancialProfile>()
                .Property(fp => fp.Salary)
                .HasPrecision(18, 2);
                
            modelBuilder.Entity<FinancialProfile>()
                .Property(fp => fp.PartnerSalary)
                .HasPrecision(18, 2);
                
            modelBuilder.Entity<FinancialProfile>()
                .Property(fp => fp.Expenses)
                .HasPrecision(18, 2);
                
            modelBuilder.Entity<FinancialProfile>()
                .Property(fp => fp.FinancialAssetGrowthRate)
                .HasPrecision(18, 6); // More precision for growth rates
                
            modelBuilder.Entity<FinancialProfile>()
                .Property(fp => fp.PropertyGrowthRate)
                .HasPrecision(18, 6); // More precision for growth rates
                
            modelBuilder.Entity<FinancialProfile>()
                .Property(fp => fp.InflationRate)
                .HasPrecision(18, 6); // More precision for rates
                
            modelBuilder.Entity<FinancialProfile>()
                .Property(fp => fp.PensionAmount)
                .HasPrecision(18, 2);
                
            modelBuilder.Entity<FinancialProfile>()
                .Property(fp => fp.PartnerPensionAmount)
                .HasPrecision(18, 2);
        }
    }
}

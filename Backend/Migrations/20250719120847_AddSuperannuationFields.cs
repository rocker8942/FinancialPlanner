using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinancialPlanner.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSuperannuationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "SuperannuationBalance",
                table: "FinancialProfiles",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SuperannuationRate",
                table: "FinancialProfiles",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SuperannuationBalance",
                table: "FinancialProfiles");

            migrationBuilder.DropColumn(
                name: "SuperannuationRate",
                table: "FinancialProfiles");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinancialPlanner.Backend.Migrations
{
    /// <inheritdoc />
    public partial class SeparateAssetTypesWithPrecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Assets",
                table: "FinancialProfiles");

            migrationBuilder.AddColumn<decimal>(
                name: "FinancialAssetGrowthRate",
                table: "FinancialProfiles",
                type: "decimal(18,6)",
                precision: 18,
                scale: 6,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "FinancialAssets",
                table: "FinancialProfiles",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PropertyAssets",
                table: "FinancialProfiles",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PropertyGrowthRate",
                table: "FinancialProfiles",
                type: "decimal(18,6)",
                precision: 18,
                scale: 6,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FinancialAssetGrowthRate",
                table: "FinancialProfiles");

            migrationBuilder.DropColumn(
                name: "FinancialAssets",
                table: "FinancialProfiles");

            migrationBuilder.DropColumn(
                name: "PropertyAssets",
                table: "FinancialProfiles");

            migrationBuilder.DropColumn(
                name: "PropertyGrowthRate",
                table: "FinancialProfiles");

            migrationBuilder.AddColumn<decimal>(
                name: "Assets",
                table: "FinancialProfiles",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}

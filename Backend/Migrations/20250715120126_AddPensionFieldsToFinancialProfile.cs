using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinancialPlanner.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPensionFieldsToFinancialProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PartnerPensionAmount",
                table: "FinancialProfiles",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "PartnerPensionStartAge",
                table: "FinancialProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "PensionAmount",
                table: "FinancialProfiles",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "PensionStartAge",
                table: "FinancialProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PartnerPensionAmount",
                table: "FinancialProfiles");

            migrationBuilder.DropColumn(
                name: "PartnerPensionStartAge",
                table: "FinancialProfiles");

            migrationBuilder.DropColumn(
                name: "PensionAmount",
                table: "FinancialProfiles");

            migrationBuilder.DropColumn(
                name: "PensionStartAge",
                table: "FinancialProfiles");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinancialPlanner.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPartnerAgeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PartnerAge",
                table: "FinancialProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PartnerRetireAge",
                table: "FinancialProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PartnerAge",
                table: "FinancialProfiles");

            migrationBuilder.DropColumn(
                name: "PartnerRetireAge",
                table: "FinancialProfiles");
        }
    }
}

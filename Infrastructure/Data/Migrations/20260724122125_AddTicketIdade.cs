using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexTicket.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketIdade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Idade",
                schema: "nexticket_app",
                table: "Tickets",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Idade",
                schema: "nexticket_app",
                table: "Tickets");
        }
    }
}

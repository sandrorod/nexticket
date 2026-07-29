using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexTicket.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEventExigirContatoTodosIngressos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ExigirContatoTodosIngressos",
                schema: "nexticket_app",
                table: "Events",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExigirContatoTodosIngressos",
                schema: "nexticket_app",
                table: "Events");
        }
    }
}

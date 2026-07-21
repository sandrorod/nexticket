using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexTicket.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEventTransmissaoUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TransmissaoUrl",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TransmissaoUrl",
                schema: "nexticket_app",
                table: "Events");
        }
    }
}

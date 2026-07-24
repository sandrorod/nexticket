using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexTicket.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEventSocialContactFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContatoFacebook",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContatoInstagram",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContatoFacebook",
                schema: "nexticket_app",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ContatoInstagram",
                schema: "nexticket_app",
                table: "Events");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexTicket.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEventSalePeriod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "VendaFim",
                schema: "nexticket_app",
                table: "Events",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "VendaInicio",
                schema: "nexticket_app",
                table: "Events",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VendaFim",
                schema: "nexticket_app",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "VendaInicio",
                schema: "nexticket_app",
                table: "Events");
        }
    }
}

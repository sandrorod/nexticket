using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexTicket.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEventExtendedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bairro",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cep",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(9)",
                maxLength: 9,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cidade",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Classificacao",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "Livre");

            migrationBuilder.AddColumn<string>(
                name: "ContatoEmail",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContatoTelefone",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContatoWhatsapp",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Endereco",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Estado",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(2)",
                maxLength: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Numero",
                schema: "nexticket_app",
                table: "Events",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OrientacoesGerais",
                schema: "nexticket_app",
                table: "Events",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bairro",
                schema: "nexticket_app",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Cep",
                schema: "nexticket_app",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Cidade",
                schema: "nexticket_app",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Classificacao",
                schema: "nexticket_app",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ContatoEmail",
                schema: "nexticket_app",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ContatoTelefone",
                schema: "nexticket_app",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ContatoWhatsapp",
                schema: "nexticket_app",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Endereco",
                schema: "nexticket_app",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Estado",
                schema: "nexticket_app",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Numero",
                schema: "nexticket_app",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "OrientacoesGerais",
                schema: "nexticket_app",
                table: "Events");
        }
    }
}

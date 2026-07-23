using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexTicket.Domain.Entities;

namespace NexTicket.Infrastructure.Data.Configurations;

public class EventConfiguration : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.ToTable("Events");

        builder.Property(e => e.Nome).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Descricao).HasMaxLength(4000);
        builder.Property(e => e.Local).IsRequired().HasMaxLength(300);
        builder.Property(e => e.ImagemUrl).HasMaxLength(500);
        builder.Property(e => e.MapaUrl).HasMaxLength(500);
        builder.Property(e => e.TransmissaoUrl).HasMaxLength(500);

        builder.Property(e => e.Cep).HasMaxLength(9);
        builder.Property(e => e.Endereco).HasMaxLength(300);
        builder.Property(e => e.Numero).HasMaxLength(20);
        builder.Property(e => e.Bairro).HasMaxLength(150);
        builder.Property(e => e.Cidade).HasMaxLength(150);
        builder.Property(e => e.Estado).HasMaxLength(2);
        builder.Property(e => e.Classificacao).IsRequired().HasMaxLength(10).HasDefaultValue("Livre");
        builder.Property(e => e.ContatoWhatsapp).HasMaxLength(20);
        builder.Property(e => e.ContatoTelefone).HasMaxLength(20);
        builder.Property(e => e.ContatoEmail).HasMaxLength(200);
        builder.Property(e => e.OrientacoesGerais).HasColumnType("text");

        builder.HasMany(e => e.Lots)
            .WithOne(l => l.Event)
            .HasForeignKey(l => l.EventId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

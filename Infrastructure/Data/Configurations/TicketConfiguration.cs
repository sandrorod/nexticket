using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexTicket.Domain.Entities;

namespace NexTicket.Infrastructure.Data.Configurations;

public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
{
    public void Configure(EntityTypeBuilder<Ticket> builder)
    {
        builder.ToTable("Tickets");

        builder.Property(t => t.Codigo).IsRequired().HasMaxLength(20);
        builder.Property(t => t.Token).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Nome).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Email).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Telefone).IsRequired().HasMaxLength(20);
        builder.Property(t => t.Cpf).HasMaxLength(14);

        builder.HasIndex(t => t.Codigo).IsUnique();
        builder.HasIndex(t => t.Token).IsUnique();

        // Anti-fraude: dentro do mesmo evento não pode repetir Email,
        // nem repetir a combinação Nome+Telefone.
        builder.HasIndex(t => new { t.EventId, t.Email })
            .IsUnique()
            .HasFilter("\"Status\" <> 2");

        builder.HasIndex(t => new { t.EventId, t.Nome, t.Telefone })
            .IsUnique()
            .HasFilter("\"Status\" <> 2");

        builder.HasOne(t => t.Event)
            .WithMany(e => e.Tickets)
            .HasForeignKey(t => t.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Lot)
            .WithMany()
            .HasForeignKey(t => t.LotId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.UsuarioValidador)
            .WithMany()
            .HasForeignKey(t => t.UsuarioValidadorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

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

        builder.HasMany(e => e.Lots)
            .WithOne(l => l.Event)
            .HasForeignKey(l => l.EventId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexTicket.Domain.Entities;

namespace NexTicket.Infrastructure.Data.Configurations;

public class LotConfiguration : IEntityTypeConfiguration<Lot>
{
    public void Configure(EntityTypeBuilder<Lot> builder)
    {
        builder.ToTable("Lots");

        builder.Property(l => l.Nome).IsRequired().HasMaxLength(100);
        builder.Property(l => l.Preco).HasColumnType("numeric(10,2)");

        builder.Ignore(l => l.QuantidadeDisponivel);

        builder.HasMany(l => l.OrderItems)
            .WithOne(oi => oi.Lot)
            .HasForeignKey(oi => oi.LotId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexTicket.Domain.Entities;

namespace NexTicket.Infrastructure.Data.Configurations;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("Coupons");

        builder.Property(c => c.Codigo).IsRequired().HasMaxLength(50);
        builder.Property(c => c.Valor).HasColumnType("numeric(10,2)");

        builder.HasIndex(c => c.Codigo).IsUnique();

        builder.HasOne(c => c.Event)
            .WithMany(e => e.Coupons)
            .HasForeignKey(c => c.EventId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

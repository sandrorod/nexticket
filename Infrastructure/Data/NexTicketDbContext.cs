using Microsoft.EntityFrameworkCore;
using NexTicket.Domain.Entities;

namespace NexTicket.Infrastructure.Data;

public class NexTicketDbContext : DbContext
{
    public NexTicketDbContext(DbContextOptions<NexTicketDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Lot> Lots => Set<Lot>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<Coupon> Coupons => Set<Coupon>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(NexTicketDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}

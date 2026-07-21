using NexTicket.Domain.Entities;

namespace NexTicket.Application.Common.Interfaces;

public interface IUnitOfWork
{
    IRepository<User> Users { get; }
    IRepository<Event> Events { get; }
    IRepository<Lot> Lots { get; }
    IRepository<Order> Orders { get; }
    IRepository<OrderItem> OrderItems { get; }
    IRepository<Ticket> Tickets { get; }
    IRepository<Coupon> Coupons { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
    Task<IDisposable> BeginTransactionAsync(CancellationToken ct = default);
}

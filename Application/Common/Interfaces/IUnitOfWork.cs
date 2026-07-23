using NexTicket.Domain.Entities;

namespace NexTicket.Application.Common.Interfaces;

public interface IUnitOfWorkTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken ct = default);
}

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
    Task<IUnitOfWorkTransaction> BeginTransactionAsync(CancellationToken ct = default);
}

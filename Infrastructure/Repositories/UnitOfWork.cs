using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Domain.Entities;
using NexTicket.Infrastructure.Data;

namespace NexTicket.Infrastructure.Repositories;

public class UnitOfWorkTransaction : IUnitOfWorkTransaction
{
    private readonly IDbContextTransaction _transaction;

    public UnitOfWorkTransaction(IDbContextTransaction transaction)
    {
        _transaction = transaction;
    }

    public Task CommitAsync(CancellationToken ct = default) => _transaction.CommitAsync(ct);

    public ValueTask DisposeAsync() => _transaction.DisposeAsync();
}

public class UnitOfWork : IUnitOfWork
{
    private readonly NexTicketDbContext _context;

    public UnitOfWork(NexTicketDbContext context)
    {
        _context = context;
        Users = new Repository<User>(context);
        Events = new Repository<Event>(context);
        Lots = new Repository<Lot>(context);
        Orders = new Repository<Order>(context);
        OrderItems = new Repository<OrderItem>(context);
        Tickets = new Repository<Ticket>(context);
        Coupons = new Repository<Coupon>(context);
    }

    public IRepository<User> Users { get; }
    public IRepository<Event> Events { get; }
    public IRepository<Lot> Lots { get; }
    public IRepository<Order> Orders { get; }
    public IRepository<OrderItem> OrderItems { get; }
    public IRepository<Ticket> Tickets { get; }
    public IRepository<Coupon> Coupons { get; }

    public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        _context.SaveChangesAsync(ct);

    public async Task<IUnitOfWorkTransaction> BeginTransactionAsync(CancellationToken ct = default)
    {
        IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(ct);
        return new UnitOfWorkTransaction(transaction);
    }

    public async Task<TResult> ExecuteInTransactionAsync<TResult>(
        Func<CancellationToken, Task<TResult>> operation, CancellationToken ct = default)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(
            state: (Context: _context, Operation: operation),
            operation: async (_, state, innerCt) =>
            {
                await using var transaction = await state.Context.Database.BeginTransactionAsync(innerCt);
                var result = await state.Operation(innerCt);
                await transaction.CommitAsync(innerCt);
                return result;
            },
            verifySucceeded: null,
            cancellationToken: ct);
    }
}

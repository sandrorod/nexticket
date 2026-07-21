using Microsoft.EntityFrameworkCore.Storage;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Domain.Entities;
using NexTicket.Infrastructure.Data;

namespace NexTicket.Infrastructure.Repositories;

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

    public async Task<IDisposable> BeginTransactionAsync(CancellationToken ct = default)
    {
        IDbContextTransaction transaction = await _context.Database.BeginTransactionAsync(ct);
        return transaction;
    }
}

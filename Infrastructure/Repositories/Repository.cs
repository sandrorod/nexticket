using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Domain.Common;
using NexTicket.Infrastructure.Data;

namespace NexTicket.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    private readonly NexTicketDbContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository(NexTicketDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _dbSet.FindAsync(new object[] { id }, ct);

    public async Task<List<T>> GetAllAsync(CancellationToken ct = default) =>
        await _dbSet.ToListAsync(ct);

    public async Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default) =>
        await _dbSet.Where(predicate).ToListAsync(ct);

    public async Task AddAsync(T entity, CancellationToken ct = default) =>
        await _dbSet.AddAsync(entity, ct);

    public void Update(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _dbSet.Update(entity);
    }

    public void Remove(T entity) => _dbSet.Remove(entity);

    public IQueryable<T> Query() => _dbSet.AsQueryable();
}

using Microsoft.EntityFrameworkCore;
using NexTicket.Application.Common.Exceptions;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Staff;
using NexTicket.Domain.Entities;
using NexTicket.Domain.Enums;

namespace NexTicket.Application.Services;

public class StaffService : IStaffService
{
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _passwordHasher;

    public StaffService(IUnitOfWork uow, IPasswordHasher passwordHasher)
    {
        _uow = uow;
        _passwordHasher = passwordHasher;
    }

    public async Task<List<StaffDto>> GetAllAsync(CancellationToken ct = default)
    {
        var staff = await _uow.Users.Query()
            .Where(u => u.Role == UserRole.Validador)
            .OrderBy(u => u.Nome)
            .ToListAsync(ct);

        return staff.Select(ToDto).ToList();
    }

    public async Task<StaffDto> CreateAsync(CreateStaffRequest request, CancellationToken ct = default)
    {
        var existing = await _uow.Users.FindAsync(u => u.Email == request.Email, ct);
        if (existing.Count > 0)
            throw new ConflictException("Já existe uma conta cadastrada com este email.");

        var user = new User
        {
            Nome = request.Nome,
            Email = request.Email,
            SenhaHash = _passwordHasher.Hash(request.Senha),
            Telefone = request.Telefone,
            Role = UserRole.Validador
        };

        await _uow.Users.AddAsync(user, ct);
        await _uow.SaveChangesAsync(ct);

        return ToDto(user);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken ct = default)
    {
        var user = await GetValidadorOrThrow(id, ct);
        user.Ativo = false;
        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);
    }

    public async Task ReactivateAsync(Guid id, CancellationToken ct = default)
    {
        var user = await GetValidadorOrThrow(id, ct);
        user.Ativo = true;
        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);
    }

    private async Task<User> GetValidadorOrThrow(Guid id, CancellationToken ct)
    {
        var user = await _uow.Users.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Funcionário", id);

        if (user.Role != UserRole.Validador)
            throw new ConflictException("Este usuário não é uma conta de funcionário.");

        return user;
    }

    private static StaffDto ToDto(User u) => new(u.Id, u.Nome, u.Email, u.Telefone, u.Ativo, u.CreatedAt);
}

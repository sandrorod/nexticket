using NexTicket.Application.Common.Exceptions;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Auth;
using NexTicket.Domain.Entities;
using NexTicket.Domain.Enums;

namespace NexTicket.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(IUnitOfWork uow, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator)
    {
        _uow = uow;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var existing = await _uow.Users.FindAsync(u => u.Email == request.Email, ct);
        if (existing.Count > 0)
            throw new ConflictException("Já existe uma conta cadastrada com este email.");

        if (!string.IsNullOrEmpty(request.Cpf))
        {
            var existingCpf = await _uow.Users.FindAsync(u => u.Cpf == request.Cpf, ct);
            if (existingCpf.Count > 0)
                throw new ConflictException("Já existe uma conta cadastrada com este CPF.");
        }

        var user = new User
        {
            Nome = request.Nome,
            Email = request.Email,
            SenhaHash = _passwordHasher.Hash(request.Senha),
            Telefone = request.Telefone,
            Cpf = request.Cpf,
            Role = UserRole.Comprador
        };

        await _uow.Users.AddAsync(user, ct);
        await _uow.SaveChangesAsync(ct);

        var token = _jwtTokenGenerator.GenerateToken(user);
        return new AuthResponse(token, user.Id, user.Nome, user.Email, user.Role.ToString());
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var users = await _uow.Users.FindAsync(u => u.Email == request.Email, ct);
        var user = users.FirstOrDefault();

        if (user is null || !user.Ativo || !_passwordHasher.Verify(request.Senha, user.SenhaHash))
            throw new UnauthorizedAppException("Email ou senha inválidos.");

        var token = _jwtTokenGenerator.GenerateToken(user);
        return new AuthResponse(token, user.Id, user.Nome, user.Email, user.Role.ToString());
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await _uow.Users.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("Usuário", userId);

        if (!_passwordHasher.Verify(request.SenhaAtual, user.SenhaHash))
            throw new UnauthorizedAppException("Senha atual incorreta.");

        user.SenhaHash = _passwordHasher.Hash(request.NovaSenha);
        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);
    }
}

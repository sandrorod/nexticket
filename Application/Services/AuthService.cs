using Microsoft.Extensions.Options;
using NexTicket.Application.Common.Exceptions;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.Common.Options;
using NexTicket.Application.DTOs.Auth;
using NexTicket.Domain.Entities;
using NexTicket.Domain.Enums;

namespace NexTicket.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _uow;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ITicketTokenGenerator _tokenGenerator;
    private readonly IEmailSender _emailSender;
    private readonly string _frontendUrl;

    public AuthService(
        IUnitOfWork uow,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        ITicketTokenGenerator tokenGenerator,
        IEmailSender emailSender,
        IOptions<FrontendSettings> frontendSettings)
    {
        _uow = uow;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _tokenGenerator = tokenGenerator;
        _emailSender = emailSender;
        _frontendUrl = frontendSettings.Value.Url;
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

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken ct = default)
    {
        var users = await _uow.Users.FindAsync(u => u.Email == request.Email, ct);
        var user = users.FirstOrDefault();

        // Não revela se o email existe ou não — evita enumeração de contas.
        if (user is null || !user.Ativo)
            return;

        user.ResetPasswordToken = _tokenGenerator.GenerateToken();
        user.ResetPasswordTokenExpiraEm = DateTime.UtcNow.AddHours(1);
        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);

        var resetUrl = $"{_frontendUrl}/redefinir-senha?token={user.ResetPasswordToken}";
        var html = $"""
            <p>Olá, {user.Nome}!</p>
            <p>Recebemos uma solicitação para redefinir sua senha no NexTicket.</p>
            <p><a href="{resetUrl}">Clique aqui para criar uma nova senha</a></p>
            <p>Este link expira em 1 hora. Se você não solicitou isso, ignore este email.</p>
            """;

        await _emailSender.SendAsync(user.Email, "Redefinição de senha — NexTicket", html, ct);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default)
    {
        var users = await _uow.Users.FindAsync(u => u.ResetPasswordToken == request.Token, ct);
        var user = users.FirstOrDefault();

        if (user is null || user.ResetPasswordTokenExpiraEm is null || user.ResetPasswordTokenExpiraEm < DateTime.UtcNow)
            throw new ConflictException("Link de redefinição inválido ou expirado.");

        user.SenhaHash = _passwordHasher.Hash(request.NovaSenha);
        user.ResetPasswordToken = null;
        user.ResetPasswordTokenExpiraEm = null;
        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);
    }
}

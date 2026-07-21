namespace NexTicket.Application.DTOs.Auth;

public record RegisterRequest(string Nome, string Email, string Senha, string Telefone, string? Cpf);

public record LoginRequest(string Email, string Senha);

public record AuthResponse(string Token, Guid UserId, string Nome, string Email, string Role);

public record ChangePasswordRequest(string SenhaAtual, string NovaSenha);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Token, string NovaSenha);

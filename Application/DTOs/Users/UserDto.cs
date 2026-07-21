namespace NexTicket.Application.DTOs.Users;

public record UserDto(Guid Id, string Nome, string Email, string Telefone, string? Cpf, string Role, DateTime CreatedAt);

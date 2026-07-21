namespace NexTicket.Application.DTOs.Staff;

public record StaffDto(Guid Id, string Nome, string Email, string Telefone, bool Ativo, DateTime CreatedAt);

public record CreateStaffRequest(string Nome, string Email, string Senha, string Telefone);

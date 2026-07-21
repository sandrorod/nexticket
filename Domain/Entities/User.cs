using NexTicket.Domain.Common;
using NexTicket.Domain.Enums;

namespace NexTicket.Domain.Entities;

public class User : BaseEntity
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string? Cpf { get; set; }
    public UserRole Role { get; set; } = UserRole.Comprador;
    public bool Ativo { get; set; } = true;

    public string? ResetPasswordToken { get; set; }
    public DateTime? ResetPasswordTokenExpiraEm { get; set; }

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

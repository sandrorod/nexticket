using NexTicket.Domain.Common;
using NexTicket.Domain.Enums;

namespace NexTicket.Domain.Entities;

public class Ticket : BaseEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;

    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid EventId { get; set; }
    public Event Event { get; set; } = null!;

    public Guid LotId { get; set; }
    public Lot Lot { get; set; } = null!;

    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string? Cpf { get; set; }

    public TicketStatus Status { get; set; } = TicketStatus.Disponivel;
    public DateTime? DataUso { get; set; }
    public Guid? UsuarioValidadorId { get; set; }
    public User? UsuarioValidador { get; set; }
}

using NexTicket.Domain.Common;

namespace NexTicket.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid LotId { get; set; }
    public Lot Lot { get; set; } = null!;

    public int Quantidade { get; set; }
    public decimal ValorUnitario { get; set; }
    public decimal ValorTotal => Quantidade * ValorUnitario;
}

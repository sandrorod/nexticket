using NexTicket.Domain.Common;
using NexTicket.Domain.Enums;

namespace NexTicket.Domain.Entities;

public class Lot : BaseEntity
{
    public Guid EventId { get; set; }
    public Event Event { get; set; } = null!;

    public string Nome { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public int Quantidade { get; set; }
    public int QuantidadeVendida { get; set; }
    public int MaximoPorUsuario { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public LotStatus Status { get; set; } = LotStatus.Programado;

    public int QuantidadeDisponivel => Quantidade - QuantidadeVendida;

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

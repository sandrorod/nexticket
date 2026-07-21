using NexTicket.Domain.Common;
using NexTicket.Domain.Enums;

namespace NexTicket.Domain.Entities;

public class Coupon : BaseEntity
{
    public string Codigo { get; set; } = string.Empty;
    public CouponType Tipo { get; set; }
    public decimal Valor { get; set; }

    public Guid? EventId { get; set; }
    public Event? Event { get; set; }

    public int? QuantidadeMaxima { get; set; }
    public int QuantidadeUtilizada { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public bool Ativo { get; set; } = true;
}

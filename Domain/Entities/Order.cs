using NexTicket.Domain.Common;
using NexTicket.Domain.Enums;

namespace NexTicket.Domain.Entities;

public class Order : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime Data { get; set; } = DateTime.UtcNow;
    public decimal ValorTotal { get; set; }
    public decimal Desconto { get; set; }
    public OrderPaymentStatus StatusPagamento { get; set; } = OrderPaymentStatus.Pendente;

    public Guid? CouponId { get; set; }
    public Coupon? Coupon { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}

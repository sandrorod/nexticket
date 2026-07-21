using NexTicket.Domain.Common;
using NexTicket.Domain.Enums;

namespace NexTicket.Domain.Entities;

public class Event : BaseEntity
{
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public DateOnly Data { get; set; }
    public TimeOnly Hora { get; set; }
    public string Local { get; set; } = string.Empty;
    public string? MapaUrl { get; set; }
    public string? ImagemUrl { get; set; }
    public string? TransmissaoUrl { get; set; }
    public EventStatus Status { get; set; } = EventStatus.Rascunho;
    public int MaximoPorCpf { get; set; }
    public int MaximoPorUsuario { get; set; }

    public ICollection<Lot> Lots { get; set; } = new List<Lot>();
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public ICollection<Coupon> Coupons { get; set; } = new List<Coupon>();
}

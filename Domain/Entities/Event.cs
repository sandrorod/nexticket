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
    public DateTime VendaInicio { get; set; }
    public DateTime VendaFim { get; set; }
    public EventStatus Status { get; set; } = EventStatus.Rascunho;
    public int MaximoPorCpf { get; set; }
    public int MaximoPorUsuario { get; set; }

    public string? Cep { get; set; }
    public string? Endereco { get; set; }
    public string? Numero { get; set; }
    public string? Bairro { get; set; }
    public string? Cidade { get; set; }
    public string? Estado { get; set; }
    public string Classificacao { get; set; } = "Livre";
    public string? ContatoWhatsapp { get; set; }
    public string? ContatoTelefone { get; set; }
    public string? ContatoEmail { get; set; }
    public string? OrientacoesGerais { get; set; }

    public ICollection<Lot> Lots { get; set; } = new List<Lot>();
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public ICollection<Coupon> Coupons { get; set; } = new List<Coupon>();
}

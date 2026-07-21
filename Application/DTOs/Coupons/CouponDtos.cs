namespace NexTicket.Application.DTOs.Coupons;

public record CouponDto(
    Guid Id,
    string Codigo,
    string Tipo,
    decimal Valor,
    Guid? EventId,
    int? QuantidadeMaxima,
    int QuantidadeUtilizada,
    DateTime DataInicio,
    DateTime DataFim,
    bool Ativo);

public record CreateCouponRequest(
    string Codigo,
    string Tipo,
    decimal Valor,
    Guid? EventId,
    int? QuantidadeMaxima,
    DateTime DataInicio,
    DateTime DataFim);

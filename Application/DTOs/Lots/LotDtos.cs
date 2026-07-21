namespace NexTicket.Application.DTOs.Lots;

public record LotDto(
    Guid Id,
    Guid EventId,
    string Nome,
    decimal Preco,
    int Quantidade,
    int QuantidadeVendida,
    int QuantidadeDisponivel,
    int MaximoPorUsuario,
    DateTime DataInicio,
    DateTime DataFim,
    string Status);

public record CreateLotRequest(
    string Nome,
    decimal Preco,
    int Quantidade,
    int MaximoPorUsuario,
    DateTime DataInicio,
    DateTime DataFim);

public record UpdateLotRequest(
    string Nome,
    decimal Preco,
    int Quantidade,
    int MaximoPorUsuario,
    DateTime DataInicio,
    DateTime DataFim);

namespace NexTicket.Application.DTOs.Orders;

public record TicketHolderRequest(string Nome, string Email, string Telefone, string? Cpf);

public record CreateOrderItemRequest(Guid LotId, List<TicketHolderRequest> Ingressos);

public record CreateOrderRequest(Guid EventId, List<CreateOrderItemRequest> Itens, string? CupomCodigo);

public record OrderDto(
    Guid Id,
    Guid UserId,
    DateTime Data,
    decimal ValorTotal,
    decimal Desconto,
    string StatusPagamento,
    List<OrderItemDto> Items);

public record OrderItemDto(Guid Id, Guid LotId, string LotNome, int Quantidade, decimal ValorUnitario, decimal ValorTotal);

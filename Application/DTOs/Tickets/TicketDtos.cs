namespace NexTicket.Application.DTOs.Tickets;

public record TicketDto(
    Guid Id,
    string Codigo,
    string Token,
    Guid EventId,
    string EventNome,
    string EventLocal,
    DateOnly EventData,
    TimeOnly EventHora,
    string LotNome,
    string Nome,
    string Email,
    string Telefone,
    string Status,
    DateTime? DataUso);

public record ValidateTicketRequest(string Token);

public record ValidateTicketPreviewResponse(
    bool Valido,
    string Mensagem,
    Guid? TicketId,
    string? Nome,
    string? EventoNome,
    TimeOnly? Hora,
    string? Status,
    DateTime? DataUso,
    string? UsuarioValidador);

public record ConfirmValidationRequest(string Token);

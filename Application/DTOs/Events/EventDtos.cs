namespace NexTicket.Application.DTOs.Events;

public record EventDto(
    Guid Id,
    string Nome,
    string Descricao,
    DateOnly Data,
    TimeOnly Hora,
    string Local,
    string? MapaUrl,
    string? ImagemUrl,
    string Status,
    int MaximoPorCpf,
    int MaximoPorUsuario,
    int TotalIngressosVendidos,
    decimal ReceitaTotal);

public record CreateEventRequest(
    string Nome,
    string Descricao,
    DateOnly Data,
    TimeOnly Hora,
    string Local,
    string? MapaUrl,
    string? ImagemUrl,
    int MaximoPorCpf,
    int MaximoPorUsuario);

public record UpdateEventRequest(
    string Nome,
    string Descricao,
    DateOnly Data,
    TimeOnly Hora,
    string Local,
    string? MapaUrl,
    string? ImagemUrl,
    int MaximoPorCpf,
    int MaximoPorUsuario);

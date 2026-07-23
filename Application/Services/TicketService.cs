using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NexTicket.Application.Common.Exceptions;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Tickets;
using NexTicket.Domain.Enums;

namespace NexTicket.Application.Services;

public class TicketService : ITicketService
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public TicketService(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<List<TicketDto>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        var tickets = await _uow.Tickets.Query()
            .Include(t => t.Event)
            .Include(t => t.Lot)
            .Where(t => t.Order.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(ct);

        return _mapper.Map<List<TicketDto>>(tickets);
    }

    public async Task<TicketDto> GetByIdAsync(Guid ticketId, CancellationToken ct = default)
    {
        var ticket = await _uow.Tickets.Query()
            .Include(t => t.Event)
            .Include(t => t.Lot)
            .FirstOrDefaultAsync(t => t.Id == ticketId, ct)
            ?? throw new NotFoundException("Ingresso", ticketId);

        return _mapper.Map<TicketDto>(ticket);
    }

    public async Task<ValidateTicketPreviewResponse> PreviewValidationAsync(string token, CancellationToken ct = default)
    {
        var ticket = await _uow.Tickets.Query()
            .Include(t => t.Event)
            .Include(t => t.UsuarioValidador)
            .FirstOrDefaultAsync(t => t.Token == token, ct);

        if (ticket is null)
            return new ValidateTicketPreviewResponse(false, "Ingresso não encontrado.", null, null, null, null, null, null, null);

        if (ticket.Status == TicketStatus.Utilizado)
            return new ValidateTicketPreviewResponse(
                false, "Ingresso já utilizado.", ticket.Id, ticket.Nome, ticket.Event.Nome,
                ticket.Event.Hora, ticket.Status.ToString(), ticket.DataUso, ticket.UsuarioValidador?.Nome);

        if (ticket.Status == TicketStatus.Cancelado)
            return new ValidateTicketPreviewResponse(
                false, "Ingresso cancelado.", ticket.Id, ticket.Nome, ticket.Event.Nome,
                ticket.Event.Hora, ticket.Status.ToString(), ticket.DataUso, null);

        if (ticket.Event.Status != EventStatus.Publicado)
            return new ValidateTicketPreviewResponse(
                false, "Evento não está válido para check-in.", ticket.Id, ticket.Nome, ticket.Event.Nome,
                ticket.Event.Hora, ticket.Status.ToString(), null, null);

        return new ValidateTicketPreviewResponse(
            true, "Ingresso válido.", ticket.Id, ticket.Nome, ticket.Event.Nome,
            ticket.Event.Hora, ticket.Status.ToString(), null, null);
    }

    public async Task<ValidateTicketPreviewResponse> ConfirmValidationAsync(string token, Guid validadorId, CancellationToken ct = default)
    {
        await using var transaction = await _uow.BeginTransactionAsync(ct);

        var ticket = await _uow.Tickets.Query()
            .Include(t => t.Event)
            .FirstOrDefaultAsync(t => t.Token == token, ct);

        if (ticket is null)
            return new ValidateTicketPreviewResponse(false, "Ingresso não encontrado.", null, null, null, null, null, null, null);

        if (ticket.Status != TicketStatus.Disponivel)
        {
            return new ValidateTicketPreviewResponse(
                false, "Ingresso já utilizado ou inválido.", ticket.Id, ticket.Nome, ticket.Event.Nome,
                ticket.Event.Hora, ticket.Status.ToString(), ticket.DataUso, null);
        }

        ticket.Status = TicketStatus.Utilizado;
        ticket.DataUso = DateTime.UtcNow;
        ticket.UsuarioValidadorId = validadorId;

        _uow.Tickets.Update(ticket);
        await _uow.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return new ValidateTicketPreviewResponse(
            true, "Ingresso validado com sucesso.", ticket.Id, ticket.Nome, ticket.Event.Nome,
            ticket.Event.Hora, ticket.Status.ToString(), ticket.DataUso, null);
    }
}

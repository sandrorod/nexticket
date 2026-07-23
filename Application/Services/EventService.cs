using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NexTicket.Application.Common.Exceptions;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Events;
using NexTicket.Domain.Entities;
using NexTicket.Domain.Enums;

namespace NexTicket.Application.Services;

public class EventService : IEventService
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public EventService(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<List<EventDto>> GetAllAsync(CancellationToken ct = default)
    {
        var events = await _uow.Events.Query()
            .Include(e => e.Lots)
            .Include(e => e.Tickets)
            .Where(e => e.Status == EventStatus.Publicado)
            .OrderBy(e => e.Data)
            .ToListAsync(ct);

        // Evento continua visível até 24h após o fim do período de venda, independente de login.
        var visiveis = events
            .Where(e => e.VendaFim >= DateTime.UtcNow.AddHours(-24))
            .ToList();

        return _mapper.Map<List<EventDto>>(visiveis);
    }

    public async Task<EventDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var ev = await _uow.Events.Query()
            .Include(e => e.Lots)
            .Include(e => e.Tickets)
            .FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException("Evento", id);

        return _mapper.Map<EventDto>(ev);
    }

    public async Task<EventDto> CreateAsync(CreateEventRequest request, CancellationToken ct = default)
    {
        var ev = new Event
        {
            Nome = request.Nome,
            Descricao = request.Descricao,
            Data = request.Data,
            Hora = request.Hora,
            Local = request.Local,
            MapaUrl = request.MapaUrl,
            ImagemUrl = request.ImagemUrl,
            TransmissaoUrl = request.TransmissaoUrl,
            VendaInicio = request.VendaInicio,
            VendaFim = request.VendaFim,
            MaximoPorCpf = request.MaximoPorCpf,
            MaximoPorUsuario = request.MaximoPorUsuario,
            Status = EventStatus.Publicado
        };

        await _uow.Events.AddAsync(ev, ct);
        await _uow.SaveChangesAsync(ct);

        return _mapper.Map<EventDto>(ev);
    }

    public async Task<EventDto> UpdateAsync(Guid id, UpdateEventRequest request, CancellationToken ct = default)
    {
        var ev = await _uow.Events.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Evento", id);

        ev.Nome = request.Nome;
        ev.Descricao = request.Descricao;
        ev.Data = request.Data;
        ev.Hora = request.Hora;
        ev.Local = request.Local;
        ev.MapaUrl = request.MapaUrl;
        ev.ImagemUrl = request.ImagemUrl;
        ev.TransmissaoUrl = request.TransmissaoUrl;
        ev.VendaInicio = request.VendaInicio;
        ev.VendaFim = request.VendaFim;
        ev.MaximoPorCpf = request.MaximoPorCpf;
        ev.MaximoPorUsuario = request.MaximoPorUsuario;

        _uow.Events.Update(ev);
        await _uow.SaveChangesAsync(ct);

        return _mapper.Map<EventDto>(ev);
    }

    public async Task CancelAsync(Guid id, CancellationToken ct = default)
    {
        var ev = await _uow.Events.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Evento", id);

        ev.Status = EventStatus.Cancelado;
        _uow.Events.Update(ev);
        await _uow.SaveChangesAsync(ct);
    }
}

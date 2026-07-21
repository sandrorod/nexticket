using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NexTicket.Application.Common.Exceptions;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Lots;
using NexTicket.Domain.Entities;
using NexTicket.Domain.Enums;

namespace NexTicket.Application.Services;

public class LotService : ILotService
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public LotService(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<List<LotDto>> GetByEventIdAsync(Guid eventId, CancellationToken ct = default)
    {
        var lots = await _uow.Lots.Query()
            .Where(l => l.EventId == eventId)
            .OrderBy(l => l.DataInicio)
            .ToListAsync(ct);

        return _mapper.Map<List<LotDto>>(lots);
    }

    public async Task<LotDto> CreateAsync(Guid eventId, CreateLotRequest request, CancellationToken ct = default)
    {
        var ev = await _uow.Events.GetByIdAsync(eventId, ct)
            ?? throw new NotFoundException("Evento", eventId);

        var lot = new Lot
        {
            EventId = eventId,
            Nome = request.Nome,
            Preco = request.Preco,
            Quantidade = request.Quantidade,
            MaximoPorUsuario = request.MaximoPorUsuario,
            DataInicio = request.DataInicio,
            DataFim = request.DataFim,
            Status = LotStatus.Programado
        };

        await _uow.Lots.AddAsync(lot, ct);
        await _uow.SaveChangesAsync(ct);

        return _mapper.Map<LotDto>(lot);
    }

    public async Task<LotDto> UpdateAsync(Guid lotId, UpdateLotRequest request, CancellationToken ct = default)
    {
        var lot = await _uow.Lots.GetByIdAsync(lotId, ct)
            ?? throw new NotFoundException("Lote", lotId);

        if (request.Quantidade < lot.QuantidadeVendida)
            throw new ConflictException("A quantidade do lote não pode ser menor que a quantidade já vendida.");

        lot.Nome = request.Nome;
        lot.Preco = request.Preco;
        lot.Quantidade = request.Quantidade;
        lot.MaximoPorUsuario = request.MaximoPorUsuario;
        lot.DataInicio = request.DataInicio;
        lot.DataFim = request.DataFim;

        _uow.Lots.Update(lot);
        await _uow.SaveChangesAsync(ct);

        return _mapper.Map<LotDto>(lot);
    }
}

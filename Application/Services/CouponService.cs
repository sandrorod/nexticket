using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NexTicket.Application.Common.Exceptions;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Coupons;
using NexTicket.Domain.Entities;
using NexTicket.Domain.Enums;

namespace NexTicket.Application.Services;

public class CouponService : ICouponService
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public CouponService(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<CouponDto> CreateAsync(CreateCouponRequest request, CancellationToken ct = default)
    {
        var existing = await _uow.Coupons.FindAsync(c => c.Codigo == request.Codigo, ct);
        if (existing.Count > 0)
            throw new ConflictException("Já existe um cupom com este código.");

        if (!Enum.TryParse<CouponType>(request.Tipo, ignoreCase: true, out var tipo))
            throw new ConflictException("Tipo de cupom inválido. Use 'Percentual' ou 'ValorFixo'.");

        var coupon = new Coupon
        {
            Codigo = request.Codigo,
            Tipo = tipo,
            Valor = request.Valor,
            EventId = request.EventId,
            QuantidadeMaxima = request.QuantidadeMaxima,
            DataInicio = request.DataInicio,
            DataFim = request.DataFim,
            Ativo = true
        };

        await _uow.Coupons.AddAsync(coupon, ct);
        await _uow.SaveChangesAsync(ct);

        return _mapper.Map<CouponDto>(coupon);
    }

    public async Task<List<CouponDto>> GetAllAsync(CancellationToken ct = default)
    {
        var coupons = await _uow.Coupons.Query().OrderByDescending(c => c.CreatedAt).ToListAsync(ct);
        return _mapper.Map<List<CouponDto>>(coupons);
    }
}

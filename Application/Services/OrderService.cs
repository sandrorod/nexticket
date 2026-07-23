using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NexTicket.Application.Common.Exceptions;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Orders;
using NexTicket.Domain.Entities;
using NexTicket.Domain.Enums;

namespace NexTicket.Application.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;
    private readonly ITicketTokenGenerator _tokenGenerator;

    public OrderService(IUnitOfWork uow, IMapper mapper, ITicketTokenGenerator tokenGenerator)
    {
        _uow = uow;
        _mapper = mapper;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderRequest request, CancellationToken ct = default)
    {
        var ev = await _uow.Events.GetByIdAsync(request.EventId, ct)
            ?? throw new NotFoundException("Evento", request.EventId);

        if (ev.Status != EventStatus.Publicado)
            throw new ConflictException("Este evento não está disponível para venda.");

        var lotIds = request.Itens.Select(i => i.LotId).Distinct().ToList();
        var lots = await _uow.Lots.Query().Where(l => lotIds.Contains(l.Id)).ToListAsync(ct);

        if (lots.Count != lotIds.Count)
            throw new NotFoundException("Lote", string.Join(",", lotIds));

        var totalIngressosNoPedido = request.Itens.Sum(i => i.Ingressos.Count);

        await using var transaction = await _uow.BeginTransactionAsync(ct);

        var order = new Order
        {
            UserId = userId,
            StatusPagamento = OrderPaymentStatus.Pendente
        };

        decimal valorTotal = 0;
        var novosTickets = new List<Ticket>();

        foreach (var itemRequest in request.Itens)
        {
            var lot = lots.First(l => l.Id == itemRequest.LotId);

            if (lot.EventId != ev.Id)
                throw new ConflictException($"O lote '{lot.Nome}' não pertence ao evento informado.");

            var agora = DateTime.UtcNow;
            if (agora < lot.DataInicio || agora > lot.DataFim)
                throw new ConflictException($"O lote '{lot.Nome}' não está disponível no momento.");

            var quantidade = itemRequest.Ingressos.Count;

            if (quantidade > lot.QuantidadeDisponivel)
                throw new ConflictException($"Quantidade indisponível no lote '{lot.Nome}'. Restam {lot.QuantidadeDisponivel}.");

            if (quantidade > lot.MaximoPorUsuario)
                throw new ConflictException($"O lote '{lot.Nome}' permite no máximo {lot.MaximoPorUsuario} ingressos por usuário.");

            var orderItem = new OrderItem
            {
                Order = order,
                LotId = lot.Id,
                Quantidade = quantidade,
                ValorUnitario = lot.Preco
            };
            order.Items.Add(orderItem);
            valorTotal += orderItem.ValorTotal;

            lot.QuantidadeVendida += quantidade;
            if (lot.QuantidadeDisponivel == 0)
                lot.Status = LotStatus.Esgotado;
            _uow.Lots.Update(lot);

            foreach (var holder in itemRequest.Ingressos)
            {
                await ValidarUnicidadeNoEventoAsync(ev.Id, holder.Email, holder.Nome, holder.Telefone, ct);

                novosTickets.Add(new Ticket
                {
                    Codigo = _tokenGenerator.GenerateCode(),
                    Token = _tokenGenerator.GenerateToken(),
                    Order = order,
                    EventId = ev.Id,
                    LotId = lot.Id,
                    Nome = holder.Nome,
                    Email = holder.Email,
                    Telefone = holder.Telefone,
                    Cpf = holder.Cpf,
                    Status = TicketStatus.Disponivel
                });
            }
        }

        ValidarUnicidadeDentroDoPedido(request);

        if (ev.MaximoPorUsuario > 0)
        {
            var jaComprados = await _uow.Tickets.Query()
                .Where(t => t.EventId == ev.Id && t.Order.UserId == userId && t.Status != TicketStatus.Cancelado)
                .CountAsync(ct);

            if (jaComprados + totalIngressosNoPedido > ev.MaximoPorUsuario)
                throw new ConflictException($"Limite de {ev.MaximoPorUsuario} ingressos por usuário para este evento.");
        }

        order.ValorTotal = valorTotal;

        await _uow.Orders.AddAsync(order, ct);
        foreach (var ticket in novosTickets)
            await _uow.Tickets.AddAsync(ticket, ct);

        await _uow.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return _mapper.Map<OrderDto>(order);
    }

    private static void ValidarUnicidadeDentroDoPedido(CreateOrderRequest request)
    {
        var holders = request.Itens.SelectMany(i => i.Ingressos).ToList();

        var emailsDuplicados = holders.GroupBy(h => h.Email.Trim().ToLowerInvariant()).Any(g => g.Count() > 1);
        if (emailsDuplicados)
            throw new ConflictException("Não é permitido repetir o mesmo email para ingressos do mesmo evento.");

        var telefonesDuplicados = holders.GroupBy(h => h.Telefone.Trim()).Any(g => g.Count() > 1);
        if (telefonesDuplicados)
            throw new ConflictException("Não é permitido repetir o mesmo celular para ingressos do mesmo evento.");

        var comboDuplicado = holders
            .GroupBy(h => $"{h.Nome.Trim().ToLowerInvariant()}|{h.Telefone.Trim()}")
            .Any(g => g.Count() > 1);
        if (comboDuplicado)
            throw new ConflictException("Não é permitido repetir a combinação nome + celular para ingressos do mesmo evento.");
    }

    private async Task ValidarUnicidadeNoEventoAsync(Guid eventId, string email, string nome, string telefone, CancellationToken ct)
    {
        var conflito = await _uow.Tickets.Query()
            .Where(t => t.EventId == eventId && t.Status != TicketStatus.Cancelado)
            .Where(t => t.Email == email || (t.Nome == nome && t.Telefone == telefone))
            .AnyAsync(ct);

        if (conflito)
            throw new ConflictException("Já existe um ingresso emitido para este evento com o mesmo email, ou mesma combinação de nome e celular.");
    }

    public async Task<List<OrderDto>> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        var orders = await _uow.Orders.Query()
            .Include(o => o.Items).ThenInclude(i => i.Lot)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.Data)
            .ToListAsync(ct);

        return _mapper.Map<List<OrderDto>>(orders);
    }

    public async Task<OrderDto> GetByIdAsync(Guid orderId, CancellationToken ct = default)
    {
        var order = await _uow.Orders.Query()
            .Include(o => o.Items).ThenInclude(i => i.Lot)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct)
            ?? throw new NotFoundException("Pedido", orderId);

        return _mapper.Map<OrderDto>(order);
    }

    public async Task ConfirmPaymentAsync(Guid orderId, CancellationToken ct = default)
    {
        var order = await _uow.Orders.GetByIdAsync(orderId, ct)
            ?? throw new NotFoundException("Pedido", orderId);

        order.StatusPagamento = OrderPaymentStatus.Pago;
        _uow.Orders.Update(order);
        await _uow.SaveChangesAsync(ct);
    }
}

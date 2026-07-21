using NexTicket.Application.DTOs.Auth;
using NexTicket.Application.DTOs.Coupons;
using NexTicket.Application.DTOs.Events;
using NexTicket.Application.DTOs.Lots;
using NexTicket.Application.DTOs.Orders;
using NexTicket.Application.DTOs.Tickets;

namespace NexTicket.Application.Common.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default);
}

public interface IEventService
{
    Task<List<EventDto>> GetAllAsync(CancellationToken ct = default);
    Task<EventDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<EventDto> CreateAsync(CreateEventRequest request, CancellationToken ct = default);
    Task<EventDto> UpdateAsync(Guid id, UpdateEventRequest request, CancellationToken ct = default);
    Task CancelAsync(Guid id, CancellationToken ct = default);
}

public interface ILotService
{
    Task<List<LotDto>> GetByEventIdAsync(Guid eventId, CancellationToken ct = default);
    Task<LotDto> CreateAsync(Guid eventId, CreateLotRequest request, CancellationToken ct = default);
    Task<LotDto> UpdateAsync(Guid lotId, UpdateLotRequest request, CancellationToken ct = default);
}

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderRequest request, CancellationToken ct = default);
    Task<List<OrderDto>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<OrderDto> GetByIdAsync(Guid orderId, CancellationToken ct = default);
    Task ConfirmPaymentAsync(Guid orderId, CancellationToken ct = default);
}

public interface ITicketService
{
    Task<List<TicketDto>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<TicketDto> GetByIdAsync(Guid ticketId, CancellationToken ct = default);
    Task<ValidateTicketPreviewResponse> PreviewValidationAsync(string token, CancellationToken ct = default);
    Task<ValidateTicketPreviewResponse> ConfirmValidationAsync(string token, Guid validadorId, CancellationToken ct = default);
}

public interface ICouponService
{
    Task<CouponDto> CreateAsync(CreateCouponRequest request, CancellationToken ct = default);
    Task<List<CouponDto>> GetAllAsync(CancellationToken ct = default);
}

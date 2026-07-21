using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTicket.API.Extensions;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Orders;

namespace NexTicket.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(CreateOrderRequest request, CancellationToken ct)
    {
        var result = await _orderService.CreateOrderAsync(User.GetUserId(), request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("me")]
    public async Task<ActionResult<List<OrderDto>>> GetMyOrders(CancellationToken ct) =>
        Ok(await _orderService.GetByUserIdAsync(User.GetUserId(), ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> GetById(Guid id, CancellationToken ct) =>
        Ok(await _orderService.GetByIdAsync(id, ct));

    [Authorize(Policy = "Administrador")]
    [HttpPost("{id:guid}/confirm-payment")]
    public async Task<IActionResult> ConfirmPayment(Guid id, CancellationToken ct)
    {
        await _orderService.ConfirmPaymentAsync(id, ct);
        return NoContent();
    }
}

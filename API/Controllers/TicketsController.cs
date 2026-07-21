using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTicket.API.Extensions;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Tickets;

namespace NexTicket.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<List<TicketDto>>> GetMyTickets(CancellationToken ct) =>
        Ok(await _ticketService.GetByUserIdAsync(User.GetUserId(), ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TicketDto>> GetById(Guid id, CancellationToken ct) =>
        Ok(await _ticketService.GetByIdAsync(id, ct));

    [Authorize(Policy = "Administrador")]
    [HttpPost("validate/preview")]
    public async Task<ActionResult<ValidateTicketPreviewResponse>> PreviewValidation(ValidateTicketRequest request, CancellationToken ct) =>
        Ok(await _ticketService.PreviewValidationAsync(request.Token, ct));

    [Authorize(Policy = "Administrador")]
    [HttpPost("validate/confirm")]
    public async Task<ActionResult<ValidateTicketPreviewResponse>> ConfirmValidation(ConfirmValidationRequest request, CancellationToken ct) =>
        Ok(await _ticketService.ConfirmValidationAsync(request.Token, User.GetUserId(), ct));
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Lots;

namespace NexTicket.API.Controllers;

[ApiController]
[Route("api/events/{eventId:guid}/lots")]
public class LotsController : ControllerBase
{
    private readonly ILotService _lotService;

    public LotsController(ILotService lotService)
    {
        _lotService = lotService;
    }

    [HttpGet]
    public async Task<ActionResult<List<LotDto>>> GetByEvent(Guid eventId, CancellationToken ct) =>
        Ok(await _lotService.GetByEventIdAsync(eventId, ct));

    [Authorize(Policy = "Administrador")]
    [HttpPost]
    public async Task<ActionResult<LotDto>> Create(Guid eventId, CreateLotRequest request, CancellationToken ct)
    {
        var result = await _lotService.CreateAsync(eventId, request, ct);
        return CreatedAtAction(nameof(GetByEvent), new { eventId }, result);
    }

    [Authorize(Policy = "Administrador")]
    [HttpPut("{lotId:guid}")]
    public async Task<ActionResult<LotDto>> Update(Guid eventId, Guid lotId, UpdateLotRequest request, CancellationToken ct) =>
        Ok(await _lotService.UpdateAsync(lotId, request, ct));
}

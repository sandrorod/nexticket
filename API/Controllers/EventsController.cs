using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Events;

namespace NexTicket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpGet]
    public async Task<ActionResult<List<EventDto>>> GetAll(CancellationToken ct) =>
        Ok(await _eventService.GetAllAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EventDto>> GetById(Guid id, CancellationToken ct) =>
        Ok(await _eventService.GetByIdAsync(id, ct));

    [Authorize(Policy = "Administrador")]
    [HttpPost]
    public async Task<ActionResult<EventDto>> Create(CreateEventRequest request, CancellationToken ct)
    {
        var result = await _eventService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [Authorize(Policy = "Administrador")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EventDto>> Update(Guid id, UpdateEventRequest request, CancellationToken ct) =>
        Ok(await _eventService.UpdateAsync(id, request, ct));

    [Authorize(Policy = "Administrador")]
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _eventService.CancelAsync(id, ct);
        return NoContent();
    }
}

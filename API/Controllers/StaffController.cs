using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Staff;

namespace NexTicket.API.Controllers;

[Authorize(Policy = "Administrador")]
[ApiController]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly IStaffService _staffService;

    public StaffController(IStaffService staffService)
    {
        _staffService = staffService;
    }

    [HttpGet]
    public async Task<ActionResult<List<StaffDto>>> GetAll(CancellationToken ct) =>
        Ok(await _staffService.GetAllAsync(ct));

    [HttpPost]
    public async Task<ActionResult<StaffDto>> Create(CreateStaffRequest request, CancellationToken ct) =>
        Ok(await _staffService.CreateAsync(request, ct));

    [HttpPost("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        await _staffService.DeactivateAsync(id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/reactivate")]
    public async Task<IActionResult> Reactivate(Guid id, CancellationToken ct)
    {
        await _staffService.ReactivateAsync(id, ct);
        return NoContent();
    }
}

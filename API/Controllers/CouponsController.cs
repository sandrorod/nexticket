using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.DTOs.Coupons;

namespace NexTicket.API.Controllers;

[Authorize(Policy = "Administrador")]
[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService)
    {
        _couponService = couponService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CouponDto>>> GetAll(CancellationToken ct) =>
        Ok(await _couponService.GetAllAsync(ct));

    [HttpPost]
    public async Task<ActionResult<CouponDto>> Create(CreateCouponRequest request, CancellationToken ct) =>
        Ok(await _couponService.CreateAsync(request, ct));
}

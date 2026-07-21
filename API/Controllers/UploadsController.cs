using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTicket.Application.Common.Interfaces;

namespace NexTicket.API.Controllers;

[Authorize(Policy = "Administrador")]
[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp"
    };

    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    private readonly IImageStorageService _imageStorageService;

    public UploadsController(IImageStorageService imageStorageService)
    {
        _imageStorageService = imageStorageService;
    }

    [HttpPost("event-image")]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<ActionResult<object>> UploadEventImage(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { errors = new[] { "Nenhum arquivo enviado." } });

        if (file.Length > MaxFileSizeBytes)
            return BadRequest(new { errors = new[] { "A imagem deve ter no máximo 5MB." } });

        if (!AllowedContentTypes.Contains(file.ContentType))
            return BadRequest(new { errors = new[] { "Formato inválido. Envie uma imagem JPEG, PNG ou WebP." } });

        await using var stream = file.OpenReadStream();
        var url = await _imageStorageService.UploadEventImageAsync(stream, file.FileName, file.ContentType, ct);

        return Ok(new { url });
    }
}

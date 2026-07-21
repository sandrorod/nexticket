namespace NexTicket.Application.Common.Interfaces;

public interface IImageStorageService
{
    /// <summary>Envia a imagem para o storage e retorna a URL pública.</summary>
    Task<string> UploadEventImageAsync(Stream content, string fileName, string contentType, CancellationToken ct = default);
}

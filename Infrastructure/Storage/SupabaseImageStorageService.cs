using System.Net.Http.Headers;
using Microsoft.Extensions.Options;
using NexTicket.Application.Common.Exceptions;
using NexTicket.Application.Common.Interfaces;

namespace NexTicket.Infrastructure.Storage;

public class SupabaseImageStorageService : IImageStorageService
{
    private readonly HttpClient _httpClient;
    private readonly SupabaseStorageSettings _settings;

    public SupabaseImageStorageService(HttpClient httpClient, IOptions<SupabaseStorageSettings> settings)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
    }

    public async Task<string> UploadEventImageAsync(Stream content, string fileName, string contentType, CancellationToken ct = default)
    {
        var objectPath = $"{Guid.NewGuid()}-{Path.GetFileName(fileName)}";
        var uploadUrl = $"{_settings.Url}/storage/v1/object/{_settings.EventsBucket}/{objectPath}";

        using var streamContent = new StreamContent(content);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        using var request = new HttpRequestMessage(HttpMethod.Post, uploadUrl) { Content = streamContent };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ServiceRoleKey);
        request.Headers.Add("apikey", _settings.ServiceRoleKey);
        request.Headers.Add("x-upsert", "true");

        var response = await _httpClient.SendAsync(request, ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            throw new ConflictException($"Falha ao enviar imagem para o storage: {body}");
        }

        return $"{_settings.Url}/storage/v1/object/public/{_settings.EventsBucket}/{objectPath}";
    }
}

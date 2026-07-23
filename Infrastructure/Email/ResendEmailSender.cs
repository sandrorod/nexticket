using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NexTicket.Application.Common.Interfaces;

namespace NexTicket.Infrastructure.Email;

public class ResendEmailSender : IEmailSender
{
    private readonly HttpClient _httpClient;
    private readonly SmtpSettings _fromSettings;
    private readonly ILogger<ResendEmailSender> _logger;

    public ResendEmailSender(HttpClient httpClient, IOptions<SmtpSettings> fromSettings, ILogger<ResendEmailSender> logger)
    {
        _httpClient = httpClient;
        _fromSettings = fromSettings.Value;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        var payload = new
        {
            from = $"{_fromSettings.FromName} <{_fromSettings.FromEmail}>",
            to = new[] { toEmail },
            subject,
            html = htmlBody
        };

        try
        {
            using var response = await _httpClient.PostAsJsonAsync("emails", payload, ct);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("Falha ao enviar email via Resend para {Email}: {Status} {Body}", toEmail, response.StatusCode, body);
                throw new InvalidOperationException($"Falha ao enviar email via Resend: {response.StatusCode}");
            }
        }
        catch (Exception ex) when (ex is not InvalidOperationException)
        {
            _logger.LogError(ex, "Falha ao enviar email via Resend para {Email}", toEmail);
            throw;
        }
    }
}

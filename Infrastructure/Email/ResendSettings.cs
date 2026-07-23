namespace NexTicket.Infrastructure.Email;

public class ResendSettings
{
    public const string SectionName = "Resend";

    public string ApiKey { get; set; } = string.Empty;
}

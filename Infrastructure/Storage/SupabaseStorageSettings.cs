namespace NexTicket.Infrastructure.Storage;

public class SupabaseStorageSettings
{
    public const string SectionName = "Supabase";

    public string Url { get; set; } = string.Empty;
    public string ServiceRoleKey { get; set; } = string.Empty;
    public string EventsBucket { get; set; } = "nexticket-events";
}

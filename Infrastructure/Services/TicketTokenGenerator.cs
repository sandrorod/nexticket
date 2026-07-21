using System.Security.Cryptography;
using NexTicket.Application.Common.Interfaces;

namespace NexTicket.Infrastructure.Services;

public class TicketTokenGenerator : ITicketTokenGenerator
{
    public string GenerateToken()
    {
        byte[] bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }

    public string GenerateCode()
    {
        byte[] bytes = RandomNumberGenerator.GetBytes(8);
        return Convert.ToHexString(bytes);
    }
}

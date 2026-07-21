using NexTicket.Domain.Entities;

namespace NexTicket.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}

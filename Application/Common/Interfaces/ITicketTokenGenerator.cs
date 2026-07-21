namespace NexTicket.Application.Common.Interfaces;

public interface ITicketTokenGenerator
{
    /// <summary>Token público aleatório de uso único (32 bytes, Base64URL) usado no QR Code.</summary>
    string GenerateToken();

    /// <summary>Código curto legível exibido junto ao QR Code (ex: 9A82BC34DF91AB22).</summary>
    string GenerateCode();
}

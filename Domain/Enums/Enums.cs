namespace NexTicket.Domain.Enums;

public enum UserRole
{
    Comprador = 0,
    Administrador = 1,
    Validador = 2
}

public enum EventStatus
{
    Rascunho = 0,
    Publicado = 1,
    Cancelado = 2,
    Encerrado = 3
}

public enum LotStatus
{
    Programado = 0,
    Ativo = 1,
    Esgotado = 2,
    Encerrado = 3
}

public enum OrderPaymentStatus
{
    Pendente = 0,
    Pago = 1,
    Cancelado = 2,
    Estornado = 3,
    Expirado = 4
}

public enum TicketStatus
{
    Disponivel = 0,
    Utilizado = 1,
    Cancelado = 2
}

public enum CouponType
{
    Percentual = 0,
    ValorFixo = 1
}

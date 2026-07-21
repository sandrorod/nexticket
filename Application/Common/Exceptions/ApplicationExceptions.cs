namespace NexTicket.Application.Common.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string entity, object key) : base($"{entity} '{key}' não encontrado(a).") { }
}

public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}

public class ValidationAppException : Exception
{
    public ValidationAppException(string message) : base(message) { }
}

public class UnauthorizedAppException : Exception
{
    public UnauthorizedAppException(string message) : base(message) { }
}

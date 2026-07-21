using System.Net;
using System.Text.Json;
using FluentValidation;
using NexTicket.Application.Common.Exceptions;
using Serilog;

namespace NexTicket.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title) = exception switch
        {
            NotFoundException => (HttpStatusCode.NotFound, "Recurso não encontrado"),
            ConflictException => (HttpStatusCode.Conflict, "Conflito"),
            UnauthorizedAppException => (HttpStatusCode.Unauthorized, "Não autorizado"),
            ValidationException => (HttpStatusCode.BadRequest, "Erro de validação"),
            ValidationAppException => (HttpStatusCode.BadRequest, "Erro de validação"),
            _ => (HttpStatusCode.InternalServerError, "Erro interno do servidor")
        };

        if (statusCode == HttpStatusCode.InternalServerError)
            Log.Error(exception, "Erro não tratado ao processar {Path}", context.Request.Path);
        else
            Log.Warning("{Title}: {Message}", title, exception.Message);

        var errors = exception is ValidationException validationException
            ? validationException.Errors.Select(e => e.ErrorMessage)
            : new[] { exception.Message };

        var problemDetails = new
        {
            title,
            status = (int)statusCode,
            errors
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        return context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
    }
}

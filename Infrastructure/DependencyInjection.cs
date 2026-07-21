using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Infrastructure.Auth;
using NexTicket.Infrastructure.Data;
using NexTicket.Infrastructure.Email;
using NexTicket.Infrastructure.Repositories;
using NexTicket.Infrastructure.Services;
using NexTicket.Infrastructure.Storage;

namespace NexTicket.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<NexTicketDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "nexticket_app")));

        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<SupabaseStorageSettings>(configuration.GetSection(SupabaseStorageSettings.SectionName));
        services.Configure<SmtpSettings>(configuration.GetSection(SmtpSettings.SectionName));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<ITicketTokenGenerator, TicketTokenGenerator>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddHttpClient<IImageStorageService, SupabaseImageStorageService>();

        return services;
    }
}

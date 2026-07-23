using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
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
        var connectionStringBuilder = new NpgsqlConnectionStringBuilder(configuration.GetConnectionString("DefaultConnection"))
        {
            // The Supabase Transaction Pooler (PgBouncer) doesn't support server-side
            // prepared statements; Npgsql's auto-prepare cache silently breaks queries
            // against it, causing them to hang until CommandTimeout. Disable it.
            MaxAutoPrepare = 0,
        };

        services.AddDbContext<NexTicketDbContext>(options =>
            options.UseNpgsql(
                connectionStringBuilder.ConnectionString,
                npgsql =>
                {
                    npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "nexticket_app");
                    npgsql.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null);
                }));

        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<SupabaseStorageSettings>(configuration.GetSection(SupabaseStorageSettings.SectionName));
        services.Configure<SmtpSettings>(configuration.GetSection(SmtpSettings.SectionName));
        services.Configure<ResendSettings>(configuration.GetSection(ResendSettings.SectionName));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<ITicketTokenGenerator, TicketTokenGenerator>();
        services.AddHttpClient<IEmailSender, ResendEmailSender>((sp, client) =>
        {
            var resendSettings = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<ResendSettings>>().Value;
            client.BaseAddress = new Uri("https://api.resend.com/");
            client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", resendSettings.ApiKey);
        });
        services.AddHttpClient<IImageStorageService, SupabaseImageStorageService>();

        return services;
    }
}

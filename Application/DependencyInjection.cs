using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.Common.Options;
using NexTicket.Application.Services;

namespace NexTicket.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAutoMapper(cfg => { }, typeof(DependencyInjection).Assembly);
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.Configure<FrontendSettings>(configuration.GetSection(FrontendSettings.SectionName));

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<ILotService, LotService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<ITicketService, TicketService>();
        services.AddScoped<ICouponService, CouponService>();
        services.AddScoped<IStaffService, StaffService>();

        return services;
    }
}

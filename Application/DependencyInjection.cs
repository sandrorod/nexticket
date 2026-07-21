using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using NexTicket.Application.Common.Interfaces;
using NexTicket.Application.Services;

namespace NexTicket.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(cfg => { }, typeof(DependencyInjection).Assembly);
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IEventService, EventService>();
        services.AddScoped<ILotService, LotService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<ITicketService, TicketService>();
        services.AddScoped<ICouponService, CouponService>();

        return services;
    }
}

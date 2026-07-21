using AutoMapper;
using NexTicket.Application.DTOs.Coupons;
using NexTicket.Application.DTOs.Events;
using NexTicket.Application.DTOs.Lots;
using NexTicket.Application.DTOs.Orders;
using NexTicket.Application.DTOs.Tickets;
using NexTicket.Application.DTOs.Users;
using NexTicket.Domain.Entities;

namespace NexTicket.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForCtorParam("Role", opt => opt.MapFrom(s => s.Role.ToString()));

        CreateMap<Event, EventDto>()
            .ForCtorParam("Status", opt => opt.MapFrom(s => s.Status.ToString()))
            .ForCtorParam("TotalIngressosVendidos", opt => opt.MapFrom(s => s.Tickets.Count))
            .ForCtorParam("ReceitaTotal", opt => opt.MapFrom(s => s.Lots.Sum(l => l.QuantidadeVendida * l.Preco)));

        CreateMap<Lot, LotDto>()
            .ForCtorParam("Status", opt => opt.MapFrom(s => s.Status.ToString()));

        CreateMap<Order, OrderDto>()
            .ForCtorParam("StatusPagamento", opt => opt.MapFrom(s => s.StatusPagamento.ToString()));

        CreateMap<OrderItem, OrderItemDto>()
            .ForCtorParam("LotNome", opt => opt.MapFrom(s => s.Lot.Nome));

        CreateMap<Ticket, TicketDto>()
            .ForCtorParam("EventNome", opt => opt.MapFrom(s => s.Event.Nome))
            .ForCtorParam("EventLocal", opt => opt.MapFrom(s => s.Event.Local))
            .ForCtorParam("EventData", opt => opt.MapFrom(s => s.Event.Data))
            .ForCtorParam("EventHora", opt => opt.MapFrom(s => s.Event.Hora))
            .ForCtorParam("LotNome", opt => opt.MapFrom(s => s.Lot.Nome))
            .ForCtorParam("Status", opt => opt.MapFrom(s => s.Status.ToString()));

        CreateMap<Coupon, CouponDto>()
            .ForCtorParam("Tipo", opt => opt.MapFrom(s => s.Tipo.ToString()));
    }
}

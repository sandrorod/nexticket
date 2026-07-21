using FluentValidation;
using NexTicket.Application.DTOs.Events;

namespace NexTicket.Application.Validators;

public class CreateEventRequestValidator : AbstractValidator<CreateEventRequest>
{
    public CreateEventRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descricao).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.Local).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Data).NotEmpty();
        RuleFor(x => x.MaximoPorCpf).GreaterThan(0);
        RuleFor(x => x.MaximoPorUsuario).GreaterThan(0);
    }
}

public class UpdateEventRequestValidator : AbstractValidator<UpdateEventRequest>
{
    public UpdateEventRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descricao).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.Local).NotEmpty().MaximumLength(300);
        RuleFor(x => x.MaximoPorCpf).GreaterThan(0);
        RuleFor(x => x.MaximoPorUsuario).GreaterThan(0);
    }
}

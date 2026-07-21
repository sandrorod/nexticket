using FluentValidation;
using NexTicket.Application.DTOs.Lots;

namespace NexTicket.Application.Validators;

public class CreateLotRequestValidator : AbstractValidator<CreateLotRequest>
{
    public CreateLotRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Preco).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Quantidade).GreaterThan(0);
        RuleFor(x => x.MaximoPorUsuario).GreaterThan(0);
        RuleFor(x => x.DataFim).GreaterThan(x => x.DataInicio);
    }
}

public class UpdateLotRequestValidator : AbstractValidator<UpdateLotRequest>
{
    public UpdateLotRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Preco).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Quantidade).GreaterThan(0);
        RuleFor(x => x.MaximoPorUsuario).GreaterThan(0);
        RuleFor(x => x.DataFim).GreaterThan(x => x.DataInicio);
    }
}

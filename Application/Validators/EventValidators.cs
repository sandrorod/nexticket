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
        RuleFor(x => x.VendaInicio).NotEmpty();
        RuleFor(x => x.VendaFim).GreaterThan(x => x.VendaInicio);
        RuleFor(x => x.MaximoPorCpf).GreaterThan(0);
        RuleFor(x => x.MaximoPorUsuario).GreaterThan(0);

        RuleFor(x => x.Cep).MaximumLength(9);
        RuleFor(x => x.Endereco).MaximumLength(300);
        RuleFor(x => x.Numero).MaximumLength(20);
        RuleFor(x => x.Bairro).MaximumLength(150);
        RuleFor(x => x.Cidade).MaximumLength(150);
        RuleFor(x => x.Estado).MaximumLength(2);
        RuleFor(x => x.Classificacao).MaximumLength(10);
        RuleFor(x => x.ContatoWhatsapp).MaximumLength(20);
        RuleFor(x => x.ContatoTelefone).MaximumLength(20);
        RuleFor(x => x.ContatoEmail).MaximumLength(200).EmailAddress().When(x => !string.IsNullOrEmpty(x.ContatoEmail));
    }
}

public class UpdateEventRequestValidator : AbstractValidator<UpdateEventRequest>
{
    public UpdateEventRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descricao).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.Local).NotEmpty().MaximumLength(300);
        RuleFor(x => x.VendaInicio).NotEmpty();
        RuleFor(x => x.VendaFim).GreaterThan(x => x.VendaInicio);
        RuleFor(x => x.MaximoPorCpf).GreaterThan(0);
        RuleFor(x => x.MaximoPorUsuario).GreaterThan(0);

        RuleFor(x => x.Cep).MaximumLength(9);
        RuleFor(x => x.Endereco).MaximumLength(300);
        RuleFor(x => x.Numero).MaximumLength(20);
        RuleFor(x => x.Bairro).MaximumLength(150);
        RuleFor(x => x.Cidade).MaximumLength(150);
        RuleFor(x => x.Estado).MaximumLength(2);
        RuleFor(x => x.Classificacao).MaximumLength(10);
        RuleFor(x => x.ContatoWhatsapp).MaximumLength(20);
        RuleFor(x => x.ContatoTelefone).MaximumLength(20);
        RuleFor(x => x.ContatoEmail).MaximumLength(200).EmailAddress().When(x => !string.IsNullOrEmpty(x.ContatoEmail));
    }
}

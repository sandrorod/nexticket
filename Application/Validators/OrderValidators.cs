using FluentValidation;
using NexTicket.Application.DTOs.Orders;

namespace NexTicket.Application.Validators;

public class TicketHolderRequestValidator : AbstractValidator<TicketHolderRequest>
{
    public TicketHolderRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Telefone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Cpf).Length(11).When(x => !string.IsNullOrEmpty(x.Cpf));
    }
}

public class CreateOrderItemRequestValidator : AbstractValidator<CreateOrderItemRequest>
{
    public CreateOrderItemRequestValidator()
    {
        RuleFor(x => x.LotId).NotEmpty();
        RuleFor(x => x.Ingressos).NotEmpty();
        RuleForEach(x => x.Ingressos).SetValidator(new TicketHolderRequestValidator());
    }
}

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.EventId).NotEmpty();
        RuleFor(x => x.Itens).NotEmpty();
        RuleForEach(x => x.Itens).SetValidator(new CreateOrderItemRequestValidator());

        RuleFor(x => x.Itens)
            .Must(NaoTerEmailsDuplicados)
            .WithMessage("Não é permitido repetir o mesmo email para ingressos do mesmo evento.");

        RuleFor(x => x.Itens)
            .Must(NaoTerTelefonesDuplicados)
            .WithMessage("Não é permitido repetir o mesmo celular para ingressos do mesmo evento.");

        RuleFor(x => x.Itens)
            .Must(NaoTerNomeTelefoneDuplicados)
            .WithMessage("Não é permitido repetir a combinação nome + celular para ingressos do mesmo evento.");
    }

    private static bool NaoTerEmailsDuplicados(List<CreateOrderItemRequest> itens)
    {
        var emails = itens.SelectMany(i => i.Ingressos).Select(t => t.Email.Trim().ToLowerInvariant());
        return emails.Count() == emails.Distinct().Count();
    }

    private static bool NaoTerTelefonesDuplicados(List<CreateOrderItemRequest> itens)
    {
        var telefones = itens.SelectMany(i => i.Ingressos).Select(t => t.Telefone.Trim());
        return telefones.Count() == telefones.Distinct().Count();
    }

    private static bool NaoTerNomeTelefoneDuplicados(List<CreateOrderItemRequest> itens)
    {
        var combos = itens.SelectMany(i => i.Ingressos)
            .Select(t => $"{t.Nome.Trim().ToLowerInvariant()}|{t.Telefone.Trim()}");
        return combos.Count() == combos.Distinct().Count();
    }
}

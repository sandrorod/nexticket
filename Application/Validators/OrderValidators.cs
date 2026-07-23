using FluentValidation;
using NexTicket.Application.DTOs.Orders;
using System.Linq;

namespace NexTicket.Application.Validators;

public class TicketHolderRequestValidator : AbstractValidator<TicketHolderRequest>
{
    public TicketHolderRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Nome)
            .Must(TerNomeESobrenome)
            .WithMessage("Informe nome e sobrenome completos.")
            .When(x => !string.IsNullOrWhiteSpace(x.Nome));
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Telefone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Cpf).Length(11).When(x => !string.IsNullOrEmpty(x.Cpf));
    }

    private static bool TerNomeESobrenome(string nome)
    {
        var partes = nome.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return partes.Length >= 2 && partes.All(p => p.Length >= 2);
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

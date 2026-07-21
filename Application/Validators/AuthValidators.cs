using FluentValidation;
using NexTicket.Application.DTOs.Auth;

namespace NexTicket.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Senha).NotEmpty().MinimumLength(8)
            .Matches("[A-Z]").WithMessage("A senha deve conter ao menos uma letra maiúscula.")
            .Matches("[0-9]").WithMessage("A senha deve conter ao menos um número.");
        RuleFor(x => x.Telefone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Cpf).Length(11).When(x => !string.IsNullOrEmpty(x.Cpf));
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Senha).NotEmpty();
    }
}

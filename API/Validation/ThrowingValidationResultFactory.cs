using FluentValidation;
using FluentValidation.Results;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Results;
using SharpGrip.FluentValidation.AutoValidation.Shared.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace NexTicket.API.Validation;

public class ThrowingValidationResultFactory : IFluentValidationAutoValidationResultFactory
{
    public Task<IActionResult?> CreateActionResult(
        ActionExecutingContext context,
        ValidationProblemDetails? validationProblemDetails,
        IDictionary<IValidationContext, ValidationResult> validationResults)
    {
        var failures = validationResults.Values
            .SelectMany(r => r.Errors)
            .ToList();

        throw new ValidationException(failures);
    }
}

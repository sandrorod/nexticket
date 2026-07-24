import { ValidationAppError } from "./errors.ts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Validator {
  private errors: string[] = [];

  notEmpty(value: string | undefined | null, field: string): this {
    if (!value || value.trim() === "") this.errors.push(`${field} é obrigatório.`);
    return this;
  }

  maxLength(value: string | undefined | null, max: number, field: string): this {
    if (value && value.length > max) this.errors.push(`${field} deve ter no máximo ${max} caracteres.`);
    return this;
  }

  email(value: string | undefined | null, field: string): this {
    if (value && !EMAIL_REGEX.test(value)) this.errors.push(`${field} deve ser um email válido.`);
    return this;
  }

  minLength(value: string | undefined | null, min: number, field: string): this {
    if (value && value.length < min) this.errors.push(`${field} deve ter no mínimo ${min} caracteres.`);
    return this;
  }

  matches(value: string | undefined | null, regex: RegExp, message: string): this {
    if (value && !regex.test(value)) this.errors.push(message);
    return this;
  }

  exactLength(value: string | undefined | null, len: number, field: string): this {
    if (value && value.length !== len) this.errors.push(`${field} deve ter exatamente ${len} caracteres.`);
    return this;
  }

  greaterThan(value: number | undefined | null, min: number, field: string): this {
    if (value === undefined || value === null || value <= min) this.errors.push(`${field} deve ser maior que ${min}.`);
    return this;
  }

  greaterThanDate(value: string | undefined | null, other: string | undefined | null, field: string): this {
    if (value && other && new Date(value) <= new Date(other)) {
      this.errors.push(`${field} deve ser posterior à data inicial.`);
    }
    return this;
  }

  custom(condition: boolean, message: string): this {
    if (!condition) this.errors.push(message);
    return this;
  }

  throwIfInvalid(): void {
    if (this.errors.length > 0) throw new ValidationAppError(this.errors);
  }
}

// Regra de senha forte: RegisterRequestValidator / ResetPasswordRequestValidator
export function validateSenhaForte(senha: string | undefined, v: Validator): void {
  v.notEmpty(senha, "Senha").minLength(senha, 8, "Senha");
  v.matches(senha, /[A-Z]/, "A senha deve conter ao menos uma letra maiúscula.");
  v.matches(senha, /[0-9]/, "A senha deve conter ao menos um número.");
}

// Regra de nome+sobrenome: TicketHolderRequestValidator.TerNomeESobrenome
export function temNomeESobrenome(nome: string): boolean {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return partes.length >= 2 && partes.every((p) => p.length >= 2);
}

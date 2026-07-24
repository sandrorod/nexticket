// Replica o contrato de erro de API/Middleware/ExceptionHandlingMiddleware.cs:
// { title: string, status: number, errors: string[] }

export class AppError extends Error {
  constructor(public status: number, public title: string, message: string) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(entidade: string, chave: string) {
    super(404, "Recurso não encontrado", `${entidade} '${chave}' não encontrado(a).`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, "Conflito", message);
  }
}

export class UnauthorizedAppError extends AppError {
  constructor(message: string) {
    super(401, "Não autorizado", message);
  }
}

export class ValidationAppError extends AppError {
  constructor(public messages: string[]) {
    super(400, "Erro de validação", messages[0] ?? "Erro de validação.");
  }
}

// Erros do postgrest-js (data: null, error: {code, message, details, hint})
// não são instâncias de Error — são objetos planos.
function extractMessage(err: unknown): string | null {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return null;
}

export function errorResponse(err: unknown, corsHeaders: Record<string, string>): Response {
  let status = 500;
  let title = "Erro interno do servidor";
  const rawMessage = extractMessage(err);
  let errors: string[] = [rawMessage ?? String(err)];

  if (err instanceof ValidationAppError) {
    status = err.status;
    title = err.title;
    errors = err.messages;
  } else if (err instanceof AppError) {
    status = err.status;
    title = err.title;
    errors = [err.message];
  } else if (rawMessage) {
    // Erros lançados pelas funções PL/pgSQL (via RAISE EXCEPTION) chegam
    // como "CONFLICT: mensagem" / "NOT_FOUND: mensagem" no campo message.
    const match = rawMessage.match(/^(CONFLICT|NOT_FOUND|UNAUTHORIZED):\s*(.+)$/s);
    if (match) {
      const [, kind, msg] = match;
      if (kind === "CONFLICT") { status = 409; title = "Conflito"; }
      else if (kind === "NOT_FOUND") { status = 404; title = "Recurso não encontrado"; }
      else { status = 401; title = "Não autorizado"; }
      errors = [msg];
    }
  }

  if (status === 500) {
    console.error("Erro não tratado:", err);
  }

  return new Response(
    JSON.stringify({ title, status, errors }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

const CHAVE_RETORNO = "nexticket:oauth-return-to";

export function salvarRetornoOAuth(path: string): void {
  try {
    sessionStorage.setItem(CHAVE_RETORNO, path);
  } catch {
    // ignora
  }
}

export function lerELimparRetornoOAuth(): string | null {
  try {
    const from = sessionStorage.getItem(CHAVE_RETORNO);
    sessionStorage.removeItem(CHAVE_RETORNO);
    return from;
  } catch {
    return null;
  }
}

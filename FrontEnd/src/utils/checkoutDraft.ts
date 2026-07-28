import type { TicketHolder } from "../types";

export interface CheckoutDraft {
  email: string;
  telefone: string;
  holdersPorLote: Record<string, TicketHolder[]>;
  quantidades: Record<string, number>;
}

const chave = (eventId: string) => `nexticket:checkout-draft:${eventId}`;

export function salvarRascunhoCheckout(eventId: string, draft: CheckoutDraft): void {
  try {
    sessionStorage.setItem(chave(eventId), JSON.stringify(draft));
  } catch {
    // sessionStorage indisponível (modo privado etc.) — ignora silenciosamente
  }
}

export function lerRascunhoCheckout(eventId: string): CheckoutDraft | null {
  try {
    const raw = sessionStorage.getItem(chave(eventId));
    return raw ? (JSON.parse(raw) as CheckoutDraft) : null;
  } catch {
    return null;
  }
}

export function limparRascunhoCheckout(eventId: string): void {
  try {
    sessionStorage.removeItem(chave(eventId));
  } catch {
    // ignora
  }
}

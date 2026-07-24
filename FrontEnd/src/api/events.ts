import { api } from "./client";
import type { EventDto, LotDto } from "../types";

export const getEvents = () => api.get<EventDto[]>("/events").then((r) => r.data);

export const getEventById = (id: string) =>
  api.get<EventDto>(`/events/${id}`).then((r) => r.data);

export const getLotsByEvent = (eventId: string) =>
  api.get<LotDto[]>(`/lots/${eventId}`).then((r) => r.data);

export interface EventPayload {
  nome: string;
  descricao: string;
  data: string;
  hora: string;
  local: string;
  mapaUrl?: string;
  imagemUrl?: string;
  transmissaoUrl?: string;
  vendaInicio: string;
  vendaFim: string;
  maximoPorCpf: number;
  maximoPorUsuario: number;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  classificacao?: string;
  contatoWhatsapp?: string;
  contatoTelefone?: string;
  contatoEmail?: string;
  orientacoesGerais?: string;
}

export const createEvent = (payload: EventPayload) =>
  api.post<EventDto>("/events", payload).then((r) => r.data);

export const updateEvent = (id: string, payload: EventPayload) =>
  api.put<EventDto>(`/events/${id}`, payload).then((r) => r.data);

export const cancelEvent = (id: string) => api.post(`/events/${id}/cancel`);

export interface LotPayload {
  nome: string;
  preco: number;
  quantidade: number;
  maximoPorUsuario: number;
  dataInicio: string;
  dataFim: string;
}

export const createLot = (eventId: string, payload: LotPayload) =>
  api.post<LotDto>(`/lots/${eventId}`, payload).then((r) => r.data);

export const updateLot = (eventId: string, lotId: string, payload: LotPayload) =>
  api.put<LotDto>(`/lots/${eventId}/${lotId}`, payload).then((r) => r.data);

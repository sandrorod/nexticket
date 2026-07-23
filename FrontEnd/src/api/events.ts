import { api } from "./client";
import type { EventDto, LotDto } from "../types";

export const getEvents = () => api.get<EventDto[]>("/events").then((r) => r.data);

export const getEventById = (id: string) =>
  api.get<EventDto>(`/events/${id}`).then((r) => r.data);

export const getLotsByEvent = (eventId: string) =>
  api.get<LotDto[]>(`/events/${eventId}/lots`).then((r) => r.data);

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
  api.post<LotDto>(`/events/${eventId}/lots`, payload).then((r) => r.data);

export const updateLot = (eventId: string, lotId: string, payload: LotPayload) =>
  api.put<LotDto>(`/events/${eventId}/lots/${lotId}`, payload).then((r) => r.data);

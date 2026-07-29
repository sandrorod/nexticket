import { api } from "./client";
import type { EventDto, LotDto, TicketDto } from "../types";

export const getEvents = () => api.get<EventDto[]>("/events").then((r) => r.data);

export const getAdminEvents = () =>
  api.get<EventDto[]>("/events", { params: { admin: "true" } }).then((r) => r.data);

export const getEventById = (id: string) =>
  api.get<EventDto>(`/events/${id}`).then((r) => r.data);

export const getLotsByEvent = (eventId: string) =>
  api.get<LotDto[]>(`/lots/${eventId}`).then((r) => r.data);

export const getTicketsByEvent = (eventId: string) =>
  api.get<TicketDto[]>("/tickets", { params: { eventId } }).then((r) => r.data);

export const cancelTicket = (ticketId: string) =>
  api.post(`/tickets/${ticketId}/cancel`).then((r) => r.data);

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
  contatoFacebook?: string;
  contatoInstagram?: string;
  orientacoesGerais?: string;
  exigirContatoTodosIngressos?: boolean;
}

export const createEvent = (payload: EventPayload) =>
  api.post<EventDto>("/events", payload).then((r) => r.data);

export const updateEvent = (id: string, payload: EventPayload) =>
  api.put<EventDto>(`/events/${id}`, payload).then((r) => r.data);

export const cancelEvent = (id: string) => api.post(`/events/${id}/cancel`);

export const deleteEvent = (id: string) => api.delete(`/events/${id}`);

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

export const duplicateEvent = async (id: string): Promise<EventDto> => {
  const original = await getEventById(id);
  const lots = await getLotsByEvent(id);

  const payload: EventPayload = {
    nome: `${original.nome} (cópia)`,
    descricao: original.descricao,
    data: original.data,
    hora: original.hora,
    local: original.local,
    mapaUrl: original.mapaUrl,
    imagemUrl: original.imagemUrl,
    transmissaoUrl: original.transmissaoUrl,
    vendaInicio: original.vendaInicio,
    vendaFim: original.vendaFim,
    maximoPorUsuario: original.maximoPorUsuario,
    cep: original.cep,
    endereco: original.endereco,
    numero: original.numero,
    bairro: original.bairro,
    cidade: original.cidade,
    estado: original.estado,
    classificacao: original.classificacao,
    contatoWhatsapp: original.contatoWhatsapp,
    contatoTelefone: original.contatoTelefone,
    contatoEmail: original.contatoEmail,
    contatoFacebook: original.contatoFacebook,
    contatoInstagram: original.contatoInstagram,
    orientacoesGerais: original.orientacoesGerais,
    exigirContatoTodosIngressos: original.exigirContatoTodosIngressos,
  };

  const created = await createEvent(payload);

  for (const lot of lots) {
    await createLot(created.id, {
      nome: lot.nome,
      preco: lot.preco,
      quantidade: lot.quantidade,
      maximoPorUsuario: lot.maximoPorUsuario,
      dataInicio: lot.dataInicio,
      dataFim: lot.dataFim,
    });
  }

  return created;
};

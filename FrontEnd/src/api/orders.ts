import { api } from "./client";
import type { OrderDto, TicketDto, TicketHolder } from "../types";

export interface CreateOrderItemPayload {
  lotId: string;
  ingressos: TicketHolder[];
}

export interface CreateOrderPayload {
  eventId: string;
  itens: CreateOrderItemPayload[];
  cupomCodigo?: string;
}

export const createOrder = (payload: CreateOrderPayload) =>
  api.post<OrderDto>("/orders", payload).then((r) => r.data);

export const getMyOrders = () => api.get<OrderDto[]>("/orders/me").then((r) => r.data);

export const getMyTickets = () => api.get<TicketDto[]>("/tickets/me").then((r) => r.data);

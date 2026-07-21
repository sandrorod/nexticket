import { api } from "./client";
import type { EventDto, LotDto } from "../types";

export const getEvents = () => api.get<EventDto[]>("/events").then((r) => r.data);

export const getEventById = (id: string) =>
  api.get<EventDto>(`/events/${id}`).then((r) => r.data);

export const getLotsByEvent = (eventId: string) =>
  api.get<LotDto[]>(`/events/${eventId}/lots`).then((r) => r.data);

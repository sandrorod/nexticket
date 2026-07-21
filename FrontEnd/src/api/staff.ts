import { api } from "./client";
import type { StaffDto } from "../types";

export const getStaff = () => api.get<StaffDto[]>("/staff").then((r) => r.data);

export interface CreateStaffPayload {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
}

export const createStaff = (payload: CreateStaffPayload) =>
  api.post<StaffDto>("/staff", payload).then((r) => r.data);

export const deactivateStaff = (id: string) => api.post(`/staff/${id}/deactivate`);

export const reactivateStaff = (id: string) => api.post(`/staff/${id}/reactivate`);

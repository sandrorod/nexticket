import { api } from "./client";
import type { UserAccountDto } from "../types";

export const getUsers = () => api.get<UserAccountDto[]>("/users").then((r) => r.data);

export interface UpdateUserPayload {
  nome: string;
  telefone: string;
}

export const updateUser = (id: string, payload: UpdateUserPayload) =>
  api.put<UserAccountDto>(`/users/${id}`, payload).then((r) => r.data);

export const promoverAdmin = (id: string) => api.post<UserAccountDto>(`/users/${id}/promover-admin`).then((r) => r.data);

export const removerAdmin = (id: string) => api.post<UserAccountDto>(`/users/${id}/remover-admin`).then((r) => r.data);

export const deactivateUser = (id: string) => api.post<UserAccountDto>(`/users/${id}/deactivate`).then((r) => r.data);

export const reactivateUser = (id: string) => api.post<UserAccountDto>(`/users/${id}/reactivate`).then((r) => r.data);

export const deleteUser = (id: string) => api.delete(`/users/${id}`);

/** Dados da própria conta: CPF e telefone do titular (exigidos para comprar). */
export interface MyProfile {
  nome: string;
  email: string;
  telefone: string;
  cpf: string | null;
}

export const getMyProfile = () => api.get<MyProfile>("/users/me").then((r) => r.data);

export const updateMyProfile = (payload: { cpf: string; telefone: string }) =>
  api.put<MyProfile>("/users/me", payload).then((r) => r.data);

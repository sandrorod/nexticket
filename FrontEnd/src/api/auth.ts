import { api } from "./client";
import type { AuthResponse } from "../types";

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf?: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export const registerUser = (payload: RegisterPayload) =>
  api.post<AuthResponse>("/auth/register", payload).then((r) => r.data);

export const loginUser = (payload: LoginPayload) =>
  api.post<AuthResponse>("/auth/login", payload).then((r) => r.data);

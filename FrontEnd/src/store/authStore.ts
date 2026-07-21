import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse } from "../types";

interface AuthState {
  token: string | null;
  userId: string | null;
  nome: string | null;
  email: string | null;
  role: "Comprador" | "Administrador" | null;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      nome: null,
      email: null,
      role: null,
      setAuth: (auth) =>
        set({
          token: auth.token,
          userId: auth.userId,
          nome: auth.nome,
          email: auth.email,
          role: auth.role,
        }),
      logout: () =>
        set({ token: null, userId: null, nome: null, email: null, role: null }),
    }),
    { name: "nexticket-auth" }
  )
);

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types";

interface Props {
  roles?: UserRole[];
}

export default function RequireAuth({ roles }: Props) {
  const { token, role: userRole } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;

  // Master tem acesso a tudo que Administrador tem, exceto onde a rota
  // exige explicitamente "Master" (ex: gestão de contas admin).
  const permitido =
    !roles ||
    (userRole && roles.includes(userRole)) ||
    (userRole === "Master" && roles.includes("Administrador"));

  if (!permitido) return <Navigate to="/eventos" replace />;

  return <Outlet />;
}

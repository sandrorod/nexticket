import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types";

interface Props {
  roles?: UserRole[];
}

export default function RequireAuth({ roles }: Props) {
  const { token, role: userRole } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (roles && (!userRole || !roles.includes(userRole))) return <Navigate to="/eventos" replace />;

  return <Outlet />;
}

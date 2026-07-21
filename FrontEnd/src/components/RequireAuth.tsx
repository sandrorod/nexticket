import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface Props {
  role?: "Administrador";
}

export default function RequireAuth({ role }: Props) {
  const { token, role: userRole } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/eventos" replace />;

  return <Outlet />;
}

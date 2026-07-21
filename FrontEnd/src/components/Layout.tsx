import { Outlet, Link as RouterLink, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useAuthStore } from "../store/authStore";

export default function Layout() {
  const navigate = useNavigate();
  const { token, nome, role, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #eee" }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" fontWeight={700} component={RouterLink} to="/eventos" sx={{ textDecoration: "none", color: "inherit", flexGrow: 1 }}>
            NexTicket
          </Typography>

          <Button component={RouterLink} to="/eventos">Eventos</Button>

          {token && <Button component={RouterLink} to="/meus-ingressos">Meus ingressos</Button>}
          {role === "Administrador" && <Button component={RouterLink} to="/admin/validar">Validar ingresso</Button>}

          <Box flexGrow={0} />

          {token ? (
            <>
              <Typography variant="body2" alignSelf="center">{nome}</Typography>
              <Button onClick={handleLogout}>Sair</Button>
            </>
          ) : (
            <Button component={RouterLink} to="/login" variant="contained">Entrar</Button>
          )}
        </Toolbar>
      </AppBar>
      <Outlet />
    </>
  );
}

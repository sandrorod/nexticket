import { Outlet, Link as RouterLink, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useAuthStore } from "../store/authStore";

const navLinkSx = {
  color: "text.secondary",
  fontWeight: 500,
  fontSize: "0.875rem",
  borderRadius: "0.375rem",
  px: 1.25,
  "&:hover": { color: "primary.main", backgroundColor: "rgba(55, 125, 255, 0.06)" },
};

export default function Layout() {
  const navigate = useNavigate();
  const { token, nome, role, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          backgroundColor: "#fff",
          borderBottom: "1px solid rgba(231, 234, 243, 0.9)",
          boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.1)",
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: "4.75rem" }}>
          <Typography
            variant="h6"
            fontWeight={800}
            component={RouterLink}
            to="/eventos"
            sx={{ textDecoration: "none", color: "primary.main", flexGrow: 1 }}
          >
            NexTicket
          </Typography>

          {role !== "Validador" && (
            <Button component={RouterLink} to="/eventos" sx={navLinkSx}>Eventos</Button>
          )}

          {token && role !== "Validador" && (
            <Button component={RouterLink} to="/meus-ingressos" sx={navLinkSx}>Meus ingressos</Button>
          )}
          {role === "Administrador" && (
            <Button component={RouterLink} to="/admin/eventos" sx={navLinkSx}>Meus eventos</Button>
          )}
          {role === "Administrador" && (
            <Button component={RouterLink} to="/admin/funcionarios" sx={navLinkSx}>Funcionários</Button>
          )}
          {(role === "Administrador" || role === "Validador") && (
            <Button component={RouterLink} to="/admin/validar" sx={navLinkSx}>Validar ingresso</Button>
          )}

          <Box flexGrow={0} />

          {token ? (
            <>
              <Typography variant="body2" color="text.secondary" alignSelf="center" sx={{ mr: 1 }}>
                {nome}
              </Typography>
              <Button onClick={handleLogout} sx={navLinkSx}>Sair</Button>
            </>
          ) : (
            <Button component={RouterLink} to="/login" variant="contained" sx={{ borderRadius: "0.5rem", px: 2.5 }}>
              Entrar
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Outlet />
    </>
  );
}

import { Outlet, Link as RouterLink, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LoginIcon from "@mui/icons-material/Login";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useAuthStore } from "../store/authStore";
import Footer from "./Footer";

const navLinkSx = {
  color: "text.secondary",
  fontWeight: 500,
  fontSize: "0.875rem",
  borderRadius: "0.375rem",
  px: 1.25,
  gap: 0.5,
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
        }}
      >
        <Toolbar sx={{ gap: 0.5, minHeight: "4.75rem", px: { xs: 2, md: 4 } }}>
          <Typography
            variant="h6"
            fontWeight={800}
            component={RouterLink}
            to="/eventos"
            sx={{ textDecoration: "none", color: "text.primary", flexGrow: 1, letterSpacing: "-0.02em" }}
          >
            <Box component="span" sx={{ color: "primary.main" }}>X</Box>next
          </Typography>

          {role === "Administrador" && (
            <Button component={RouterLink} to="/admin/eventos/novo" startIcon={<AddCircleOutlineIcon />} sx={navLinkSx}>
              Criar evento
            </Button>
          )}
          {role === "Administrador" && (
            <Button component={RouterLink} to="/admin/eventos" startIcon={<EventNoteIcon />} sx={navLinkSx}>
              Meus eventos
            </Button>
          )}
          {role === "Administrador" && (
            <Button component={RouterLink} to="/admin/funcionarios" startIcon={<PeopleAltOutlinedIcon />} sx={navLinkSx}>
              Funcionários
            </Button>
          )}
          {(role === "Administrador" || role === "Validador") && (
            <Button component={RouterLink} to="/admin/validar" startIcon={<QrCodeScannerIcon />} sx={navLinkSx}>
              Validar ingresso
            </Button>
          )}
          {token && role !== "Validador" && (
            <Button component={RouterLink} to="/meus-ingressos" startIcon={<ConfirmationNumberOutlinedIcon />} sx={navLinkSx}>
              Meus ingressos
            </Button>
          )}

          <Box flexGrow={0} />

          {token ? (
            <>
              <Typography variant="body2" color="text.secondary" alignSelf="center" sx={{ mx: 1.5 }}>
                {nome?.split(" ")[0]}
              </Typography>
              <Button onClick={handleLogout} sx={navLinkSx}>Sair</Button>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              startIcon={<LoginIcon />}
              sx={{ borderRadius: "0.5rem", px: 2.5, ml: 1 }}
            >
              Entrar
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Outlet />
      <Footer />
    </>
  );
}

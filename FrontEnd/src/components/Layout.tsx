import { useState } from "react";
import { Outlet, Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List,
  ListItemButton, ListItemIcon, ListItemText, Divider, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [menuOpen, setMenuOpen] = useState(false);
  const { token, nome, role, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    role === "Administrador" && { to: "/admin/eventos/novo", icon: <AddCircleOutlineIcon />, label: "Criar evento" },
    role === "Administrador" && { to: "/admin/eventos", icon: <EventNoteIcon />, label: "Meus eventos" },
    role === "Administrador" && { to: "/admin/funcionarios", icon: <PeopleAltOutlinedIcon />, label: "Funcionários" },
    (role === "Administrador" || role === "Validador") && { to: "/admin/validar", icon: <QrCodeScannerIcon />, label: "Validar ingresso" },
    token && role !== "Validador" && { to: "/meus-ingressos", icon: <ConfirmationNumberOutlinedIcon />, label: "Meus ingressos" },
  ].filter(Boolean) as { to: string; icon: React.ReactNode; label: string }[];

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

          {!isMobile && navItems.map((item) => (
            <Button key={item.to} component={RouterLink} to={item.to} startIcon={item.icon} sx={navLinkSx}>
              {item.label}
            </Button>
          ))}

          {!isMobile && <Box flexGrow={0} />}

          {!isMobile && (
            token ? (
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
            )
          )}

          {isMobile && (
            <IconButton onClick={() => setMenuOpen(true)} sx={{ color: "text.primary" }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          {token && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
              Olá, {nome?.split(" ")[0]}
            </Typography>
          )}
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItemButton key={item.to} component={RouterLink} to={item.to} onClick={() => setMenuOpen(false)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            {token ? (
              <ListItemButton onClick={() => { setMenuOpen(false); handleLogout(); }}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Sair" />
              </ListItemButton>
            ) : (
              <ListItemButton component={RouterLink} to="/login" onClick={() => setMenuOpen(false)}>
                <ListItemIcon><LoginIcon /></ListItemIcon>
                <ListItemText primary="Entrar" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>

      <Outlet />
      <Footer />
    </>
  );
}

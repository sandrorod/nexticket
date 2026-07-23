import { Link as RouterLink } from "react-router-dom";
import { Box, Container, Grid, Typography, IconButton, Link, Divider, Stack } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import EmailIcon from "@mui/icons-material/Email";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import ShieldIcon from "@mui/icons-material/Shield";

const linkSx = {
  color: "text.secondary",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: 1,
  py: 0.5,
  fontSize: "0.9rem",
  "&:hover": { color: "primary.main" },
};

export default function Footer() {
  return (
    <Box component="footer" sx={{ backgroundColor: "#f8fafc", borderTop: "1px solid rgba(231, 234, 243, 0.9)", mt: 8 }}>
      <Container sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={800} color="text.primary" mb={1.5}>
              <Box component="span" sx={{ color: "primary.main" }}>X</Box>next
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Plataforma de venda e gestão de ingressos.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                href="https://instagram.com"
                target="_blank"
                rel="noopener"
                size="small"
                sx={{ backgroundColor: "rgba(55, 125, 255, 0.08)", color: "primary.main" }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton
                href="mailto:ajuda@nexticket.com.br"
                size="small"
                sx={{ backgroundColor: "rgba(55, 125, 255, 0.08)", color: "primary.main" }}
              >
                <EmailIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={1.5}>
              Links
            </Typography>
            <Link component={RouterLink} to="/eventos" sx={linkSx}>
              <CalendarMonthIcon sx={{ fontSize: "1.1rem" }} /> Eventos
            </Link>
            <Link component={RouterLink} to="/login" sx={linkSx}>
              <PersonIcon sx={{ fontSize: "1.1rem" }} /> Entrar
            </Link>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={1.5}>
              Sua conta
            </Typography>
            <Link component={RouterLink} to="/login" sx={linkSx}>
              <PersonIcon sx={{ fontSize: "1.1rem" }} /> Minha conta
            </Link>
            <Link component={RouterLink} to="/meus-ingressos" sx={linkSx}>
              <ConfirmationNumberOutlinedIcon sx={{ fontSize: "1.1rem" }} /> Meus ingressos
            </Link>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={1.5}>
              Políticas
            </Typography>
            <Link href="#" sx={linkSx}>
              <DescriptionIcon sx={{ fontSize: "1.1rem" }} /> Termos de uso
            </Link>
            <Link href="#" sx={linkSx}>
              <ShieldIcon sx={{ fontSize: "1.1rem" }} /> Privacidade
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="body2" color="text.secondary">
          Copyright © {new Date().getFullYear()} NexTicket
        </Typography>
      </Container>
    </Box>
  );
}

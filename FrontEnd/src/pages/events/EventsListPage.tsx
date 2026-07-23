import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AppsIcon from "@mui/icons-material/Apps";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CelebrationIcon from "@mui/icons-material/Celebration";
import CampaignIcon from "@mui/icons-material/Campaign";
import ChurchIcon from "@mui/icons-material/Church";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Grid,
  InputBase,
  Stack,
  Typography,
} from "@mui/material";
import { getEvents } from "../../api/events";
import { formatarData, formatarHora } from "../../utils/date";

const categorias = [
  { label: "Tudo", icon: <AppsIcon /> },
  { label: "Festa", icon: <CelebrationIcon /> },
  { label: "Shows", icon: <MusicNoteIcon /> },
  { label: "Palestras e Congressos", icon: <CampaignIcon /> },
  { label: "Religião", icon: <ChurchIcon /> },
  { label: "Outros", icon: <MoreHorizIcon /> },
];

export default function EventsListPage() {
  const navigate = useNavigate();
  const { data: events, isLoading } = useQuery({ queryKey: ["events"], queryFn: getEvents });
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Tudo");

  const eventosFiltrados = events?.filter((ev) =>
    ev.nome.toLowerCase().includes(busca.toLowerCase()) || ev.local.toLowerCase().includes(busca.toLowerCase())
  );

  const destaque = eventosFiltrados?.find((ev) => ev.imagemUrl);

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            width: "100%",
            p: "0.75rem 1rem",
            mb: 3,
            backgroundColor: "#fff",
            border: "1px solid rgba(231, 234, 243, 0.95)",
            borderRadius: "0.75rem",
            boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.06)",
          }}
        >
          <SearchIcon sx={{ color: "primary.main", fontSize: "1.15rem" }} />
          <InputBase
            placeholder="Buscar eventos, cidade ou estado..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            fullWidth
            sx={{ fontSize: "0.95rem" }}
          />
        </Box>

        {destaque && (
          <Box
            onClick={() => navigate(`/eventos/${destaque.id}`)}
            sx={{
              width: "100%",
              aspectRatio: { xs: "16 / 9", md: "3.6 / 1" },
              borderRadius: "0.75rem",
              overflow: "hidden",
              mb: 4,
              cursor: "pointer",
              boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.1)",
            }}
          >
            <Box
              component="img"
              src={destaque.imagemUrl}
              alt={destaque.nome}
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </Box>
        )}

        <Typography variant="h6" fontWeight={700} color="text.primary" mb={1.5}>
          Categorias
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ overflowX: "auto", pb: 3 }}>
          {categorias.map((cat) => (
            <Button
              key={cat.label}
              onClick={() => setCategoriaAtiva(cat.label)}
              sx={{
                flexDirection: "column",
                gap: 0.5,
                minWidth: 96,
                py: 1.5,
                px: 2,
                borderRadius: "0.75rem",
                border: "1px solid rgba(231, 234, 243, 0.95)",
                color: categoriaAtiva === cat.label ? "primary.main" : "text.secondary",
                backgroundColor: categoriaAtiva === cat.label ? "rgba(55, 125, 255, 0.08)" : "#fff",
                fontWeight: 600,
                fontSize: "0.8rem",
                textTransform: "none",
                "&:hover": { backgroundColor: "rgba(55, 125, 255, 0.08)" },
              }}
            >
              {cat.icon}
              {cat.label}
            </Button>
          ))}
        </Stack>

        <Typography variant="h6" fontWeight={700} color="text.primary" mb={2}>
          Eventos
        </Typography>

        {isLoading && <Typography color="text.secondary">Carregando...</Typography>}

        <Grid container spacing={3}>
          {eventosFiltrados?.map((ev) => (
            <Grid item xs={12} sm={6} md={3} key={ev.id}>
              <Card>
                <CardActionArea onClick={() => navigate(`/eventos/${ev.id}`)}>
                  {ev.imagemUrl && (
                    <CardMedia
                      component="img"
                      image={ev.imagemUrl}
                      alt={ev.nome}
                      sx={{ aspectRatio: "1 / 1", objectFit: "cover" }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary" noWrap>
                      {ev.nome}
                    </Typography>
                    <Stack spacing={0.4} mt={1} mb={2}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <CalendarTodayIcon sx={{ fontSize: "0.9rem", color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">{formatarData(ev.data)}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <ScheduleIcon sx={{ fontSize: "0.9rem", color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">{formatarHora(ev.hora)}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <LocationOnIcon sx={{ fontSize: "0.9rem", color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary" noWrap>{ev.local}</Typography>
                      </Stack>
                    </Stack>
                    <Button variant="contained" fullWidth sx={{ borderRadius: "0.5rem" }}>
                      Mais informações
                    </Button>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

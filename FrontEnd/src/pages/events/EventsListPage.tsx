import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  InputBase,
  Typography,
} from "@mui/material";
import { getEvents } from "../../api/events";
import { formatarData, formatarHora } from "../../utils/date";

export default function EventsListPage() {
  const navigate = useNavigate();
  const { data: events, isLoading } = useQuery({ queryKey: ["events"], queryFn: getEvents });
  const [busca, setBusca] = useState("");

  const eventosFiltrados = events?.filter((ev) =>
    ev.nome.toLowerCase().includes(busca.toLowerCase()) || ev.local.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary" mb={3}>
          Eventos
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            width: "100%",
            maxWidth: 480,
            p: "0.75rem 1rem",
            mb: 4,
            backgroundColor: "#fff",
            border: "1px solid rgba(231, 234, 243, 0.95)",
            borderRadius: "0.75rem",
            boxShadow: "0 0.35rem 1.25rem rgba(19, 33, 68, 0.1)",
          }}
        >
          <SearchIcon sx={{ color: "primary.main", fontSize: "1.15rem" }} />
          <InputBase
            placeholder="Buscar por evento ou local..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            fullWidth
            sx={{ fontSize: "0.95rem" }}
          />
        </Box>

        {isLoading && <Typography color="text.secondary">Carregando...</Typography>}

        <Grid container spacing={3}>
          {eventosFiltrados?.map((ev) => (
            <Grid item xs={12} sm={6} md={4} key={ev.id}>
              <Card>
                <CardActionArea onClick={() => navigate(`/eventos/${ev.id}`)}>
                  {ev.imagemUrl && (
                    <CardMedia
                      component="img"
                      image={ev.imagemUrl}
                      alt={ev.nome}
                      sx={{ aspectRatio: "16 / 9", objectFit: "cover" }}
                    />
                  )}
                  <CardContent>
                    <Chip
                      label={ev.status}
                      size="small"
                      sx={{
                        mb: 1,
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                        backgroundColor: "rgba(55, 125, 255, 0.1)",
                        color: "primary.main",
                      }}
                    />
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      {ev.nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{ev.local}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatarData(ev.data)} às {formatarHora(ev.hora)}
                    </Typography>
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

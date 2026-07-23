import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardActionArea, CardContent, CardMedia, Chip, Container, Grid, Typography } from "@mui/material";
import { getEvents } from "../../api/events";
import { formatarData, formatarHora } from "../../utils/date";

export default function EventsListPage() {
  const navigate = useNavigate();
  const { data: events, isLoading } = useQuery({ queryKey: ["events"], queryFn: getEvents });

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Eventos
      </Typography>

      {isLoading && <Typography>Carregando...</Typography>}

      <Grid container spacing={3}>
        {events?.map((ev) => (
          <Grid item xs={12} sm={6} md={4} key={ev.id}>
            <Card elevation={1}>
              <CardActionArea onClick={() => navigate(`/eventos/${ev.id}`)}>
                {ev.imagemUrl && (
                  <CardMedia component="img" image={ev.imagemUrl} alt={ev.nome} sx={{ aspectRatio: "16 / 9", objectFit: "cover" }} />
                )}
                <CardContent>
                  <Chip label={ev.status} size="small" sx={{ mb: 1 }} />
                  <Typography variant="h6" fontWeight={600}>{ev.nome}</Typography>
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
  );
}

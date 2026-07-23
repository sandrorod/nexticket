import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container, Typography, Grid, Card, CardActionArea, CardContent, Box, Chip, Stack } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getMyTickets } from "../../api/orders";
import type { TicketDto } from "../../types";
import { formatarData, formatarHora } from "../../utils/date";

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const { data: tickets, isLoading } = useQuery({ queryKey: ["myTickets"], queryFn: getMyTickets });

  const grupos = tickets?.reduce<Record<string, TicketDto[]>>((acc, ticket) => {
    (acc[ticket.eventId] ??= []).push(ticket);
    return acc;
  }, {});

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary" mb={3}>Meus ingressos</Typography>

        {isLoading && <Typography color="text.secondary">Carregando...</Typography>}
        {!isLoading && tickets?.length === 0 && <Typography color="text.secondary">Você ainda não possui ingressos.</Typography>}

        <Grid container spacing={3}>
          {grupos && Object.entries(grupos).map(([eventId, eventTickets]) => {
            const primeiro = eventTickets[0];
            return (
              <Grid item xs={12} sm={6} md={4} key={eventId}>
                <Card>
                  <CardActionArea onClick={() => navigate(`/meus-ingressos/${eventId}`)}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" fontWeight={700} color="text.primary">
                            {primeiro.eventNome}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">{primeiro.eventLocal}</Typography>
                          <Typography variant="body2" color="text.secondary" mb={2}>
                            {formatarData(primeiro.eventData)} às {formatarHora(primeiro.eventHora)}
                          </Typography>
                        </Box>
                        <ChevronRightIcon sx={{ color: "text.secondary" }} />
                      </Stack>
                      <Chip
                        label={`${eventTickets.length} ${eventTickets.length === 1 ? "ingresso" : "ingressos"}`}
                        size="small"
                        sx={{ fontWeight: 700, backgroundColor: "rgba(55, 125, 255, 0.1)", color: "primary.main" }}
                      />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}

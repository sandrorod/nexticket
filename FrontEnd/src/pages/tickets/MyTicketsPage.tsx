import { useQuery } from "@tanstack/react-query";
import { Container, Typography, Grid, Card, CardContent, Box, Chip, Divider } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { getMyTickets } from "../../api/orders";
import { formatarData, formatarHora } from "../../utils/date";

const statusColor: Record<string, "success" | "default" | "error"> = {
  Disponivel: "success",
  Utilizado: "default",
  Cancelado: "error",
};

export default function MyTicketsPage() {
  const { data: tickets, isLoading } = useQuery({ queryKey: ["myTickets"], queryFn: getMyTickets });

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Meus ingressos</Typography>

      {isLoading && <Typography>Carregando...</Typography>}
      {!isLoading && tickets?.length === 0 && <Typography color="text.secondary">Você ainda não possui ingressos.</Typography>}

      <Grid container spacing={3}>
        {tickets?.map((ticket) => (
          <Grid item xs={12} sm={6} md={4} key={ticket.id}>
            <Card elevation={2}>
              <CardContent>
                <Chip label={ticket.status} color={statusColor[ticket.status] ?? "default"} size="small" sx={{ mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>{ticket.eventNome}</Typography>
                <Typography variant="body2" color="text.secondary">{ticket.eventLocal}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {formatarData(ticket.eventData)} às {formatarHora(ticket.eventHora)}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2"><strong>Nome:</strong> {ticket.nome}</Typography>
                <Typography variant="body2" mb={2}><strong>Setor:</strong> {ticket.lotNome}</Typography>

                <Box display="flex" justifyContent="center" mb={1}>
                  <QRCodeSVG value={ticket.token} size={160} />
                </Box>
                <Typography variant="caption" display="block" textAlign="center" color="text.secondary">
                  Código: {ticket.codigo}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

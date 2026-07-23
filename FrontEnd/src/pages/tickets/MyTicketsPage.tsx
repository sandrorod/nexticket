import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Container, Typography, Grid, Card, CardContent, Box, Chip, Divider, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getMyTickets } from "../../api/orders";
import type { TicketDto } from "../../types";
import { formatarData, formatarHora } from "../../utils/date";

const statusColor: Record<string, "success" | "default" | "error"> = {
  Disponivel: "success",
  Utilizado: "default",
  Cancelado: "error",
};

function TicketCard({ ticket }: { ticket: TicketDto }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`ingresso-${ticket.codigo}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card>
      <Box ref={cardRef} sx={{ backgroundColor: "#fff" }}>
        <CardContent>
          <Chip
            label={ticket.status}
            color={statusColor[ticket.status] ?? "default"}
            size="small"
            sx={{ mb: 1, fontWeight: 700 }}
          />
          <Typography variant="body2" color="text.secondary">
            {formatarData(ticket.eventData)} às {formatarHora(ticket.eventHora)}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.primary"><strong>Nome:</strong> {ticket.nome}</Typography>
          <Typography variant="body2" color="text.primary" mb={2}><strong>Setor:</strong> {ticket.lotNome}</Typography>

          <Box display="flex" justifyContent="center" mb={1}>
            <QRCodeSVG value={ticket.token} size={160} />
          </Box>
          <Typography variant="caption" display="block" textAlign="center" color="text.secondary">
            Código: {ticket.codigo}
          </Typography>
        </CardContent>
      </Box>
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPdf}
          disabled={downloading}
          sx={{ borderRadius: "0.5rem" }}
        >
          {downloading ? "Gerando PDF..." : "Baixar PDF"}
        </Button>
      </Box>
    </Card>
  );
}

export default function MyTicketsPage() {
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

        {grupos && Object.entries(grupos).map(([eventId, eventTickets]) => (
          <Box key={eventId} mb={5}>
            <Typography variant="h6" fontWeight={700} color="text.primary" mb={0.5}>
              {eventTickets[0].eventNome}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {eventTickets[0].eventLocal} · {formatarData(eventTickets[0].eventData)} às {formatarHora(eventTickets[0].eventHora)}
            </Typography>

            <Grid container spacing={3}>
              {eventTickets.map((ticket) => (
                <Grid item xs={12} sm={6} md={4} key={ticket.id}>
                  <TicketCard ticket={ticket} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Container>
    </Box>
  );
}

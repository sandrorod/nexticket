import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box, Container, Typography, Card, CardContent, Button, Chip,
  Divider, Alert, Select, MenuItem, FormControl, InputLabel,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import { getEventById, getLotsByEvent } from "../../api/events";
import type { LotDto } from "../../types";
import CheckoutForm from "../checkout/CheckoutForm";
import { formatarData, formatarHora } from "../../utils/date";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedLot, setSelectedLot] = useState<LotDto | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id!),
    enabled: !!id,
  });

  const { data: lots } = useQuery({
    queryKey: ["lots", id],
    queryFn: () => getLotsByEvent(id!),
    enabled: !!id,
  });

  if (!event) return null;

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
    <Container sx={{ py: 4 }}>
      {event.imagemUrl && (
        <Box
          sx={{
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: "0.75rem",
            overflow: "hidden",
            mb: 3,
            boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)",
          }}
        >
          <Box component="img" src={event.imagemUrl} alt={event.nome} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Box>
      )}

      <Typography variant="h4" fontWeight={800} color="text.primary">{event.nome}</Typography>
      <Typography color="text.secondary" mb={1}>{event.local}</Typography>
      <Typography color="text.secondary" mb={2}>{formatarData(event.data)} às {formatarHora(event.hora)}</Typography>
      <Typography color="text.primary" mb={3}>{event.descricao}</Typography>

      {event.transmissaoUrl && (
        <Alert
          icon={<LiveTvIcon />}
          severity="info"
          action={
            <Button color="inherit" size="small" href={event.transmissaoUrl} target="_blank" rel="noopener noreferrer">
              Assistir
            </Button>
          }
          sx={{ mb: 3 }}
        >
          Este evento possui transmissão ao vivo.
        </Alert>
      )}

      <Typography variant="h6" fontWeight={700} color="text.primary" mb={2}>Lotes disponíveis</Typography>

      <Box display="flex" flexDirection="column" gap={2} mb={4}>
        {lots?.map((lot) => (
          <Card
            key={lot.id}
            sx={{
              border: selectedLot?.id === lot.id ? "2px solid" : "1px solid rgba(231, 234, 243, 0.9)",
              borderColor: selectedLot?.id === lot.id ? "primary.main" : undefined,
            }}
          >
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography fontWeight={700} color="text.primary">{lot.nome}</Typography>
                <Typography variant="body2" color="text.secondary">
                  R$ {lot.preco.toFixed(2)}
                </Typography>
              </Box>
              <Box display="flex" gap={1} alignItems="center">
                <Chip
                  label={lot.status}
                  size="small"
                  sx={{ fontWeight: 700, backgroundColor: "rgba(55, 125, 255, 0.1)", color: "primary.main" }}
                />
                <Button
                  variant={selectedLot?.id === lot.id ? "contained" : "outlined"}
                  disabled={lot.quantidadeDisponivel === 0}
                  onClick={() => { setSelectedLot(lot); setQuantity(1); }}
                  sx={{ borderRadius: "0.5rem" }}
                >
                  Selecionar
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {selectedLot && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" fontWeight={600} mb={2}>Quantidade de ingressos</Typography>
          <FormControl sx={{ mb: 3, minWidth: 120 }}>
            <InputLabel id="quantidade-label">Quantidade</InputLabel>
            <Select
              labelId="quantidade-label"
              label="Quantidade"
              value={quantity}
              onChange={(e: SelectChangeEvent<number>) => setQuantity(Number(e.target.value))}
            >
              {Array.from(
                { length: Math.min(selectedLot.maximoPorUsuario, selectedLot.quantidadeDisponivel, 10) },
                (_, i) => i + 1
              ).map((n) => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <CheckoutForm event={event} lot={selectedLot} quantity={quantity} />
        </>
      )}
    </Container>
    </Box>
  );
}

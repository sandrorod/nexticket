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
    <Container sx={{ py: 4 }}>
      {event.imagemUrl && (
        <Box sx={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 3, overflow: "hidden", mb: 3 }}>
          <Box component="img" src={event.imagemUrl} alt={event.nome} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Box>
      )}

      <Typography variant="h4" fontWeight={700}>{event.nome}</Typography>
      <Typography color="text.secondary" mb={1}>{event.local}</Typography>
      <Typography color="text.secondary" mb={2}>{formatarData(event.data)} às {formatarHora(event.hora)}</Typography>
      <Typography mb={3}>{event.descricao}</Typography>

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

      <Typography variant="h6" fontWeight={600} mb={2}>Lotes disponíveis</Typography>

      <Box display="flex" flexDirection="column" gap={2} mb={4}>
        {lots?.map((lot) => (
          <Card
            key={lot.id}
            elevation={selectedLot?.id === lot.id ? 3 : 1}
            sx={{ border: selectedLot?.id === lot.id ? "2px solid" : "none", borderColor: "primary.main" }}
          >
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography fontWeight={600}>{lot.nome}</Typography>
                <Typography variant="body2" color="text.secondary">
                  R$ {lot.preco.toFixed(2)}
                </Typography>
              </Box>
              <Box display="flex" gap={1} alignItems="center">
                <Chip label={lot.status} size="small" />
                <Button
                  variant={selectedLot?.id === lot.id ? "contained" : "outlined"}
                  disabled={lot.quantidadeDisponivel === 0}
                  onClick={() => { setSelectedLot(lot); setQuantity(1); }}
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
  );
}

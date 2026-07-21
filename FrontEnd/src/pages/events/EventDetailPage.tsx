import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box, Container, Typography, Card, CardContent, Button, Chip,
  ToggleButton, ToggleButtonGroup, Divider,
} from "@mui/material";
import { getEventById, getLotsByEvent } from "../../api/events";
import type { LotDto } from "../../types";
import CheckoutForm from "../checkout/CheckoutForm";

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
        <Box component="img" src={event.imagemUrl} alt={event.nome} sx={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 3, mb: 3 }} />
      )}

      <Typography variant="h4" fontWeight={700}>{event.nome}</Typography>
      <Typography color="text.secondary" mb={1}>{event.local}</Typography>
      <Typography color="text.secondary" mb={2}>{event.data} às {event.hora}</Typography>
      <Typography mb={4}>{event.descricao}</Typography>

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
                  R$ {lot.preco.toFixed(2)} · {lot.quantidadeDisponivel} disponíveis
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
          <ToggleButtonGroup
            exclusive
            value={quantity}
            onChange={(_, v) => v && setQuantity(v)}
            sx={{ mb: 3 }}
          >
            {Array.from({ length: Math.min(selectedLot.maximoPorUsuario, 10) }, (_, i) => i + 1).map((n) => (
              <ToggleButton key={n} value={n}>{n}</ToggleButton>
            ))}
          </ToggleButtonGroup>

          <CheckoutForm event={event} lot={selectedLot} quantity={quantity} />
        </>
      )}
    </Container>
  );
}

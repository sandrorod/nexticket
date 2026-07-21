import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, TextField, Typography, Alert, Divider, Grid } from "@mui/material";
import type { EventDto, LotDto, TicketHolder } from "../../types";
import { createOrder } from "../../api/orders";

interface Props {
  event: EventDto;
  lot: LotDto;
  quantity: number;
}

const emptyHolder: TicketHolder = { nome: "", email: "", telefone: "", cpf: "" };

export default function CheckoutForm({ event, lot, quantity }: Props) {
  const navigate = useNavigate();
  const [holders, setHolders] = useState<TicketHolder[]>(
    Array.from({ length: quantity }, () => ({ ...emptyHolder }))
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (holders.length !== quantity) {
    setHolders(Array.from({ length: quantity }, (_, i) => holders[i] ?? { ...emptyHolder }));
  }

  const updateHolder = (index: number, field: keyof TicketHolder, value: string) => {
    setHolders((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const order = await createOrder({
        eventId: event.id,
        itens: [{ lotId: lot.id, ingressos: holders.map((h) => ({ ...h, cpf: h.cpf || undefined })) }],
      });
      navigate(`/pedidos/${order.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.join(" ") ?? "Não foi possível concluir a compra.");
    } finally {
      setLoading(false);
    }
  };

  const total = lot.preco * quantity;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" fontWeight={600} mb={2}>Dados dos ingressos</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Cada ingresso deve ter dados próprios. Não é permitido repetir email, celular, ou a combinação nome + celular.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        {holders.map((holder, i) => (
          <Card key={i} variant="outlined">
            <CardContent>
              <Typography fontWeight={600} mb={2}>Ingresso {i + 1}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={7}>
                  <TextField label="Nome completo" value={holder.nome} onChange={(e) => updateHolder(i, "nome", e.target.value)} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField label="Telefone" value={holder.telefone} onChange={(e) => updateHolder(i, "telefone", e.target.value)} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField label="Email" type="email" value={holder.email} onChange={(e) => updateHolder(i, "email", e.target.value)} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="CPF (opcional)" value={holder.cpf} onChange={(e) => updateHolder(i, "cpf", e.target.value)} fullWidth />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Total</Typography>
        <Typography variant="h6" fontWeight={700}>R$ {total.toFixed(2)}</Typography>
      </Box>

      <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
        {loading ? "Processando..." : "Finalizar compra"}
      </Button>
    </Box>
  );
}

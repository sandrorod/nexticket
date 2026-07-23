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

  const temNomeESobrenome = (nome: string) => {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    return partes.length >= 2 && partes.every((p) => p.length >= 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const indiceInvalido = holders.findIndex((h) => !temNomeESobrenome(h.nome));
    if (indiceInvalido !== -1) {
      setError(`Informe nome e sobrenome completos no Ingresso ${indiceInvalido + 1}.`);
      return;
    }

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
      <Typography
        variant="overline"
        fontWeight={700}
        color="text.secondary"
        letterSpacing="0.04em"
        sx={{ display: "block", textAlign: "left", mb: 1 }}
      >
        Dados dos ingressos
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3} sx={{ fontSize: "0.7875rem" }}>
        Informe nome e sobrenome completos. Cada ingresso deve ter dados próprios: não é permitido repetir email
        ou celular já utilizados neste evento.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        {holders.map((holder, i) => (
          <Card key={i} sx={{ border: "1px solid rgba(231, 234, 243, 0.9)" }}>
            <CardContent>
              <Typography fontWeight={700} color="text.primary" mb={2}>Ingresso {i + 1}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={7}>
                  <TextField
                    label="Nome completo"
                    placeholder="Nome e sobrenome"
                    value={holder.nome}
                    onChange={(e) => updateHolder(i, "nome", e.target.value)}
                    required
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-input": { py: "14.85px" } }}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Telefone"
                    value={holder.telefone}
                    onChange={(e) => updateHolder(i, "telefone", e.target.value)}
                    required
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-input": { py: "14.85px" } }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Email"
                    type="email"
                    value={holder.email}
                    onChange={(e) => updateHolder(i, "email", e.target.value)}
                    required
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-input": { py: "14.85px" } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="CPF (opcional)"
                    value={holder.cpf}
                    onChange={(e) => updateHolder(i, "cpf", e.target.value)}
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-input": { py: "14.85px" } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" color="text.primary">Total</Typography>
        <Typography variant="h6" fontWeight={700} color="primary.main">R$ {total.toFixed(2)}</Typography>
      </Box>

      <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ borderRadius: "0.5rem", py: 1.2 }}>
        {loading ? "Processando..." : "Finalizar compra"}
      </Button>
    </Box>
  );
}

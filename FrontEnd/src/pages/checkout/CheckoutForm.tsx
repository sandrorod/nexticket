import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Box, Button, Card, CardContent, TextField, Typography, Alert, Divider, Grid, MenuItem } from "@mui/material";
import type { EventDto, LotDto, TicketHolder } from "../../types";
import { createOrder } from "../../api/orders";
import { lerRascunhoCheckout, salvarRascunhoCheckout, limparRascunhoCheckout } from "../../utils/checkoutDraft";

export interface SelectedLot {
  lot: LotDto;
  quantity: number;
}

interface Props {
  event: EventDto;
  selecionados: SelectedLot[];
}

const idades = Array.from({ length: 100 }, (_, i) => i);

const emptyHolder: TicketHolder = { nome: "", idade: "" as unknown as number };

export default function CheckoutForm({ event, selecionados }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rascunho = lerRascunhoCheckout(event.id);
  const [email, setEmail] = useState(rascunho?.email ?? "");
  const [telefone, setTelefone] = useState(rascunho?.telefone ?? "");
  const [holdersPorLote, setHoldersPorLote] = useState<Record<string, TicketHolder[]>>(rascunho?.holdersPorLote ?? {});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const quantidades = Object.fromEntries(selecionados.map(({ lot, quantity }) => [lot.id, quantity]));
    salvarRascunhoCheckout(event.id, { email, telefone, holdersPorLote, quantidades });
  }, [event.id, email, telefone, holdersPorLote, selecionados]);

  const holdersDoLote = (lotId: string, quantity: number) => {
    const atuais = holdersPorLote[lotId] ?? [];
    if (atuais.length === quantity) return atuais;
    return Array.from({ length: quantity }, (_, i) => atuais[i] ?? { ...emptyHolder });
  };

  for (const { lot, quantity } of selecionados) {
    const atuais = holdersPorLote[lot.id] ?? [];
    if (atuais.length !== quantity) {
      const proximos = holdersDoLote(lot.id, quantity);
      setHoldersPorLote((prev) => ({ ...prev, [lot.id]: proximos }));
    }
  }

  const updateHolder = (lotId: string, index: number, field: keyof TicketHolder, value: string | number) => {
    setHoldersPorLote((prev) => {
      const next = [...(prev[lotId] ?? [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, [lotId]: next };
    });
  };

  const temNomeESobrenome = (nome: string) => {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    return partes.length >= 2 && partes.every((p) => p.length >= 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !telefone.trim()) {
      setError("Informe email e telefone do comprador.");
      return;
    }

    for (const { lot, quantity } of selecionados) {
      const holders = holdersDoLote(lot.id, quantity);

      const indiceInvalido = holders.findIndex((h) => !temNomeESobrenome(h.nome));
      if (indiceInvalido !== -1) {
        setError(`Informe nome e sobrenome completos no Ingresso ${indiceInvalido + 1} — ${lot.nome}.`);
        return;
      }

      const indiceSemIdade = holders.findIndex(
        (h) => h.idade === undefined || h.idade === null || (h.idade as unknown as string) === "" || h.idade < 0 || h.idade > 99
      );
      if (indiceSemIdade !== -1) {
        setError(`Informe a idade no Ingresso ${indiceSemIdade + 1} — ${lot.nome}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const order = await createOrder({
        eventId: event.id,
        email,
        telefone,
        itens: selecionados.map(({ lot, quantity }) => ({
          lotId: lot.id,
          ingressos: holdersDoLote(lot.id, quantity),
        })),
      });
      await queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      limparRascunhoCheckout(event.id);
      navigate(`/pedidos/${order.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.join(" ") ?? "Não foi possível concluir a compra.");
    } finally {
      setLoading(false);
    }
  };

  const total = selecionados.reduce((sum, { lot, quantity }) => sum + lot.preco * quantity, 0);

  let contador = 0;

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
        Informe nome e sobrenome completos de cada titular. Email e telefone do comprador são informados uma
        única vez, no Ingresso 1.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        {selecionados.map(({ lot, quantity }) =>
          holdersDoLote(lot.id, quantity).map((holder, i) => {
            const ehPrimeiro = contador === 0;
            contador += 1;
            return (
              <Card key={`${lot.id}-${i}`} sx={{ border: "1px solid rgba(231, 234, 243, 0.9)" }}>
                <CardContent>
                  <Typography fontWeight={700} color="text.primary" mb={2} sx={{ fontSize: "0.9rem" }}>Ingresso {i + 1} — {lot.nome}</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={9} sm={10}>
                      <TextField
                        label="Nome completo"
                        placeholder="Nome e sobrenome"
                        value={holder.nome}
                        onChange={(e) => updateHolder(lot.id, i, "nome", e.target.value)}
                        required
                        fullWidth
                        sx={{ "& .MuiOutlinedInput-input": { py: "14.85px" } }}
                      />
                    </Grid>
                    <Grid item xs={3} sm={2}>
                      <TextField
                        select
                        label="Idade"
                        value={holder.idade === undefined || holder.idade === null ? "" : holder.idade}
                        onChange={(e) => updateHolder(lot.id, i, "idade", Number(e.target.value))}
                        required
                        fullWidth
                      >
                        {idades.map((idade) => (
                          <MenuItem key={idade} value={idade}>{idade}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                  {ehPrimeiro && (
                    <Grid container spacing={2} mt={0.5}>
                      <Grid item xs={12} sm={7}>
                        <TextField
                          label="Email do comprador"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          fullWidth
                          sx={{ "& .MuiOutlinedInput-input": { py: "14.85px" } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          label="Telefone do comprador"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          required
                          fullWidth
                          sx={{ "& .MuiOutlinedInput-input": { py: "14.85px" } }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
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

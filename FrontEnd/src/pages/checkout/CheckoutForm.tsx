import { Box, Button, Card, CardContent, TextField, Typography, Alert, Divider, Grid, MenuItem } from "@mui/material";
import type { LotDto, TicketHolder } from "../../types";
import type { UseCheckoutFormReturn } from "./useCheckoutForm";

const idades = Array.from({ length: 100 }, (_, i) => i);

interface HolderFieldsProps {
  lot: LotDto;
  quantity: number;
  ehPrimeiroLoteGeral: boolean;
  form: UseCheckoutFormReturn;
}

// Campos de nome/idade (e email/telefone, conforme o evento) de cada
// titular de UM lote específico — renderizado logo abaixo da linha
// daquele lote na lista de ingressos, antes do próximo lote.
export function HolderFields({ lot, quantity, ehPrimeiroLoteGeral, form }: HolderFieldsProps) {
  const { holdersDoLote, updateHolder, exigirContatoTodosIngressos, mostrarCamposComprador, email, setEmail, telefone, setTelefone } = form;
  const holders = holdersDoLote(lot.id, quantity);

  return (
    <Box display="flex" flexDirection="column" sx={{ mt: 2, gap: { xs: 0.04, sm: 2 } }}>
      {holders.map((holder: TicketHolder, i: number) => {
        const ehPrimeiro = ehPrimeiroLoteGeral && i === 0;
        return (
          <Card key={`${lot.id}-${i}`} sx={{ border: { xs: "none", sm: "1px solid rgba(231, 234, 243, 0.9)" } }}>
            <CardContent
              sx={{
                px: { xs: 0.4, sm: 2 },
                py: { xs: 0.8, sm: 2 },
                "&:last-child": { pb: { xs: 0.8, sm: 3 } },
              }}
            >
              <Typography fontWeight={700} color="text.primary" mb={{ xs: 0.8, sm: 2 }} sx={{ fontSize: "0.9rem" }}>
                Ingresso {i + 1}
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}> — {lot.nome}</Box>
              </Typography>
              <Grid container spacing={{ xs: 0.4, sm: 2 }}>
                <Grid item xs={8.55} sm={10}>
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
                <Grid item xs={3.45} sm={2}>
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
              {exigirContatoTodosIngressos && (
                <Grid container spacing={2} mt={0.5}>
                  <Grid item xs={12} sm={7}>
                    <TextField
                      label="Email do titular"
                      type="email"
                      value={holder.email ?? ""}
                      onChange={(e) => updateHolder(lot.id, i, "email", e.target.value)}
                      required
                      fullWidth
                      sx={{ "& .MuiOutlinedInput-input": { py: "14.85px" } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="Telefone do titular"
                      value={holder.telefone ?? ""}
                      onChange={(e) => updateHolder(lot.id, i, "telefone", e.target.value)}
                      required
                      fullWidth
                      sx={{ "& .MuiOutlinedInput-input": { py: "14.85px" } }}
                    />
                  </Grid>
                </Grid>
              )}
              {ehPrimeiro && mostrarCamposComprador && (
                <Box sx={{ py: 0.5 }}>
                  <Grid container spacing={{ xs: 0.8, sm: 2 }} mt={0.5}>
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
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

interface CheckoutSummaryProps {
  form: UseCheckoutFormReturn;
}

// Total e botão "Finalizar compra" — únicos, cobrindo todos os lotes
// selecionados, renderizados depois do último lote na lista.
export function CheckoutSummary({ form }: CheckoutSummaryProps) {
  const { error, total, loading, handleSubmit } = form;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, pt: 3, borderTop: "1px solid rgba(231, 234, 243, 0.9)" }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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

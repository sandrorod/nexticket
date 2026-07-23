import { useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Container, Typography, Button, Box, Chip, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, Alert, Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getEventById, getLotsByEvent, cancelEvent, createLot, updateLot, type LotPayload } from "../../api/events";
import type { LotDto } from "../../types";
import { formatarData, formatarHora } from "../../utils/date";

const emptyLotForm: LotPayload = {
  nome: "",
  preco: 0,
  quantidade: 0,
  maximoPorUsuario: 4,
  dataInicio: "",
  dataFim: "",
};

function toLocalInput(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [lotDialogOpen, setLotDialogOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<LotDto | null>(null);
  const [lotForm, setLotForm] = useState<LotPayload>(emptyLotForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: event } = useQuery({ queryKey: ["event", id], queryFn: () => getEventById(id!), enabled: !!id });
  const { data: lots } = useQuery({ queryKey: ["lots", id], queryFn: () => getLotsByEvent(id!), enabled: !!id });

  if (!event) return null;

  const openNewLot = () => {
    setEditingLot(null);
    setLotForm(emptyLotForm);
    setError(null);
    setLotDialogOpen(true);
  };

  const openEditLot = (lot: LotDto) => {
    setEditingLot(lot);
    setLotForm({
      nome: lot.nome,
      preco: lot.preco,
      quantidade: lot.quantidade,
      maximoPorUsuario: lot.maximoPorUsuario,
      dataInicio: toLocalInput(lot.dataInicio),
      dataFim: toLocalInput(lot.dataFim),
    });
    setError(null);
    setLotDialogOpen(true);
  };

  const updateLotField = (field: keyof LotPayload) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setLotForm((f) => ({ ...f, [field]: value }));
  };

  const handleSaveLot = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...lotForm,
        dataInicio: new Date(lotForm.dataInicio).toISOString(),
        dataFim: new Date(lotForm.dataFim).toISOString(),
      };
      if (editingLot) {
        await updateLot(id!, editingLot.id, payload);
      } else {
        await createLot(id!, payload);
      }
      await queryClient.invalidateQueries({ queryKey: ["lots", id] });
      await queryClient.invalidateQueries({ queryKey: ["event", id] });
      setLotDialogOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.join(" ") ?? "Não foi possível salvar o lote.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!confirm("Tem certeza que deseja cancelar este evento?")) return;
    await cancelEvent(id!);
    await queryClient.invalidateQueries({ queryKey: ["event", id] });
    await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Chip label={event.status} size="small" sx={{ mb: 1, fontWeight: 700 }} />
          <Typography variant="h4" fontWeight={800} color="text.primary">{event.nome}</Typography>
          <Typography color="text.secondary">{event.local} · {formatarData(event.data)} às {formatarHora(event.hora)}</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button component={RouterLink} to={`/admin/eventos/${id}/editar`} variant="outlined" sx={{ borderRadius: "0.5rem" }}>Editar</Button>
          {event.status !== "Cancelado" && (
            <Button color="error" variant="outlined" onClick={handleCancelEvent} sx={{ borderRadius: "0.5rem" }}>Cancelar evento</Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={2} mb={4}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: "0.75rem", boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)" }} elevation={0}>
            <Typography variant="h5" fontWeight={700} color="text.primary">{event.totalIngressosVendidos}</Typography>
            <Typography variant="body2" color="text.secondary">Ingressos vendidos</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: "0.75rem", boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)" }} elevation={0}>
            <Typography variant="h5" fontWeight={700} color="primary.main">R$ {event.receitaTotal.toFixed(2)}</Typography>
            <Typography variant="body2" color="text.secondary">Receita total</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700} color="text.primary">Lotes</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={openNewLot} sx={{ borderRadius: "0.5rem" }}>Novo lote</Button>
      </Box>

      <Paper sx={{ borderRadius: "0.75rem", boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)" }} elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell align="right">Preço</TableCell>
              <TableCell align="right">Vendidos / Total</TableCell>
              <TableCell align="right">Máx. por usuário</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lots?.map((lot) => (
              <TableRow key={lot.id} hover>
                <TableCell>{lot.nome}</TableCell>
                <TableCell align="right">R$ {lot.preco.toFixed(2)}</TableCell>
                <TableCell align="right">{lot.quantidadeVendida} / {lot.quantidade}</TableCell>
                <TableCell align="right">{lot.maximoPorUsuario}</TableCell>
                <TableCell><Chip label={lot.status} size="small" sx={{ fontWeight: 700 }} /></TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEditLot(lot)}>Editar</Button>
                </TableCell>
              </TableRow>
            ))}
            {lots?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" textAlign="center" py={3}>
                    Nenhum lote cadastrado ainda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>

      <Dialog open={lotDialogOpen} onClose={() => setLotDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingLot ? "Editar lote" : "Novo lote"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12} sm={8}>
              <TextField label="Nome do lote" value={lotForm.nome} onChange={updateLotField("nome")} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Máximo por usuário"
                type="number"
                value={lotForm.maximoPorUsuario}
                onChange={updateLotField("maximoPorUsuario")}
                required
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Preço (R$)" type="number" value={lotForm.preco} onChange={updateLotField("preco")} required fullWidth inputProps={{ min: 0, step: 0.01 }} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Quantidade" type="number" value={lotForm.quantidade} onChange={updateLotField("quantidade")} required fullWidth inputProps={{ min: 1 }} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Início das vendas" type="datetime-local" value={lotForm.dataInicio} onChange={updateLotField("dataInicio")} required fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Fim das vendas" type="datetime-local" value={lotForm.dataFim} onChange={updateLotField("dataFim")} required fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLotDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveLot} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

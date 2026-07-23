import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Container, Typography, Button, Box, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getStaff, createStaff, deactivateStaff, reactivateStaff, type CreateStaffPayload } from "../../api/staff";

const emptyForm: CreateStaffPayload = { nome: "", email: "", senha: "", telefone: "" };

export default function StaffPage() {
  const queryClient = useQueryClient();
  const { data: staff, isLoading } = useQuery({ queryKey: ["staff"], queryFn: getStaff });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateStaffPayload>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (field: keyof CreateStaffPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const openDialog = () => {
    setForm(emptyForm);
    setError(null);
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    setError(null);
    setLoading(true);
    try {
      await createStaff(form);
      await queryClient.invalidateQueries({ queryKey: ["staff"] });
      setDialogOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.join(" ") ?? "Não foi possível criar o funcionário.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, ativo: boolean) => {
    if (ativo) {
      await deactivateStaff(id);
    } else {
      await reactivateStaff(id);
    }
    await queryClient.invalidateQueries({ queryKey: ["staff"] });
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ fontSize: "1.7rem" }}>Funcionários</Typography>
          <Typography variant="body2" color="text.secondary">
            Contas responsáveis apenas pela validação de ingressos.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openDialog} sx={{ borderRadius: "0.5rem" }}>
          Novo funcionário
        </Button>
      </Box>

      {isLoading && <Typography color="text.secondary">Carregando...</Typography>}

      {!isLoading && (
        <Paper sx={{ borderRadius: "0.75rem", boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)" }} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff?.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.nome}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.telefone}</TableCell>
                  <TableCell>
                    <Chip label={s.ativo ? "Ativo" : "Inativo"} size="small" color={s.ativo ? "success" : "default"} sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" color={s.ativo ? "error" : "success"} onClick={() => handleToggleActive(s.id, s.ativo)}>
                      {s.ativo ? "Desativar" : "Reativar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {staff?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary" textAlign="center" py={3}>
                      Nenhum funcionário cadastrado ainda.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo funcionário</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12} sm={7}>
              <TextField label="Nome" value={form.nome} onChange={update("nome")} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField label="Telefone" value={form.telefone} onChange={update("telefone")} required fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Email" type="email" value={form.email} onChange={update("email")} required fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Senha provisória"
                type="password"
                value={form.senha}
                onChange={update("senha")}
                required
                fullWidth
                helperText="Mínimo 8 caracteres, 1 maiúscula e 1 número"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={loading}>
            {loading ? "Criando..." : "Criar funcionário"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

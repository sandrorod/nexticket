import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Container, Typography, Button, Box, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Grid, useMediaQuery, TableContainer, InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import {
  getUsers, updateUser, promoverAdmin, removerAdmin, deactivateUser, reactivateUser,
} from "../../api/users";
import type { UserAccountDto } from "../../types";

const roleLabel: Record<string, string> = {
  Comprador: "Comprador",
  Administrador: "Administrador",
  Validador: "Validador",
  Master: "Master",
};

const roleColor: Record<string, "default" | "primary" | "secondary" | "warning"> = {
  Comprador: "default",
  Administrador: "primary",
  Validador: "secondary",
  Master: "warning",
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: users, isLoading } = useQuery({ queryKey: ["users"], queryFn: getUsers });

  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<UserAccountDto | null>(null);
  const [form, setForm] = useState({ nome: "", telefone: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return users ?? [];
    return (users ?? []).filter(
      (u) => u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo)
    );
  }, [users, busca]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const openEdit = (user: UserAccountDto) => {
    setEditando(user);
    setForm({ nome: user.nome, telefone: user.telefone });
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editando) return;
    setError(null);
    setLoading(true);
    try {
      await updateUser(editando.id, form);
      await invalidate();
      setEditando(null);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.join(" ") ?? "Não foi possível salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  const handlePromover = async (id: string) => {
    await promoverAdmin(id);
    await invalidate();
  };

  const handleRemover = async (id: string) => {
    await removerAdmin(id);
    await invalidate();
  };

  const handleToggleActive = async (id: string, ativo: boolean) => {
    if (ativo) {
      await deactivateUser(id);
    } else {
      await reactivateUser(id);
    }
    await invalidate();
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
      <Container sx={{ py: 4 }}>
        <Box mb={3}>
          <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ fontSize: "1.7rem" }}>Administradores</Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie todas as contas da plataforma e conceda ou remova acesso de administrador.
          </Typography>
        </Box>

        <TextField
          placeholder="Buscar por nome ou email"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 3, maxWidth: 400 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        {isLoading && <Typography color="text.secondary">Carregando...</Typography>}

        {!isLoading && (
          <Paper sx={{ borderRadius: "0.75rem", boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)" }} elevation={0}>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Tipo de conta</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuariosFiltrados.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.nome}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.telefone}</TableCell>
                      <TableCell>
                        <Chip label={roleLabel[u.role] ?? u.role} size="small" color={roleColor[u.role] ?? "default"} sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={u.ativo ? "Ativo" : "Inativo"} size="small" color={u.ativo ? "success" : "default"} sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="right">
                        {u.role === "Master" ? (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        ) : (
                          <Box display="flex" gap={1} justifyContent="flex-end" flexWrap="wrap">
                            {u.role === "Administrador" ? (
                              <>
                                <Button size="small" onClick={() => openEdit(u)}>Editar</Button>
                                <Button size="small" color="warning" onClick={() => handleRemover(u.id)}>Remover admin</Button>
                              </>
                            ) : (
                              <Button size="small" onClick={() => handlePromover(u.id)}>Tornar admin</Button>
                            )}
                            <Button size="small" color={u.ativo ? "error" : "success"} onClick={() => handleToggleActive(u.id, u.ativo)}>
                              {u.ativo ? "Desativar" : "Reativar"}
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography color="text.secondary" textAlign="center" py={3}>
                          Nenhuma conta encontrada.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>

      <Dialog open={!!editando} onClose={() => setEditando(null)} maxWidth="sm" fullWidth fullScreen={isSmallScreen}>
        <DialogTitle>Editar administrador</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12}>
              <TextField
                label="Nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Telefone"
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                required
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditando(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

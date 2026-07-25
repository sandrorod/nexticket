import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Box, Paper, TableContainer, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import { getAdminEvents, duplicateEvent, deleteEvent } from "../../api/events";
import { formatarData } from "../../utils/date";

const statusColor: Record<string, "success" | "default" | "error" | "warning"> = {
  Publicado: "success",
  Rascunho: "default",
  Cancelado: "error",
  Encerrado: "warning",
};

export default function AdminEventsListPage() {
  const { data: events, isLoading } = useQuery({ queryKey: ["admin-events"], queryFn: getAdminEvents });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [duplicandoId, setDuplicandoId] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const handleDuplicate = async (eventId: string) => {
    if (!confirm("Duplicar este evento? Um novo evento (com os mesmos lotes) será criado como cópia.")) return;
    setDuplicandoId(eventId);
    try {
      const created = await duplicateEvent(eventId);
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      navigate(`/admin/eventos/${created.id}`);
    } catch (err: any) {
      alert(err?.response?.data?.errors?.join(" ") ?? "Não foi possível duplicar o evento.");
    } finally {
      setDuplicandoId(null);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Excluir este evento definitivamente? Esta ação não pode ser desfeita.")) return;
    setExcluindoId(eventId);
    try {
      await deleteEvent(eventId);
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    } catch (err: any) {
      alert(err?.response?.data?.errors?.join(" ") ?? "Não foi possível excluir o evento.");
    } finally {
      setExcluindoId(null);
    }
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ fontSize: "1.7rem" }}>Meus eventos</Typography>
        <Button
          component={RouterLink}
          to="/admin/eventos/novo"
          variant="contained"
          startIcon={!isMobile ? <AddIcon /> : undefined}
          sx={{ borderRadius: "0.5rem", minWidth: isMobile ? 0 : undefined, px: isMobile ? 1.5 : undefined }}
        >
          {isMobile ? <AddIcon /> : "Novo evento"}
        </Button>
      </Box>

      {isLoading && <Typography color="text.secondary">Carregando...</Typography>}

      {!isLoading && (
        <Paper sx={{ borderRadius: "0.75rem", boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)" }} elevation={0}>
          <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Local</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ingressos vendidos</TableCell>
                <TableCell align="right">Receita</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events?.map((ev) => (
                <TableRow key={ev.id} hover>
                  <TableCell>{ev.nome}</TableCell>
                  <TableCell>{formatarData(ev.data)}</TableCell>
                  <TableCell>{ev.local}</TableCell>
                  <TableCell>
                    <Chip label={ev.status} size="small" color={statusColor[ev.status] ?? "default"} sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell align="right">{ev.totalIngressosVendidos}</TableCell>
                  <TableCell align="right">R$ {ev.receitaTotal.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <Button component={RouterLink} to={`/admin/eventos/${ev.id}`} size="small">
                        Gerenciar
                      </Button>
                      <Button
                        size="small"
                        disabled={duplicandoId === ev.id}
                        onClick={() => handleDuplicate(ev.id)}
                      >
                        {duplicandoId === ev.id ? "Duplicando..." : "Duplicar"}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={excluindoId === ev.id}
                        onClick={() => handleDelete(ev.id)}
                      >
                        {excluindoId === ev.id ? "Excluindo..." : "Excluir"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {events?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography color="text.secondary" textAlign="center" py={3}>
                      Nenhum evento cadastrado ainda.
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
    </Box>
  );
}

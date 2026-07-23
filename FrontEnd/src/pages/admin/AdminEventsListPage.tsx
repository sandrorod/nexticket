import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import {
  Container, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Box, Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getEvents } from "../../api/events";
import { formatarData } from "../../utils/date";

const statusColor: Record<string, "success" | "default" | "error" | "warning"> = {
  Publicado: "success",
  Rascunho: "default",
  Cancelado: "error",
  Encerrado: "warning",
};

export default function AdminEventsListPage() {
  const { data: events, isLoading } = useQuery({ queryKey: ["admin-events"], queryFn: getEvents });

  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Meus eventos</Typography>
        <Button component={RouterLink} to="/admin/eventos/novo" variant="contained" startIcon={<AddIcon />}>
          Novo evento
        </Button>
      </Box>

      {isLoading && <Typography>Carregando...</Typography>}

      {!isLoading && (
        <Paper variant="outlined">
          <Table>
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
                    <Chip label={ev.status} size="small" color={statusColor[ev.status] ?? "default"} />
                  </TableCell>
                  <TableCell align="right">{ev.totalIngressosVendidos}</TableCell>
                  <TableCell align="right">R$ {ev.receitaTotal.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Button component={RouterLink} to={`/admin/eventos/${ev.id}`} size="small">
                      Gerenciar
                    </Button>
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
        </Paper>
      )}
    </Container>
  );
}

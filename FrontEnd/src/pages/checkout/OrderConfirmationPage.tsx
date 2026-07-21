import { useParams, Link as RouterLink } from "react-router-dom";
import { Container, Typography, Paper, Box, Button, List, ListItem, ListItemText, Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import type { OrderDto } from "../../types";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order } = useQuery<OrderDto>({
    queryKey: ["order", id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  if (!order) return null;

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }} elevation={2}>
        <Typography variant="h5" fontWeight={700} mb={1}>Pedido confirmado!</Typography>
        <Chip label={order.statusPagamento} color={order.statusPagamento === "Pago" ? "success" : "warning"} sx={{ mb: 3 }} />

        <List>
          {order.items.map((item) => (
            <ListItem key={item.id} disableGutters>
              <ListItemText
                primary={`${item.lotNome} × ${item.quantidade}`}
                secondary={`R$ ${item.valorTotal.toFixed(2)}`}
              />
            </ListItem>
          ))}
        </List>

        <Box display="flex" justifyContent="space-between" mt={2} mb={3}>
          <Typography fontWeight={700}>Total</Typography>
          <Typography fontWeight={700}>R$ {order.valorTotal.toFixed(2)}</Typography>
        </Box>

        <Button component={RouterLink} to="/meus-ingressos" variant="contained" fullWidth>
          Ver meus ingressos
        </Button>
      </Paper>
    </Container>
  );
}

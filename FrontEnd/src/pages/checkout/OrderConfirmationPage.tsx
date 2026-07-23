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
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)", py: 6 }}>
    <Container maxWidth="sm">
      <Paper
        sx={{ p: 4, borderRadius: "0.75rem", boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)" }}
        elevation={0}
      >
        <Typography variant="h5" fontWeight={800} color="text.primary" mb={1}>Pedido confirmado!</Typography>
        <Chip
          label={order.statusPagamento}
          color={order.statusPagamento === "Pago" ? "success" : "warning"}
          sx={{ mb: 3, fontWeight: 700 }}
        />

        <List>
          {order.items.map((item) => (
            <ListItem key={item.id} disableGutters>
              <ListItemText
                primary={`${item.lotNome} × ${item.quantidade}`}
                secondary={`R$ ${item.valorTotal.toFixed(2)}`}
                primaryTypographyProps={{ color: "text.primary", fontWeight: 600 }}
              />
            </ListItem>
          ))}
        </List>

        <Box display="flex" justifyContent="space-between" mt={2} mb={3}>
          <Typography fontWeight={700} color="text.primary">Total</Typography>
          <Typography fontWeight={700} color="primary.main">R$ {order.valorTotal.toFixed(2)}</Typography>
        </Box>

        <Button component={RouterLink} to="/meus-ingressos" variant="contained" fullWidth sx={{ borderRadius: "0.5rem", py: 1.2 }}>
          Ver meus ingressos
        </Button>
      </Paper>
    </Container>
    </Box>
  );
}

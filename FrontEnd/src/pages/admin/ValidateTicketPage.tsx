import { useState } from "react";
import { Container, Typography, TextField, Button, Paper, Alert, Box } from "@mui/material";
import { api } from "../../api/client";
import type { ValidateTicketPreviewResponse } from "../../types";

export default function ValidateTicketPage() {
  const [token, setToken] = useState("");
  const [preview, setPreview] = useState<ValidateTicketPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    try {
      const { data } = await api.post<ValidateTicketPreviewResponse>("/tickets/validate/preview", { token });
      setPreview(data);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data } = await api.post<ValidateTicketPreviewResponse>("/tickets/validate/confirm", { token });
      setPreview(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Validar ingresso</Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField label="Token do QR Code" value={token} onChange={(e) => setToken(e.target.value)} fullWidth />
        <Button variant="outlined" onClick={handlePreview} disabled={loading || !token}>Buscar</Button>
      </Box>

      {preview && (
        <Paper sx={{ p: 3 }} elevation={2}>
          <Alert severity={preview.valido ? "success" : "error"} sx={{ mb: 2 }}>
            {preview.mensagem}
          </Alert>

          {preview.nome && (
            <>
              <Typography><strong>Nome:</strong> {preview.nome}</Typography>
              <Typography><strong>Evento:</strong> {preview.eventoNome}</Typography>
              <Typography><strong>Horário:</strong> {preview.hora}</Typography>
              <Typography><strong>Status:</strong> {preview.status}</Typography>
              {preview.dataUso && <Typography><strong>Usado em:</strong> {preview.dataUso}</Typography>}
            </>
          )}

          {preview.valido && (
            <Button variant="contained" color="success" fullWidth sx={{ mt: 2 }} onClick={handleConfirm} disabled={loading}>
              VALIDAR
            </Button>
          )}
        </Paper>
      )}
    </Container>
  );
}

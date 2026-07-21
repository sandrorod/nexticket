import { useState } from "react";
import {
  Container, Typography, TextField, Button, Paper, Alert, Box,
  ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { api } from "../../api/client";
import type { ValidateTicketPreviewResponse } from "../../types";
import QrScanner from "../../components/QrScanner";

type Mode = "camera" | "manual";

export default function ValidateTicketPage() {
  const [mode, setMode] = useState<Mode>("camera");
  const [token, setToken] = useState("");
  const [preview, setPreview] = useState<ValidateTicketPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPreview = async (scannedToken: string) => {
    setLoading(true);
    setToken(scannedToken);
    try {
      const { data } = await api.post<ValidateTicketPreviewResponse>("/tickets/validate/preview", { token: scannedToken });
      setPreview(data);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => fetchPreview(token);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data } = await api.post<ValidateTicketPreviewResponse>("/tickets/validate/confirm", { token });
      setPreview(data);
    } finally {
      setLoading(false);
    }
  };

  const handleNovaLeitura = () => {
    setPreview(null);
    setToken("");
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Validar ingresso</Typography>

      <ToggleButtonGroup
        exclusive
        value={mode}
        onChange={(_, v) => v && setMode(v)}
        sx={{ mb: 3 }}
        fullWidth
      >
        <ToggleButton value="camera"><QrCodeScannerIcon sx={{ mr: 1 }} fontSize="small" />Câmera</ToggleButton>
        <ToggleButton value="manual"><KeyboardIcon sx={{ mr: 1 }} fontSize="small" />Digitar</ToggleButton>
      </ToggleButtonGroup>

      {mode === "camera" && !preview && (
        <QrScanner active={mode === "camera" && !preview} onScan={fetchPreview} />
      )}

      {mode === "manual" && !preview && (
        <Box display="flex" gap={2} mb={3}>
          <TextField label="Token do QR Code" value={token} onChange={(e) => setToken(e.target.value)} fullWidth />
          <Button variant="outlined" onClick={handleManualSearch} disabled={loading || !token}>Buscar</Button>
        </Box>
      )}

      {preview && (
        <Paper sx={{ p: 3, mt: 3 }} elevation={2}>
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

          {preview.valido && preview.status !== "Utilizado" && (
            <Button variant="contained" color="success" fullWidth sx={{ mt: 2 }} onClick={handleConfirm} disabled={loading}>
              VALIDAR
            </Button>
          )}

          <Button variant="text" fullWidth sx={{ mt: 1 }} onClick={handleNovaLeitura}>
            Ler próximo ingresso
          </Button>
        </Paper>
      )}
    </Container>
  );
}

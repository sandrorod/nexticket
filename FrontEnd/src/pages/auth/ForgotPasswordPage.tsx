import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, Paper, TextField, Typography, Alert, Link } from "@mui/material";
import { forgotPassword } from "../../api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.[0] ?? "Não foi possível enviar o email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)", display: "flex", alignItems: "center" }}>
    <Container maxWidth="xs">
      <Paper
        sx={{ p: { xs: 3, md: 5 }, borderRadius: "0.75rem", boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)" }}
        elevation={0}
      >
        <Typography variant="h5" fontWeight={800} color="text.primary" mb={1} textAlign="center">
          Esqueceu sua senha?
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3} textAlign="center">
          Informe seu email e enviaremos um link para redefinir sua senha.
        </Typography>

        {sent ? (
          <Alert severity="success">
            Se este email estiver cadastrado, você receberá um link de redefinição em instantes.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ borderRadius: "0.5rem", py: 1.2 }}>
              {loading ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
          </Box>
        )}

        <Typography variant="body2" mt={3} textAlign="center">
          <Link component={RouterLink} to="/login" color="primary.main">Voltar ao login</Link>
        </Typography>
      </Paper>
    </Container>
    </Box>
  );
}

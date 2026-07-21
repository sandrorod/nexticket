import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, Paper, TextField, Typography, Alert, Link } from "@mui/material";
import { forgotPassword } from "../../api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }} elevation={2}>
        <Typography variant="h5" fontWeight={700} mb={1}>
          Esqueceu sua senha?
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Informe seu email e enviaremos um link para redefinir sua senha.
        </Typography>

        {sent ? (
          <Alert severity="success">
            Se este email estiver cadastrado, você receberá um link de redefinição em instantes.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
          </Box>
        )}

        <Typography variant="body2" mt={3} textAlign="center">
          <Link component={RouterLink} to="/login">Voltar ao login</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

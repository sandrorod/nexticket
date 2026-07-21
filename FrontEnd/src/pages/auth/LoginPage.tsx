import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, Paper, TextField, Typography, Alert, Link } from "@mui/material";
import { loginUser } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await loginUser({ email, senha });
      setAuth(auth);
      navigate("/eventos");
    } catch {
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }} elevation={2}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          Entrar no NexTicket
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
          <TextField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Box>
        <Typography variant="body2" mt={3} textAlign="center">
          Não tem conta? <Link component={RouterLink} to="/registro">Cadastre-se</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

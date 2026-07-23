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
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)", display: "flex", alignItems: "center" }}>
      <Container maxWidth="xs">
        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: "0.75rem",
            boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)",
          }}
          elevation={0}
        >
          <Typography variant="h5" fontWeight={800} color="text.primary" mb={3} textAlign="center">
            Entrar no NexTicket
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            <TextField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required fullWidth />
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ borderRadius: "0.5rem", py: 1.2 }}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </Box>
          <Typography variant="body2" mt={2} textAlign="center">
            <Link component={RouterLink} to="/esqueci-senha" color="primary.main">Esqueceu sua senha?</Link>
          </Typography>
          <Typography variant="body2" mt={1} textAlign="center" color="text.secondary">
            Não tem conta? <Link component={RouterLink} to="/registro" color="primary.main">Cadastre-se</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

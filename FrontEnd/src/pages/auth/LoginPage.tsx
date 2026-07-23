import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, Paper, TextField, Typography, Alert, Divider } from "@mui/material";
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
          <Typography variant="h5" fontWeight={800} color="text.primary" mb={3}>
            Acessar conta
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth size="medium" />
            <TextField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required fullWidth />
            <Typography variant="body2" textAlign="right">
              <Box component={RouterLink} to="/esqueci-senha" sx={{ color: "primary.main", textDecoration: "none" }}>
                Esqueceu sua senha?
              </Box>
            </Typography>
            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth sx={{ borderRadius: "0.5rem", py: 1.4 }}>
              {loading ? "Entrando..." : "Acessar"}
            </Button>

            <Divider sx={{ my: 1 }}>
              <Typography variant="body2" color="text.secondary">Ainda não tem conta?</Typography>
            </Divider>

            <Button
              component={RouterLink}
              to="/registro"
              variant="text"
              fullWidth
              sx={{
                borderRadius: "0.5rem",
                py: 1.4,
                backgroundColor: "rgba(55, 125, 255, 0.08)",
                color: "primary.main",
                fontWeight: 700,
                "&:hover": { backgroundColor: "rgba(55, 125, 255, 0.16)" },
              }}
            >
              Cadastrar-se
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

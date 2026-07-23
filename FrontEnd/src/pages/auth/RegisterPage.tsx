import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, Paper, TextField, Typography, Alert, Link, Grid } from "@mui/material";
import { registerUser } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", telefone: "", cpf: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await registerUser({ ...form, cpf: form.cpf || undefined });
      setAuth(auth);
      navigate("/eventos");
    } catch (err: any) {
      setError(err?.response?.data?.errors?.[0] ?? "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)", py: 6 }}>
    <Container maxWidth="sm">
      <Paper
        sx={{ p: { xs: 3, md: 5 }, borderRadius: "0.75rem", boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)" }}
        elevation={0}
      >
        <Typography variant="h5" fontWeight={800} color="text.primary" mb={3}>
          Criar sua conta
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField label="Nome" value={form.nome} onChange={update("nome")} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField label="Telefone" value={form.telefone} onChange={update("telefone")} required fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Email" type="email" value={form.email} onChange={update("email")} required fullWidth />
            </Grid>
            <Grid item xs={12} sm={7}>
              <TextField
                label="Senha"
                type="password"
                value={form.senha}
                onChange={update("senha")}
                required
                fullWidth
                helperText="Mínimo 8 caracteres, 1 maiúscula e 1 número"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField label="CPF (opcional)" value={form.cpf} onChange={update("cpf")} fullWidth />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mt: 3, borderRadius: "0.5rem", py: 1.2 }}>
            {loading ? "Criando..." : "Criar conta"}
          </Button>
        </Box>
        <Typography variant="body2" mt={3} textAlign="center" color="text.secondary">
          Já tem conta? <Link component={RouterLink} to="/login" color="primary.main">Entrar</Link>
        </Typography>
      </Paper>
    </Container>
    </Box>
  );
}

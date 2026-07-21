import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, Paper, TextField, Typography, Alert, Link } from "@mui/material";
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
    <Container maxWidth="xs" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }} elevation={2}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          Criar conta
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField label="Nome" value={form.nome} onChange={update("nome")} required fullWidth />
          <TextField label="Email" type="email" value={form.email} onChange={update("email")} required fullWidth />
          <TextField label="Senha" type="password" value={form.senha} onChange={update("senha")} required fullWidth helperText="Mínimo 8 caracteres, 1 maiúscula e 1 número" />
          <TextField label="Telefone" value={form.telefone} onChange={update("telefone")} required fullWidth />
          <TextField label="CPF (opcional)" value={form.cpf} onChange={update("cpf")} fullWidth />
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </Button>
        </Box>
        <Typography variant="body2" mt={3} textAlign="center">
          Já tem conta? <Link component={RouterLink} to="/login">Entrar</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

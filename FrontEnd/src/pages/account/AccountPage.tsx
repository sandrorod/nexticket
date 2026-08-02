import { useState } from "react";
import { Box, Container, Typography, Card, CardContent, Stack, Chip, TextField, Button, Alert } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import { useAuthStore } from "../../store/authStore";
import { changePassword } from "../../api/auth";

const roleLabel: Record<string, string> = {
  Comprador: "Comprador",
  Administrador: "Administrador",
  Validador: "Validador",
  Master: "Master",
};

export default function AccountPage() {
  const { nome, email, role } = useAuthStore();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(senhaAtual, novaSenha);
      setSuccess(true);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err: any) {
      setError(err?.response?.data?.errors?.join(" ") ?? "Não foi possível alterar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary" mb={3} sx={{ fontSize: "1.7rem" }}>
          Minha conta
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <PersonIcon sx={{ color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Nome</Typography>
                  <Typography variant="body1" color="text.primary" fontWeight={600}>{nome}</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <EmailIcon sx={{ color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1" color="text.primary" fontWeight={600}>{email}</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <BadgeIcon sx={{ color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Tipo de conta</Typography>
                  <Chip label={roleLabel[role ?? ""] ?? role} size="small" sx={{ fontWeight: 700 }} />
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing="0.04em" sx={{ display: "block", mb: 2 }}>
              Alterar senha
            </Typography>

            <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">Senha alterada com sucesso.</Alert>}
              <TextField
                label="Senha atual"
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                fullWidth
                helperText="Deixe em branco se você nunca definiu uma senha (ex: conta criada com Google)"
              />
              <TextField
                label="Nova senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                fullWidth
                helperText="Mínimo 8 caracteres, 1 maiúscula e 1 número"
              />
              <TextField
                label="Confirmar nova senha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={loading} sx={{ borderRadius: "0.5rem", py: 1.2, alignSelf: "flex-start", px: 3 }}>
                {loading ? "Salvando..." : "Alterar senha"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

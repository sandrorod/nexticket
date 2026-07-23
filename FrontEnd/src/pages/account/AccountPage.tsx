import { Box, Container, Typography, Card, CardContent, Stack, Chip } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import { useAuthStore } from "../../store/authStore";

const roleLabel: Record<string, string> = {
  Comprador: "Comprador",
  Administrador: "Administrador",
  Validador: "Validador",
};

export default function AccountPage() {
  const { nome, email, role } = useAuthStore();

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary" mb={3}>
          Minha conta
        </Typography>

        <Card>
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
      </Container>
    </Box>
  );
}

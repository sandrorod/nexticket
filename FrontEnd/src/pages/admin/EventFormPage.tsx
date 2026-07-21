import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container, Typography, TextField, Button, Paper, Box, Alert, Grid, Divider } from "@mui/material";
import { getEventById, createEvent, updateEvent, type EventPayload } from "../../api/events";
import ImageUpload from "../../components/ImageUpload";

const emptyForm: EventPayload = {
  nome: "",
  descricao: "",
  data: "",
  hora: "",
  local: "",
  mapaUrl: "",
  imagemUrl: "",
  transmissaoUrl: "",
  maximoPorCpf: 4,
  maximoPorUsuario: 4,
};

export default function EventFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<EventPayload>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        nome: existing.nome,
        descricao: existing.descricao,
        data: existing.data,
        hora: existing.hora.slice(0, 5),
        local: existing.local,
        mapaUrl: existing.mapaUrl ?? "",
        imagemUrl: existing.imagemUrl ?? "",
        transmissaoUrl: existing.transmissaoUrl ?? "",
        maximoPorCpf: existing.maximoPorCpf,
        maximoPorUsuario: existing.maximoPorUsuario,
      });
    }
  }, [existing]);

  const update = (field: keyof EventPayload) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleImageChange = (url: string | undefined) => {
    setForm((f) => ({ ...f, imagemUrl: url ?? "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        hora: form.hora.length === 5 ? `${form.hora}:00` : form.hora,
        mapaUrl: form.mapaUrl || undefined,
        imagemUrl: form.imagemUrl || undefined,
        transmissaoUrl: form.transmissaoUrl || undefined,
      };
      const result = isEdit ? await updateEvent(id!, payload) : await createEvent(payload);
      navigate(`/admin/eventos/${result.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.join(" ") ?? "Não foi possível salvar o evento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        {isEdit ? "Editar evento" : "Novo evento"}
      </Typography>

      <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }} elevation={0} variant="outlined">
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Typography variant="overline" color="text.secondary">Informações do evento</Typography>
              <Grid container spacing={2} mt={0.5}>
                <Grid item xs={12}>
                  <TextField label="Nome do evento" value={form.nome} onChange={update("nome")} required fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Descrição" value={form.descricao} onChange={update("descricao")} required fullWidth multiline minRows={4} />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField label="Local" value={form.local} onChange={update("local")} required fullWidth />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField label="Data" type="date" value={form.data} onChange={update("data")} required fullWidth InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField label="Hora" type="time" value={form.hora} onChange={update("hora")} required fullWidth InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={5}>
              <Typography variant="overline" color="text.secondary">Capa do evento</Typography>
              <Box mt={0.5}>
                <ImageUpload value={form.imagemUrl || undefined} onChange={handleImageChange} />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="overline" color="text.secondary">Links adicionais (opcional)</Typography>
          <Grid container spacing={2} mt={0.5} mb={4}>
            <Grid item xs={12} sm={6}>
              <TextField label="URL do mapa" value={form.mapaUrl} onChange={update("mapaUrl")} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="URL da transmissão" value={form.transmissaoUrl} onChange={update("transmissaoUrl")} fullWidth />
            </Grid>
          </Grid>

          <Typography variant="overline" color="text.secondary">Limites de compra</Typography>
          <Grid container spacing={2} mt={0.5} mb={4}>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Máximo por CPF"
                type="number"
                value={form.maximoPorCpf}
                onChange={update("maximoPorCpf")}
                required
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Máximo por usuário"
                type="number"
                value={form.maximoPorUsuario}
                onChange={update("maximoPorUsuario")}
                required
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="text" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ px: 4 }}>
              {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar evento"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

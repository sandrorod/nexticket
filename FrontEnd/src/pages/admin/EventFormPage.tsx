import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container, Typography, TextField, Button, Paper, Box, Alert, Grid } from "@mui/material";
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
        hora: existing.hora,
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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        {isEdit ? "Editar evento" : "Novo evento"}
      </Typography>

      <Paper sx={{ p: 4 }} elevation={2}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField label="Nome do evento" value={form.nome} onChange={update("nome")} required fullWidth />
          <TextField label="Descrição" value={form.descricao} onChange={update("descricao")} required fullWidth multiline minRows={3} />
          <TextField label="Local" value={form.local} onChange={update("local")} required fullWidth />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField label="Data" type="date" value={form.data} onChange={update("data")} required fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Hora" type="time" value={form.hora} onChange={update("hora")} required fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>

          <ImageUpload value={form.imagemUrl || undefined} onChange={handleImageChange} />

          <TextField label="URL do mapa (opcional)" value={form.mapaUrl} onChange={update("mapaUrl")} fullWidth />
          <TextField label="URL da transmissão (opcional)" value={form.transmissaoUrl} onChange={update("transmissaoUrl")} fullWidth />

          <Grid container spacing={2}>
            <Grid item xs={6}>
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
            <Grid item xs={6}>
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

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar evento"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

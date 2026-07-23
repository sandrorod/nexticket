import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Container, Typography, TextField, Button, Paper, Box, Alert, Grid, Divider,
  IconButton, MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { getEventById, createEvent, updateEvent, type EventPayload } from "../../api/events";
import ImageUpload from "../../components/ImageUpload";

const classificacoes = ["Livre", "10", "12", "14", "16", "18"];

const emptyForm: EventPayload = {
  nome: "",
  descricao: "",
  data: "",
  hora: "",
  local: "",
  mapaUrl: "",
  imagemUrl: "",
  transmissaoUrl: "",
  vendaInicio: "",
  vendaFim: "",
  maximoPorCpf: 4,
  maximoPorUsuario: 4,
  cep: "",
  endereco: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  classificacao: "Livre",
  contatoWhatsapp: "",
  contatoTelefone: "",
  contatoEmail: "",
  orientacoesGerais: "",
};

export default function EventFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<EventPayload>(emptyForm);
  const [orientacoes, setOrientacoes] = useState<string[]>([""]);
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
        vendaInicio: existing.vendaInicio.slice(0, 16),
        vendaFim: existing.vendaFim.slice(0, 16),
        maximoPorCpf: existing.maximoPorCpf,
        maximoPorUsuario: existing.maximoPorUsuario,
        cep: existing.cep ?? "",
        endereco: existing.endereco ?? "",
        numero: existing.numero ?? "",
        bairro: existing.bairro ?? "",
        cidade: existing.cidade ?? "",
        estado: existing.estado ?? "",
        classificacao: existing.classificacao ?? "Livre",
        contatoWhatsapp: existing.contatoWhatsapp ?? "",
        contatoTelefone: existing.contatoTelefone ?? "",
        contatoEmail: existing.contatoEmail ?? "",
        orientacoesGerais: existing.orientacoesGerais ?? "",
      });
      setOrientacoes(
        existing.orientacoesGerais ? existing.orientacoesGerais.split("\n").filter(Boolean) : [""]
      );
    }
  }, [existing]);

  const update = (field: keyof EventPayload) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const updateOrientacao = (index: number, value: string) => {
    setOrientacoes((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addOrientacao = () => setOrientacoes((prev) => [...prev, ""]);

  const removeOrientacao = (index: number) =>
    setOrientacoes((prev) => prev.filter((_, i) => i !== index));

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
        vendaInicio: new Date(form.vendaInicio).toISOString(),
        vendaFim: new Date(form.vendaFim).toISOString(),
        cep: form.cep || undefined,
        endereco: form.endereco || undefined,
        numero: form.numero || undefined,
        bairro: form.bairro || undefined,
        cidade: form.cidade || undefined,
        estado: form.estado || undefined,
        contatoWhatsapp: form.contatoWhatsapp || undefined,
        contatoTelefone: form.contatoTelefone || undefined,
        contatoEmail: form.contatoEmail || undefined,
        orientacoesGerais: orientacoes.filter((o) => o.trim() !== "").join("\n") || undefined,
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
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} color="text.primary" mb={3}>
        {isEdit ? "Editar evento" : "Novo evento"}
      </Typography>

      <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: "0.75rem", boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)" }} elevation={0}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="overline" color="text.secondary">Informações do evento</Typography>
              <Grid container spacing={2} mt={0.5}>
                <Grid item xs={12} sm={8}>
                  <TextField label="Nome do evento" value={form.nome} onChange={update("nome")} required fullWidth />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Classificação"
                    select
                    value={form.classificacao}
                    onChange={update("classificacao")}
                    fullWidth
                  >
                    {classificacoes.map((c) => (
                      <MenuItem key={c} value={c}>{c === "Livre" ? "Livre" : `+${c}`}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField label="Hora" type="time" value={form.hora} onChange={update("hora")} required fullWidth InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField label="Data" type="date" value={form.data} onChange={update("data")} required fullWidth InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Nome do local" value={form.local} onChange={update("local")} required fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Descrição" value={form.descricao} onChange={update("descricao")} required fullWidth multiline minRows={4} />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="overline" color="text.secondary">Capa do evento</Typography>
              <Box mt={0.5}>
                <ImageUpload value={form.imagemUrl || undefined} onChange={handleImageChange} />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="overline" color="text.secondary">Localização</Typography>
          <Grid container spacing={2} mt={0.5} mb={4}>
            <Grid item xs={12} sm={4} md={2}>
              <TextField label="CEP" value={form.cep} onChange={update("cep")} fullWidth />
            </Grid>
            <Grid item xs={12} sm={8} md={6}>
              <TextField label="Endereço" value={form.endereco} onChange={update("endereco")} fullWidth />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField label="Número" value={form.numero} onChange={update("numero")} fullWidth />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField label="Bairro" value={form.bairro} onChange={update("bairro")} fullWidth />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField label="Cidade" value={form.cidade} onChange={update("cidade")} fullWidth />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField label="Estado (UF)" value={form.estado} onChange={update("estado")} fullWidth inputProps={{ maxLength: 2 }} />
            </Grid>
            <Grid item xs={12} md={7}>
              <TextField label="URL do mapa" value={form.mapaUrl} onChange={update("mapaUrl")} fullWidth />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="overline" color="text.secondary">Contato do organizador</Typography>
          <Grid container spacing={2} mt={0.5} mb={4}>
            <Grid item xs={12} sm={4}>
              <TextField label="WhatsApp" value={form.contatoWhatsapp} onChange={update("contatoWhatsapp")} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Telefone" value={form.contatoTelefone} onChange={update("contatoTelefone")} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Email" type="email" value={form.contatoEmail} onChange={update("contatoEmail")} fullWidth />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="overline" color="text.secondary">Orientações gerais</Typography>
          <Box mt={1} mb={4}>
            {orientacoes.map((orientacao, i) => (
              <Box key={i} display="flex" gap={1} mb={1.5} alignItems="center">
                <TextField
                  value={orientacao}
                  onChange={(e) => updateOrientacao(i, e.target.value)}
                  placeholder="Ex: É obrigatória a apresentação de documento oficial com foto."
                  fullWidth
                />
                <IconButton onClick={() => removeOrientacao(i)} disabled={orientacoes.length === 1}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={addOrientacao} sx={{ borderRadius: "0.5rem" }}>
              Adicionar orientação
            </Button>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="overline" color="text.secondary">Período de venda</Typography>
          <Grid container spacing={2} mt={0.5} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Início das vendas"
                type="datetime-local"
                value={form.vendaInicio}
                onChange={update("vendaInicio")}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Fim das vendas"
                type="datetime-local"
                value={form.vendaFim}
                onChange={update("vendaFim")}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={3}>
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
            <Grid item xs={6} sm={3} md={3}>
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

          <Typography variant="overline" color="text.secondary">Links adicionais (opcional)</Typography>
          <Grid container spacing={2} mt={0.5} mb={4}>
            <Grid item xs={12} sm={6}>
              <TextField label="URL da transmissão" value={form.transmissaoUrl} onChange={update("transmissaoUrl")} fullWidth />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="text" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ px: 4, borderRadius: "0.5rem" }}>
              {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar evento"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
    </Box>
  );
}

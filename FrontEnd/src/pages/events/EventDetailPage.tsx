import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box, Container, Typography, Card, CardContent, Button, IconButton,
  Divider, Alert, Grid, Stack, Chip,
} from "@mui/material";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MapIcon from "@mui/icons-material/Map";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { getEventById, getLotsByEvent } from "../../api/events";
import type { LotDto } from "../../types";
import CheckoutForm from "../checkout/CheckoutForm";
import { formatarData, formatarHora } from "../../utils/date";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});

  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id!),
    enabled: !!id,
  });

  const { data: lots } = useQuery({
    queryKey: ["lots", id],
    queryFn: () => getLotsByEvent(id!),
    enabled: !!id,
  });

  if (!event) return null;

  const setQuantidade = (lot: LotDto, value: number) => {
    const max = Math.min(lot.maximoPorUsuario, lot.quantidadeDisponivel, 10);
    setQuantidades((prev) => ({ ...prev, [lot.id]: Math.max(0, Math.min(value, max)) }));
  };

  const loteSelecionado = lots?.find((l) => (quantidades[l.id] ?? 0) > 0);
  const quantidadeSelecionada = loteSelecionado ? quantidades[loteSelecionado.id] : 0;

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
      <Container maxWidth="xl" sx={{ py: 4, pb: 6 }}>
        <Grid container spacing={3}>
          {/* Coluna esquerda */}
          <Grid item xs={12} md={3}>
            {event.imagemUrl && (
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  mb: 3,
                  boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)",
                }}
              >
                <Box component="img" src={event.imagemUrl} alt={event.nome} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
            )}

            <Stack spacing={1} mb={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
                <ScheduleIcon sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
                <Typography variant="body2" color="text.primary">
                  {formatarData(event.data)} · {formatarHora(event.hora)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <LocationOnIcon sx={{ fontSize: "1.1rem", color: "text.secondary", mt: "1px" }} />
                <Typography variant="body2" color="text.primary">{event.local}</Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1.5} mb={1} justifyContent="flex-start">
              <IconButton sx={{ backgroundColor: "rgba(55, 125, 255, 0.08)", color: "primary.main" }}>
                <FacebookIcon />
              </IconButton>
              <IconButton sx={{ backgroundColor: "rgba(0, 166, 80, 0.08)", color: "#00a650" }}>
                <WhatsAppIcon />
              </IconButton>
            </Stack>
            <Typography variant="caption" display="block" textAlign="left" color="text.secondary" mb={3}>
              Compartilhe este evento
            </Typography>

            <Card sx={{ p: 2.5, mb: 3 }}>
              <Typography variant="overline" fontWeight={700} color="primary.main" letterSpacing="0.04em" sx={{ display: "block", textAlign: "left" }}>
                Localização
              </Typography>
              <Typography variant="body2" color="text.primary" mt={1} sx={{ textAlign: "left", fontSize: "0.7875rem" }}>
                <strong>Local:</strong> {event.local}
              </Typography>
              {(event.endereco || event.cidade) && (
                <Typography variant="body2" color="text.secondary" mt={0.5} sx={{ textAlign: "left", fontSize: "0.7875rem" }}>
                  <strong>Endereço:</strong> {[
                    event.endereco && event.numero ? `${event.endereco}, ${event.numero}` : event.endereco,
                    event.bairro,
                    event.cidade && event.estado ? `${event.cidade}/${event.estado}` : event.cidade,
                    event.cep,
                  ].filter(Boolean).join(" — ")}
                </Typography>
              )}
            </Card>

            {event.mapaUrl && (
              <Button
                href={event.mapaUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<MapIcon />}
                fullWidth
                sx={{
                  mb: 3,
                  py: 1.2,
                  borderRadius: "0.5rem",
                  backgroundColor: "rgba(55, 125, 255, 0.08)",
                  color: "primary.main",
                  fontWeight: 700,
                  "&:hover": { backgroundColor: "rgba(55, 125, 255, 0.16)" },
                }}
              >
                Ver mapa de setores
              </Button>
            )}

            {(event.contatoWhatsapp || event.contatoTelefone || event.contatoEmail) && (
              <Card sx={{ p: 2.5, mb: 3 }}>
                <Typography variant="overline" fontWeight={700} color="primary.main" letterSpacing="0.04em" sx={{ display: "block", textAlign: "left" }}>
                  Contato
                </Typography>
                <Stack spacing={1} mt={1.5}>
                  {event.contatoWhatsapp && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WhatsAppIcon sx={{ fontSize: "1.1rem", color: "#00a650" }} />
                      <Typography variant="body2" color="text.primary">{event.contatoWhatsapp}</Typography>
                    </Stack>
                  )}
                  {event.contatoTelefone && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
                      <Typography variant="body2" color="text.primary">{event.contatoTelefone}</Typography>
                    </Stack>
                  )}
                  {event.contatoEmail && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
                      <Typography variant="body2" color="text.primary">{event.contatoEmail}</Typography>
                    </Stack>
                  )}
                </Stack>
              </Card>
            )}
          </Grid>

          {/* Coluna direita */}
          <Grid item xs={12} md={9}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {event.nome}
              </Typography>
              {event.classificacao && event.classificacao !== "Livre" && (
                <Chip
                  label={`+${event.classificacao}`}
                  size="small"
                  sx={{ backgroundColor: "#132144", color: "#fff", fontWeight: 700 }}
                />
              )}
            </Stack>
            <Typography variant="body1" color="primary.main" fontWeight={600} mb={3}>
              {formatarData(event.data).toUpperCase()} · {formatarHora(event.hora)}
            </Typography>

            {event.transmissaoUrl && (
              <Alert
                icon={<LiveTvIcon />}
                severity="info"
                action={
                  <Button color="inherit" size="small" href={event.transmissaoUrl} target="_blank" rel="noopener noreferrer">
                    Assistir
                  </Button>
                }
                sx={{ mb: 3 }}
              >
                Este evento possui transmissão ao vivo.
              </Alert>
            )}

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing="0.04em" sx={{ display: "block", textAlign: "left" }}>
                  Ingressos
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack divider={<Divider />} spacing={2}>
                  {lots?.map((lot) => {
                    const qtd = quantidades[lot.id] ?? 0;
                    const max = Math.min(lot.maximoPorUsuario, lot.quantidadeDisponivel, 10);
                    return (
                      <Box key={lot.id} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                        <Box>
                          <Typography fontWeight={700} color="text.primary" sx={{ textTransform: "uppercase", fontSize: "0.9rem", letterSpacing: "0.01em" }}>
                            {lot.nome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                            {lot.quantidadeDisponivel > 0 ? `${lot.quantidadeDisponivel} disponíveis` : "Esgotado"}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography fontWeight={700} color="text.primary">R$ {lot.preco.toFixed(2)}</Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <IconButton
                              size="small"
                              disabled={qtd === 0}
                              onClick={() => setQuantidade(lot, qtd - 1)}
                              sx={{ border: "1px solid rgba(231, 234, 243, 0.95)" }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ minWidth: 20, textAlign: "center" }}>{qtd}</Typography>
                            <IconButton
                              size="small"
                              disabled={qtd >= max || lot.quantidadeDisponivel === 0}
                              onClick={() => setQuantidade(lot, qtd + 1)}
                              sx={{ backgroundColor: "primary.main", color: "#fff", "&:hover": { backgroundColor: "primary.dark" } }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing="0.04em" sx={{ display: "block", textAlign: "left" }}>
                  Informações sobre o evento
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-line", lineHeight: 1.8, textAlign: "left" }}>{event.descricao}</Typography>
              </CardContent>
            </Card>

            {event.orientacoesGerais && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing="0.04em" sx={{ display: "block", textAlign: "left" }}>
                    Orientações gerais
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {event.orientacoesGerais.split("\n").filter(Boolean).map((linha, i) => (
                      <Typography key={i} component="li" variant="body2" color="text.primary" sx={{ mb: 1.2, textAlign: "left" }}>
                        {linha}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {loteSelecionado && quantidadeSelecionada > 0 && (
              <CheckoutForm event={event} lot={loteSelecionado} quantity={quantidadeSelecionada} />
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

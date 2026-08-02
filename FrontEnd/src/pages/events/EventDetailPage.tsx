import { useMemo, useState } from "react";
import { useParams, useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box, Container, Typography, Card, CardContent, Button, IconButton,
  Divider, Alert, Grid, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MapIcon from "@mui/icons-material/Map";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { getEventById, getLotsByEvent } from "../../api/events";
import { getMyTickets } from "../../api/orders";
import type { LotDto } from "../../types";
import { HolderFields, CheckoutSummary } from "../checkout/CheckoutForm";
import { useCheckoutForm } from "../checkout/useCheckoutForm";
import { formatarData, formatarHora } from "../../utils/date";
import { paraLinkWhatsapp } from "../../utils/whatsapp";
import { useAuthStore } from "../../store/authStore";
import { lerRascunhoCheckout, salvarRascunhoCheckout } from "../../utils/checkoutDraft";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => !!s.token);
  const [quantidades, setQuantidades] = useState<Record<string, number>>(
    () => (id ? lerRascunhoCheckout(id)?.quantidades ?? {} : {})
  );

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

  const { data: meusIngressos } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: getMyTickets,
    enabled: isAuthenticated,
  });

  const vendasEncerradas = useMemo(() => {
    if (!event) return false;
    if (event.status !== "Publicado") return true;
    const agora = Date.now();
    if (event.vendaInicio && agora < new Date(event.vendaInicio).getTime()) return true;
    if (event.vendaFim && agora > new Date(event.vendaFim).getTime()) return true;
    return false;
  }, [event]);

  const lotesSelecionados = (lots ?? [])
    .filter((l) => (quantidades[l.id] ?? 0) > 0)
    .map((lot) => ({ lot, quantity: quantidades[lot.id] }));

  const checkoutForm = useCheckoutForm(event, lotesSelecionados);

  if (!event) return null;

  const jaCompradosPorLote = (lotId: string) =>
    (meusIngressos ?? []).filter((t) => t.lotId === lotId && t.status !== "Cancelado").length;

  const restanteNoLote = (lot: LotDto) =>
    lot.maximoPorUsuario > 0
      ? Math.max(0, lot.maximoPorUsuario - jaCompradosPorLote(lot.id))
      : Infinity;

  const setQuantidade = (lot: LotDto, value: number) => {
    const max = Math.min(lot.quantidadeDisponivel, restanteNoLote(lot), 10);
    setQuantidades((prev) => {
      const next = { ...prev, [lot.id]: Math.max(0, Math.min(value, max)) };
      if (id) {
        const rascunho = lerRascunhoCheckout(id);
        salvarRascunhoCheckout(id, {
          email: rascunho?.email ?? "",
          telefone: rascunho?.telefone ?? "",
          holdersPorLote: rascunho?.holdersPorLote ?? {},
          quantidades: next,
        });
      }
      return next;
    });
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
      <Container maxWidth="xl" sx={{ pt: 4, pb: 1.2 }}>
        <Grid container spacing={{ xs: 2.7, md: 3 }}>
          {/* Coluna esquerda: cabeçalho (imagem, título, data, local) */}
          <Grid item xs={12} md={3} sx={{ order: { xs: 1, md: "unset" } }}>
            {event.imagemUrl && (
              <Box
                sx={{
                  width: "100%",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  mb: { xs: 2.7, md: 3 },
                  boxShadow: "0 0.25rem 1rem rgba(19, 33, 68, 0.08)",
                }}
              >
                <Box component="img" src={event.imagemUrl} alt={event.nome} sx={{ width: "100%", height: "auto", display: "block" }} />
              </Box>
            )}

            <Stack direction="row" spacing={1.5} alignItems="center" mb={2} sx={{ display: { xs: "flex", md: "none" } }}>
              <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ fontSize: "1.2rem" }}>
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

            <Stack direction="row" spacing={1.5} mb={1} justifyContent="flex-start" sx={{ display: { xs: "none", md: "flex" } }}>
              <IconButton
                component="a"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ backgroundColor: "rgba(55, 125, 255, 0.08)", color: "primary.main" }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                component="a"
                href={`https://wa.me/?text=${encodeURIComponent(`Confira este evento: ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ backgroundColor: "rgba(0, 166, 80, 0.08)", color: "#00a650" }}
              >
                <WhatsAppIcon />
              </IconButton>
            </Stack>
            <Typography variant="caption" display="block" textAlign="left" color="text.secondary" mb={3} sx={{ display: { xs: "none", md: "block" } }}>
              Compartilhe este evento
            </Typography>
          </Grid>

          {/* Ingressos: no mobile, sobe para antes de "Compartilhe este evento" */}
          <Grid item xs={12} md={9} sx={{ order: { xs: 2, md: "unset" } }}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
              <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ fontSize: "1.5rem" }}>
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
            <Typography
              variant="body1"
              color="primary.main"
              fontWeight={600}
              mb={3}
              sx={{ textAlign: "left", fontSize: "0.9rem", display: { xs: "none", md: "block" } }}
            >
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
                sx={{ mb: { xs: 2.7, md: 3 } }}
              >
                Este evento possui transmissão ao vivo.
              </Alert>
            )}

            <Card sx={{ mb: { xs: 2.7, md: 3 } }}>
              <CardContent>
                <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing="0.04em" sx={{ display: "block", textAlign: "left" }}>
                  Ingressos
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack divider={<Divider />} spacing={2}>
                  {lots?.map((lot) => {
                    const qtd = quantidades[lot.id] ?? 0;
                    const restante = restanteNoLote(lot);
                    const max = Math.min(lot.quantidadeDisponivel, restante, 10);
                    const ehPrimeiroLoteSelecionado = lotesSelecionados[0]?.lot.id === lot.id;
                    return (
                      <Box key={lot.id} py={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography fontWeight={700} color="text.primary" sx={{ textTransform: "uppercase", fontSize: "0.729rem", letterSpacing: "0.01em" }}>
                              {lot.nome}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography fontWeight={700} color="text.primary" sx={{ fontSize: "0.7875rem" }}>R$ {lot.preco.toFixed(2)}</Typography>
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
                        {restante === 0 && (
                          <Typography variant="caption" color="warning.main" sx={{ display: "block", mt: 0.5 }}>
                            Você já atingiu o limite de {lot.maximoPorUsuario} ingresso(s) por login neste lote.
                          </Typography>
                        )}
                        {qtd > 0 && isAuthenticated && (
                          <HolderFields lot={lot} quantity={qtd} ehPrimeiroLoteGeral={ehPrimeiroLoteSelecionado} form={checkoutForm} />
                        )}
                      </Box>
                    );
                  })}
                </Stack>

                {lotesSelecionados.length > 0 && !isAuthenticated && (
                  <Box sx={{ mt: 3, textAlign: "center", py: 4, borderTop: "1px solid rgba(231, 234, 243, 0.9)" }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary" mb={1}>
                      Entre ou crie sua conta para continuar
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3} sx={{ fontSize: "0.875rem" }}>
                      Seus ingressos selecionados e os dados já preenchidos serão mantidos.
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                      <Button
                        component={RouterLink}
                        to="/login"
                        state={{ from: `${location.pathname}${location.search}` }}
                        variant="contained"
                        startIcon={<LoginIcon />}
                        sx={{ borderRadius: "0.5rem", px: 3 }}
                      >
                        Entrar
                      </Button>
                      <Button
                        component={RouterLink}
                        to="/registro"
                        state={{ from: `${location.pathname}${location.search}` }}
                        variant="outlined"
                        startIcon={<PersonAddIcon />}
                        sx={{ borderRadius: "0.5rem", px: 3 }}
                      >
                        Criar conta
                      </Button>
                    </Stack>
                  </Box>
                )}

                {lotesSelecionados.length > 0 && isAuthenticated && (
                  <CheckoutSummary form={checkoutForm} />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Informações/Orientações: no mobile, sobe para logo após Ingressos */}
          <Grid item xs={12} md={9} sx={{ order: { xs: 3, md: "unset" }, display: { xs: "block", md: "none" } }}>
            <Card sx={{ mb: { xs: 2.7, md: 3 } }}>
              <CardContent>
                <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing="0.04em" sx={{ display: "block", textAlign: "left" }}>
                  Informações sobre o evento
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-line", lineHeight: 1.8, textAlign: "left", fontSize: "0.7875rem" }}>{event.descricao}</Typography>
              </CardContent>
            </Card>

            {event.orientacoesGerais && (
              <Card sx={{ mb: { xs: 2.7, md: 3 } }}>
                <CardContent>
                  <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing="0.04em" sx={{ display: "block", textAlign: "left" }}>
                    Orientações gerais
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {event.orientacoesGerais.split("\n").filter(Boolean).map((linha, i) => (
                      <Typography key={i} component="li" variant="body2" color="text.primary" sx={{ mb: 1.2, textAlign: "left", fontSize: "0.7875rem" }}>
                        {linha}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Coluna esquerda: localização, mapa, contato — no mobile, vem depois de "Compartilhe" */}
          <Grid item xs={12} md={3} sx={{ order: { xs: 4, md: "unset" } }}>
            <Card sx={{ p: 2.5, mb: { xs: 2.7, md: 3 } }}>
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
                  mb: { xs: 2.7, md: 3 },
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

            {(event.contatoWhatsapp || event.contatoTelefone || event.contatoEmail || event.contatoFacebook || event.contatoInstagram) && (
              <Card sx={{ p: 2.5, mb: { xs: 2.7, md: 3 } }}>
                <Typography variant="overline" fontWeight={700} color="primary.main" letterSpacing="0.04em" sx={{ display: "block", textAlign: "left" }}>
                  Contato
                </Typography>
                <Stack spacing={1} mt={1.5}>
                  {event.contatoWhatsapp && (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      component="a"
                      href={`https://wa.me/${paraLinkWhatsapp(event.contatoWhatsapp)}?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre o evento "${event.nome}".`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: "none" }}
                    >
                      <WhatsAppIcon sx={{ fontSize: "1.1rem", color: "#00a650" }} />
                      <Typography variant="body2" color="text.primary" sx={{ fontSize: "0.7875rem" }}>{event.contatoWhatsapp}</Typography>
                    </Stack>
                  )}
                  {event.contatoTelefone && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
                      <Typography variant="body2" color="text.primary" sx={{ fontSize: "0.7875rem" }}>{event.contatoTelefone}</Typography>
                    </Stack>
                  )}
                  {event.contatoEmail && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
                      <Typography variant="body2" color="text.primary" sx={{ fontSize: "0.7875rem" }}>{event.contatoEmail}</Typography>
                    </Stack>
                  )}
                  {event.contatoFacebook && (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      component="a"
                      href={event.contatoFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: "none" }}
                    >
                      <FacebookIcon sx={{ fontSize: "1.1rem", color: "primary.main" }} />
                      <Typography variant="body2" color="text.primary" sx={{ fontSize: "0.7875rem" }}>{event.contatoFacebook}</Typography>
                    </Stack>
                  )}
                  {event.contatoInstagram && (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      component="a"
                      href={event.contatoInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textDecoration: "none" }}
                    >
                      <InstagramIcon sx={{ fontSize: "1.1rem", color: "#c13584" }} />
                      <Typography variant="body2" color="text.primary" sx={{ fontSize: "0.7875rem" }}>{event.contatoInstagram}</Typography>
                    </Stack>
                  )}
                </Stack>
              </Card>
            )}

            {/* Compartilhar: só no mobile, aparece aqui (depois de Contato) */}
            <Stack direction="row" spacing={1.5} mb={1} justifyContent="flex-start" sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                component="a"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ backgroundColor: "rgba(55, 125, 255, 0.08)", color: "primary.main" }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                component="a"
                href={`https://wa.me/?text=${encodeURIComponent(`Confira este evento: ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ backgroundColor: "rgba(0, 166, 80, 0.08)", color: "#00a650" }}
              >
                <WhatsAppIcon />
              </IconButton>
            </Stack>
            <Typography variant="caption" display="block" textAlign="left" color="text.secondary" mb={3} sx={{ display: { xs: "block", md: "none" } }}>
              Compartilhe este evento
            </Typography>
          </Grid>

          {/* Coluna direita: Informações/Orientações no desktop (mobile já mostradas acima) */}
          <Grid item xs={12} md={9} sx={{ order: { xs: 5, md: "unset" } }}>
            <Card sx={{ mb: { xs: 2.7, md: 3 }, display: { xs: "none", md: "block" } }}>
              <CardContent>
                <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing="0.04em" sx={{ display: "block", textAlign: "left" }}>
                  Informações sobre o evento
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-line", lineHeight: 1.8, textAlign: "left", fontSize: "0.7875rem" }}>{event.descricao}</Typography>
              </CardContent>
            </Card>

            {event.orientacoesGerais && (
              <Card sx={{ mb: 0.6, display: { xs: "none", md: "block" } }}>
                <CardContent>
                  <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing="0.04em" sx={{ display: "block", textAlign: "left" }}>
                    Orientações gerais
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {event.orientacoesGerais.split("\n").filter(Boolean).map((linha, i) => (
                      <Typography key={i} component="li" variant="body2" color="text.primary" sx={{ mb: 1.2, textAlign: "left", fontSize: "0.7875rem" }}>
                        {linha}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>

      <Dialog
        open={vendasEncerradas}
        disableEscapeKeyDown
        slotProps={{ backdrop: { sx: { backdropFilter: "blur(4px)" } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EventBusyIcon color="warning" />
          Evento indisponível
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Este evento não está mais disponível para venda de ingressos.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={() => navigate("/eventos")} sx={{ borderRadius: "0.5rem", px: 3 }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

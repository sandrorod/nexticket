import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse, NotFoundError } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { requireAuth, requireRole } from "../_shared/jwt.ts";
import { Validator } from "../_shared/validate.ts";
import { mapEventToDto } from "../_shared/eventMapper.ts";

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

function validateEventRequest(body: Record<string, unknown>): void {
  const v = new Validator();
  v.notEmpty(body.nome as string, "Nome").maxLength(body.nome as string, 200, "Nome");
  v.notEmpty(body.descricao as string, "Descricao").maxLength(body.descricao as string, 4000, "Descricao");
  v.notEmpty(body.local as string, "Local").maxLength(body.local as string, 300, "Local");
  v.greaterThan(body.maximoPorCpf as number, 0, "MaximoPorCpf");
  v.greaterThan(body.maximoPorUsuario as number, 0, "MaximoPorUsuario");
  v.greaterThanDate(body.vendaFim as string, body.vendaInicio as string, "VendaFim");
  v.maxLength(body.cep as string, 9, "Cep");
  v.maxLength(body.endereco as string, 300, "Endereco");
  v.maxLength(body.numero as string, 20, "Numero");
  v.maxLength(body.bairro as string, 150, "Bairro");
  v.maxLength(body.cidade as string, 150, "Cidade");
  v.maxLength(body.estado as string, 2, "Estado");
  v.maxLength(body.classificacao as string, 10, "Classificacao");
  v.maxLength(body.contatoWhatsapp as string, 20, "ContatoWhatsapp");
  v.maxLength(body.contatoTelefone as string, 20, "ContatoTelefone");
  if (body.contatoEmail) {
    v.maxLength(body.contatoEmail as string, 200, "ContatoEmail").email(body.contatoEmail as string, "ContatoEmail");
  }
  v.throwIfInvalid();
}

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);
  const url = new URL(req.url);
  // path esperado: /events[/:id][/cancel]
  const parts = url.pathname.replace(/^\/events\/?/, "").split("/").filter(Boolean);
  const id = parts[0];
  const isCancel = parts[1] === "cancel";

  try {
    if (req.method === "GET" && !id) {
      const { data, error } = await supabaseAdmin
        .from("Events")
        .select("*, Lots(*), Tickets(Id)")
        .eq("Status", 1) // Publicado
        .order("Data", { ascending: true });
      if (error) throw error;

      const limite = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const visiveis = (data ?? []).filter((e) => new Date(e.VendaFim) >= limite);
      return json(visiveis.map(mapEventToDto), 200, headers);
    }

    if (req.method === "GET" && id) {
      const { data, error } = await supabaseAdmin
        .from("Events")
        .select("*, Lots(*), Tickets(Id)")
        .eq("Id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new NotFoundError("Evento", id);
      return json(mapEventToDto(data), 200, headers);
    }

    // Todas as rotas abaixo exigem Administrador
    const auth = await requireAuth(req);
    requireRole(auth, "Administrador");

    if (req.method === "POST" && !id) {
      const body = await req.json();
      validateEventRequest(body);

      const eventId = crypto.randomUUID();
      const { error } = await supabaseAdmin.from("Events").insert({
        Id: eventId,
        Nome: body.nome,
        Descricao: body.descricao,
        Data: body.data,
        Hora: body.hora,
        Local: body.local,
        MapaUrl: body.mapaUrl ?? null,
        ImagemUrl: body.imagemUrl ?? null,
        TransmissaoUrl: body.transmissaoUrl ?? null,
        VendaInicio: body.vendaInicio,
        VendaFim: body.vendaFim,
        MaximoPorCpf: body.maximoPorCpf,
        MaximoPorUsuario: body.maximoPorUsuario,
        Status: 1, // Publicado
        Cep: body.cep ?? null,
        Endereco: body.endereco ?? null,
        Numero: body.numero ?? null,
        Bairro: body.bairro ?? null,
        Cidade: body.cidade ?? null,
        Estado: body.estado ?? null,
        Classificacao: body.classificacao ?? "Livre",
        ContatoWhatsapp: body.contatoWhatsapp ?? null,
        ContatoTelefone: body.contatoTelefone ?? null,
        ContatoEmail: body.contatoEmail ?? null,
        OrientacoesGerais: body.orientacoesGerais ?? null,
        CreatedAt: new Date().toISOString(),
      });
      if (error) throw error;

      const { data: created } = await supabaseAdmin.from("Events").select("*, Lots(*), Tickets(Id)").eq("Id", eventId).single();
      return json(mapEventToDto(created), 201, headers);
    }

    if (req.method === "PUT" && id && !isCancel) {
      const body = await req.json();
      validateEventRequest(body);

      const { data: existing } = await supabaseAdmin.from("Events").select("Id").eq("Id", id).maybeSingle();
      if (!existing) throw new NotFoundError("Evento", id);

      const { error } = await supabaseAdmin.from("Events").update({
        Nome: body.nome,
        Descricao: body.descricao,
        Data: body.data,
        Hora: body.hora,
        Local: body.local,
        MapaUrl: body.mapaUrl ?? null,
        ImagemUrl: body.imagemUrl ?? null,
        TransmissaoUrl: body.transmissaoUrl ?? null,
        VendaInicio: body.vendaInicio,
        VendaFim: body.vendaFim,
        MaximoPorCpf: body.maximoPorCpf,
        MaximoPorUsuario: body.maximoPorUsuario,
        Cep: body.cep ?? null,
        Endereco: body.endereco ?? null,
        Numero: body.numero ?? null,
        Bairro: body.bairro ?? null,
        Cidade: body.cidade ?? null,
        Estado: body.estado ?? null,
        Classificacao: body.classificacao ?? "Livre",
        ContatoWhatsapp: body.contatoWhatsapp ?? null,
        ContatoTelefone: body.contatoTelefone ?? null,
        ContatoEmail: body.contatoEmail ?? null,
        OrientacoesGerais: body.orientacoesGerais ?? null,
      }).eq("Id", id);
      if (error) throw error;

      const { data: updated } = await supabaseAdmin.from("Events").select("*, Lots(*), Tickets(Id)").eq("Id", id).single();
      return json(mapEventToDto(updated), 200, headers);
    }

    if (req.method === "POST" && id && isCancel) {
      const { data: existing } = await supabaseAdmin.from("Events").select("Id").eq("Id", id).maybeSingle();
      if (!existing) throw new NotFoundError("Evento", id);

      const { error } = await supabaseAdmin.from("Events").update({ Status: 2 }).eq("Id", id); // Cancelado
      if (error) throw error;

      return new Response(null, { status: 204, headers });
    }

    return json({ title: "Não encontrado", status: 404, errors: ["Rota não encontrada."] }, 404, headers);
  } catch (err) {
    return errorResponse(err, headers);
  }
});

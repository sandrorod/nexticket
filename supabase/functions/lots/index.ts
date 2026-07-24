import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse, NotFoundError, ConflictError } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { requireAuth, requireRole } from "../_shared/jwt.ts";
import { Validator } from "../_shared/validate.ts";
import { mapLotToDto } from "../_shared/eventMapper.ts";

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

function validateLotRequest(body: Record<string, unknown>): void {
  const v = new Validator();
  v.notEmpty(body.nome as string, "Nome").maxLength(body.nome as string, 100, "Nome");
  v.custom(typeof body.preco === "number" && body.preco >= 0, "Preco deve ser maior ou igual a 0.");
  v.greaterThan(body.quantidade as number, 0, "Quantidade");
  v.greaterThan(body.maximoPorUsuario as number, 0, "MaximoPorUsuario");
  v.greaterThanDate(body.dataFim as string, body.dataInicio as string, "DataFim");
  v.throwIfInvalid();
}

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);
  const url = new URL(req.url);
  // path esperado: /lots/:eventId[/:lotId]
  const parts = url.pathname.replace(/^\/lots\/?/, "").split("/").filter(Boolean);
  const eventId = parts[0];
  const lotId = parts[1];

  try {
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("Lots")
        .select("*")
        .eq("EventId", eventId)
        .order("DataInicio", { ascending: true });
      if (error) throw error;
      return json((data ?? []).map(mapLotToDto), 200, headers);
    }

    const auth = await requireAuth(req);
    requireRole(auth, "Administrador");

    if (req.method === "POST" && !lotId) {
      const { data: event } = await supabaseAdmin.from("Events").select("Id").eq("Id", eventId).maybeSingle();
      if (!event) throw new NotFoundError("Evento", eventId);

      const body = await req.json();
      validateLotRequest(body);

      const newLotId = crypto.randomUUID();
      const { error } = await supabaseAdmin.from("Lots").insert({
        Id: newLotId,
        EventId: eventId,
        Nome: body.nome,
        Preco: body.preco,
        Quantidade: body.quantidade,
        QuantidadeVendida: 0,
        MaximoPorUsuario: body.maximoPorUsuario,
        DataInicio: body.dataInicio,
        DataFim: body.dataFim,
        Status: 0, // Programado
        CreatedAt: new Date().toISOString(),
      });
      if (error) throw error;

      const { data: created } = await supabaseAdmin.from("Lots").select("*").eq("Id", newLotId).single();
      return json(mapLotToDto(created), 201, headers);
    }

    if (req.method === "PUT" && lotId) {
      const { data: lot } = await supabaseAdmin.from("Lots").select("*").eq("Id", lotId).maybeSingle();
      if (!lot) throw new NotFoundError("Lote", lotId);

      const body = await req.json();
      validateLotRequest(body);

      if ((body.quantidade as number) < lot.QuantidadeVendida) {
        throw new ConflictError("A quantidade do lote não pode ser menor que a quantidade já vendida.");
      }

      const { error } = await supabaseAdmin.from("Lots").update({
        Nome: body.nome,
        Preco: body.preco,
        Quantidade: body.quantidade,
        MaximoPorUsuario: body.maximoPorUsuario,
        DataInicio: body.dataInicio,
        DataFim: body.dataFim,
      }).eq("Id", lotId);
      if (error) throw error;

      const { data: updated } = await supabaseAdmin.from("Lots").select("*").eq("Id", lotId).single();
      return json(mapLotToDto(updated), 200, headers);
    }

    return json({ title: "Não encontrado", status: 404, errors: ["Rota não encontrada."] }, 404, headers);
  } catch (err) {
    return errorResponse(err, headers);
  }
});

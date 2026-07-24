import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse, ConflictError } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { requireAuth, requireRole } from "../_shared/jwt.ts";
import { Validator } from "../_shared/validate.ts";

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

const couponTypeNames = ["Percentual", "ValorFixo"];

// deno-lint-ignore no-explicit-any
const toDto = (c: any) => ({
  id: c.Id,
  codigo: c.Codigo,
  tipo: couponTypeNames[c.Tipo],
  valor: Number(c.Valor),
  eventId: c.EventId,
  quantidadeMaxima: c.QuantidadeMaxima,
  quantidadeUtilizada: c.QuantidadeUtilizada,
  dataInicio: c.DataInicio,
  dataFim: c.DataFim,
  ativo: c.Ativo,
});

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);

  try {
    const auth = await requireAuth(req);
    requireRole(auth, "Administrador");

    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin.from("Coupons").select("*").order("CreatedAt", { ascending: false });
      if (error) throw error;
      return json((data ?? []).map(toDto), 200, headers);
    }

    if (req.method === "POST") {
      const body = await req.json();
      const v = new Validator();
      v.notEmpty(body.codigo, "Codigo").maxLength(body.codigo, 50, "Codigo");
      v.notEmpty(body.tipo, "Tipo");
      v.throwIfInvalid();

      const tipoIndex = couponTypeNames.findIndex((t) => t.toLowerCase() === String(body.tipo).toLowerCase());
      if (tipoIndex === -1) {
        throw new ConflictError("Tipo de cupom inválido. Use 'Percentual' ou 'ValorFixo'.");
      }

      const { data: existing } = await supabaseAdmin.from("Coupons").select("Id").eq("Codigo", body.codigo).limit(1);
      if (existing && existing.length > 0) throw new ConflictError("Já existe um cupom com este código.");

      const couponId = crypto.randomUUID();
      const { error } = await supabaseAdmin.from("Coupons").insert({
        Id: couponId,
        Codigo: body.codigo,
        Tipo: tipoIndex,
        Valor: body.valor,
        EventId: body.eventId ?? null,
        QuantidadeMaxima: body.quantidadeMaxima ?? null,
        QuantidadeUtilizada: 0,
        DataInicio: body.dataInicio,
        DataFim: body.dataFim,
        Ativo: true,
        CreatedAt: new Date().toISOString(),
      });
      if (error) throw error;

      const { data: created } = await supabaseAdmin.from("Coupons").select("*").eq("Id", couponId).single();
      return json(toDto(created), 200, headers);
    }

    return json({ title: "Não encontrado", status: 404, errors: ["Rota não encontrada."] }, 404, headers);
  } catch (err) {
    return errorResponse(err, headers);
  }
});

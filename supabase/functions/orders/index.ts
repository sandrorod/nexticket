import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse, NotFoundError, UnauthorizedAppError } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { requireAuth, requireRole } from "../_shared/jwt.ts";
import { Validator, temNomeESobrenome } from "../_shared/validate.ts";

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

const orderPaymentStatusNames = ["Pendente", "Pago", "Cancelado", "Estornado", "Expirado"];

// deno-lint-ignore no-explicit-any
function mapOrderToDto(o: any) {
  return {
    id: o.Id,
    userId: o.UserId,
    data: o.Data,
    valorTotal: Number(o.ValorTotal),
    desconto: Number(o.Desconto),
    statusPagamento: orderPaymentStatusNames[o.StatusPagamento],
    // deno-lint-ignore no-explicit-any
    items: (o.OrderItems ?? []).map((i: any) => ({
      id: i.Id,
      lotId: i.LotId,
      lotNome: i.Lots?.Nome,
      quantidade: i.Quantidade,
      valorUnitario: Number(i.ValorUnitario),
      valorTotal: i.Quantidade * Number(i.ValorUnitario),
    })),
  };
}

interface TicketHolderRequest {
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
}

interface CreateOrderItemRequest {
  lotId: string;
  ingressos: TicketHolderRequest[];
}

function validateCreateOrderRequest(body: { eventId?: string; itens?: CreateOrderItemRequest[] }): void {
  const v = new Validator();
  v.notEmpty(body.eventId, "EventId");
  v.custom(Array.isArray(body.itens) && body.itens.length > 0, "Itens é obrigatório.");

  for (const item of body.itens ?? []) {
    v.notEmpty(item.lotId, "LotId");
    v.custom(Array.isArray(item.ingressos) && item.ingressos.length > 0, "Ingressos é obrigatório.");

    for (const holder of item.ingressos ?? []) {
      v.notEmpty(holder.nome, "Nome").maxLength(holder.nome, 200, "Nome");
      if (holder.nome && !temNomeESobrenome(holder.nome)) {
        v.custom(false, "Informe nome e sobrenome completos.");
      }
      v.notEmpty(holder.email, "Email").email(holder.email, "Email").maxLength(holder.email, 200, "Email");
      v.notEmpty(holder.telefone, "Telefone").maxLength(holder.telefone, 20, "Telefone");
      if (holder.cpf) v.exactLength(holder.cpf, 11, "Cpf");
    }
  }
  v.throwIfInvalid();
}

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);
  const url = new URL(req.url);
  // path esperado: (vazio) | /me | /:id | /:id/confirm-payment
  const parts = url.pathname.replace(/^\/orders\/?/, "").split("/").filter(Boolean);
  const first = parts[0];

  try {
    const auth = await requireAuth(req);

    if (req.method === "POST" && !first) {
      const body = await req.json();
      validateCreateOrderRequest(body);

      const { data, error } = await supabaseAdmin.rpc("create_order", {
        p_user_id: auth.sub,
        p_event_id: body.eventId,
        p_itens: body.itens,
      });
      if (error) throw error;

      const { data: order } = await supabaseAdmin
        .from("Orders")
        .select("*, OrderItems(*, Lots(Nome))")
        .eq("Id", data.orderId)
        .single();

      return json(mapOrderToDto(order), 201, headers);
    }

    if (req.method === "GET" && first === "me") {
      const { data, error } = await supabaseAdmin
        .from("Orders")
        .select("*, OrderItems(*, Lots(Nome))")
        .eq("UserId", auth.sub)
        .order("Data", { ascending: false });
      if (error) throw error;
      return json((data ?? []).map(mapOrderToDto), 200, headers);
    }

    if (req.method === "GET" && first) {
      const { data: order, error } = await supabaseAdmin
        .from("Orders")
        .select("*, OrderItems(*, Lots(Nome))")
        .eq("Id", first)
        .maybeSingle();
      if (error) throw error;
      if (!order) throw new NotFoundError("Pedido", first);

      // Correção de ownership: só o dono do pedido ou um Administrador pode vê-lo.
      if (order.UserId !== auth.sub && auth.role !== "Administrador") {
        throw new UnauthorizedAppError("Você não tem permissão para acessar este pedido.");
      }

      return json(mapOrderToDto(order), 200, headers);
    }

    if (req.method === "POST" && first && parts[1] === "confirm-payment") {
      requireRole(auth, "Administrador");

      const { data: order } = await supabaseAdmin.from("Orders").select("Id").eq("Id", first).maybeSingle();
      if (!order) throw new NotFoundError("Pedido", first);

      const { error } = await supabaseAdmin.from("Orders").update({ StatusPagamento: 1 }).eq("Id", first); // Pago
      if (error) throw error;

      return new Response(null, { status: 204, headers });
    }

    return json({ title: "Não encontrado", status: 404, errors: ["Rota não encontrada."] }, 404, headers);
  } catch (err) {
    return errorResponse(err, headers);
  }
});

import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse, NotFoundError, UnauthorizedAppError } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { requireAuth, requireRole } from "../_shared/jwt.ts";
import { Validator } from "../_shared/validate.ts";

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

const ticketStatusNames = ["Disponivel", "Utilizado", "Cancelado"];
const eventStatusPublicado = 1;

// deno-lint-ignore no-explicit-any
function mapTicketToDto(t: any) {
  return {
    id: t.Id,
    codigo: t.Codigo,
    token: t.Token,
    eventId: t.EventId,
    eventNome: t.Events.Nome,
    eventLocal: t.Events.Local,
    eventData: t.Events.Data,
    eventHora: t.Events.Hora,
    lotNome: t.Lots.Nome,
    nome: t.Nome,
    email: t.Email,
    telefone: t.Telefone,
    status: ticketStatusNames[t.Status],
    dataUso: t.DataUso,
  };
}

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);
  const url = new URL(req.url);
  // path esperado: /tickets/me | /tickets/:id | /tickets/validate/preview | /tickets/validate/confirm
  const parts = url.pathname.replace(/^\/tickets\/?/, "").split("/").filter(Boolean);
  const first = parts[0];

  try {
    if (req.method === "POST" && first === "validate" && parts[1] === "preview") {
      const auth = await requireAuth(req);
      requireRole(auth, "Administrador", "Validador");

      const { token } = await req.json();
      const v = new Validator();
      v.notEmpty(token, "Token");
      v.throwIfInvalid();

      const { data: ticket } = await supabaseAdmin
        .from("Tickets")
        .select("*, Events(Nome, Hora, Status)")
        .eq("Token", token)
        .maybeSingle();

      if (!ticket) {
        return json({
          valido: false, mensagem: "Ingresso não encontrado.",
          ticketId: null, nome: null, eventoNome: null, hora: null, status: null, dataUso: null, usuarioValidador: null,
        }, 200, headers);
      }

      let usuarioValidadorNome: string | null = null;
      if (ticket.UsuarioValidadorId) {
        const { data: validador } = await supabaseAdmin.from("Users").select("Nome").eq("Id", ticket.UsuarioValidadorId).maybeSingle();
        usuarioValidadorNome = validador?.Nome ?? null;
      }

      if (ticket.Status === 1) { // Utilizado
        return json({
          valido: false, mensagem: "Ingresso já utilizado.",
          ticketId: ticket.Id, nome: ticket.Nome, eventoNome: ticket.Events.Nome, hora: ticket.Events.Hora,
          status: ticketStatusNames[ticket.Status], dataUso: ticket.DataUso, usuarioValidador: usuarioValidadorNome,
        }, 200, headers);
      }
      if (ticket.Status === 2) { // Cancelado
        return json({
          valido: false, mensagem: "Ingresso cancelado.",
          ticketId: ticket.Id, nome: ticket.Nome, eventoNome: ticket.Events.Nome, hora: ticket.Events.Hora,
          status: ticketStatusNames[ticket.Status], dataUso: ticket.DataUso, usuarioValidador: null,
        }, 200, headers);
      }
      if (ticket.Events.Status !== eventStatusPublicado) {
        return json({
          valido: false, mensagem: "Evento não está válido para check-in.",
          ticketId: ticket.Id, nome: ticket.Nome, eventoNome: ticket.Events.Nome, hora: ticket.Events.Hora,
          status: ticketStatusNames[ticket.Status], dataUso: null, usuarioValidador: null,
        }, 200, headers);
      }

      return json({
        valido: true, mensagem: "Ingresso válido.",
        ticketId: ticket.Id, nome: ticket.Nome, eventoNome: ticket.Events.Nome, hora: ticket.Events.Hora,
        status: ticketStatusNames[ticket.Status], dataUso: null, usuarioValidador: null,
      }, 200, headers);
    }

    if (req.method === "POST" && first === "validate" && parts[1] === "confirm") {
      const auth = await requireAuth(req);
      requireRole(auth, "Administrador", "Validador");

      const { token } = await req.json();
      const v = new Validator();
      v.notEmpty(token, "Token");
      v.throwIfInvalid();

      const { data, error } = await supabaseAdmin.rpc("confirm_ticket_validation", {
        p_token: token,
        p_validador_id: auth.sub,
      });
      if (error) throw error;

      return json(data, 200, headers);
    }

    // Demais rotas exigem apenas usuário autenticado
    const auth = await requireAuth(req);

    if (req.method === "GET" && first === "me") {
      const { data, error } = await supabaseAdmin
        .from("Tickets")
        .select("*, Events(Nome, Local, Data, Hora), Lots(Nome), Orders!inner(UserId)")
        .eq("Orders.UserId", auth.sub)
        .order("CreatedAt", { ascending: false });
      if (error) throw error;
      return json((data ?? []).map(mapTicketToDto), 200, headers);
    }

    if (req.method === "GET" && first) {
      const { data: ticket, error } = await supabaseAdmin
        .from("Tickets")
        .select("*, Events(Nome, Local, Data, Hora), Lots(Nome), Orders(UserId)")
        .eq("Id", first)
        .maybeSingle();
      if (error) throw error;
      if (!ticket) throw new NotFoundError("Ingresso", first);

      // Correção de ownership: só o dono do pedido ou um Administrador pode ver o ingresso.
      if (ticket.Orders.UserId !== auth.sub && auth.role !== "Administrador") {
        throw new UnauthorizedAppError("Você não tem permissão para acessar este ingresso.");
      }

      return json(mapTicketToDto(ticket), 200, headers);
    }

    return json({ title: "Não encontrado", status: 404, errors: ["Rota não encontrada."] }, 404, headers);
  } catch (err) {
    return errorResponse(err, headers);
  }
});

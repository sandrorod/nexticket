import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse, NotFoundError, ConflictError } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { requireAuth, requireRole } from "../_shared/jwt.ts";
import { Validator } from "../_shared/validate.ts";

const roleNames = ["Comprador", "Administrador", "Validador", "Master"];

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

// deno-lint-ignore no-explicit-any
const toDto = (u: any) => ({
  id: u.Id,
  nome: u.Nome,
  email: u.Email,
  telefone: u.Telefone,
  role: roleNames[u.Role],
  ativo: u.Ativo,
  createdAt: u.CreatedAt,
});

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);
  const url = new URL(req.url);
  // path esperado: /users[/:id/promover-admin|remover-admin|deactivate|reactivate]
  const parts = url.pathname.replace(/^\/users\/?/, "").split("/").filter(Boolean);
  const id = parts[0];
  const action = parts[1];

  try {
    const auth = await requireAuth(req);
    requireRole(auth, "Master");

    if (req.method === "GET" && !id) {
      const { data, error } = await supabaseAdmin.from("Users").select("*").order("Nome", { ascending: true });
      if (error) throw error;
      return json((data ?? []).map(toDto), 200, headers);
    }

    if (id && !action) {
      const { data: user } = await supabaseAdmin.from("Users").select("*").eq("Id", id).maybeSingle();
      if (!user) throw new NotFoundError("Usuário", id);
      if (user.Role === 3) throw new ConflictError("Contas master não podem ser alteradas por esta tela.");

      if (req.method === "PUT") {
        const body = await req.json();
        const v = new Validator();
        v.notEmpty(body.nome, "Nome").maxLength(body.nome, 200, "Nome");
        v.notEmpty(body.telefone, "Telefone").maxLength(body.telefone, 20, "Telefone");
        v.throwIfInvalid();

        const { error } = await supabaseAdmin
          .from("Users")
          .update({ Nome: body.nome, Telefone: body.telefone })
          .eq("Id", id);
        if (error) throw error;

        const { data: updated } = await supabaseAdmin.from("Users").select("*").eq("Id", id).single();
        return json(toDto(updated), 200, headers);
      }

      if (req.method === "DELETE") {
        const { count } = await supabaseAdmin
          .from("Orders")
          .select("Id", { count: "exact", head: true })
          .eq("UserId", id);
        if (count && count > 0) {
          throw new ConflictError(
            "Esta conta possui pedidos vinculados e não pode ser excluída — desative-a em vez de excluir."
          );
        }

        const { error } = await supabaseAdmin.from("Users").delete().eq("Id", id);
        if (error) throw error;

        return new Response(null, { status: 204, headers });
      }
    }

    if (req.method === "POST" && id && action) {
      const { data: user } = await supabaseAdmin.from("Users").select("*").eq("Id", id).maybeSingle();
      if (!user) throw new NotFoundError("Usuário", id);
      if (user.Role === 3) throw new ConflictError("Contas master não podem ser alteradas por esta tela.");

      if (action === "promover-admin") {
        if (user.Role === 1) throw new ConflictError("Este usuário já é administrador.");
        const { error } = await supabaseAdmin.from("Users").update({ Role: 1 }).eq("Id", id);
        if (error) throw error;
      } else if (action === "remover-admin") {
        if (user.Role !== 1) throw new ConflictError("Este usuário não é administrador.");
        const { error } = await supabaseAdmin.from("Users").update({ Role: 0 }).eq("Id", id);
        if (error) throw error;
      } else if (action === "deactivate" || action === "reactivate") {
        const { error } = await supabaseAdmin.from("Users").update({ Ativo: action === "reactivate" }).eq("Id", id);
        if (error) throw error;
      } else {
        return json({ title: "Não encontrado", status: 404, errors: ["Rota não encontrada."] }, 404, headers);
      }

      const { data: updated } = await supabaseAdmin.from("Users").select("*").eq("Id", id).single();
      return json(toDto(updated), 200, headers);
    }

    return json({ title: "Não encontrado", status: 404, errors: ["Rota não encontrada."] }, 404, headers);
  } catch (err) {
    return errorResponse(err, headers);
  }
});

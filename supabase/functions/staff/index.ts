import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse, NotFoundError, ConflictError } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { requireAuth, requireRole } from "../_shared/jwt.ts";
import { hashPassword } from "../_shared/password.ts";
import { Validator } from "../_shared/validate.ts";

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

// deno-lint-ignore no-explicit-any
const toDto = (u: any) => ({
  id: u.Id,
  nome: u.Nome,
  email: u.Email,
  telefone: u.Telefone,
  ativo: u.Ativo,
  createdAt: u.CreatedAt,
});

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);
  const url = new URL(req.url);
  // path esperado: /staff[/:id/deactivate|reactivate]
  const parts = url.pathname.replace(/^\/staff\/?/, "").split("/").filter(Boolean);
  const id = parts[0];
  const action = parts[1];

  try {
    const auth = await requireAuth(req);
    requireRole(auth, "Administrador");

    if (req.method === "GET" && !id) {
      const { data, error } = await supabaseAdmin
        .from("Users")
        .select("*")
        .eq("Role", 2) // Validador
        .order("Nome", { ascending: true });
      if (error) throw error;
      return json((data ?? []).map(toDto), 200, headers);
    }

    if (req.method === "POST" && !id) {
      const body = await req.json();
      const v = new Validator();
      v.notEmpty(body.nome, "Nome").maxLength(body.nome, 200, "Nome");
      v.notEmpty(body.email, "Email").email(body.email, "Email").maxLength(body.email, 200, "Email");
      v.notEmpty(body.telefone, "Telefone").maxLength(body.telefone, 20, "Telefone");
      v.notEmpty(body.senha, "Senha").minLength(body.senha, 8, "Senha");
      v.matches(body.senha, /[A-Z]/, "A senha deve conter ao menos uma letra maiúscula.");
      v.matches(body.senha, /[0-9]/, "A senha deve conter ao menos um número.");
      v.throwIfInvalid();

      const { data: existing } = await supabaseAdmin.from("Users").select("Id").eq("Email", body.email).limit(1);
      if (existing && existing.length > 0) throw new ConflictError("Já existe uma conta cadastrada com este email.");

      const userId = crypto.randomUUID();
      const { error } = await supabaseAdmin.from("Users").insert({
        Id: userId,
        Nome: body.nome,
        Email: body.email,
        SenhaHash: hashPassword(body.senha),
        Telefone: body.telefone,
        Role: 2, // Validador
        Ativo: true,
        CreatedAt: new Date().toISOString(),
      });
      if (error) throw error;

      const { data: created } = await supabaseAdmin.from("Users").select("*").eq("Id", userId).single();
      return json(toDto(created), 201, headers);
    }

    if (req.method === "POST" && id && (action === "deactivate" || action === "reactivate")) {
      const { data: user } = await supabaseAdmin.from("Users").select("*").eq("Id", id).maybeSingle();
      if (!user) throw new NotFoundError("Funcionário", id);
      if (user.Role !== 2) throw new ConflictError("Este usuário não é uma conta de funcionário.");

      const { error } = await supabaseAdmin.from("Users").update({ Ativo: action === "reactivate" }).eq("Id", id);
      if (error) throw error;

      return new Response(null, { status: 204, headers });
    }

    return json({ title: "Não encontrado", status: 404, errors: ["Rota não encontrada."] }, 404, headers);
  } catch (err) {
    return errorResponse(err, headers);
  }
});

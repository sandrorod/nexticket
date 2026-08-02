import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse, UnauthorizedAppError } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { generateToken, type UserRole } from "../_shared/jwt.ts";
import { Validator } from "../_shared/validate.ts";

const roleNames: UserRole[] = ["Comprador", "Administrador", "Validador", "Master"];

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);

  try {
    const { accessToken } = await req.json();

    const v = new Validator();
    v.notEmpty(accessToken, "AccessToken");
    v.throwIfInvalid();

    // Valida o access token emitido pelo Supabase Auth (login com Google no
    // frontend) e extrai email/nome do usuário autenticado no Google.
    const { data: googleUser, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !googleUser?.user?.email) {
      throw new UnauthorizedAppError("Token do Google inválido ou expirado.");
    }

    const email = googleUser.user.email;
    const nome =
      (googleUser.user.user_metadata?.full_name as string | undefined) ??
      (googleUser.user.user_metadata?.name as string | undefined) ??
      email.split("@")[0];

    const { data: users } = await supabaseAdmin.from("Users").select("*").eq("Email", email).limit(1);
    let user = users?.[0];

    if (!user) {
      const userId = crypto.randomUUID();
      const { error: insertError } = await supabaseAdmin.from("Users").insert({
        Id: userId,
        Nome: nome,
        Email: email,
        SenhaHash: crypto.randomUUID(), // conta só acessível via Google; senha aleatória inutilizável no login por senha
        Telefone: "",
        Cpf: null,
        Role: 0, // Comprador
        Ativo: true,
        CreatedAt: new Date().toISOString(),
      });
      if (insertError) throw insertError;

      const { data: created } = await supabaseAdmin.from("Users").select("*").eq("Id", userId).single();
      user = created;
    }

    if (!user.Ativo) {
      throw new UnauthorizedAppError("Esta conta está desativada.");
    }

    const role = roleNames[user.Role];
    const token = await generateToken(user.Id, user.Email, user.Nome, role);

    return new Response(
      JSON.stringify({ token, userId: user.Id, nome: user.Nome, email: user.Email, role }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return errorResponse(err, headers);
  }
});

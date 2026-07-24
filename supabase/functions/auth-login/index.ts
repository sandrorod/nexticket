import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse, UnauthorizedAppError } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { verifyPassword } from "../_shared/password.ts";
import { generateToken, type UserRole } from "../_shared/jwt.ts";
import { Validator } from "../_shared/validate.ts";

const roleNames: UserRole[] = ["Comprador", "Administrador", "Validador"];

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);

  try {
    const { email, senha } = await req.json();

    const v = new Validator();
    v.notEmpty(email, "Email").email(email, "Email");
    v.notEmpty(senha, "Senha");
    v.throwIfInvalid();

    const { data: users } = await supabaseAdmin.from("Users").select("*").eq("Email", email).limit(1);
    const user = users?.[0];

    if (!user || !user.Ativo || !verifyPassword(senha, user.SenhaHash)) {
      throw new UnauthorizedAppError("Email ou senha inválidos.");
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

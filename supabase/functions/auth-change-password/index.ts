import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse, NotFoundError, UnauthorizedAppError } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { hashPassword, verifyPassword } from "../_shared/password.ts";
import { requireAuth } from "../_shared/jwt.ts";
import { Validator, validateSenhaForte } from "../_shared/validate.ts";

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);

  try {
    const auth = await requireAuth(req);
    const { senhaAtual, novaSenha } = await req.json();

    const v = new Validator();
    v.notEmpty(senhaAtual, "SenhaAtual");
    validateSenhaForte(novaSenha, v);
    v.throwIfInvalid();

    const { data: user } = await supabaseAdmin.from("Users").select("*").eq("Id", auth.sub).single();
    if (!user) throw new NotFoundError("Usuário", auth.sub);

    if (!verifyPassword(senhaAtual, user.SenhaHash)) {
      throw new UnauthorizedAppError("Senha atual incorreta.");
    }

    const { error } = await supabaseAdmin.from("Users").update({ SenhaHash: hashPassword(novaSenha) }).eq("Id", auth.sub);
    if (error) throw error;

    return new Response(null, { status: 204, headers });
  } catch (err) {
    return errorResponse(err, headers);
  }
});

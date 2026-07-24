import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse, ConflictError } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { hashPassword } from "../_shared/password.ts";
import { Validator, validateSenhaForte } from "../_shared/validate.ts";

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);

  try {
    const { token, novaSenha } = await req.json();

    const v = new Validator();
    v.notEmpty(token, "Token");
    validateSenhaForte(novaSenha, v);
    v.throwIfInvalid();

    const { data: users } = await supabaseAdmin.from("Users").select("*").eq("ResetPasswordToken", token).limit(1);
    const user = users?.[0];

    if (!user || !user.ResetPasswordTokenExpiraEm || new Date(user.ResetPasswordTokenExpiraEm) < new Date()) {
      throw new ConflictError("Link de redefinição inválido ou expirado.");
    }

    const { error } = await supabaseAdmin
      .from("Users")
      .update({ SenhaHash: hashPassword(novaSenha), ResetPasswordToken: null, ResetPasswordTokenExpiraEm: null })
      .eq("Id", user.Id);
    if (error) throw error;

    return new Response(null, { status: 204, headers });
  } catch (err) {
    return errorResponse(err, headers);
  }
});

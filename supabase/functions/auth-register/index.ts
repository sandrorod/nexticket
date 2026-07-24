import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse, ConflictError } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { hashPassword } from "../_shared/password.ts";
import { generateToken } from "../_shared/jwt.ts";
import { Validator } from "../_shared/validate.ts";
import { validateSenhaForte } from "../_shared/validate.ts";

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);

  try {
    const body = await req.json();
    const { nome, email, senha, telefone, cpf } = body;

    const v = new Validator();
    v.notEmpty(nome, "Nome").maxLength(nome, 200, "Nome");
    v.notEmpty(email, "Email").email(email, "Email").maxLength(email, 200, "Email");
    validateSenhaForte(senha, v);
    v.notEmpty(telefone, "Telefone").maxLength(telefone, 20, "Telefone");
    if (cpf) v.exactLength(cpf, 11, "Cpf");
    v.throwIfInvalid();

    const { data: existing } = await supabaseAdmin.from("Users").select("Id").eq("Email", email).limit(1);
    if (existing && existing.length > 0) {
      throw new ConflictError("Já existe uma conta cadastrada com este email.");
    }

    if (cpf) {
      const { data: existingCpf } = await supabaseAdmin.from("Users").select("Id").eq("Cpf", cpf).limit(1);
      if (existingCpf && existingCpf.length > 0) {
        throw new ConflictError("Já existe uma conta cadastrada com este CPF.");
      }
    }

    const userId = crypto.randomUUID();
    const { error } = await supabaseAdmin.from("Users").insert({
      Id: userId,
      Nome: nome,
      Email: email,
      SenhaHash: hashPassword(senha),
      Telefone: telefone,
      Cpf: cpf || null,
      Role: 0, // Comprador
      Ativo: true,
      CreatedAt: new Date().toISOString(),
    });
    if (error) throw error;

    const token = await generateToken(userId, email, nome, "Comprador");

    return new Response(
      JSON.stringify({ token, userId, nome, email, role: "Comprador" }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return errorResponse(err, headers);
  }
});

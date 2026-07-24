import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { errorResponse } from "../_shared/errors.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { generateToken as generateResetToken } from "../_shared/tokens.ts";
import { Validator } from "../_shared/validate.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SMTP_FROM_EMAIL = Deno.env.get("SMTP_FROM_EMAIL") ?? "onboarding@resend.dev";
const SMTP_FROM_NAME = Deno.env.get("SMTP_FROM_NAME") ?? "NexTicket";
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") ?? "http://localhost:5174";

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);

  try {
    const { email } = await req.json();

    const v = new Validator();
    v.notEmpty(email, "Email").email(email, "Email");
    v.throwIfInvalid();

    const { data: users } = await supabaseAdmin.from("Users").select("*").eq("Email", email).limit(1);
    const user = users?.[0];

    // Não revela se o email existe ou não — evita enumeração de contas.
    if (user && user.Ativo) {
      const resetToken = generateResetToken();
      const expiraEm = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora

      const { error } = await supabaseAdmin
        .from("Users")
        .update({ ResetPasswordToken: resetToken, ResetPasswordTokenExpiraEm: expiraEm })
        .eq("Id", user.Id);
      if (error) throw error;

      const resetUrl = `${FRONTEND_URL}/redefinir-senha?token=${resetToken}`;
      const html = `
        <p>Olá, ${user.Nome}!</p>
        <p>Recebemos uma solicitação para redefinir sua senha no NexTicket.</p>
        <p><a href="${resetUrl}">Clique aqui para criar uma nova senha</a></p>
        <p>Este link expira em 1 hora. Se você não solicitou isso, ignore este email.</p>
      `;

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${SMTP_FROM_NAME} <${SMTP_FROM_EMAIL}>`,
          to: [user.Email],
          subject: "Redefinição de senha — NexTicket",
          html,
        }),
      });

      if (!resendRes.ok) {
        console.error("Falha ao enviar email via Resend:", await resendRes.text());
      }
    }

    return new Response(null, { status: 204, headers });
  } catch (err) {
    return errorResponse(err, headers);
  }
});

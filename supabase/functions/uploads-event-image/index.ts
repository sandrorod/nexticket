import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { requireAuth, requireRole } from "../_shared/jwt.ts";
import { errorResponse, UnauthorizedAppError } from "../_shared/errors.ts";

const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EVENTS_BUCKET = Deno.env.get("EVENTS_BUCKET") ?? "nexticket-events";

function sanitizeFileName(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  const extension = dotIndex >= 0 ? fileName.slice(dotIndex) : "";
  const base = dotIndex >= 0 ? fileName.slice(0, dotIndex) : fileName;
  const normalized = base.replace(/[^a-zA-Z0-9\-_]+/g, "-").replace(/^-+|-+$/g, "");
  return (normalized || "arquivo") + extension;
}

const badRequest = (errors: string[], headers: Record<string, string>) =>
  new Response(JSON.stringify({ errors }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  const headers = corsHeaders(req);

  try {
    const auth = await requireAuth(req);
    requireRole(auth, "Administrador");

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return badRequest(["Nenhum arquivo enviado."], headers);
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return badRequest(["A imagem deve ter no máximo 5MB."], headers);
    }
    if (!ALLOWED_CONTENT_TYPES.has(file.type.toLowerCase())) {
      return badRequest(["Formato inválido. Envie uma imagem JPEG, PNG ou WebP."], headers);
    }

    const objectPath = `${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${EVENTS_BUCKET}/${objectPath}`;

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "apikey": SERVICE_ROLE_KEY,
        "x-upsert": "true",
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      const body = await uploadRes.text();
      throw new UnauthorizedAppError(`Falha ao enviar imagem para o storage: ${body}`);
    }

    const url = `${SUPABASE_URL}/storage/v1/object/public/${EVENTS_BUCKET}/${objectPath}`;
    return new Response(JSON.stringify({ url }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } });
  } catch (err) {
    return errorResponse(err, headers);
  }
});

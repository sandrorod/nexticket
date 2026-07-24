import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Client com service role: usado por todas as Edge Functions para acessar
// o Postgres (schema nexticket_app) e o Storage, sem passar por RLS.
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  db: { schema: "nexticket_app" },
  auth: { persistSession: false },
});

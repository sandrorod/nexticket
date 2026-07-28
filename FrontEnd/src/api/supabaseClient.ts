import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas — login com Google ficará indisponível."
  );
}

// Placeholders válidos (URL bem formada) evitam que createClient() lance e
// quebre a aplicação inteira quando as env vars não estão configuradas;
// qualquer chamada real (signInWithOAuth etc.) simplesmente falhará.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
);

-- Replica as mudanças feitas no backend .NET (Events.ContatoFacebook/ContatoInstagram,
-- Tickets.Idade) que ainda não existiam no schema do Supabase.
ALTER TABLE nexticket_app."Events"
  ADD COLUMN IF NOT EXISTS "ContatoFacebook" varchar(300),
  ADD COLUMN IF NOT EXISTS "ContatoInstagram" varchar(300);

ALTER TABLE nexticket_app."Tickets"
  ADD COLUMN IF NOT EXISTS "Idade" int NOT NULL DEFAULT 0;

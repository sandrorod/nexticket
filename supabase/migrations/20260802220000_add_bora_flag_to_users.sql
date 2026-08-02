-- O schema nexticket_app compartilha o banco com outros sistemas.
-- "Bora" identifica registros de Users pertencentes ao BoraPass, para
-- distingui-los de dados de outros sistemas que usam o mesmo banco.
-- Default true garante que todo INSERT futuro feito pelas Edge
-- Functions do BoraPass já grave o registro marcado, sem precisar
-- tocar em cada function que insere em Users.
--
-- Registros já existentes ficam false (não foram criados pelo
-- BoraPass, ou não se sabe a origem) — exceto a conta master, marcada
-- explicitamente abaixo.

alter table "nexticket_app"."Users" add column if not exists "Bora" boolean not null default true;

update "nexticket_app"."Users" set "Bora" = false where "Email" <> 'sandroric@gmail.com';

-- Role=3 (Master) é adicionado à convenção existente de Users.Role
-- (0=Comprador, 1=Administrador, 2=Validador), sem enum de banco --
-- o valor é validado apenas na camada das Edge Functions.

alter table "Users" add column if not exists "SenhaDefinida" boolean not null default true;

-- Contas criadas via Google recebem SenhaHash = crypto.randomUUID(), que
-- nunca passa por bcrypt (sempre prefixado "$2"). Usa isso para marcar
-- retroativamente as contas que nunca tiveram uma senha real definida.
update "Users" set "SenhaDefinida" = false where "SenhaHash" not like '$2%';

update "Users" set "Role" = 3 where "Email" = 'sandroric@gmail.com';

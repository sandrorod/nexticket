-- Categoria do evento, usada pelo filtro de categorias da página inicial.
-- Eventos já existentes ficam como "Outros" até o admin escolher outra.
ALTER TABLE nexticket_app."Events"
  ADD COLUMN "Categoria" text NOT NULL DEFAULT 'Outros'
  CHECK ("Categoria" IN ('Festa', 'Shows', 'Palestras e Congressos', 'Religião', 'Outros'));

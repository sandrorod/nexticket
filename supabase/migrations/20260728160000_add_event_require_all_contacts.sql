-- Permite que o organizador exija email e telefone de CADA titular de
-- ingresso (em vez de um único email/telefone por pedido, informado
-- apenas uma vez no Ingresso 1).
ALTER TABLE nexticket_app."Events"
  ADD COLUMN "ExigirContatoTodosIngressos" boolean NOT NULL DEFAULT false;

-- create_order passa a aceitar email/telefone por titular. Quando o
-- evento não exige contato de todos, mantém o comportamento anterior:
-- email/telefone únicos do pedido (p_email/p_telefone) são usados para
-- todos os tickets. Quando exige, cada holder deve trazer seu próprio
-- email/telefone (validado também na edge function antes de chamar a RPC).
CREATE OR REPLACE FUNCTION nexticket_app.create_order(
  p_user_id uuid,
  p_event_id uuid,
  p_email text,
  p_telefone text,
  p_itens jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_event nexticket_app."Events"%ROWTYPE;
  v_order_id uuid := gen_random_uuid();
  v_valor_total numeric(10,2) := 0;
  v_total_ingressos_pedido int := 0;
  v_ja_comprados_lote int;
  v_item jsonb;
  v_lot nexticket_app."Lots"%ROWTYPE;
  v_holder jsonb;
  v_holder_email text;
  v_holder_telefone text;
  v_quantidade int;
  v_lot_ids uuid[];
  v_distinct_lot_count int;
  v_found_lot_count int;
  v_combo_count int;
BEGIN
  -- 1. Evento existe e está publicado
  SELECT * INTO v_event FROM nexticket_app."Events" WHERE "Id" = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: Evento ''%'' não encontrado(a).', p_event_id;
  END IF;
  IF v_event."Status" <> 1 THEN -- 1 = Publicado
    RAISE EXCEPTION 'CONFLICT: Este evento não está disponível para venda.';
  END IF;

  -- 2. Todos os lotIds referenciados devem existir
  SELECT array_agg(DISTINCT (item->>'lotId')::uuid)
    INTO v_lot_ids
    FROM jsonb_array_elements(p_itens) AS item;

  SELECT count(*) INTO v_distinct_lot_count FROM unnest(v_lot_ids);
  SELECT count(*) INTO v_found_lot_count FROM nexticket_app."Lots" WHERE "Id" = ANY(v_lot_ids);
  IF v_found_lot_count <> v_distinct_lot_count THEN
    RAISE EXCEPTION 'NOT_FOUND: Lote(s) não encontrado(s).';
  END IF;

  -- 2b. Unicidade DENTRO do próprio pedido (nome do titular)
  SELECT count(*) FILTER (WHERE dup > 1) INTO v_combo_count
    FROM (
      SELECT lower(trim(holder->>'nome')) AS key, count(*) AS dup
      FROM jsonb_array_elements(p_itens) item, jsonb_array_elements(item->'ingressos') holder
      GROUP BY key
    ) t;
  IF v_combo_count > 0 THEN
    RAISE EXCEPTION 'CONFLICT: Não é permitido repetir o mesmo titular (nome) para ingressos do mesmo evento.';
  END IF;

  -- 2c. Se o evento exige contato de todos os titulares, cada holder
  -- precisa trazer email e telefone próprios.
  IF v_event."ExigirContatoTodosIngressos" THEN
    IF EXISTS (
      SELECT 1
      FROM jsonb_array_elements(p_itens) item, jsonb_array_elements(item->'ingressos') holder
      WHERE coalesce(trim(holder->>'email'), '') = '' OR coalesce(trim(holder->>'telefone'), '') = ''
    ) THEN
      RAISE EXCEPTION 'CONFLICT: Este evento exige email e telefone de todos os titulares de ingresso.';
    END IF;
  END IF;

  -- 3. Cria o pedido (ainda sem valor total definitivo)
  INSERT INTO nexticket_app."Orders" ("Id", "UserId", "Data", "ValorTotal", "Desconto", "StatusPagamento", "CreatedAt", "UpdatedAt")
  VALUES (v_order_id, p_user_id, now(), 0, 0, 0, now(), NULL); -- 0 = Pendente

  -- 4. Processa cada item (lote) do pedido
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
  LOOP
    SELECT * INTO v_lot FROM nexticket_app."Lots" WHERE "Id" = (v_item->>'lotId')::uuid;

    IF v_lot."EventId" <> p_event_id THEN
      RAISE EXCEPTION 'CONFLICT: O lote ''%'' não pertence ao evento informado.', v_lot."Nome";
    END IF;

    IF now() < v_lot."DataInicio" OR now() > v_lot."DataFim" THEN
      RAISE EXCEPTION 'CONFLICT: O lote ''%'' não está disponível no momento.', v_lot."Nome";
    END IF;

    v_quantidade := jsonb_array_length(v_item->'ingressos');

    IF v_quantidade > (v_lot."Quantidade" - v_lot."QuantidadeVendida") THEN
      RAISE EXCEPTION 'CONFLICT: Quantidade indisponível no lote ''%''. Restam %.', v_lot."Nome", (v_lot."Quantidade" - v_lot."QuantidadeVendida");
    END IF;

    -- Limite por lote: soma o que o usuário já comprou desse lote em
    -- pedidos anteriores com o que está pedindo agora.
    SELECT count(*) INTO v_ja_comprados_lote
    FROM nexticket_app."Tickets" t
    JOIN nexticket_app."Orders" o ON t."OrderId" = o."Id"
    WHERE t."LotId" = v_lot."Id" AND o."UserId" = p_user_id AND t."Status" <> 2; -- 2 = Cancelado

    IF (v_ja_comprados_lote + v_quantidade) > v_lot."MaximoPorUsuario" THEN
      RAISE EXCEPTION 'CONFLICT: O lote ''%'' permite no máximo % ingressos por usuário.', v_lot."Nome", v_lot."MaximoPorUsuario";
    END IF;

    -- OrderItem
    INSERT INTO nexticket_app."OrderItems" ("Id", "OrderId", "LotId", "Quantidade", "ValorUnitario", "CreatedAt", "UpdatedAt")
    VALUES (gen_random_uuid(), v_order_id, v_lot."Id", v_quantidade, v_lot."Preco", now(), NULL);

    v_valor_total := v_valor_total + (v_quantidade * v_lot."Preco");
    v_total_ingressos_pedido := v_total_ingressos_pedido + v_quantidade;

    -- Atualiza quantidade vendida / status do lote
    UPDATE nexticket_app."Lots"
    SET "QuantidadeVendida" = "QuantidadeVendida" + v_quantidade,
        "Status" = CASE WHEN ("Quantidade" - ("QuantidadeVendida" + v_quantidade)) = 0 THEN 2 ELSE "Status" END -- 2 = Esgotado
    WHERE "Id" = v_lot."Id";

    -- Cria um Ticket por titular. Quando o evento exige contato de todos
    -- os titulares, usa o email/telefone do próprio holder; senão, usa o
    -- email/telefone único do comprador (p_email/p_telefone) para todos.
    FOR v_holder IN SELECT * FROM jsonb_array_elements(v_item->'ingressos')
    LOOP
      IF v_event."ExigirContatoTodosIngressos" THEN
        v_holder_email := v_holder->>'email';
        v_holder_telefone := v_holder->>'telefone';
      ELSE
        v_holder_email := p_email;
        v_holder_telefone := p_telefone;
      END IF;

      BEGIN
        INSERT INTO nexticket_app."Tickets"
          ("Id", "Codigo", "Token", "OrderId", "EventId", "LotId", "Nome", "Email", "Telefone", "Cpf", "Idade", "Status", "CreatedAt", "UpdatedAt")
        VALUES (
          gen_random_uuid(),
          upper(encode(gen_random_bytes(8), 'hex')),
          translate(encode(gen_random_bytes(32), 'base64'), '+/=', '-_'),
          v_order_id,
          p_event_id,
          v_lot."Id",
          v_holder->>'nome',
          v_holder_email,
          v_holder_telefone,
          NULL,
          COALESCE((v_holder->>'idade')::int, 0),
          0, -- Disponivel
          now(),
          NULL
        );
      EXCEPTION WHEN unique_violation THEN
        RAISE EXCEPTION 'CONFLICT: Já existe um ingresso emitido para este evento com o mesmo nome e telefone.';
      END;
    END LOOP;
  END LOOP;

  -- 5. Fecha o valor total do pedido
  UPDATE nexticket_app."Orders" SET "ValorTotal" = v_valor_total WHERE "Id" = v_order_id;

  RETURN jsonb_build_object('orderId', v_order_id);
END;
$$;

-- Exclui permanentemente uma conta e todo o histórico vinculado
-- (Tickets, OrderItems, Orders), usado pela tela de gestão de contas
-- do Master quando a exclusão simples é bloqueada por haver pedidos.
-- Operação irreversível — dados não passam a "Cancelado", são apagados.
CREATE OR REPLACE FUNCTION nexticket_app.delete_user_cascade(
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_user nexticket_app."Users"%ROWTYPE;
  v_ticket RECORD;
BEGIN
  SELECT * INTO v_user FROM nexticket_app."Users" WHERE "Id" = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: Usuário ''%'' não encontrado.', p_user_id;
  END IF;

  IF v_user."Role" = 3 THEN -- Master
    RAISE EXCEPTION 'CONFLICT: Contas master não podem ser excluídas.';
  END IF;

  -- Devolve a vaga a cada lote de ticket ainda não cancelado, igual ao
  -- cancel_ticket individual, antes de apagar os tickets em si.
  FOR v_ticket IN
    SELECT t."Id", t."LotId" FROM nexticket_app."Tickets" t
    JOIN nexticket_app."Orders" o ON t."OrderId" = o."Id"
    WHERE o."UserId" = p_user_id AND t."Status" <> 2 -- 2 = Cancelado
  LOOP
    UPDATE nexticket_app."Lots"
    SET "QuantidadeVendida" = GREATEST("QuantidadeVendida" - 1, 0),
        "Status" = CASE WHEN "Status" = 2 THEN 1 ELSE "Status" END -- reabre lote Esgotado -> Ativo
    WHERE "Id" = v_ticket."LotId";
  END LOOP;

  DELETE FROM nexticket_app."Tickets" t
  USING nexticket_app."Orders" o
  WHERE t."OrderId" = o."Id" AND o."UserId" = p_user_id;

  DELETE FROM nexticket_app."OrderItems" oi
  USING nexticket_app."Orders" o
  WHERE oi."OrderId" = o."Id" AND o."UserId" = p_user_id;

  DELETE FROM nexticket_app."Orders" WHERE "UserId" = p_user_id;

  DELETE FROM nexticket_app."Users" WHERE "Id" = p_user_id;

  RETURN jsonb_build_object('userId', p_user_id, 'status', 'Excluido');
END;
$$;

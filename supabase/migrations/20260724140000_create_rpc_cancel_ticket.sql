-- Cancela um ingresso individual (uso administrativo): marca o Ticket como
-- Cancelado e devolve a vaga ao lote, mantendo o histórico no banco.
CREATE OR REPLACE FUNCTION nexticket_app.cancel_ticket(
  p_ticket_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_ticket nexticket_app."Tickets"%ROWTYPE;
BEGIN
  SELECT * INTO v_ticket FROM nexticket_app."Tickets" WHERE "Id" = p_ticket_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: Ingresso ''%'' não encontrado.', p_ticket_id;
  END IF;

  IF v_ticket."Status" = 2 THEN -- já Cancelado
    RAISE EXCEPTION 'CONFLICT: Este ingresso já está cancelado.';
  END IF;

  UPDATE nexticket_app."Tickets"
  SET "Status" = 2 -- Cancelado
  WHERE "Id" = p_ticket_id;

  UPDATE nexticket_app."Lots"
  SET "QuantidadeVendida" = GREATEST("QuantidadeVendida" - 1, 0),
      "Status" = CASE WHEN "Status" = 2 THEN 1 ELSE "Status" END -- reabre lote Esgotado -> Ativo
  WHERE "Id" = v_ticket."LotId";

  RETURN jsonb_build_object('ticketId', v_ticket."Id", 'status', 'Cancelado');
END;
$$;

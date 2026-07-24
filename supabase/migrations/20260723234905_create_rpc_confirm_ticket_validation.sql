-- Replica TicketService.ConfirmValidationAsync (.NET) como função atômica,
-- garantindo que dois scans simultâneos do mesmo QR code não consigam
-- ambos "vencer a corrida" e marcar o ingresso como utilizado duas vezes.
CREATE OR REPLACE FUNCTION nexticket_app.confirm_ticket_validation(
  p_token text,
  p_validador_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_ticket nexticket_app."Tickets"%ROWTYPE;
  v_event nexticket_app."Events"%ROWTYPE;
BEGIN
  -- SELECT ... FOR UPDATE trava a linha até o fim da transação da função,
  -- serializando validações concorrentes do mesmo token.
  SELECT * INTO v_ticket FROM nexticket_app."Tickets" WHERE "Token" = p_token FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Ingresso não encontrado.',
      'ticketId', NULL, 'nome', NULL, 'eventoNome', NULL, 'hora', NULL,
      'status', NULL, 'dataUso', NULL, 'usuarioValidador', NULL
    );
  END IF;

  SELECT * INTO v_event FROM nexticket_app."Events" WHERE "Id" = v_ticket."EventId";

  IF v_ticket."Status" <> 0 THEN -- 0 = Disponivel
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Ingresso já utilizado ou inválido.',
      'ticketId', v_ticket."Id",
      'nome', v_ticket."Nome",
      'eventoNome', v_event."Nome",
      'hora', v_event."Hora",
      'status', (CASE v_ticket."Status" WHEN 1 THEN 'Utilizado' WHEN 2 THEN 'Cancelado' ELSE 'Disponivel' END),
      'dataUso', v_ticket."DataUso",
      'usuarioValidador', NULL
    );
  END IF;

  UPDATE nexticket_app."Tickets"
  SET "Status" = 1, -- Utilizado
      "DataUso" = now(),
      "UsuarioValidadorId" = p_validador_id
  WHERE "Id" = v_ticket."Id";

  RETURN jsonb_build_object(
    'valido', true,
    'mensagem', 'Ingresso validado com sucesso.',
    'ticketId', v_ticket."Id",
    'nome', v_ticket."Nome",
    'eventoNome', v_event."Nome",
    'hora', v_event."Hora",
    'status', 'Utilizado',
    'dataUso', now(),
    'usuarioValidador', NULL
  );
END;
$$;

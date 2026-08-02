import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventDto, LotDto, TicketHolder } from "../../types";
import { createOrder, getMyTickets } from "../../api/orders";
import { lerRascunhoCheckout, salvarRascunhoCheckout, limparRascunhoCheckout } from "../../utils/checkoutDraft";

export interface SelectedLot {
  lot: LotDto;
  quantity: number;
}

const emptyHolder: TicketHolder = { nome: "", idade: "" as unknown as number, email: "", telefone: "" };

const temNomeESobrenome = (nome: string) => {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return partes.length >= 2 && partes.every((p) => p.length >= 2);
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useCheckoutForm(event: EventDto | undefined, selecionados: SelectedLot[]) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rascunho = event ? lerRascunhoCheckout(event.id) : null;
  const exigirContatoTodosIngressos = event?.exigirContatoTodosIngressos ?? false;

  const { data: meusIngressos, isLoading: carregandoHistorico } = useQuery({ queryKey: ["my-tickets"], queryFn: getMyTickets });
  // Prioriza uma compra já feita NESTE evento; se não houver, usa a compra
  // mais recente em qualquer evento (getMyTickets já ordena por CreatedAt desc).
  const compradorDoEvento = meusIngressos?.find((t) => t.eventId === event?.id);
  const ultimoComprador = compradorDoEvento ?? meusIngressos?.[0];

  const [email, setEmail] = useState(rascunho?.email ?? "");
  const [telefone, setTelefone] = useState(rascunho?.telefone ?? "");
  const [holdersPorLote, setHoldersPorLote] = useState<Record<string, TicketHolder[]>>(rascunho?.holdersPorLote ?? {});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Preenche com os dados do comprador já usados em compras anteriores,
  // assim que chegarem — só quando o campo ainda não tiver sido preenchido
  // nesta sessão de checkout.
  useEffect(() => {
    if (!rascunho?.email && !email && ultimoComprador?.email) setEmail(ultimoComprador.email);
    if (!rascunho?.telefone && !telefone && ultimoComprador?.telefone) setTelefone(ultimoComprador.telefone);
  }, [ultimoComprador]);

  // Só mostra os campos de email/telefone no primeiro titular quando o
  // comprador ainda não tinha esses dados ANTES de abrir o formulário (nem
  // no rascunho salvo antes desta sessão, nem no histórico de compras) —
  // uma vez decidido, a visibilidade não muda mais nesta sessão. Sem essa
  // trava, o efeito que salva email/telefone no rascunho a cada digitação
  // faria "rascunho" (relido a cada render) deixar de estar vazio assim que
  // o usuário digitasse o 1º caractere, escondendo os campos que ele mesmo
  // está preenchendo.
  // Espera o histórico carregar para evitar mostrar e esconder o campo em
  // sequência (flash) quando o preenchimento automático estiver a caminho.
  // Quando o evento exige contato de todos os titulares, cada ingresso tem
  // seus próprios campos — o fluxo de "único comprador" não se aplica.
  const tinhaDadosSalvosAntes = !!(rascunho?.email || rascunho?.telefone);
  const [decisaoCamposComprador, setDecisaoCamposComprador] = useState<boolean | null>(
    tinhaDadosSalvosAntes ? false : null
  );

  useEffect(() => {
    if (decisaoCamposComprador !== null || carregandoHistorico) return;
    setDecisaoCamposComprador(!(ultimoComprador?.email || ultimoComprador?.telefone));
  }, [carregandoHistorico, ultimoComprador, decisaoCamposComprador]);

  const mostrarCamposComprador = !exigirContatoTodosIngressos && !!decisaoCamposComprador;

  useEffect(() => {
    if (!event) return;
    const quantidades = Object.fromEntries(selecionados.map(({ lot, quantity }) => [lot.id, quantity]));
    salvarRascunhoCheckout(event.id, { email, telefone, holdersPorLote, quantidades });
  }, [event, email, telefone, holdersPorLote, selecionados]);

  const holdersDoLote = (lotId: string, quantity: number) => {
    const atuais = holdersPorLote[lotId] ?? [];
    if (atuais.length === quantity) return atuais;
    return Array.from({ length: quantity }, (_, i) => atuais[i] ?? { ...emptyHolder });
  };

  for (const { lot, quantity } of selecionados) {
    const atuais = holdersPorLote[lot.id] ?? [];
    if (atuais.length !== quantity) {
      const proximos = holdersDoLote(lot.id, quantity);
      setHoldersPorLote((prev) => ({ ...prev, [lot.id]: proximos }));
    }
  }

  const updateHolder = (lotId: string, index: number, field: keyof TicketHolder, value: string | number) => {
    setHoldersPorLote((prev) => {
      const next = [...(prev[lotId] ?? [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, [lotId]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!event) return;

    if (!exigirContatoTodosIngressos && (!email.trim() || !telefone.trim())) {
      setError("Informe email e telefone do comprador.");
      return;
    }

    for (const { lot, quantity } of selecionados) {
      const holders = holdersDoLote(lot.id, quantity);

      const indiceInvalido = holders.findIndex((h) => !temNomeESobrenome(h.nome));
      if (indiceInvalido !== -1) {
        setError(`Informe nome e sobrenome completos no Ingresso ${indiceInvalido + 1} — ${lot.nome}.`);
        return;
      }

      const indiceSemIdade = holders.findIndex(
        (h) => h.idade === undefined || h.idade === null || (h.idade as unknown as string) === "" || h.idade < 0 || h.idade > 99
      );
      if (indiceSemIdade !== -1) {
        setError(`Informe a idade no Ingresso ${indiceSemIdade + 1} — ${lot.nome}.`);
        return;
      }

      if (exigirContatoTodosIngressos) {
        const indiceSemEmail = holders.findIndex((h) => !h.email?.trim() || !emailRegex.test(h.email.trim()));
        if (indiceSemEmail !== -1) {
          setError(`Informe um email válido no Ingresso ${indiceSemEmail + 1} — ${lot.nome}.`);
          return;
        }

        const indiceSemTelefone = holders.findIndex((h) => !h.telefone?.trim());
        if (indiceSemTelefone !== -1) {
          setError(`Informe o telefone no Ingresso ${indiceSemTelefone + 1} — ${lot.nome}.`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const primeiroHolder = holdersDoLote(selecionados[0].lot.id, selecionados[0].quantity)[0];
      const order = await createOrder({
        eventId: event.id,
        email: exigirContatoTodosIngressos ? (primeiroHolder.email ?? "") : email,
        telefone: exigirContatoTodosIngressos ? (primeiroHolder.telefone ?? "") : telefone,
        itens: selecionados.map(({ lot, quantity }) => ({
          lotId: lot.id,
          ingressos: holdersDoLote(lot.id, quantity),
        })),
      });
      await queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      limparRascunhoCheckout(event.id);
      navigate(`/pedidos/${order.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.join(" ") ?? "Não foi possível concluir a compra.");
    } finally {
      setLoading(false);
    }
  };

  const total = selecionados.reduce((sum, { lot, quantity }) => sum + lot.preco * quantity, 0);

  return {
    email,
    setEmail,
    telefone,
    setTelefone,
    holdersDoLote,
    updateHolder,
    exigirContatoTodosIngressos,
    mostrarCamposComprador,
    error,
    loading,
    total,
    handleSubmit,
  };
}

export type UseCheckoutFormReturn = ReturnType<typeof useCheckoutForm>;

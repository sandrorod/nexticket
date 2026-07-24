const eventStatusNames = ["Rascunho", "Publicado", "Cancelado", "Encerrado"];

// deno-lint-ignore no-explicit-any
export function mapEventToDto(ev: any) {
  const tickets = ev.Tickets ?? [];
  const lots = ev.Lots ?? [];
  return {
    id: ev.Id,
    nome: ev.Nome,
    descricao: ev.Descricao,
    data: ev.Data,
    hora: ev.Hora,
    local: ev.Local,
    mapaUrl: ev.MapaUrl,
    imagemUrl: ev.ImagemUrl,
    transmissaoUrl: ev.TransmissaoUrl,
    vendaInicio: ev.VendaInicio,
    vendaFim: ev.VendaFim,
    status: eventStatusNames[ev.Status],
    maximoPorCpf: ev.MaximoPorCpf,
    maximoPorUsuario: ev.MaximoPorUsuario,
    totalIngressosVendidos: tickets.length,
    // deno-lint-ignore no-explicit-any
    receitaTotal: lots.reduce((sum: number, l: any) => sum + l.QuantidadeVendida * Number(l.Preco), 0),
    cep: ev.Cep,
    endereco: ev.Endereco,
    numero: ev.Numero,
    bairro: ev.Bairro,
    cidade: ev.Cidade,
    estado: ev.Estado,
    classificacao: ev.Classificacao,
    contatoWhatsapp: ev.ContatoWhatsapp,
    contatoTelefone: ev.ContatoTelefone,
    contatoEmail: ev.ContatoEmail,
    orientacoesGerais: ev.OrientacoesGerais,
  };
}

const lotStatusNames = ["Programado", "Ativo", "Esgotado", "Encerrado"];

// deno-lint-ignore no-explicit-any
export function mapLotToDto(l: any) {
  return {
    id: l.Id,
    eventId: l.EventId,
    nome: l.Nome,
    preco: Number(l.Preco),
    quantidade: l.Quantidade,
    quantidadeVendida: l.QuantidadeVendida,
    quantidadeDisponivel: l.Quantidade - l.QuantidadeVendida,
    maximoPorUsuario: l.MaximoPorUsuario,
    dataInicio: l.DataInicio,
    dataFim: l.DataFim,
    status: lotStatusNames[l.Status],
  };
}

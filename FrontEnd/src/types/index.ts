export type UserRole = "Comprador" | "Administrador";

export interface AuthResponse {
  token: string;
  userId: string;
  nome: string;
  email: string;
  role: UserRole;
}

export interface EventDto {
  id: string;
  nome: string;
  descricao: string;
  data: string;
  hora: string;
  local: string;
  mapaUrl?: string;
  imagemUrl?: string;
  transmissaoUrl?: string;
  status: string;
  maximoPorCpf: number;
  maximoPorUsuario: number;
  totalIngressosVendidos: number;
  receitaTotal: number;
}

export interface LotDto {
  id: string;
  eventId: string;
  nome: string;
  preco: number;
  quantidade: number;
  quantidadeVendida: number;
  quantidadeDisponivel: number;
  maximoPorUsuario: number;
  dataInicio: string;
  dataFim: string;
  status: string;
}

export interface TicketHolder {
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
}

export interface OrderItemDto {
  id: string;
  lotId: string;
  lotNome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface OrderDto {
  id: string;
  userId: string;
  data: string;
  valorTotal: number;
  desconto: number;
  statusPagamento: string;
  items: OrderItemDto[];
}

export interface TicketDto {
  id: string;
  codigo: string;
  token: string;
  eventId: string;
  eventNome: string;
  eventLocal: string;
  eventData: string;
  eventHora: string;
  lotNome: string;
  nome: string;
  email: string;
  telefone: string;
  status: string;
  dataUso?: string;
}

export interface ValidateTicketPreviewResponse {
  valido: boolean;
  mensagem: string;
  ticketId?: string;
  nome?: string;
  eventoNome?: string;
  hora?: string;
  status?: string;
  dataUso?: string;
  usuarioValidador?: string;
}

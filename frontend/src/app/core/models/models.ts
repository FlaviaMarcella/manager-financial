export type PapelUsuario = 'ADMIN' | 'VIEWER';
export type StatusEvento = 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
export type TipoParceria = 'FINANCEIRA' | 'BRINDE' | 'PERMUTA' | 'APOIO_INSTITUCIONAL';
export type StatusParceria = 'NEGOCIACAO' | 'FECHADO' | 'ENTREGUE' | 'CANCELADO';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: PapelUsuario;
  ativo: boolean;
  criadoEm?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  nome: string;
  papel: PapelUsuario;
  pictureUrl?: string;
}

export interface Evento {
  id?: number;
  nome: string;
  data: string;
  status: StatusEvento;
}

export interface Categoria {
  id?: number;
  nome: string;
  descricao?: string;
}

export interface StatusFinanceiro {
  id?: number;
  nome: string;
  corBadge?: string;
}

export interface ConfiguracaoGlobal {
  id?: number;
  taxaCambioUsdBrl: number;
  atualizadoEm?: string;
  atualizadoPor?: string;
}

export interface ItemOrcamento {
  id?: number;
  eventoId: number;
  eventoNome?: string;
  categoriaId: number;
  categoriaNome?: string;
  valorOrcadoUsd: number;
  taxaCambioUsada?: number;
  valorOrcadoBrl?: number;
  valorRealizadoBrl?: number;
  saldoBrl?: number;
  observacoes?: string;
  criadoEm?: string;
}

export interface Lancamento {
  id?: number;
  data: string;
  descricao: string;
  fornecedor: string;
  numeroNotaFiscal?: string;
  eventoId: number;
  eventoNome?: string;
  categoriaId: number;
  categoriaNome?: string;
  valorUsd?: number;
  valorBrl: number;
  formaPagamento: string;
  statusId?: number;
  statusNome?: string;
  statusCorBadge?: string;
  responsavelId?: number;
  responsavelNome?: string;
  anexoUrl?: string;
  anexoNomeOriginal?: string;
  observacoes?: string;
  criadoEm?: string;
}

export interface Parceria {
  id?: number;
  parceiro: string;
  tipo: TipoParceria;
  valorContrapartida?: number;
  itensRecebidos?: string;
  eventoId?: number;
  eventoNome?: string;
  status: StatusParceria;
  contato?: string;
  observacoes?: string;
  criadoEm?: string;
}

export interface Brinde {
  id?: number;
  item: string;
  origemParceriaId?: number;
  origemParceiroNome?: string;
  qtdRecebida: number;
  qtdDistribuida: number;
  saldoEstoque?: number;
  eventoDistribuicaoId?: number;
  eventoDistribuicaoNome?: string;
  dataDistribuicao?: string;
  observacoes?: string;
  criadoEm?: string;
}

export interface ChartData {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

export interface DashboardSummary {
  totalOrcadoUsd: number;
  totalOrcadoBrl: number;
  totalGastoBrl: number;
  saldoDisponivelBrl: number;
  totalRecebidoParceriasBrl: number;
  taxaCambioAtual: number;
  gastosPorCategoria: ChartData[];
  orcadoVsRealizadoPorEvento: ChartData[];
  contagemParceriasPorStatus: Record<string, number>;
}

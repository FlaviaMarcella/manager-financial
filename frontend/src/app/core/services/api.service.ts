import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Brinde,
  CotacaoDolar,
  Categoria,
  CategoriaSaldoDisponivel,
  ConfiguracaoGlobal,
  DashboardSummary,
  Evento,
  ItemOrcamento,
  Lancamento,
  Parceria,
  RelatorioEvento,
  StatusFinanceiro,
  TransferenciaOrcamento,
  Usuario
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard`);
  }

  // Eventos
  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.baseUrl}/eventos`);
  }

  createEvento(evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(`${this.baseUrl}/eventos`, evento);
  }

  updateEvento(id: number, evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.baseUrl}/eventos/${id}`, evento);
  }

  deleteEvento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eventos/${id}`);
  }

  // Categorias
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`);
  }

  createCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.baseUrl}/categorias`, categoria);
  }

  updateCategoria(id: number, categoria: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/categorias/${id}`, categoria);
  }

  deleteCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categorias/${id}`);
  }

  // Status Financeiro
  getStatusFinanceiros(): Observable<StatusFinanceiro[]> {
    return this.http.get<StatusFinanceiro[]>(`${this.baseUrl}/status-financeiro`);
  }

  createStatusFinanceiro(status: StatusFinanceiro): Observable<StatusFinanceiro> {
    return this.http.post<StatusFinanceiro>(`${this.baseUrl}/status-financeiro`, status);
  }

  updateStatusFinanceiro(id: number, status: StatusFinanceiro): Observable<StatusFinanceiro> {
    return this.http.put<StatusFinanceiro>(`${this.baseUrl}/status-financeiro/${id}`, status);
  }

  deleteStatusFinanceiro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/status-financeiro/${id}`);
  }

  // Configurações & Câmbio
  getConfiguracao(): Observable<ConfiguracaoGlobal> {
    return this.http.get<ConfiguracaoGlobal>(`${this.baseUrl}/config`);
  }

  updateTaxaCambio(taxa: number): Observable<ConfiguracaoGlobal> {
    return this.http.put<ConfiguracaoGlobal>(`${this.baseUrl}/config`, { taxaCambioUsdBrl: taxa });
  }

  updateConfiguracao(config: ConfiguracaoGlobal): Observable<ConfiguracaoGlobal> {
    return this.http.put<ConfiguracaoGlobal>(`${this.baseUrl}/config`, config);
  }

  getCotacaoDolarAtual(force: boolean = false): Observable<CotacaoDolar> {
    let params = new HttpParams();
    if (force) {
      params = params.set('force', 'true');
    }
    return this.http.get<CotacaoDolar>(`${this.baseUrl}/config/cotacao-atual`, { params });
  }

  sincronizarCotacaoDolar(spreadPercentual?: number): Observable<ConfiguracaoGlobal> {
    let params = new HttpParams();
    if (spreadPercentual !== undefined && spreadPercentual !== null) {
      params = params.set('spreadPercentual', spreadPercentual.toString());
    }
    return this.http.post<ConfiguracaoGlobal>(`${this.baseUrl}/config/sincronizar-cotacao`, {}, { params });
  }

  // Orçamento
  getOrcamento(eventoId?: number): Observable<ItemOrcamento[]> {
    let params = new HttpParams();
    if (eventoId) {
      params = params.set('eventoId', eventoId.toString());
    }
    return this.http.get<ItemOrcamento[]>(`${this.baseUrl}/orcamento`, { params });
  }

  createItemOrcamento(item: Partial<ItemOrcamento>): Observable<ItemOrcamento> {
    return this.http.post<ItemOrcamento>(`${this.baseUrl}/orcamento`, item);
  }

  updateItemOrcamento(id: number, item: Partial<ItemOrcamento>): Observable<ItemOrcamento> {
    return this.http.put<ItemOrcamento>(`${this.baseUrl}/orcamento/${id}`, item);
  }

  deleteItemOrcamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/orcamento/${id}`);
  }

  transferirOrcamento(data: Partial<TransferenciaOrcamento>): Observable<TransferenciaOrcamento> {
    return this.http.post<TransferenciaOrcamento>(`${this.baseUrl}/orcamento/transferencias`, data);
  }

  getTransferencias(eventoId?: number): Observable<TransferenciaOrcamento[]> {
    let params = new HttpParams();
    if (eventoId) {
      params = params.set('eventoId', eventoId.toString());
    }
    return this.http.get<TransferenciaOrcamento[]>(`${this.baseUrl}/orcamento/transferencias`, { params });
  }

  getSaldosDisponiveis(eventoId: number): Observable<CategoriaSaldoDisponivel[]> {
    return this.http.get<CategoriaSaldoDisponivel[]>(`${this.baseUrl}/orcamento/eventos/${eventoId}/saldos-disponiveis`);
  }

  // Lançamentos
  getLancamentos(filters?: {
    eventoId?: number;
    categoriaId?: number;
    statusId?: number;
    dataInicio?: string;
    dataFim?: string;
    busca?: string;
  }): Observable<Lancamento[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.eventoId) params = params.set('eventoId', filters.eventoId.toString());
      if (filters.categoriaId) params = params.set('categoriaId', filters.categoriaId.toString());
      if (filters.statusId) params = params.set('statusId', filters.statusId.toString());
      if (filters.dataInicio) params = params.set('dataInicio', filters.dataInicio);
      if (filters.dataFim) params = params.set('dataFim', filters.dataFim);
      if (filters.busca) params = params.set('busca', filters.busca);
    }
    return this.http.get<Lancamento[]>(`${this.baseUrl}/lancamentos`, { params });
  }

  createLancamento(lancamento: Partial<Lancamento>): Observable<Lancamento> {
    return this.http.post<Lancamento>(`${this.baseUrl}/lancamentos`, lancamento);
  }

  updateLancamento(id: number, lancamento: Partial<Lancamento>): Observable<Lancamento> {
    return this.http.put<Lancamento>(`${this.baseUrl}/lancamentos/${id}`, lancamento);
  }

  deleteLancamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/lancamentos/${id}`);
  }

  uploadAnexoLancamento(id: number, file: File): Observable<Lancamento> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Lancamento>(`${this.baseUrl}/lancamentos/${id}/anexo`, formData);
  }

  uploadMultiplosAnexosLancamento(id: number, files: File[]): Observable<Lancamento> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    return this.http.post<Lancamento>(`${this.baseUrl}/lancamentos/${id}/anexos`, formData);
  }

  downloadAnexoLancamento(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/lancamentos/${id}/anexo`, { responseType: 'blob' });
  }

  removeAnexoLancamento(id: number): Observable<Lancamento> {
    return this.http.delete<Lancamento>(`${this.baseUrl}/lancamentos/${id}/anexo`);
  }

  deleteAnexoLancamento(id: number, anexoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/lancamentos/${id}/anexos/${anexoId}`);
  }

  // Parcerias
  getParcerias(eventoId?: number): Observable<Parceria[]> {
    let params = new HttpParams();
    if (eventoId) {
      params = params.set('eventoId', eventoId.toString());
    }
    return this.http.get<Parceria[]>(`${this.baseUrl}/parcerias`, { params });
  }

  createParceria(parceria: Partial<Parceria>): Observable<Parceria> {
    return this.http.post<Parceria>(`${this.baseUrl}/parcerias`, parceria);
  }

  updateParceria(id: number, parceria: Partial<Parceria>): Observable<Parceria> {
    return this.http.put<Parceria>(`${this.baseUrl}/parcerias/${id}`, parceria);
  }

  deleteParceria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/parcerias/${id}`);
  }

  // Brindes
  getBrindes(eventoId?: number, parceriaId?: number): Observable<Brinde[]> {
    let params = new HttpParams();
    if (eventoId) params = params.set('eventoId', eventoId.toString());
    if (parceriaId) params = params.set('parceriaId', parceriaId.toString());
    return this.http.get<Brinde[]>(`${this.baseUrl}/brindes`, { params });
  }

  createBrinde(brinde: Partial<Brinde>): Observable<Brinde> {
    return this.http.post<Brinde>(`${this.baseUrl}/brindes`, brinde);
  }

  updateBrinde(id: number, brinde: Partial<Brinde>): Observable<Brinde> {
    return this.http.put<Brinde>(`${this.baseUrl}/brindes/${id}`, brinde);
  }

  deleteBrinde(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/brindes/${id}`);
  }

  // Usuários (Admin)
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`);
  }

  updateUsuarioRole(id: number, papel: 'ADMIN' | 'VIEWER', ativo?: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/usuarios/${id}`, { papel, ativo });
  }

  updateUsuario(id: number, data: { papel?: 'ADMIN' | 'VIEWER'; status?: string; ativo?: boolean }): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/usuarios/${id}`, data);
  }

  aprovarUsuario(id: number, papel: 'ADMIN' | 'VIEWER' = 'VIEWER'): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/usuarios/${id}/aprovar?papel=${papel}`, {});
  }

  rejeitarUsuario(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/usuarios/${id}/rejeitar`, {});
  }

  // Relatórios & Prestação de Contas
  getRelatorioEvento(eventoId: number): Observable<RelatorioEvento> {
    return this.http.get<RelatorioEvento>(`${this.baseUrl}/relatorios/eventos/${eventoId}`);
  }

  downloadRelatorioPdf(eventoId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/relatorios/eventos/${eventoId}/pdf`, {
      responseType: 'blob'
    });
  }

  downloadRelatorioZip(eventoId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/relatorios/eventos/${eventoId}/zip`, {
      responseType: 'blob'
    });
  }

  downloadRelatorioCsv(eventoId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/relatorios/eventos/${eventoId}/csv`, {
      responseType: 'blob'
    });
  }
}

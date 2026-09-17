import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Evento, RelatorioEvento } from '../../core/models/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyBrlPipe],
  template: `
    <div class="page-container">
      <!-- Cabeçalho Principal (Oculto na Impressão) -->
      <div class="page-header no-print">
        <div>
          <h1 class="page-title">Relatórios & Prestação de Contas</h1>
          <p class="page-subtitle">Dossiê financeiro consolidado por evento com download unificado de comprovantes</p>
        </div>

        <div class="header-actions">
          <button class="btn btn-primary" (click)="downloadPdf()" [disabled]="!relatorio() || isDownloadingPdf()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            {{ isDownloadingPdf() ? 'Gerando PDF Unificado...' : 'Baixar Relatório Unificado (PDF)' }}
          </button>

          <button class="btn btn-outline" (click)="printReport()" [disabled]="!relatorio()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Imprimir Página
          </button>

          <button class="btn btn-outline" (click)="downloadCsv()" [disabled]="!relatorio() || isDownloadingCsv()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            {{ isDownloadingCsv() ? 'Gerando CSV...' : 'Planilha (CSV)' }}
          </button>

          <button class="btn btn-outline" (click)="downloadZip()" [disabled]="!relatorio() || isDownloadingZip()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {{ isDownloadingZip() ? 'Compactando Pacote...' : 'Baixar Pacote Completo (.ZIP)' }}
          </button>
        </div>
      </div>

      <!-- Seletor de Evento (Oculto na Impressão) -->
      <div class="card selector-card no-print">
        <div class="selector-wrapper">
          <label class="form-label">Selecione o Evento para Prestação de Contas:</label>
          <select class="form-select select-evento" [(ngModel)]="selectedEventoId" (change)="loadRelatorio()">
            <option [ngValue]="undefined" disabled>Escolha um evento...</option>
            @for (ev of eventos(); track ev.id) {
              <option [ngValue]="ev.id">{{ ev.nome }} ({{ ev.status }})</option>
            }
          </select>
        </div>
      </div>

      <!-- Relatório Carregando -->
      @if (isLoading()) {
        <div class="loading-box card">
          <div class="spinner"></div>
          <p>Compilando dados financeiros e anexos do evento...</p>
        </div>
      }

      <!-- Relatório Consolidado -->
      @if (!isLoading() && relatorio(); as r) {
        <!-- Cabeçalho Exclusivo de Impressão -->
        <div class="print-header only-print">
          <div class="print-title-row">
            <div>
              <h2>AWS Student Builder Group — Prestação de Contas</h2>
              <h3>Evento: {{ r.eventoNome }}</h3>
            </div>
            <div class="print-date">
              Emitido em: {{ dataAtual | date:'dd/MM/yyyy HH:mm' }}
            </div>
          </div>
          <div class="print-meta-grid">
            <div><strong>Status:</strong> {{ r.status }}</div>
            <div><strong>Data do Evento:</strong> {{ r.data | date:'dd/MM/yyyy' }}</div>
            <div><strong>Total Comprovantes:</strong> {{ r.totalComprovantesAnexados }} de {{ r.totalLancamentos }}</div>
          </div>
        </div>

        <!-- Banner do Evento -->
        <div class="card event-banner no-print">
          <div class="banner-content">
            <div>
              <span class="badge badge-navy badge-lg">{{ r.status }}</span>
              <h2 class="banner-title">{{ r.eventoNome }}</h2>
            </div>
            <div class="banner-dates">
              <div class="date-item">
                <span class="date-label">Data do Evento:</span>
                <strong>{{ r.data | date:'dd/MM/yyyy' }}</strong>
              </div>
            </div>
          </div>

          <!-- Barra de Execução Orçamentária -->
          <div class="progress-section">
            <div class="progress-labels">
              <span>Execução do Orçamento</span>
              <strong>{{ r.percentualExecucao | number:'1.1-1' }}% utilizado</strong>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar"
                   [style.width.%]="r.percentualExecucao > 100 ? 100 : r.percentualExecucao"
                   [class.progress-mint]="r.percentualExecucao <= 80"
                   [class.progress-amber]="r.percentualExecucao > 80 && r.percentualExecucao <= 100"
                   [class.progress-danger]="r.percentualExecucao > 100">
              </div>
            </div>
          </div>
        </div>

        <!-- Cards de KPIs Financeiros -->
        <div class="kpi-grid">
          <div class="card kpi-card">
            <span class="kpi-label">Orçamento Aprovado</span>
            <div class="kpi-value text-navy">{{ r.totalOrcadoBrl | currencyBrl }}</div>
            <small class="kpi-sub">US$ {{ r.totalOrcadoUsd | number:'1.2-2' }}</small>
          </div>

          <div class="card kpi-card">
            <span class="kpi-label">Total Realizado / Gasto</span>
            <div class="kpi-value text-amber">{{ r.totalRealizadoBrl | currencyBrl }}</div>
            <small class="kpi-sub">US$ {{ r.totalRealizadoUsd | number:'1.2-2' }}</small>
          </div>

          <div class="card kpi-card" [class.kpi-danger]="r.saldoRestanteBrl < 0">
            <span class="kpi-label">Saldo Restante</span>
            <div class="kpi-value" [class.text-mint]="r.saldoRestanteBrl >= 0" [class.text-danger]="r.saldoRestanteBrl < 0">
              {{ r.saldoRestanteBrl | currencyBrl }}
            </div>
            <small class="kpi-sub">US$ {{ r.saldoRestanteUsd | number:'1.2-2' }}</small>
          </div>

          <div class="card kpi-card">
            <span class="kpi-label">Notas Fiscais / Recibos</span>
            <div class="kpi-value text-purple">{{ r.totalComprovantesAnexados }} / {{ r.totalLancamentos }}</div>
            <small class="kpi-sub">{{ r.totalLancamentos > 0 ? ((r.totalComprovantesAnexados / r.totalLancamentos) * 100 | number:'1.0-0') : 0 }}% comprovados</small>
          </div>
        </div>

        <!-- Seção de Dotação Orçamentária por Categoria -->
        <div class="card report-section">
          <h3 class="section-title">1. Planejamento Orçamentário por Categoria</h3>
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Orçado (USD)</th>
                  <th>Taxa Câmbio Usada</th>
                  <th>Orçado (BRL)</th>
                  <th>Gasto Realizado (BRL)</th>
                  <th>Saldo Categoria (BRL)</th>
                </tr>
              </thead>
              <tbody>
                @for (item of r.itensOrcamento; track item.id) {
                  <tr>
                    <td><strong>{{ item.categoriaNome }}</strong></td>
                    <td>US$ {{ item.valorOrcadoUsd | number:'1.2-2' }}</td>
                    <td>R$ {{ item.taxaCambioUsada | number:'1.4-4' }}</td>
                    <td><strong>{{ item.valorOrcadoBrl | currencyBrl }}</strong></td>
                    <td class="text-amber">{{ (item.valorRealizadoBrl || 0) | currencyBrl }}</td>
                    <td [class.text-mint]="(item.saldoBrl || 0) >= 0" [class.text-danger]="(item.saldoBrl || 0) < 0">
                      <strong>{{ (item.saldoBrl || 0) | currencyBrl }}</strong>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="empty-state">Nenhum orçamento cadastrado para este evento.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Seção de Lançamentos e Comprovantes -->
        <div class="card report-section">
          <div class="section-header-row">
            <h3 class="section-title">2. Lançamentos & Despesas Realizadas</h3>
            <span class="badge badge-subtle">{{ r.lancamentos.length }} lançamentos registrados</span>
          </div>

          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Fornecedor</th>
                  <th>Nº Nota Fiscal</th>
                  <th>Categoria</th>
                  <th>Valor (BRL)</th>
                  <th>Forma Pgto</th>
                  <th>Status</th>
                  <th>Comprovante / NF</th>
                </tr>
              </thead>
              <tbody>
                @for (l of r.lancamentos; track l.id) {
                  <tr>
                    <td>{{ l.data | date:'dd/MM/yyyy' }}</td>
                    <td><strong>{{ l.descricao }}</strong></td>
                    <td>{{ l.fornecedor }}</td>
                    <td>
                      @if (l.numeroNotaFiscal) {
                        <code>{{ l.numeroNotaFiscal }}</code>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                    <td><span class="badge badge-navy">{{ l.categoriaNome }}</span></td>
                    <td><strong>{{ l.valorBrl | currencyBrl }}</strong></td>
                    <td><small>{{ l.formaPagamento }}</small></td>
                    <td>
                      <span class="badge" [style.background-color]="l.statusCorBadge + '22'" [style.color]="l.statusCorBadge">
                        {{ l.statusNome }}
                      </span>
                    </td>
                    <td>
                      @if (l.anexos && l.anexos.length > 0) {
                        <div class="anexos-cell-list">
                          @for (anx of l.anexos; track anx.id) {
                            <a [href]="anx.url" target="_blank" class="btn btn-sm btn-outline btn-anexo">
                              📎 {{ anx.nomeOriginal }}
                            </a>
                          }
                        </div>
                      } @else if (l.anexoUrl) {
                        <a [href]="'/api/lancamentos/' + l.id + '/anexo'" target="_blank" class="btn btn-sm btn-outline btn-anexo">
                          📎 {{ l.anexoNomeOriginal || 'Ver Comprovante' }}
                        </a>
                      } @else {
                        <span class="badge-pending">⚠️ Pendente Anexo</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="empty-state">Nenhum lançamento registrado para este evento.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Seção de Parcerias do Evento -->
        <div class="card report-section">
          <h3 class="section-title">3. Parcerias & Patrocínios Vinculados</h3>
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Parceiro / Patrocinador</th>
                  <th>Tipo</th>
                  <th>Valor Contrapartida (BRL)</th>
                  <th>Itens Recebidos / Benefícios</th>
                  <th>Status</th>
                  <th>Contato</th>
                </tr>
              </thead>
              <tbody>
                @for (p of r.parcerias; track p.id) {
                  <tr>
                    <td><strong>{{ p.parceiro }}</strong></td>
                    <td><span class="badge badge-purple">{{ p.tipo }}</span></td>
                    <td><strong>{{ (p.valorContrapartida || 0) | currencyBrl }}</strong></td>
                    <td>{{ p.itensRecebidos || '—' }}</td>
                    <td><span class="badge badge-navy">{{ p.status }}</span></td>
                    <td><small>{{ p.contato || '—' }}</small></td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="empty-state">Nenhuma parceria vinculada a este evento.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Seção de Brindes Distribuídos -->
        <div class="card report-section">
          <h3 class="section-title">4. Distribuição de Brindes (Swag)</h3>
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Item / Brinde</th>
                  <th>Qtd Distribuída no Evento</th>
                  <th>Data da Distribuição</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                @for (b of r.brindesUtilizados; track b.id) {
                  <tr>
                    <td><strong>{{ b.item }}</strong></td>
                    <td><span class="badge badge-mint">{{ b.qtdDistribuida }} unidades</span></td>
                    <td>{{ b.dataDistribuicao | date:'dd/MM/yyyy' }}</td>
                    <td>{{ b.observacoes || '—' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="empty-state">Nenhum brinde registrado para este evento.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else if (!isLoading() && !relatorio()) {
        <div class="card empty-selection">
          <div class="empty-icon">📊</div>
          <h3>Selecione um Evento</h3>
          <p>Escolha um evento acima para visualizar o balanço financeiro, orçamentos e baixar a pasta completa de comprovantes.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-size: 1.75rem;
      color: var(--color-navy);
    }
    .page-subtitle {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }
    .header-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .selector-card {
      padding: 1.25rem;
    }
    .selector-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .select-evento {
      max-width: 500px;
      font-size: 1rem;
      font-weight: 600;
    }
    .event-banner {
      padding: 1.75rem;
      background: linear-gradient(135deg, #151D25 0%, #1e2936 100%);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .banner-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .banner-title {
      font-size: 1.6rem;
      color: #FFFFFF;
      margin: 0.5rem 0 0.25rem;
    }
    .banner-desc {
      color: #94A3B8;
      font-size: 0.9rem;
      max-width: 700px;
      line-height: 1.5;
    }
    .banner-dates {
      background: rgba(255, 255, 255, 0.05);
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .date-label {
      font-size: 0.75rem;
      color: #94A3B8;
      display: block;
    }
    .progress-section {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1.25rem;
    }
    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
      color: #E2E8F0;
    }
    .progress-bar-container {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-pill);
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      transition: width 0.5s ease-in-out;
    }
    .progress-mint { background: var(--color-mint); }
    .progress-amber { background: var(--color-amber); }
    .progress-danger { background: var(--color-danger); }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }
    .kpi-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .kpi-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .kpi-value {
      font-size: 1.85rem;
      font-weight: 800;
      line-height: 1.2;
    }
    .kpi-sub {
      font-size: 0.825rem;
      color: var(--color-text-muted);
    }
    .text-navy { color: var(--color-navy); }
    .text-amber { color: var(--color-amber-hover); }
    .text-mint { color: #00874C; }
    .text-purple { color: var(--color-purple); }
    .text-danger { color: var(--color-danger); }
    .kpi-danger { border-color: rgba(235, 87, 87, 0.4); }

    .report-section {
      padding: 1.5rem;
    }
    .section-title {
      font-size: 1.15rem;
      color: var(--color-navy);
      margin-bottom: 1rem;
    }
    .section-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .badge-lg {
      font-size: 0.75rem;
      padding: 0.35rem 0.75rem;
    }
    .badge-subtle {
      background: #F1F5F9;
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-sm);
    }
    .badge-pending {
      font-size: 0.75rem;
      font-weight: 700;
      color: #b45309;
      background: #fef3c7;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
    }
    .btn-anexo {
      font-size: 0.8rem;
      padding: 0.3rem 0.6rem;
      color: var(--color-blue);
      border-color: var(--color-blue);
      text-decoration: none;
      display: inline-block;
      &:hover { background: var(--color-blue-subtle); }
    }
    .anexos-cell-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .loading-box {
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--color-text-secondary);
    }
    .empty-selection {
      padding: 5rem 2rem;
      text-align: center;
      color: var(--color-text-secondary);
      .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
      h3 { font-size: 1.3rem; color: var(--color-navy); margin-bottom: 0.5rem; }
      p { max-width: 450px; margin: 0 auto; font-size: 0.9rem; }
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--color-text-muted);
    }

    .only-print { display: none; }

    /* Estilos de Impressão e Exportação em PDF */
    @media print {
      .no-print { display: none !important; }
      .only-print { display: block !important; }
      .page-container { padding: 0; max-width: 100%; }
      .card { box-shadow: none !important; border: 1px solid #ddd !important; break-inside: avoid; page-break-inside: avoid; }
      .print-header {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #151D25;
      }
      .print-title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }
      .print-title-row h2 { font-size: 1.3rem; margin: 0; }
      .print-title-row h3 { font-size: 1.1rem; color: #555; margin: 0.25rem 0 0; }
      .print-date { font-size: 0.8rem; color: #666; }
      .print-meta-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
        font-size: 0.85rem;
      }
      .kpi-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 0.5rem !important; }
      .kpi-card { padding: 0.75rem !important; }
      .kpi-value { font-size: 1.3rem !important; }
    }
  `]
})
export class RelatoriosComponent implements OnInit {
  private apiService = inject(ApiService);
  private toast = inject(ToastService);

  eventos = signal<Evento[]>([]);
  selectedEventoId: number | undefined;
  relatorio = signal<RelatorioEvento | null>(null);

  isLoading = signal(false);
  isDownloadingPdf = signal(false);
  isDownloadingZip = signal(false);
  isDownloadingCsv = signal(false);
  dataAtual = new Date();

  ngOnInit() {
    this.loadEventos();
  }

  loadEventos() {
    this.apiService.getEventos().subscribe({
      next: (res) => {
        this.eventos.set(res);
        if (res.length > 0) {
          this.selectedEventoId = res[0].id;
          this.loadRelatorio();
        }
      },
      error: () => this.toast.error('Erro ao carregar lista de eventos.')
    });
  }

  loadRelatorio() {
    if (!this.selectedEventoId) return;

    this.isLoading.set(true);
    this.apiService.getRelatorioEvento(this.selectedEventoId).subscribe({
      next: (data) => {
        this.relatorio.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message || 'Erro ao carregar relatório do evento.');
      }
    });
  }

  downloadPdf() {
    if (!this.selectedEventoId) return;

    this.isDownloadingPdf.set(true);
    this.toast.info('Gerando relatório unificado em PDF com todos os comprovantes...');

    this.apiService.downloadRelatorioPdf(this.selectedEventoId).subscribe({
      next: (blob) => {
        this.isDownloadingPdf.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-unificado-evento-${this.selectedEventoId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toast.success('Relatório unificado em PDF baixado com sucesso!');
      },
      error: () => {
        this.isDownloadingPdf.set(false);
        this.toast.error('Erro ao gerar relatório unificado em PDF.');
      }
    });
  }

  downloadZip() {
    if (!this.selectedEventoId) return;

    this.isDownloadingZip.set(true);
    this.toast.info('Gerando pacote ZIP com todos os comprovantes...');

    this.apiService.downloadRelatorioZip(this.selectedEventoId).subscribe({
      next: (blob) => {
        this.isDownloadingZip.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prestacao-contas-evento-${this.selectedEventoId}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toast.success('Pacote de prestação de contas (.ZIP) baixado com sucesso!');
      },
      error: () => {
        this.isDownloadingZip.set(false);
        this.toast.error('Erro ao gerar arquivo ZIP da prestação de contas.');
      }
    });
  }

  downloadCsv() {
    if (!this.selectedEventoId) return;

    this.isDownloadingCsv.set(true);
    this.toast.info('Exportando planilha estruturada (CSV)...');
    this.apiService.downloadRelatorioCsv(this.selectedEventoId).subscribe({
      next: (blob) => {
        this.isDownloadingCsv.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-financeiro-evento-${this.selectedEventoId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toast.success('Planilha CSV exportada com sucesso!');
      },
      error: () => {
        this.isDownloadingCsv.set(false);
        this.toast.error('Erro ao exportar planilha CSV.');
      }
    });
  }

  printReport() {
    window.print();
  }
}

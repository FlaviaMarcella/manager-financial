import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CotacaoDolar, DashboardSummary } from '../../core/models/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyBrlPipe],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Painel Financeiro</h1>
          <p class="page-subtitle">Visão consolidada do orçamento, despesas e patrocínios do grupo</p>
        </div>
        <div class="header-badges-group">
          @if (cotacaoMercado()?.cotacaoOficial) {
            <span class="exchange-rate-badge market-badge" title="Cotação comercial oficial do dia">
              <span class="dot dot-blue"></span> Dólar Hoje: <strong>R$ {{ cotacaoMercado()?.cotacaoOficial | number:'1.4-4' }}</strong>
              @if (cotacaoMercado()?.pctChange !== undefined) {
                <small class="var-tag" [class.var-up]="(cotacaoMercado()?.pctChange || 0) >= 0" [class.var-down]="(cotacaoMercado()?.pctChange || 0) < 0">
                  {{ (cotacaoMercado()?.pctChange || 0) >= 0 ? '+' : '' }}{{ cotacaoMercado()?.pctChange | number:'1.2-2' }}%
                </small>
              }
            </span>
          }
          <span class="exchange-rate-badge">
            <span class="dot dot-mint"></span> Câmbio Sistema: <strong>1 USD = {{ summary()?.taxaCambioAtual | currencyBrl }}</strong>
          </span>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="card kpi-card kpi-amber">
          <div class="kpi-icon-wrapper">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Orçamento Total</span>
            <h2 class="kpi-value">{{ summary()?.totalOrcadoBrl | currencyBrl }}</h2>
            <span class="kpi-subtext">US$ {{ summary()?.totalOrcadoUsd | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="card kpi-card kpi-magenta">
          <div class="kpi-icon-wrapper">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Gasto Total Realizado</span>
            <h2 class="kpi-value">{{ summary()?.totalGastoBrl | currencyBrl }}</h2>
            <span class="kpi-subtext">Soma de todas as notas fiscais</span>
          </div>
        </div>

        <div class="card kpi-card" [class.kpi-mint]="(summary()?.saldoDisponivelBrl || 0) >= 0" [class.kpi-danger]="(summary()?.saldoDisponivelBrl || 0) < 0">
          <div class="kpi-icon-wrapper">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Saldo Disponível</span>
            <h2 class="kpi-value">{{ summary()?.saldoDisponivelBrl | currencyBrl }}</h2>
            <span class="kpi-subtext">
              {{ (summary()?.saldoDisponivelBrl || 0) >= 0 ? 'Dentro do teto orçado' : 'Orçamento estourado!' }}
            </span>
          </div>
        </div>

        <div class="card kpi-card kpi-blue">
          <div class="kpi-icon-wrapper">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Aportes de Parcerias</span>
            <h2 class="kpi-value">{{ summary()?.totalRecebidoParceriasBrl | currencyBrl }}</h2>
            <span class="kpi-subtext">Patrocínios fechados e entregues</span>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="charts-grid">
        <!-- Gráfico de Pizza: Gastos por Categoria -->
        <div class="card chart-card">
          <div class="card-header">
            <h3>Gastos por Categoria</h3>
            <span class="badge badge-purple">Distribuição</span>
          </div>
          <div class="chart-wrapper">
            <canvas #categoriaChartCanvas></canvas>
          </div>
        </div>

        <!-- Gráfico de Barras: Orçado x Realizado por Evento -->
        <div class="card chart-card">
          <div class="card-header">
            <h3>Orçado vs. Realizado por Evento</h3>
            <span class="badge badge-amber">Execução</span>
          </div>
          <div class="chart-wrapper">
            <canvas #eventoChartCanvas></canvas>
          </div>
        </div>
      </div>

      <!-- Tabela de Status das Parcerias -->
      <div class="card table-card">
        <div class="card-header">
          <div>
            <h3>Status das Parcerias e Patrocínios</h3>
            <p class="card-subtitle">Contagem atualizada por estágio de negociação</p>
          </div>
          <a routerLink="/parcerias" class="btn btn-sm btn-outline">Ver todas as parcerias</a>
        </div>

        <div class="status-cards-row">
          <div class="status-stat-item status-negociacao">
            <span class="stat-status-name">Em Negociação</span>
            <span class="stat-status-count">{{ summary()?.contagemParceriasPorStatus?.['NEGOCIACAO'] || 0 }}</span>
          </div>
          <div class="status-stat-item status-fechado">
            <span class="stat-status-name">Fechado</span>
            <span class="stat-status-count">{{ summary()?.contagemParceriasPorStatus?.['FECHADO'] || 0 }}</span>
          </div>
          <div class="status-stat-item status-entregue">
            <span class="stat-status-name">Entregue</span>
            <span class="stat-status-count">{{ summary()?.contagemParceriasPorStatus?.['ENTREGUE'] || 0 }}</span>
          </div>
          <div class="status-stat-item status-cancelado">
            <span class="stat-status-name">Cancelado</span>
            <span class="stat-status-count">{{ summary()?.contagemParceriasPorStatus?.['CANCELADO'] || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
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
      font-weight: 700;
      color: var(--color-navy);
    }
    .page-subtitle {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }
    .header-badges-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .exchange-rate-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-pill);
      font-size: 0.825rem;
      color: var(--color-navy);
      box-shadow: var(--shadow-sm);
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        &.dot-mint { background-color: var(--color-mint); }
        &.dot-blue { background-color: var(--color-blue); }
      }
      &.market-badge {
        background: #F8FAFC;
        border-color: #CBD5E1;
      }
    }
    .var-tag {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.1rem 0.35rem;
      border-radius: var(--radius-sm);
      &.var-up { background: #DCFCE7; color: #15803D; }
      &.var-down { background: #FEE2E2; color: #B91C1C; }
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }
    .kpi-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      position: relative;
      overflow: hidden;
      border-left: 4px solid transparent;
      &.kpi-amber { border-left-color: var(--color-amber); .kpi-icon-wrapper { background: var(--color-amber-subtle); color: var(--color-amber); } }
      &.kpi-magenta { border-left-color: var(--color-magenta); .kpi-icon-wrapper { background: var(--color-magenta-subtle); color: var(--color-magenta); } }
      &.kpi-mint { border-left-color: var(--color-mint); .kpi-icon-wrapper { background: var(--color-mint-subtle); color: var(--color-mint); } }
      &.kpi-danger { border-left-color: var(--color-danger); .kpi-icon-wrapper { background: var(--color-danger-subtle); color: var(--color-danger); } }
      &.kpi-blue { border-left-color: var(--color-blue); .kpi-icon-wrapper { background: var(--color-blue-subtle); color: var(--color-blue); } }
    }
    .kpi-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .kpi-content {
      display: flex;
      flex-direction: column;
    }
    .kpi-label {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-text-secondary);
    }
    .kpi-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--color-navy);
      margin: 0.2rem 0;
    }
    .kpi-subtext {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: 1.5rem;
    }
    .chart-card {
      display: flex;
      flex-direction: column;
      min-height: 380px;
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      h3 {
        font-size: 1.1rem;
        color: var(--color-navy);
      }
    }
    .card-subtitle {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      margin-top: 0.2rem;
    }
    .chart-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      max-height: 300px;
    }
    .status-cards-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .status-stat-item {
      padding: 1.25rem;
      border-radius: var(--radius-md);
      background-color: var(--color-bg);
      border: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: transform var(--transition-fast);
      &:hover {
        transform: translateY(-2px);
      }
      &.status-negociacao { border-top: 3px solid var(--color-amber); }
      &.status-fechado { border-top: 3px solid var(--color-mint); }
      &.status-entregue { border-top: 3px solid var(--color-blue); }
      &.status-cancelado { border-top: 3px solid var(--color-danger); }
    }
    .stat-status-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
    }
    .stat-status-count {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--color-navy);
    }
    @media (max-width: 600px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private apiService = inject(ApiService);

  summary = signal<DashboardSummary | null>(null);
  cotacaoMercado = signal<CotacaoDolar | null>(null);

  @ViewChild('categoriaChartCanvas') categoriaCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventoChartCanvas') eventoCanvas!: ElementRef<HTMLCanvasElement>;

  private categoriaChartInstance: Chart | null = null;
  private eventoChartInstance: Chart | null = null;

  ngOnInit() {
    this.loadData();
    this.loadCotacao();
  }

  ngAfterViewInit() {
    // Initialized after data loads
  }

  loadData() {
    this.apiService.getDashboardSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        setTimeout(() => this.renderCharts(data), 50);
      }
    });
  }

  loadCotacao() {
    this.apiService.getCotacaoDolarAtual().subscribe({
      next: (c) => this.cotacaoMercado.set(c),
      error: () => {}
    });
  }

  renderCharts(data: DashboardSummary) {
    // 1. Doughnut Chart: Gastos por Categoria
    if (this.categoriaCanvas?.nativeElement) {
      if (this.categoriaChartInstance) {
        this.categoriaChartInstance.destroy();
      }

      const labels = data.gastosPorCategoria.map(c => c.label);
      const values = data.gastosPorCategoria.map(c => c.value);
      const colors = data.gastosPorCategoria.map(c => c.color || '#FF9900');

      this.categoriaChartInstance = new Chart(this.categoriaCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: labels.length > 0 ? labels : ['Sem despesas registradas'],
          datasets: [{
            data: values.length > 0 ? values : [1],
            backgroundColor: values.length > 0 ? colors : ['#E2E8F0'],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                font: { family: "'Amazon Ember Display', Arial, sans-serif", size: 11 }
              }
            }
          },
          cutout: '65%'
        }
      });
    }

    // 2. Bar Chart: Orçado vs Realizado por Evento
    if (this.eventoCanvas?.nativeElement) {
      if (this.eventoChartInstance) {
        this.eventoChartInstance.destroy();
      }

      const labels = data.orcadoVsRealizadoPorEvento.map(e => e.label);
      const orcadoVals = data.orcadoVsRealizadoPorEvento.map(e => e.value);
      const realizadoVals = data.orcadoVsRealizadoPorEvento.map(e => e.secondaryValue || 0);

      this.eventoChartInstance = new Chart(this.eventoCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: labels.length > 0 ? labels : ['Sem eventos com orçamento'],
          datasets: [
            {
              label: 'Orçado (R$)',
              data: orcadoVals,
              backgroundColor: '#FF9900',
              borderRadius: 6
            },
            {
              label: 'Realizado (R$)',
              data: realizadoVals,
              backgroundColor: '#AC5BFF',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                font: { family: "'Amazon Ember Display', Arial, sans-serif", size: 11 }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (val) => 'R$ ' + Number(val).toLocaleString('pt-BR')
              }
            }
          }
        }
      });
    }
  }
}

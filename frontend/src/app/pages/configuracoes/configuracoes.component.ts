import { Component, OnInit, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria, ConfiguracaoGlobal, CotacaoDolar, Evento, StatusFinanceiro } from '../../core/models/models';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class.page-container]="!isModal" [class.modal-view-container]="isModal">
      <!-- Cabeçalho (apenas quando não em modal) -->
      @if (!isModal) {
        <div class="page-header">
          <div>
            <h1 class="page-title">Configurações do Sistema</h1>
            <p class="page-subtitle">Parâmetros globais de câmbio USD/BRL, simulador de taxas, eventos, categorias e status</p>
          </div>
        </div>
      }

      <div class="config-grid">
        <!-- 1. Painel de Câmbio USD -> BRL & Cotação em Tempo Real -->
        <div class="card config-card full-width cambio-card">
          <div class="card-header">
            <div>
              <h3>Cotação do Dólar & Política Cambial (USD → BRL)</h3>
              <p class="card-subtitle">Monitore o mercado oficial e simule taxas de conversão com spread e IOF</p>
            </div>
            <span class="badge badge-amber">Câmbio Multi-Moeda</span>
          </div>

          <div class="cambio-dashboard-grid">
            <!-- Coluna 1: Cotação Comercial de Mercado (Hoje) -->
            <div class="cambio-box market-box">
              <div class="box-top">
                <span class="box-tag">🌐 Mercado Oficial Hoje</span>
                <button type="button" class="btn btn-sm btn-outline btn-refresh" (click)="loadCotacaoMercado()" [disabled]="isLoadingCotacao()">
                  {{ isLoadingCotacao() ? '...' : '🔄 Atualizar' }}
                </button>
              </div>

              <div class="market-rate-display">
                <span class="currency-symbol">US$ 1 =</span>
                <span class="rate-value">R$ {{ cotacaoMercado()?.cotacaoOficial | number:'1.4-4' }}</span>
                @if (cotacaoMercado()?.pctChange !== undefined) {
                  <span class="var-badge" [class.var-pos]="(cotacaoMercado()?.pctChange || 0) >= 0" [class.var-neg]="(cotacaoMercado()?.pctChange || 0) < 0">
                    {{ (cotacaoMercado()?.pctChange || 0) >= 0 ? '▲ +' : '▼ ' }}{{ cotacaoMercado()?.pctChange | number:'1.2-2' }}%
                  </span>
                }
              </div>

              <div class="market-stats">
                <div class="stat-item">
                  <span class="stat-label">Máxima do Dia</span>
                  <span class="stat-val">R$ {{ cotacaoMercado()?.maximo | number:'1.4-4' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Mínima do Dia</span>
                  <span class="stat-val">R$ {{ cotacaoMercado()?.minimo | number:'1.4-4' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Fonte</span>
                  <span class="stat-val text-truncate">{{ cotacaoMercado()?.fonte || 'AwesomeAPI' }}</span>
                </div>
              </div>

              <div class="market-footer">
                <small>Última cotação: <strong>{{ cotacaoMercado()?.dataHoraCotacao || 'Hoje' }}</strong></small>
                <button type="button" class="btn-copy-rate" (click)="copiarCotacaoMercado()">
                  Copiar para Taxa do Sistema ➔
                </button>
              </div>
            </div>

            <!-- Coluna 2: Simulador de Taxas / Spread e Inserção Livre -->
            <div class="cambio-box spread-box">
              <div class="box-top">
                <span class="box-tag tag-purple">🧮 Simulador Livre de Taxas</span>
              </div>
              
              <div class="spread-presets">
                <span class="preset-label">Descontos padrão:</span>
                <button type="button" class="btn-preset" [class.active]="modoSimulacao === 'PRESET' && spreadPercentual === 2.0" (click)="aplicarSpread(2.0)">-2.0%</button>
                <button type="button" class="btn-preset" [class.active]="modoSimulacao === 'PRESET' && spreadPercentual === 3.0" (click)="aplicarSpread(3.0)">-3.0%</button>
                <button type="button" class="btn-preset" [class.active]="modoSimulacao === 'PRESET' && spreadPercentual === 3.5" (click)="aplicarSpread(3.5)">-3.5%</button>
              </div>

              <!-- Inserção de Taxa Livre pelo Usuário -->
              <div class="custom-sim-row">
                <div class="form-group flex-1">
                  <label class="form-label">Ou digite uma taxa personalizada:</label>
                  <div class="input-group-custom">
                    <span class="prefix">R$</span>
                    <input type="number" step="0.0001" min="0.0001" class="form-control" 
                           [(ngModel)]="simulacaoTaxaLivre" (input)="onTaxaLivreInput()" 
                           placeholder="Ex: 4.4964">
                  </div>
                </div>
              </div>

              <div class="simulacao-result">
                <div class="result-row">
                  <span>Cotação Spot Mercado:</span>
                  <strong>R$ {{ (cotacaoMercado()?.cotacaoOficial || 5.07) | number:'1.4-4' }}</strong>
                </div>
                <div class="result-row text-danger">
                  <span>Desconto de Spread/Taxas:</span>
                  <strong>- R$ {{ getDescontoSimulado() | number:'1.4-4' }} ({{ getPctSpreadSimulado() | number:'1.1-1' }}%)</strong>
                </div>
                <div class="result-row result-total text-mint">
                  <span>Taxa Efetiva Resultante:</span>
                  <strong>R$ {{ getTaxaSimuladaFinal() | number:'1.4-4' }}</strong>
                </div>
                <div class="result-example">
                  <small>💡 Para cada <strong>US$ 100</strong> gastos, chegam <strong>R$ {{ (100 * getTaxaSimuladaFinal()) | number:'1.2-2' }}</strong> e <strong>R$ {{ (100 * getDescontoSimulado()) | number:'1.2-2' }}</strong> ficam em taxas.</small>
                </div>
              </div>

              <button type="button" class="btn btn-sm btn-primary btn-apply-sim" (click)="aplicarTaxaSimulada()">
                Usar Esta Taxa como Padrão do Sistema
              </button>
            </div>

            <!-- Coluna 3: Taxa Operacional Efetiva Ativa no Sistema -->
            <div class="cambio-box active-box">
              <div class="box-top">
                <span class="box-tag tag-mint">⚙️ Taxa Efetiva no Sistema</span>
                <span class="badge badge-mint">Ativa</span>
              </div>

              <form (ngSubmit)="saveTaxaCambio()" class="cambio-form">
                <div class="form-group">
                  <label class="form-label">Taxa Operacional 1 USD (R$) *</label>
                  <div class="input-prefix-group">
                    <span class="prefix">R$</span>
                    <input type="number" step="0.0001" min="0.0001" class="form-control input-taxa" [(ngModel)]="taxaInput" name="taxaInput" required placeholder="5.5000">
                  </div>
                  <small class="form-helper">Esta taxa é o padrão para novas dotações de orçamento e lançamentos.</small>
                </div>

                <div class="cambio-meta">
                  <span>Última alteração: <strong>{{ config()?.atualizadoEm | date:'dd/MM/yyyy HH:mm' }}</strong></span>
                  <span>Por: <strong>{{ config()?.atualizadoPor || 'sistema' }}</strong></span>
                </div>

                <button type="submit" class="btn btn-primary btn-save-cambio" [disabled]="!taxaInput || taxaInput <= 0">
                  Salvar Taxa Operacional
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- 2. Cadastro de Eventos -->
        <div class="card config-card full-width">
          <div class="card-header">
            <div>
              <h3>Eventos do AWS Student Builder Group</h3>
              <p class="card-subtitle">Workshops, meetups, hackathons e community days</p>
            </div>
            <button class="btn btn-sm btn-primary" (click)="openEventoModal()">+ Novo Evento</button>
          </div>

          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Nome do Evento</th>
                  <th>Data Prevista</th>
                  <th>Status</th>
                  <th style="text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (ev of eventos(); track ev.id) {
                  <tr>
                    <td><strong>{{ ev.nome }}</strong></td>
                    <td>{{ ev.data | date:'dd/MM/yyyy' }}</td>
                    <td>
                      <span class="badge" [class.badge-blue]="ev.status === 'PLANEJADO'" [class.badge-amber]="ev.status === 'EM_ANDAMENTO'" [class.badge-mint]="ev.status === 'CONCLUIDO'" [class.badge-danger]="ev.status === 'CANCELADO'">
                        {{ ev.status }}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-sm btn-outline" (click)="editEvento(ev)">✎</button>
                      <button class="btn btn-sm btn-danger" (click)="deleteEvento(ev.id!)">🗑</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. Categorias de Despesas -->
        <div class="card config-card">
          <div class="card-header">
            <div>
              <h3>Categorias de Despesas</h3>
              <p class="card-subtitle">Classificação para orçamento e lançamentos</p>
            </div>
            <button class="btn btn-sm btn-primary" (click)="openCategoriaModal()">+ Nova Categoria</button>
          </div>

          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th style="text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (cat of categorias(); track cat.id) {
                  <tr>
                    <td><strong>{{ cat.nome }}</strong></td>
                    <td><small>{{ cat.descricao || '—' }}</small></td>
                    <td style="text-align: right;">
                      <button class="btn btn-sm btn-outline" (click)="editCategoria(cat)">✎</button>
                      <button class="btn btn-sm btn-danger" (click)="deleteCategoria(cat.id!)">🗑</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. Status Financeiros -->
        <div class="card config-card">
          <div class="card-header">
            <div>
              <h3>Status de Pagamentos</h3>
              <p class="card-subtitle">Pago, Pendente, Atrasado, Reembolsado</p>
            </div>
            <button class="btn btn-sm btn-primary" (click)="openStatusModal()">+ Novo Status</button>
          </div>

          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Cor da Badge</th>
                  <th style="text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (st of statusList(); track st.id) {
                  <tr>
                    <td>
                      <span class="badge" [style.background-color]="st.corBadge + '22'" [style.color]="st.corBadge">
                        {{ st.nome }}
                      </span>
                    </td>
                    <td>
                      <div class="color-preview-box">
                        <span class="color-circle" [style.background-color]="st.corBadge"></span>
                        <code>{{ st.corBadge }}</code>
                      </div>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-sm btn-outline" (click)="editStatus(st)">✎</button>
                      <button class="btn btn-sm btn-danger" (click)="deleteStatus(st.id!)">🗑</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modais Internos -->
      @if (showEventoModal()) {
        <div class="modal-backdrop" (click)="closeEventoModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2>{{ editingEventoId() ? 'Editar Evento' : 'Novo Evento' }}</h2>
            <form (ngSubmit)="saveEvento()">
              <div class="form-group">
                <label class="form-label">Nome do Evento *</label>
                <input type="text" class="form-control" [(ngModel)]="eventoForm.nome" name="nome" required>
              </div>
              <div class="form-group">
                <label class="form-label">Data Prevista *</label>
                <input type="date" class="form-control" [(ngModel)]="eventoForm.data" name="data" required>
              </div>
              <div class="form-group">
                <label class="form-label">Status *</label>
                <select class="form-select" [(ngModel)]="eventoForm.status" name="status" required>
                  <option value="PLANEJADO">Planejado</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea class="form-control" [(ngModel)]="eventoForm.descricao" name="descricao" rows="2"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-outline" (click)="closeEventoModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar Evento</button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (showCategoriaModal()) {
        <div class="modal-backdrop" (click)="closeCategoriaModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2>{{ editingCategoriaId() ? 'Editar Categoria' : 'Nova Categoria' }}</h2>
            <form (ngSubmit)="saveCategoria()">
              <div class="form-group">
                <label class="form-label">Nome da Categoria *</label>
                <input type="text" class="form-control" [(ngModel)]="categoriaForm.nome" name="nome" required>
              </div>
              <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea class="form-control" [(ngModel)]="categoriaForm.descricao" name="descricao" rows="2"></textarea>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-outline" (click)="closeCategoriaModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar Categoria</button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (showStatusModal()) {
        <div class="modal-backdrop" (click)="closeStatusModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2>{{ editingStatusId() ? 'Editar Status' : 'Novo Status' }}</h2>
            <form (ngSubmit)="saveStatus()">
              <div class="form-group">
                <label class="form-label">Nome do Status *</label>
                <input type="text" class="form-control" [(ngModel)]="statusForm.nome" name="nome" required>
              </div>
              <div class="form-group">
                <label class="form-label">Cor da Badge (Hexadecimal) *</label>
                <div class="input-color-group">
                  <input type="color" class="color-picker" [(ngModel)]="statusForm.corBadge" name="corBadge">
                  <input type="text" class="form-control" [(ngModel)]="statusForm.corBadge" name="corBadgeText" required>
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-outline" (click)="closeStatusModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar Status</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.5rem;
    }
    .modal-view-container {
      padding: 0.5rem 0;
      width: 100%;
    }
    .page-header {
      margin-bottom: 1.5rem;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.25rem;
    }
    .page-subtitle {
      font-size: 0.88rem;
      color: #94A3B8;
    }

    .config-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    .full-width {
      grid-column: span 2;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      h3 { font-size: 1.1rem; color: #FFFFFF; }
      .card-subtitle { font-size: 0.82rem; color: #94A3B8; }
    }

    /* Painel de Câmbio */
    .cambio-card {
      background: #161D26;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem;
    }
    .cambio-dashboard-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    .cambio-box {
      background: #0F1722;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .box-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .box-tag {
      font-size: 0.75rem;
      font-weight: 700;
      color: #38BDF8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .tag-purple { color: #C084FC; }
    .tag-mint { color: #34D399; }

    .market-rate-display {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }
    .currency-symbol { font-size: 0.9rem; color: #94A3B8; }
    .rate-value { font-size: 1.5rem; font-weight: 700; color: #FFFFFF; }
    .var-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      &.var-pos { background: rgba(52, 211, 153, 0.15); color: #34D399; }
      &.var-neg { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
    }

    .market-stats {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin: 0.75rem 0;
      font-size: 0.8rem;
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      .stat-label { color: #94A3B8; }
      .stat-val { color: #E2E8F0; font-weight: 600; }
    }
    .market-footer {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 0.75rem;
      font-size: 0.75rem;
      color: #94A3B8;
    }
    .btn-copy-rate {
      background: transparent;
      border: 1px solid rgba(255, 153, 0, 0.35);
      color: #FF9900;
      padding: 0.4rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      &:hover { background: rgba(255, 153, 0, 0.15); }
    }

    .spread-presets {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }
    .preset-label { font-size: 0.72rem; color: #94A3B8; }
    .btn-preset {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #CBD5E1;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      &.active {
        background: rgba(147, 51, 234, 0.25);
        border-color: #A855F7;
        color: #FFFFFF;
        font-weight: 700;
      }
    }

    .custom-sim-row {
      margin-bottom: 0.75rem;
    }
    .input-group-custom {
      display: flex;
      align-items: center;
      background: #161D26;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      overflow: hidden;
      .prefix {
        padding: 0 0.5rem;
        font-size: 0.8rem;
        color: #94A3B8;
        background: rgba(255, 255, 255, 0.04);
      }
      .form-control {
        border: none;
        border-radius: 0;
        &:focus { box-shadow: none; }
      }
    }

    .simulacao-result {
      background: rgba(255, 255, 255, 0.03);
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 0.75rem;
    }
    .result-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      margin-bottom: 0.25rem;
      color: #94A3B8;
      strong { color: #FFFFFF; }
    }
    .result-total {
      font-size: 0.9rem;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
      padding-top: 0.35rem;
      margin-top: 0.35rem;
      strong { color: #34D399; }
    }
    .result-example {
      margin-top: 0.5rem;
      padding-top: 0.4rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.72rem;
      color: #CBD5E1;
    }

    .btn-apply-sim {
      width: 100%;
      padding: 0.5rem;
      font-weight: 600;
    }

    .cambio-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .input-prefix-group {
      display: flex;
      align-items: center;
      background: #161D26;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      overflow: hidden;
      .prefix {
        padding: 0 0.75rem;
        font-size: 0.9rem;
        font-weight: 700;
        color: #FF9900;
        background: rgba(255, 153, 0, 0.1);
      }
      .input-taxa {
        border: none;
        border-radius: 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: #FFFFFF;
      }
    }
    .form-helper {
      font-size: 0.72rem;
      color: #64748B;
      margin-top: 0.25rem;
    }
    .cambio-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: #94A3B8;
    }
    .btn-save-cambio {
      padding: 0.65rem;
      font-weight: 700;
      width: 100%;
    }

    .color-preview-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .color-circle {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }

    @media (max-width: 992px) {
      .config-grid { grid-template-columns: 1fr; }
      .full-width { grid-column: span 1; }
      .cambio-dashboard-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ConfiguracoesComponent implements OnInit {
  @Input() isModal = false;
  @Output() onClose = new EventEmitter<void>();

  private api = inject(ApiService);
  private toast = inject(ToastService);

  config = signal<ConfiguracaoGlobal | null>(null);
  cotacaoMercado = signal<CotacaoDolar | null>(null);
  eventos = signal<Evento[]>([]);
  categorias = signal<Categoria[]>([]);
  statusList = signal<StatusFinanceiro[]>([]);

  isLoadingCotacao = signal(false);
  taxaInput: number = 5.5000;

  modoSimulacao: 'PRESET' | 'CUSTOM' = 'PRESET';
  spreadPercentual: number = 3.0;
  simulacaoTaxaLivre: number | null = null;

  showEventoModal = signal(false);
  editingEventoId = signal<number | null>(null);
  eventoForm: Partial<Evento> = { status: 'PLANEJADO' };

  showCategoriaModal = signal(false);
  editingCategoriaId = signal<number | null>(null);
  categoriaForm: Partial<Categoria> = {};

  showStatusModal = signal(false);
  editingStatusId = signal<number | null>(null);
  statusForm: Partial<StatusFinanceiro> = { corBadge: '#38BDF8' };

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.api.getConfiguracao().subscribe(c => {
      this.config.set(c);
      if (c && c.taxaCambioUsdBrl) {
        this.taxaInput = c.taxaCambioUsdBrl;
      }
    });
    this.loadCotacaoMercado();
    this.loadEventos();
    this.loadCategorias();
    this.loadStatus();
  }

  loadCotacaoMercado() {
    this.isLoadingCotacao.set(true);
    this.api.getCotacaoDolarAtual().subscribe({
      next: (data) => {
        this.cotacaoMercado.set(data);
        this.isLoadingCotacao.set(false);
      },
      error: () => {
        this.isLoadingCotacao.set(false);
      }
    });
  }

  copiarCotacaoMercado() {
    if (this.cotacaoMercado()?.cotacaoOficial) {
      this.taxaInput = this.cotacaoMercado()!.cotacaoOficial;
      this.toast.info('Cotação oficial de mercado copiada para o campo.');
    }
  }

  aplicarSpread(pct: number) {
    this.modoSimulacao = 'PRESET';
    this.spreadPercentual = pct;
    this.simulacaoTaxaLivre = null;
  }

  onTaxaLivreInput() {
    if (this.simulacaoTaxaLivre && this.simulacaoTaxaLivre > 0) {
      this.modoSimulacao = 'CUSTOM';
    }
  }

  getTaxaSimuladaFinal(): number {
    if (this.modoSimulacao === 'CUSTOM' && this.simulacaoTaxaLivre && this.simulacaoTaxaLivre > 0) {
      return this.simulacaoTaxaLivre;
    }
    const spot = this.cotacaoMercado()?.cotacaoOficial || 5.0700;
    return Number((spot * (1 - this.spreadPercentual / 100)).toFixed(4));
  }

  getDescontoSimulado(): number {
    const spot = this.cotacaoMercado()?.cotacaoOficial || 5.0700;
    const finalRate = this.getTaxaSimuladaFinal();
    return Math.max(0, spot - finalRate);
  }

  getPctSpreadSimulado(): number {
    const spot = this.cotacaoMercado()?.cotacaoOficial || 5.0700;
    if (spot <= 0) return 0;
    return (this.getDescontoSimulado() / spot) * 100;
  }

  aplicarTaxaSimulada() {
    const taxa = this.getTaxaSimuladaFinal();
    this.taxaInput = taxa;
    this.saveTaxaCambio();
  }

  saveTaxaCambio() {
    if (!this.taxaInput || this.taxaInput <= 0) {
      this.toast.warning('Informe um valor de taxa de câmbio válido.');
      return;
    }
    this.api.updateTaxaCambio(this.taxaInput).subscribe({
      next: (res) => {
        this.config.set(res);
        this.toast.success(`Taxa operacional de câmbio salva: R$ ${this.taxaInput.toFixed(4)}`);
      },
      error: () => this.toast.error('Erro ao salvar taxa de câmbio.')
    });
  }

  loadEventos() {
    this.api.getEventos().subscribe(data => this.eventos.set(data));
  }

  openEventoModal() {
    this.editingEventoId.set(null);
    this.eventoForm = { status: 'PLANEJADO', data: new Date().toISOString().split('T')[0] };
    this.showEventoModal.set(true);
  }

  editEvento(ev: Evento) {
    this.editingEventoId.set(ev.id || null);
    this.eventoForm = { ...ev };
    this.showEventoModal.set(true);
  }

  closeEventoModal() {
    this.showEventoModal.set(false);
  }

  saveEvento() {
    if (!this.eventoForm.nome || !this.eventoForm.data || !this.eventoForm.status) return;
    const req = {
      nome: this.eventoForm.nome,
      data: this.eventoForm.data,
      status: this.eventoForm.status,
      descricao: this.eventoForm.descricao
    };

    const action = this.editingEventoId()
      ? this.api.updateEvento(this.editingEventoId()!, req)
      : this.api.createEvento(req);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingEventoId() ? 'Evento atualizado!' : 'Evento criado!');
        this.loadEventos();
        this.closeEventoModal();
      },
      error: () => this.toast.error('Erro ao salvar evento.')
    });
  }

  deleteEvento(id: number) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      this.api.deleteEvento(id).subscribe({
        next: () => {
          this.toast.success('Evento excluído.');
          this.loadEventos();
        },
        error: () => this.toast.error('Erro ao excluir evento.')
      });
    }
  }

  loadCategorias() {
    this.api.getCategorias().subscribe(data => this.categorias.set(data));
  }

  openCategoriaModal() {
    this.editingCategoriaId.set(null);
    this.categoriaForm = {};
    this.showCategoriaModal.set(true);
  }

  editCategoria(cat: Categoria) {
    this.editingCategoriaId.set(cat.id || null);
    this.categoriaForm = { ...cat };
    this.showCategoriaModal.set(true);
  }

  closeCategoriaModal() {
    this.showCategoriaModal.set(false);
  }

  saveCategoria() {
    if (!this.categoriaForm.nome) return;
    const req = {
      nome: this.categoriaForm.nome,
      descricao: this.categoriaForm.descricao
    };

    const action = this.editingCategoriaId()
      ? this.api.updateCategoria(this.editingCategoriaId()!, req)
      : this.api.createCategoria(req);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingCategoriaId() ? 'Categoria atualizada!' : 'Categoria criada!');
        this.loadCategorias();
        this.closeCategoriaModal();
      },
      error: () => this.toast.error('Erro ao salvar categoria.')
    });
  }

  deleteCategoria(id: number) {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      this.api.deleteCategoria(id).subscribe({
        next: () => {
          this.toast.success('Categoria excluída.');
          this.loadCategorias();
        },
        error: () => this.toast.error('Erro ao excluir categoria.')
      });
    }
  }

  loadStatus() {
    this.api.getStatusFinanceiros().subscribe(data => this.statusList.set(data));
  }

  openStatusModal() {
    this.editingStatusId.set(null);
    this.statusForm = { corBadge: '#38BDF8' };
    this.showStatusModal.set(true);
  }

  editStatus(st: StatusFinanceiro) {
    this.editingStatusId.set(st.id || null);
    this.statusForm = { ...st };
    this.showStatusModal.set(true);
  }

  closeStatusModal() {
    this.showStatusModal.set(false);
  }

  saveStatus() {
    if (!this.statusForm.nome || !this.statusForm.corBadge) return;
    const req = {
      nome: this.statusForm.nome,
      corBadge: this.statusForm.corBadge
    };

    const action = this.editingStatusId()
      ? this.api.updateStatusFinanceiro(this.editingStatusId()!, req)
      : this.api.createStatusFinanceiro(req);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingStatusId() ? 'Status atualizado!' : 'Status criado!');
        this.loadStatus();
        this.closeStatusModal();
      },
      error: () => this.toast.error('Erro ao salvar status.')
    });
  }

  deleteStatus(id: number) {
    if (confirm('Tem certeza que deseja excluir este status?')) {
      this.api.deleteStatusFinanceiro(id).subscribe({
        next: () => {
          this.toast.success('Status excluído.');
          this.loadStatus();
        },
        error: () => this.toast.error('Erro ao excluir status.')
      });
    }
  }
}

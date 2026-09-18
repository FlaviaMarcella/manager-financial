import { Component, OnInit, inject, signal } from '@angular/core';
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
    <div class="page-container">
      <!-- Cabeçalho -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Configurações do Sistema</h1>
          <p class="page-subtitle">Parâmetros globais de câmbio USD/BRL, simulador de taxas, eventos, categorias e status</p>
        </div>
      </div>

      <div class="config-grid">
        <!-- 1. Painel de Câmbio USD -> BRL & Cotação em Tempo Real -->
        <div class="card config-card full-width">
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
                <span class="box-tag">🏛️ Cotação Oficial (BACEN / PTAX)</span>
                <button type="button" class="btn btn-sm btn-outline btn-refresh" (click)="loadCotacaoMercado(true)" [disabled]="isLoadingCotacao()">
                  {{ isLoadingCotacao() ? '...' : '🔄 Atualizar' }}
                </button>
              </div>

              <div class="market-rate-display">
                <span class="currency-symbol">US$ 1 =</span>
                <span class="rate-value">R$ {{ (cotacaoMercado()?.cotacaoOficial || 5.50) | number:'1.4-4' }}</span>
                @if (cotacaoMercado()?.pctChange !== undefined) {
                  <span class="var-badge" [class.var-pos]="(cotacaoMercado()?.pctChange || 0) >= 0" [class.var-neg]="(cotacaoMercado()?.pctChange || 0) < 0">
                    {{ (cotacaoMercado()?.pctChange || 0) >= 0 ? '▲ +' : '▼ ' }}{{ cotacaoMercado()?.pctChange | number:'1.2-2' }}%
                  </span>
                }
              </div>

              <div class="market-stats">
                <div class="stat-item">
                  <span class="stat-label">Máxima do Dia</span>
                  <span class="stat-val">R$ {{ (cotacaoMercado()?.maximo || 5.55) | number:'1.4-4' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Mínima do Dia</span>
                  <span class="stat-val">R$ {{ (cotacaoMercado()?.minimo || 5.45) | number:'1.4-4' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Fonte</span>
                  <span class="stat-val text-truncate">{{ cotacaoMercado()?.fonte || 'AwesomeAPI' }}</span>
                </div>
              </div>

              <div class="market-footer">
                <small>Última cotação: <strong>{{ cotacaoMercado()?.dataHoraCotacao || 'Hoje' }}</strong></small>
                <button type="button" class="btn btn-sm btn-outline btn-copy-rate" (click)="copiarCotacaoMercado()">
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
                <label class="form-label" style="font-size: 0.78rem;">Ou digite uma taxa personalizada:</label>
                <div class="input-group-custom">
                  <span class="prefix">R$</span>
                  <input type="number" step="0.0001" min="0.0001" class="form-control" 
                         [(ngModel)]="simulacaoTaxaLivre" (input)="onTaxaLivreInput()" 
                         placeholder="Ex: 4.4964">
                </div>
              </div>

              <div class="simulacao-result">
                <div class="result-row">
                  <span>Cotação Spot Mercado:</span>
                  <strong>R$ {{ (cotacaoMercado()?.cotacaoOficial || 5.50) | number:'1.4-4' }}</strong>
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
            <div class="modal-header">
              <h2 class="modal-title">{{ editingEventoId() ? 'Editar Evento' : 'Novo Evento' }}</h2>
              <button class="btn-close" (click)="closeEventoModal()">✕</button>
            </div>
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
              <div class="modal-footer">
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
            <div class="modal-header">
              <h2 class="modal-title">{{ editingCategoriaId() ? 'Editar Categoria' : 'Nova Categoria' }}</h2>
              <button class="btn-close" (click)="closeCategoriaModal()">✕</button>
            </div>
            <form (ngSubmit)="saveCategoria()">
              <div class="form-group">
                <label class="form-label">Nome da Categoria *</label>
                <input type="text" class="form-control" [(ngModel)]="categoriaForm.nome" name="nome" required>
              </div>
              <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea class="form-control" [(ngModel)]="categoriaForm.descricao" name="descricao" rows="2"></textarea>
              </div>
              <div class="modal-footer">
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
            <div class="modal-header">
              <h2 class="modal-title">{{ editingStatusId() ? 'Editar Status' : 'Novo Status' }}</h2>
              <button class="btn-close" (click)="closeStatusModal()">✕</button>
            </div>
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
              <div class="modal-footer">
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
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .page-header {
      margin-bottom: 0.5rem;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-navy);
      margin-bottom: 0.25rem;
    }
    .page-subtitle {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
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
      h3 { font-size: 1.15rem; color: var(--color-navy); font-weight: 700; }
      .card-subtitle { font-size: 0.85rem; color: var(--color-text-secondary); }
    }

    /* Painel de Câmbio */
    .cambio-dashboard-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    .cambio-box {
      background: #F8FAFC;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 1.25rem;
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
      color: #0284C7;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .tag-purple { color: #7B1BE0; }
    .tag-mint { color: #00874C; }

    .market-rate-display {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin: 0.5rem 0;
    }
    .currency-symbol { font-size: 0.9rem; color: var(--color-text-secondary); }
    .rate-value { font-size: 1.5rem; font-weight: 700; color: var(--color-navy); }
    .var-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      &.var-pos { background: rgba(0, 229, 130, 0.15); color: #00874C; }
      &.var-neg { background: rgba(255, 77, 79, 0.15); color: #DC2626; }
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
      .stat-label { color: var(--color-text-secondary); }
      .stat-val { color: var(--color-navy); font-weight: 600; }
    }
    .market-footer {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      border-top: 1px solid var(--color-border);
      padding-top: 0.75rem;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }
    .btn-copy-rate {
      color: #B45309;
      border-color: #FDE68A;
      background: #FFFBEB;
      font-weight: 600;
      &:hover { background: #FEF3C7; }
    }

    .spread-presets {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }
    .preset-label { font-size: 0.75rem; color: var(--color-text-secondary); font-weight: 600; }
    .btn-preset {
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      color: var(--color-navy);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      font-weight: 600;
      &.active {
        background: var(--color-purple-subtle);
        border-color: var(--color-purple);
        color: #7B1BE0;
      }
    }

    .custom-sim-row {
      margin-bottom: 0.75rem;
    }
    .input-group-custom {
      display: flex;
      align-items: center;
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      overflow: hidden;
      margin-top: 0.25rem;
      .prefix {
        padding: 0 0.5rem;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        background: #F1F5F9;
        border-right: 1px solid var(--color-border);
      }
      .form-control {
        border: none;
        border-radius: 0;
        &:focus { box-shadow: none; }
      }
    }

    .simulacao-result {
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 0.75rem;
    }
    .result-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      margin-bottom: 0.25rem;
      color: var(--color-text-secondary);
      strong { color: var(--color-navy); }
    }
    .result-total {
      font-size: 0.9rem;
      border-top: 1px dashed var(--color-border);
      padding-top: 0.35rem;
      margin-top: 0.35rem;
      strong { color: #059669; }
    }
    .result-example {
      margin-top: 0.5rem;
      padding-top: 0.4rem;
      border-top: 1px solid var(--color-border-light);
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }
    .btn-apply-sim {
      width: 100%;
      font-weight: 700;
    }

    .cambio-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .input-prefix-group {
      display: flex;
      align-items: center;
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      overflow: hidden;
      .prefix {
        padding: 0 0.75rem;
        font-size: 0.9rem;
        font-weight: 700;
        color: #B45309;
        background: #FFFBEB;
        border-right: 1px solid #FDE68A;
      }
      .input-taxa {
        border: none;
        border-radius: 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-navy);
      }
    }
    .form-helper {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 0.25rem;
    }
    .cambio-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.78rem;
      color: var(--color-text-secondary);
    }
    .btn-save-cambio {
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
      border: 1px solid var(--color-border);
    }

    .input-color-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      .color-picker {
        width: 42px;
        height: 38px;
        padding: 0;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        cursor: pointer;
      }
    }

    @media (max-width: 992px) {
      .config-grid { grid-template-columns: 1fr; }
      .full-width { grid-column: span 1; }
      .cambio-dashboard-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ConfiguracoesComponent implements OnInit {
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

  loadCotacaoMercado(force: boolean = false) {
    this.isLoadingCotacao.set(true);
    this.api.getCotacaoDolarAtual(force).subscribe({
      next: (data) => {
        this.cotacaoMercado.set(data);
        this.isLoadingCotacao.set(false);
        if (force) {
          this.toast.success('Cotação do Dólar atualizada em tempo real!');
        }
      },
      error: () => {
        this.isLoadingCotacao.set(false);
        if (force) {
          this.toast.error('Erro ao atualizar cotação do dólar.');
        }
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
    const spot = this.cotacaoMercado()?.cotacaoOficial || 5.5000;
    return Number((spot * (1 - this.spreadPercentual / 100)).toFixed(4));
  }

  getDescontoSimulado(): number {
    const spot = this.cotacaoMercado()?.cotacaoOficial || 5.5000;
    const finalRate = this.getTaxaSimuladaFinal();
    return Math.max(0, spot - finalRate);
  }

  getPctSpreadSimulado(): number {
    const spot = this.cotacaoMercado()?.cotacaoOficial || 5.5000;
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

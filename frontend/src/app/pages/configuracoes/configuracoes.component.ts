import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria, ConfiguracaoGlobal, CotacaoDolar, Evento, StatusFinanceiro } from '../../core/models/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

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
          <p class="page-subtitle">Parâmetros globais de câmbio USD/BRL, cotação do dia, categorias, status e eventos</p>
        </div>
      </div>

      <div class="config-grid">
        <!-- 1. Painel de Câmbio USD -> BRL & Cotação em Tempo Real -->
        <div class="card config-card full-width cambio-card">
          <div class="card-header">
            <div>
              <h3>Cotação do Dólar & Política Cambial (USD → BRL)</h3>
              <p class="card-subtitle">Monitore o câmbio de mercado e defina a taxa operacional com desconto de taxas bancárias/spread</p>
            </div>
            <span class="badge badge-amber">Câmbio Multi-Moeda</span>
          </div>

          <div class="cambio-dashboard-grid">
            <!-- Coluna 1: Cotação Comercial de Mercado (Hoje) -->
            <div class="cambio-box market-box">
              <div class="box-top">
                <span class="box-tag">🌐 Mercado Oficial Hoje</span>
                <button type="button" class="btn btn-sm btn-outline btn-refresh" (click)="loadCotacaoMercado()" [disabled]="isLoadingCotacao()">
                  {{ isLoadingCotacao() ? 'Carregando...' : '🔄 Sincronizar' }}
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
                  <span class="stat-val text-truncate">{{ cotacaoMercado()?.fonte || 'Mercado Financeiro' }}</span>
                </div>
              </div>

              <div class="market-footer">
                <small>Última cotação: <strong>{{ cotacaoMercado()?.dataHoraCotacao || 'Hoje' }}</strong></small>
                <button type="button" class="btn-copy-rate" (click)="copiarCotacaoMercado()">
                  Copiar para Taxa do Sistema ➔
                </button>
              </div>
            </div>

            <!-- Coluna 2: Simulador de Spread / Desconto de Taxas de Conversão -->
            <div class="cambio-box spread-box">
              <div class="box-top">
                <span class="box-tag tag-purple">🧮 Simulador de Taxas / Spread</span>
              </div>
              <p class="box-desc">
                Ao converter dólares para reais, bancos e corretoras cobram IOF e taxas de conversão (spread). O dólar líquido creditado tende a ser menor que a cotação oficial.
              </p>

              <div class="spread-presets">
                <span class="preset-label">Desconto estimado:</span>
                <button type="button" class="btn-preset" [class.active]="spreadPercentual === 0" (click)="aplicarSpread(0)">0% (Bruto)</button>
                <button type="button" class="btn-preset" [class.active]="spreadPercentual === 2.0" (click)="aplicarSpread(2.0)">-2.0%</button>
                <button type="button" class="btn-preset" [class.active]="spreadPercentual === 3.0" (click)="aplicarSpread(3.0)">-3.0% (Padrão)</button>
                <button type="button" class="btn-preset" [class.active]="spreadPercentual === 3.5" (click)="aplicarSpread(3.5)">-3.5% (IOF+Spread)</button>
              </div>

              <div class="simulacao-result" *ngIf="cotacaoMercado()?.cotacaoOficial">
                <div class="result-row">
                  <span>Cotação Bruta de Mercado:</span>
                  <strong>R$ {{ cotacaoMercado()?.cotacaoOficial | number:'1.4-4' }}</strong>
                </div>
                <div class="result-row text-danger">
                  <span>Desconto de Taxas ({{ spreadPercentual }}%):</span>
                  <strong>- R$ {{ ((cotacaoMercado()?.cotacaoOficial || 0) * (spreadPercentual / 100)) | number:'1.4-4' }}</strong>
                </div>
                <div class="result-row result-total text-mint">
                  <span>Taxa Líquida Estimada:</span>
                  <strong>R$ {{ calcularTaxaLiquida() | number:'1.4-4' }}</strong>
                </div>
              </div>

              <button type="button" class="btn btn-sm btn-outline btn-apply-sim" (click)="aplicarTaxaSimulada()">
                Usar Taxa Líquida no Sistema
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

      <!-- Modal Evento -->
      @if (eventoModalOpen()) {
        <div class="modal-backdrop" (click)="eventoModalOpen.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingEventoId ? 'Editar Evento' : 'Novo Evento' }}</h2>
              <button class="modal-close" (click)="eventoModalOpen.set(false)">×</button>
            </div>
            <form (ngSubmit)="saveEvento()">
              <div class="form-group">
                <label class="form-label">Nome do Evento *</label>
                <input type="text" class="form-control" [(ngModel)]="eventoFormData.nome" name="nome" required placeholder="Ex: Hackathon Serverless">
              </div>
              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Data Prevista *</label>
                  <input type="date" class="form-control" [(ngModel)]="eventoFormData.data" name="data" required>
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Status *</label>
                  <select class="form-select" [(ngModel)]="eventoFormData.status" name="status" required>
                    <option value="PLANEJADO">Planejado</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="CONCLUIDO">Concluído</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="eventoModalOpen.set(false)">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="!eventoFormData.nome || !eventoFormData.data">Salvar Evento</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal Categoria -->
      @if (categoriaModalOpen()) {
        <div class="modal-backdrop" (click)="categoriaModalOpen.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingCategoriaId ? 'Editar Categoria' : 'Nova Categoria' }}</h2>
              <button class="modal-close" (click)="categoriaModalOpen.set(false)">×</button>
            </div>
            <form (ngSubmit)="saveCategoria()">
              <div class="form-group">
                <label class="form-label">Nome da Categoria *</label>
                <input type="text" class="form-control" [(ngModel)]="categoriaFormData.nome" name="nome" required placeholder="Ex: Coffee Break">
              </div>
              <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea class="form-control" [(ngModel)]="categoriaFormData.descricao" name="descricao" rows="2" placeholder="Opcional"></textarea>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="categoriaModalOpen.set(false)">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="!categoriaFormData.nome">Salvar Categoria</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal Status -->
      @if (statusModalOpen()) {
        <div class="modal-backdrop" (click)="statusModalOpen.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingStatusId ? 'Editar Status' : 'Novo Status Financeiro' }}</h2>
              <button class="modal-close" (click)="statusModalOpen.set(false)">×</button>
            </div>
            <form (ngSubmit)="saveStatus()">
              <div class="form-group">
                <label class="form-label">Nome do Status *</label>
                <input type="text" class="form-control" [(ngModel)]="statusFormData.nome" name="nome" required placeholder="Ex: Reembolsado">
              </div>
              <div class="form-group">
                <label class="form-label">Cor da Badge (Hexadecimal) *</label>
                <div class="input-prefix-group">
                  <input type="color" class="color-picker-input" [(ngModel)]="statusFormData.corBadge" name="corBadge">
                  <input type="text" class="form-control" [(ngModel)]="statusFormData.corBadge" name="corBadgeText" placeholder="#00E582">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="statusModalOpen.set(false)">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="!statusFormData.nome">Salvar Status</button>
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
    .config-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(440px, 1fr));
      gap: 1.5rem;
    }
    .config-card {
      display: flex;
      flex-direction: column;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      h3 { font-size: 1.15rem; color: var(--color-navy); margin: 0; }
    }
    .card-subtitle {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      margin-top: 0.2rem;
    }

    /* Câmbio Dashboard Grid */
    .cambio-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
    }
    .cambio-dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr 1fr;
      gap: 1.25rem;
      margin-top: 0.5rem;
    }
    .cambio-box {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #F8FAFC;
    }
    .box-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .box-tag {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-blue);
      background: var(--color-blue-subtle);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-pill);
      &.tag-purple { color: #6B21A8; background: #F3E8FF; }
      &.tag-mint { color: #065F46; background: #D1FAE5; }
    }
    .btn-refresh {
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
    }
    .market-rate-display {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin: 0.5rem 0 1rem 0;
      flex-wrap: wrap;
    }
    .currency-symbol {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-secondary);
    }
    .rate-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-navy);
    }
    .var-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-pill);
      &.var-pos { background: #DCFCE7; color: #15803D; }
      &.var-neg { background: #FEE2E2; color: #B91C1C; }
    }
    .market-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #FFFFFF;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      margin-bottom: 0.75rem;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .stat-label {
      font-size: 0.7rem;
      color: var(--color-text-muted);
    }
    .stat-val {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-navy);
    }
    .market-footer {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
    .btn-copy-rate {
      background: transparent;
      border: 1px dashed var(--color-blue);
      color: var(--color-blue);
      padding: 0.4rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
      &:hover { background: var(--color-blue-subtle); }
    }

    /* Spread Box */
    .box-desc {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
      margin-bottom: 0.75rem;
    }
    .spread-presets {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }
    .preset-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-text-secondary);
    }
    .btn-preset {
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      padding: 0.25rem 0.55rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-navy);
      cursor: pointer;
      &:hover { background: #F1F5F9; }
      &.active {
        background: #6B21A8;
        color: #FFFFFF;
        border-color: #6B21A8;
      }
    }
    .simulacao-result {
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      font-size: 0.8rem;
      margin-bottom: 0.75rem;
    }
    .result-row {
      display: flex;
      justify-content: space-between;
      color: var(--color-text-secondary);
    }
    .result-total {
      border-top: 1px solid var(--color-border-light);
      padding-top: 0.4rem;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .btn-apply-sim {
      width: 100%;
      text-align: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: #6B21A8;
      border-color: #6B21A8;
      &:hover { background: #F3E8FF; }
    }

    /* Active Box */
    .input-taxa {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-navy);
    }
    .cambio-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin: 0.75rem 0;
    }
    .btn-save-cambio {
      width: 100%;
    }

    .input-prefix-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      .prefix {
        font-weight: 700;
        color: var(--color-navy);
      }
    }
    .color-preview-box {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .color-circle {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: inline-block;
      border: 1px solid var(--color-border);
    }
    .color-picker-input {
      width: 40px;
      height: 38px;
      padding: 0;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      cursor: pointer;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .flex-1 { flex: 1; }
    .form-helper {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 0.25rem;
      display: block;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border);
    }
    .modal-close {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--color-text-secondary);
      &:hover { color: var(--color-navy); }
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.75rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-light);
    }

    @media (max-width: 960px) {
      .cambio-dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ConfiguracoesComponent implements OnInit {
  apiService = inject(ApiService);
  toast = inject(ToastService);

  config = signal<ConfiguracaoGlobal | null>(null);
  cotacaoMercado = signal<CotacaoDolar | null>(null);
  isLoadingCotacao = signal(false);

  taxaInput: number = 5.50;
  spreadPercentual: number = 3.0;

  eventos = signal<Evento[]>([]);
  categorias = signal<Categoria[]>([]);
  statusList = signal<StatusFinanceiro[]>([]);

  // Modais
  eventoModalOpen = signal(false);
  editingEventoId: number | null = null;
  eventoFormData: Partial<Evento> = { nome: '', data: '', status: 'PLANEJADO' };

  categoriaModalOpen = signal(false);
  editingCategoriaId: number | null = null;
  categoriaFormData: Partial<Categoria> = { nome: '', descricao: '' };

  statusModalOpen = signal(false);
  editingStatusId: number | null = null;
  statusFormData: Partial<StatusFinanceiro> = { nome: '', corBadge: '#00E582' };

  ngOnInit() {
    this.loadAll();
    this.loadCotacaoMercado();
  }

  loadAll() {
    this.apiService.getConfiguracao().subscribe(cfg => {
      this.config.set(cfg);
      this.taxaInput = cfg.taxaCambioUsdBrl;
    });
    this.apiService.getEventos().subscribe(res => this.eventos.set(res));
    this.apiService.getCategorias().subscribe(res => this.categorias.set(res));
    this.apiService.getStatusFinanceiros().subscribe(res => this.statusList.set(res));
  }

  loadCotacaoMercado() {
    this.isLoadingCotacao.set(true);
    this.apiService.getCotacaoDolarAtual().subscribe({
      next: (cotacao) => {
        this.cotacaoMercado.set(cotacao);
        this.isLoadingCotacao.set(false);
      },
      error: () => {
        this.isLoadingCotacao.set(false);
      }
    });
  }

  copiarCotacaoMercado() {
    const rate = this.cotacaoMercado()?.cotacaoOficial;
    if (rate) {
      this.taxaInput = Number(rate.toFixed(4));
      this.toast.info(`Cotação de mercado R$ ${this.taxaInput} copiada para o campo de taxa.`);
    }
  }

  aplicarSpread(spread: number) {
    this.spreadPercentual = spread;
  }

  calcularTaxaLiquida(): number {
    const cotacao = this.cotacaoMercado()?.cotacaoOficial || 5.50;
    const fator = (100 - this.spreadPercentual) / 100;
    return Number((cotacao * fator).toFixed(4));
  }

  aplicarTaxaSimulada() {
    this.taxaInput = this.calcularTaxaLiquida();
    this.toast.info(`Taxa líquida estimada de R$ ${this.taxaInput} aplicada ao formulário.`);
  }

  saveTaxaCambio() {
    this.apiService.updateConfiguracao({ taxaCambioUsdBrl: this.taxaInput }).subscribe({
      next: (updated) => {
        this.config.set(updated);
        this.toast.success('Taxa operacional de câmbio atualizada com sucesso!');
      },
      error: (err) => this.toast.error(err.error?.message || 'Erro ao atualizar taxa de câmbio.')
    });
  }

  // Evento CRUD
  openEventoModal() {
    this.editingEventoId = null;
    this.eventoFormData = { nome: '', data: new Date().toISOString().substring(0, 10), status: 'PLANEJADO' };
    this.eventoModalOpen.set(true);
  }

  editEvento(ev: Evento) {
    this.editingEventoId = ev.id!;
    this.eventoFormData = { nome: ev.nome, data: ev.data, status: ev.status };
    this.eventoModalOpen.set(true);
  }

  saveEvento() {
    if (this.editingEventoId) {
      this.apiService.updateEvento(this.editingEventoId, this.eventoFormData as Evento).subscribe({
        next: () => {
          this.toast.success('Evento atualizado com sucesso!');
          this.eventoModalOpen.set(false);
          this.apiService.getEventos().subscribe(res => this.eventos.set(res));
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao atualizar evento.')
      });
    } else {
      this.apiService.createEvento(this.eventoFormData as Evento).subscribe({
        next: () => {
          this.toast.success('Evento criado com sucesso!');
          this.eventoModalOpen.set(false);
          this.apiService.getEventos().subscribe(res => this.eventos.set(res));
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao criar evento.')
      });
    }
  }

  deleteEvento(id: number) {
    if (confirm('Deseja excluir este evento?')) {
      this.apiService.deleteEvento(id).subscribe({
        next: () => {
          this.toast.success('Evento excluído.');
          this.apiService.getEventos().subscribe(res => this.eventos.set(res));
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao excluir evento.')
      });
    }
  }

  // Categoria CRUD
  openCategoriaModal() {
    this.editingCategoriaId = null;
    this.categoriaFormData = { nome: '', descricao: '' };
    this.categoriaModalOpen.set(true);
  }

  editCategoria(cat: Categoria) {
    this.editingCategoriaId = cat.id!;
    this.categoriaFormData = { nome: cat.nome, descricao: cat.descricao };
    this.categoriaModalOpen.set(true);
  }

  saveCategoria() {
    if (this.editingCategoriaId) {
      this.apiService.updateCategoria(this.editingCategoriaId, this.categoriaFormData as Categoria).subscribe({
        next: () => {
          this.toast.success('Categoria atualizada!');
          this.categoriaModalOpen.set(false);
          this.apiService.getCategorias().subscribe(res => this.categorias.set(res));
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao atualizar categoria.')
      });
    } else {
      this.apiService.createCategoria(this.categoriaFormData as Categoria).subscribe({
        next: () => {
          this.toast.success('Categoria criada!');
          this.categoriaModalOpen.set(false);
          this.apiService.getCategorias().subscribe(res => this.categorias.set(res));
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao criar categoria.')
      });
    }
  }

  deleteCategoria(id: number) {
    if (confirm('Deseja excluir esta categoria?')) {
      this.apiService.deleteCategoria(id).subscribe({
        next: () => {
          this.toast.success('Categoria excluída.');
          this.apiService.getCategorias().subscribe(res => this.categorias.set(res));
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao excluir categoria.')
      });
    }
  }

  // Status CRUD
  openStatusModal() {
    this.editingStatusId = null;
    this.statusFormData = { nome: '', corBadge: '#00E582' };
    this.statusModalOpen.set(true);
  }

  editStatus(st: StatusFinanceiro) {
    this.editingStatusId = st.id!;
    this.statusFormData = { nome: st.nome, corBadge: st.corBadge };
    this.statusModalOpen.set(true);
  }

  saveStatus() {
    if (this.editingStatusId) {
      this.apiService.updateStatusFinanceiro(this.editingStatusId, this.statusFormData as StatusFinanceiro).subscribe({
        next: () => {
          this.toast.success('Status atualizado!');
          this.statusModalOpen.set(false);
          this.apiService.getStatusFinanceiros().subscribe(res => this.statusList.set(res));
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao atualizar status.')
      });
    } else {
      this.apiService.createStatusFinanceiro(this.statusFormData as StatusFinanceiro).subscribe({
        next: () => {
          this.toast.success('Status criado!');
          this.statusModalOpen.set(false);
          this.apiService.getStatusFinanceiros().subscribe(res => this.statusList.set(res));
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao criar status.')
      });
    }
  }

  deleteStatus(id: number) {
    if (confirm('Deseja excluir este status financeiro?')) {
      this.apiService.deleteStatusFinanceiro(id).subscribe({
        next: () => {
          this.toast.success('Status excluído.');
          this.apiService.getStatusFinanceiros().subscribe(res => this.statusList.set(res));
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao excluir status.')
      });
    }
  }
}

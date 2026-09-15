import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria, CotacaoDolar, Evento, Lancamento, StatusFinanceiro } from '../../core/models/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyBrlPipe],
  template: `
    <div class="page-container">
      <!-- Cabeçalho -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Lançamentos & Notas Fiscais</h1>
          <p class="page-subtitle">Registro de despesas pagas, notas fiscais, comprovantes e controle de taxas cambiais</p>
        </div>
        @if (authService.isAdmin()) {
          <button class="btn btn-primary" (click)="openModal()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Lançamento
          </button>
        }
      </div>

      <!-- Filtros Avançados Alinhados -->
      <div class="card filter-card">
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label">Buscar:</label>
            <input type="text" class="form-control" [(ngModel)]="filters.busca" (input)="applyFilters()" placeholder="Descrição, fornecedor, NF...">
          </div>

          <div class="form-group">
            <label class="form-label">Evento:</label>
            <select class="form-select" [(ngModel)]="filters.eventoId" (change)="applyFilters()">
              <option [ngValue]="undefined">Todos os eventos</option>
              @for (ev of eventos(); track ev.id) {
                <option [ngValue]="ev.id">{{ ev.nome }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Categoria:</label>
            <select class="form-select" [(ngModel)]="filters.categoriaId" (change)="applyFilters()">
              <option [ngValue]="undefined">Todas as categorias</option>
              @for (cat of categorias(); track cat.id) {
                <option [ngValue]="cat.id">{{ cat.nome }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Status Financeiro:</label>
            <select class="form-select" [(ngModel)]="filters.statusId" (change)="applyFilters()">
              <option [ngValue]="undefined">Todos os status</option>
              @for (st of statusList(); track st.id) {
                <option [ngValue]="st.id">{{ st.nome }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Data Início:</label>
            <input type="date" class="form-control" [(ngModel)]="filters.dataInicio" (change)="applyFilters()">
          </div>

          <div class="form-group">
            <label class="form-label">Data Fim:</label>
            <input type="date" class="form-control" [(ngModel)]="filters.dataFim" (change)="applyFilters()">
          </div>
        </div>

        <div class="filter-footer">
          <button class="btn btn-sm btn-outline btn-clear" (click)="clearFilters()">Limpar Filtros</button>
          <div class="filter-stats">
            <span class="stat-count">{{ lancamentos().length }} itens encontrados</span>
            <div class="filter-total">
              <span class="total-label">Total Filtrado:</span>
              <strong class="total-val">{{ totalFiltradoBrl() | currencyBrl }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Lançamentos Fluida e Sem Scroll Horizontal -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 100px;">Data</th>
              <th style="min-width: 180px;">Descrição & Fornecedor</th>
              <th style="min-width: 140px;">Evento & Categoria</th>
              <th style="width: 110px;">Nº NF</th>
              <th style="min-width: 170px;">Valor & Câmbio</th>
              <th style="width: 120px;">Status / Anexo</th>
              <th style="width: 170px; text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (item of lancamentos(); track item.id) {
              <tr>
                <td class="col-date">
                  <strong>{{ item.data | date:'dd/MM/yyyy' }}</strong>
                </td>
                <td class="col-desc">
                  <strong class="item-title">{{ item.descricao }}</strong>
                  <div class="supplier-text">Fornecedor: <span>{{ item.fornecedor }}</span></div>
                </td>
                <td class="col-event-cat">
                  <div class="event-name">{{ item.eventoNome }}</div>
                  <span class="badge badge-purple">{{ item.categoriaNome }}</span>
                </td>
                <td class="col-nf">
                  @if (item.numeroNotaFiscal) {
                    <code class="nf-code">{{ item.numeroNotaFiscal }}</code>
                  } @else {
                    <span class="text-muted">—</span>
                  }
                </td>
                <td class="col-values">
                  <div class="val-brl"><strong>{{ item.valorBrl | currencyBrl }}</strong></div>
                  @if (item.valorUsd && item.valorUsd > 0) {
                    <div class="val-usd-meta">
                      <span class="val-usd">US$ {{ item.valorUsd | number:'1.2-2' }}</span>
                      <span class="cambio-rate">• Tx: R$ {{ item.taxaCambioUsada | number:'1.4-4' }}</span>
                    </div>
                    @if (calcularTaxaRetida(item) > 0.05) {
                      <div class="fee-loss-tag" title="Valor retido em taxas de conversão">
                        Taxa: R$ {{ calcularTaxaRetida(item) | number:'1.2-2' }}
                      </div>
                    }
                  }
                </td>
                <td class="col-status-anexo">
                  <div class="status-stack">
                    <span class="status-pill" [style.background-color]="item.statusCorBadge + '22'" [style.color]="item.statusCorBadge" [style.border-color]="item.statusCorBadge + '55'">
                      {{ item.statusNome }}
                    </span>
                    @if (item.anexoUrl) {
                      <button class="btn-anexo" (click)="downloadAnexo(item)" title="Ver Anexo / NF">
                        📎 Ver NF
                      </button>
                    }
                  </div>
                </td>
                <td class="col-actions" style="text-align: right;">
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-outline btn-details" (click)="openDetailsModal(item)" title="Visualizar todos os detalhes">
                      👁️ Detalhes
                    </button>
                    @if (authService.isAdmin()) {
                      <button class="btn btn-sm btn-outline btn-icon" (click)="openModal(item)" title="Editar">
                        ✏️
                      </button>
                      <button class="btn btn-sm btn-danger btn-icon" (click)="excluir(item.id!)" title="Excluir">
                        🗑️
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-state" style="text-align: center; padding: 2.5rem 1rem; color: #64748B;">
                  Nenhum lançamento encontrado para os filtros selecionados.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal de Criação / Edição com Cálculo Inteligente de Taxas -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-content modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">{{ editingId() ? 'Editar Lançamento' : 'Novo Lançamento / Despesa' }}</h2>
              <button class="btn-close" (click)="closeModal()">✕</button>
            </div>

            <form (ngSubmit)="salvar()">
              <div class="modal-body">
                <div class="form-row">
                  <div class="form-group col-4">
                    <label class="form-label required">Data:</label>
                    <input type="date" class="form-control" [(ngModel)]="formData.data" name="data" required>
                  </div>
                  <div class="form-group col-8">
                    <label class="form-label required">Descrição:</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.descricao" name="descricao" placeholder="Ex: Coffee break do DemoDay" required>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group col-6">
                    <label class="form-label required">Fornecedor / Prestador:</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.fornecedor" name="fornecedor" placeholder="Ex: Salgados Flor" required>
                  </div>
                  <div class="form-group col-6">
                    <label class="form-label">Número da Nota Fiscal / Recibo:</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.numeroNotaFiscal" name="numeroNotaFiscal" placeholder="Ex: NF-000.000.119">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group col-6">
                    <label class="form-label required">Evento:</label>
                    <select class="form-select" [(ngModel)]="formData.eventoId" name="eventoId" required>
                      <option [ngValue]="undefined">Selecione o evento</option>
                      @for (ev of eventos(); track ev.id) {
                        <option [ngValue]="ev.id">{{ ev.nome }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group col-6">
                    <label class="form-label required">Categoria:</label>
                    <select class="form-select" [(ngModel)]="formData.categoriaId" name="categoriaId" required>
                      <option [ngValue]="undefined">Selecione a categoria</option>
                      @for (cat of categorias(); track cat.id) {
                        <option [ngValue]="cat.id">{{ cat.nome }}</option>
                      }
                    </select>
                  </div>
                </div>

                <!-- Painel de Cálculos Cambiais Inteligentes (BRL vs USD Cobrado vs Taxas) -->
                <div class="cambio-calc-card">
                  <div class="calc-header">
                    <span class="calc-title">💵 Valores e Controle de Câmbio</span>
                    <span class="calc-badge">
                      Spot Mercado: R$ {{ (cotacaoMercado()?.cotacaoOficial || 5.07) | number:'1.4-4' }}/USD
                    </span>
                  </div>

                  <div class="form-row">
                    <div class="form-group col-4">
                      <label class="form-label required">Valor Pago / NF (BRL):</label>
                      <div class="input-prefix-group">
                        <span class="input-prefix">R$</span>
                        <input type="number" step="0.01" min="0" class="form-control" 
                               [(ngModel)]="formData.valorBrl" name="valorBrl" 
                               (input)="onBrlChange()" placeholder="0,00" required>
                      </div>
                    </div>

                    <div class="form-group col-4">
                      <label class="form-label">Cobrança Debitada (USD):</label>
                      <div class="input-prefix-group">
                        <span class="input-prefix">US$</span>
                        <input type="number" step="0.01" min="0" class="form-control" 
                               [(ngModel)]="formData.valorUsd" name="valorUsd" 
                               (input)="onUsdChange()" placeholder="0,00">
                      </div>
                    </div>

                    <div class="form-group col-4">
                      <label class="form-label">Taxa Efetiva (R$/USD):</label>
                      <div class="input-prefix-group">
                        <span class="input-prefix">Tx</span>
                        <input type="number" step="0.0001" min="0.0001" class="form-control" 
                               [(ngModel)]="formData.taxaCambioUsada" name="taxaCambioUsada" 
                               (input)="onTaxaChange()" placeholder="5.5000">
                      </div>
                    </div>
                  </div>

                  <!-- Resumo Visual da Transação -->
                  @if (formData.valorUsd && formData.valorUsd > 0 && formData.valorBrl && formData.valorBrl > 0) {
                    <div class="calc-summary-box">
                      <div class="summary-grid">
                        <div class="sum-item">
                          <span class="sum-label">Valor do Fornecedor</span>
                          <strong class="sum-val text-mint">R$ {{ formData.valorBrl | number:'1.2-2' }}</strong>
                        </div>
                        <div class="sum-item">
                          <span class="sum-label">Total Debitado</span>
                          <strong class="sum-val text-amber">US$ {{ formData.valorUsd | number:'1.2-2' }}</strong>
                        </div>
                        <div class="sum-item">
                          <span class="sum-label">Taxa Real Praticada</span>
                          <strong class="sum-val">R$ {{ formData.taxaCambioUsada | number:'1.4-4' }}</strong>
                        </div>
                        <div class="sum-item">
                          <span class="sum-label">Taxas / Spread Retido</span>
                          <strong class="sum-val text-warning">
                            R$ {{ modalTaxaRetida() | number:'1.2-2' }} 
                            <small>({{ modalPctSpread() | number:'1.1-1' }}%)</small>
                          </strong>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <div class="form-row">
                  <div class="form-group col-6">
                    <label class="form-label required">Forma de Pagamento:</label>
                    <select class="form-select" [(ngModel)]="formData.formaPagamento" name="formaPagamento" required>
                      <option value="Cartão de Crédito Corporativo">Cartão de Crédito Corporativo</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="PIX">PIX</option>
                      <option value="Boleto">Boleto Bancário</option>
                      <option value="Transferência Bancária">Transferência Bancária</option>
                      <option value="Reembolso">Reembolso</option>
                    </select>
                  </div>
                  <div class="form-group col-6">
                    <label class="form-label">Status Financeiro:</label>
                    <select class="form-select" [(ngModel)]="formData.statusId" name="statusId">
                      <option [ngValue]="undefined">Selecione o status</option>
                      @for (st of statusList(); track st.id) {
                        <option [ngValue]="st.id">{{ st.nome }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Anexo (Nota Fiscal / Comprovante PDF ou Imagem):</label>
                  <input type="file" class="form-control" (change)="onFileSelected($event)" accept=".pdf,.png,.jpg,.jpeg">
                  @if (selectedFileName) {
                    <small class="file-hint">Arquivo selecionado: <strong>{{ selectedFileName }}</strong></small>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Observações:</label>
                  <textarea class="form-control" [(ngModel)]="formData.observacoes" name="observacoes" rows="2" placeholder="Informações adicionais sobre o pagamento..."></textarea>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="saving()">
                  {{ saving() ? 'Salvando...' : (editingId() ? 'Atualizar Lançamento' : 'Registrar Lançamento') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal de Detalhes Completos (Eye Icon) -->
      @if (selectedLancamento()) {
        <div class="modal-backdrop" (click)="closeDetailsModal()">
          <div class="modal-content modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="header-left">
                <span class="badge badge-navy">ID #{{ selectedLancamento()!.id }}</span>
                <h2 class="modal-title">Detalhes do Lançamento</h2>
              </div>
              <button class="btn-close" (click)="closeDetailsModal()">✕</button>
            </div>

            <div class="modal-body details-body">
              <div class="details-section">
                <h4 class="section-title">Informações Principais</h4>
                <div class="details-grid">
                  <div class="detail-item full-width">
                    <span class="detail-label">Descrição do Gasto</span>
                    <span class="detail-value text-lg"><strong>{{ selectedLancamento()!.descricao }}</strong></span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Fornecedor / Beneficiário</span>
                    <span class="detail-value">{{ selectedLancamento()!.fornecedor }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Número da NF / Comprovante</span>
                    <span class="detail-value">
                      @if (selectedLancamento()!.numeroNotaFiscal) {
                        <code>{{ selectedLancamento()!.numeroNotaFiscal }}</code>
                      } @else {
                        <span class="text-muted">Não informado</span>
                      }
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Data de Competência</span>
                    <span class="detail-value">{{ selectedLancamento()!.data | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Forma de Pagamento</span>
                    <span class="detail-value">{{ selectedLancamento()!.formaPagamento }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Evento Vinculado</span>
                    <span class="detail-value"><span class="badge badge-blue">{{ selectedLancamento()!.eventoNome }}</span></span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Categoria de Custo</span>
                    <span class="detail-value"><span class="badge badge-purple">{{ selectedLancamento()!.categoriaNome }}</span></span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Status da Transação</span>
                    <span class="detail-value">
                      <span class="status-pill" [style.background-color]="selectedLancamento()!.statusCorBadge + '22'" [style.color]="selectedLancamento()!.statusCorBadge">
                        {{ selectedLancamento()!.statusNome }}
                      </span>
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Registrado por</span>
                    <span class="detail-value">{{ selectedLancamento()!.responsavelNome || 'Sistema' }}</span>
                  </div>
                </div>
              </div>

              <!-- Seção de Câmbio e Taxas -->
              <div class="details-section">
                <h4 class="section-title">Valores & Breakdown Cambial</h4>
                <div class="cambio-breakdown-card">
                  <div class="breakdown-grid">
                    <div class="b-item highlight-green">
                      <span class="b-label">Valor Pago ao Fornecedor</span>
                      <strong class="b-val">{{ selectedLancamento()!.valorBrl | currencyBrl }}</strong>
                      <small>Valor líquido da nota fiscal</small>
                    </div>
                    <div class="b-item highlight-amber">
                      <span class="b-label">Valor Debitado do Orçamento</span>
                      <strong class="b-val">US$ {{ selectedLancamento()!.valorUsd | number:'1.2-2' }}</strong>
                      <small>Cobrança internacional</small>
                    </div>
                    <div class="b-item">
                      <span class="b-label">Taxa Efetiva de Câmbio</span>
                      <strong class="b-val">R$ {{ selectedLancamento()!.taxaCambioUsada | number:'1.4-4' }}</strong>
                      <small>Cotação real do gasto</small>
                    </div>
                    <div class="b-item highlight-warning">
                      <span class="b-label">Taxas Bancárias / Spread</span>
                      <strong class="b-val">R$ {{ calcularTaxaRetida(selectedLancamento()!) | number:'1.2-2' }}</strong>
                      <small>Custo de conversão retido</small>
                    </div>
                  </div>
                </div>
              </div>

              @if (selectedLancamento()!.observacoes) {
                <div class="details-section">
                  <h4 class="section-title">Observações</h4>
                  <p class="notes-text">{{ selectedLancamento()!.observacoes }}</p>
                </div>
              }

              @if (selectedLancamento()!.anexoUrl) {
                <div class="details-section">
                  <h4 class="section-title">Comprovante / Nota Fiscal</h4>
                  <div class="anexo-box">
                    <span>📎 {{ selectedLancamento()!.anexoNomeOriginal || 'Nota_Fiscal.pdf' }}</span>
                    <button class="btn btn-sm btn-primary" (click)="downloadAnexo(selectedLancamento()!)">
                      Baixar / Visualizar Arquivo
                    </button>
                  </div>
                </div>
              }
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeDetailsModal()">Fechar</button>
            </div>
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
      margin-bottom: 0.25rem;
    }
    .page-subtitle {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }

    /* Filtros Alinhados */
    .filter-card {
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.5rem;
      box-shadow: var(--shadow-sm);
    }
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 1rem;
      align-items: flex-end;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 0;
    }
    .form-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-navy);
      white-space: nowrap;
      &.required::after {
        content: ' *';
        color: #EF4444;
      }
    }
    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.85rem;
    }
    .col-4 { flex: 4; }
    .col-6 { flex: 6; }
    .col-8 { flex: 8; }

    .filter-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-light);
    }
    .btn-clear {
      color: var(--color-navy);
      border-color: #CBD5E1;
      font-weight: 600;
      &:hover { background: #F8FAFC; }
    }
    .filter-stats {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .stat-count {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }
    .filter-total {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--color-amber-subtle);
      border: 1px solid rgba(255, 153, 0, 0.3);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-pill);
    }
    .total-label {
      font-size: 0.82rem;
      color: #92400E;
      font-weight: 600;
    }
    .total-val {
      font-size: 1.05rem;
      color: #B45309;
      font-weight: 700;
    }

    /* Tabela */
    .table-container {
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow-x: auto;
      box-shadow: var(--shadow-sm);
    }
    .item-title {
      color: var(--color-navy);
      font-size: 0.9rem;
    }
    .supplier-text {
      font-size: 0.78rem;
      color: var(--color-text-secondary);
      span { color: var(--color-navy); font-weight: 600; }
    }
    .event-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--color-navy);
      margin-bottom: 0.2rem;
    }
    .nf-code {
      background: #F1F5F9;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.78rem;
      color: var(--color-navy);
    }
    .val-brl {
      font-size: 0.95rem;
      color: var(--color-navy);
    }
    .val-usd-meta {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.78rem;
      color: var(--color-text-secondary);
    }
    .fee-loss-tag {
      font-size: 0.72rem;
      font-weight: 600;
      color: #B45309;
      background: #FEF3C7;
      border: 1px solid #FDE68A;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      display: inline-block;
      margin-top: 0.2rem;
    }

    .status-stack {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      align-items: flex-start;
    }
    .status-pill {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      text-transform: uppercase;
      border: 1px solid;
    }
    .btn-anexo {
      background: transparent;
      border: 1px solid #38BDF8;
      color: #0284C7;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 0.72rem;
      cursor: pointer;
      font-weight: 600;
      &:hover { background: rgba(56, 189, 248, 0.1); }
    }

    .btn-details {
      font-size: 0.78rem;
      padding: 0.35rem 0.6rem;
      color: var(--color-navy);
      border-color: #CBD5E1;
      font-weight: 600;
      &:hover { background: #F8FAFC; border-color: var(--color-navy); }
    }

    /* Modal Form Cálculos */
    .cambio-calc-card {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .calc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .calc-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: #B45309;
    }
    .calc-badge {
      font-size: 0.75rem;
      color: #78350F;
      background: #FEF3C7;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .input-prefix-group {
      display: flex;
      align-items: center;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: var(--radius-sm);
      overflow: hidden;
      .input-prefix {
        padding: 0 0.65rem;
        font-size: 0.85rem;
        font-weight: 700;
        color: #64748B;
        background: #F8FAFC;
        border-right: 1px solid #CBD5E1;
      }
      .form-control {
        border: none;
        border-radius: 0;
        &:focus { box-shadow: none; }
      }
    }
    .calc-summary-box {
      margin-top: 0.75rem;
      padding: 0.75rem 1rem;
      background: #FFFFFF;
      border-radius: 6px;
      border: 1px solid #FCD34D;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }
    .sum-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .sum-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
    }
    .sum-val {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--color-navy);
    }
    .text-mint { color: #059669 !important; }
    .text-amber { color: #D97706 !important; }
    .text-warning { color: #DC2626 !important; }

    /* Modal Details */
    .details-body {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .section-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--color-navy);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border-light);
      padding-bottom: 0.35rem;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      &.full-width { grid-column: span 2; }
    }
    .detail-label {
      font-size: 0.72rem;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 600;
    }
    .detail-value {
      font-size: 0.9rem;
      color: var(--color-navy);
      &.text-lg { font-size: 1.05rem; }
    }
    .cambio-breakdown-card {
      background: #F8FAFC;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 1rem;
    }
    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }
    .b-item {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      small { font-size: 0.7rem; color: #64748B; }
    }
    .b-label { font-size: 0.72rem; color: #64748B; font-weight: 600; }
    .b-val { font-size: 1.05rem; color: var(--color-navy); font-weight: 700; }
    .highlight-green .b-val { color: #059669; }
    .highlight-amber .b-val { color: #D97706; }
    .highlight-warning .b-val { color: #DC2626; }

    .anexo-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #F8FAFC;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      border: 1px solid var(--color-border);
    }
    .notes-text {
      background: #F8FAFC;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      color: var(--color-navy);
      font-size: 0.85rem;
      line-height: 1.5;
      border: 1px solid var(--color-border);
    }

    @media (max-width: 992px) {
      .form-row { flex-direction: column; }
      .summary-grid, .breakdown-grid { grid-template-columns: repeat(2, 1fr); }
      .details-grid { grid-template-columns: 1fr; .detail-item.full-width { grid-column: span 1; } }
    }
  `]
})
export class LancamentosComponent implements OnInit {
  private api = inject(ApiService);
  authService = inject(AuthService);
  private toast = inject(ToastService);

  lancamentos = signal<Lancamento[]>([]);
  eventos = signal<Evento[]>([]);
  categorias = signal<Categoria[]>([]);
  statusList = signal<StatusFinanceiro[]>([]);
  cotacaoMercado = signal<CotacaoDolar | null>(null);

  selectedLancamento = signal<Lancamento | null>(null);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);

  filters = {
    busca: '',
    eventoId: undefined as number | undefined,
    categoriaId: undefined as number | undefined,
    statusId: undefined as number | undefined,
    dataInicio: '',
    dataFim: ''
  };

  formData: Partial<Lancamento> & { eventoId?: number; categoriaId?: number; statusId?: number } = {
    data: new Date().toISOString().split('T')[0],
    valorBrl: 0,
    valorUsd: 0,
    taxaCambioUsada: 5.5000,
    formaPagamento: 'Cartão de Crédito Corporativo'
  };

  selectedFile: File | null = null;
  selectedFileName = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getLancamentos().subscribe({
      next: (data) => this.lancamentos.set(data),
      error: () => this.toast.error('Erro ao carregar lançamentos.')
    });

    this.api.getEventos().subscribe(data => this.eventos.set(data));
    this.api.getCategorias().subscribe(data => this.categorias.set(data));
    this.api.getStatusFinanceiros().subscribe(data => this.statusList.set(data));
    this.api.getCotacaoDolarAtual().subscribe(data => this.cotacaoMercado.set(data));
  }

  applyFilters() {
    this.api.getLancamentos(this.filters).subscribe({
      next: (data) => this.lancamentos.set(data)
    });
  }

  clearFilters() {
    this.filters = {
      busca: '',
      eventoId: undefined,
      categoriaId: undefined,
      statusId: undefined,
      dataInicio: '',
      dataFim: ''
    };
    this.applyFilters();
  }

  totalFiltradoBrl(): number {
    return this.lancamentos().reduce((acc, curr) => acc + (curr.valorBrl || 0), 0);
  }

  onBrlChange() {
    const brl = Number(this.formData.valorBrl) || 0;
    const usd = Number(this.formData.valorUsd) || 0;
    const taxa = Number(this.formData.taxaCambioUsada) || 0;

    if (usd > 0) {
      this.formData.taxaCambioUsada = Number((brl / usd).toFixed(4));
    } else if (taxa > 0) {
      this.formData.valorUsd = Number((brl / taxa).toFixed(2));
    }
  }

  onUsdChange() {
    const brl = Number(this.formData.valorBrl) || 0;
    const usd = Number(this.formData.valorUsd) || 0;
    const taxa = Number(this.formData.taxaCambioUsada) || 0;

    if (brl > 0 && usd > 0) {
      this.formData.taxaCambioUsada = Number((brl / usd).toFixed(4));
    } else if (usd > 0 && taxa > 0) {
      this.formData.valorBrl = Number((usd * taxa).toFixed(2));
    }
  }

  onTaxaChange() {
    const usd = Number(this.formData.valorUsd) || 0;
    const taxa = Number(this.formData.taxaCambioUsada) || 0;
    if (usd > 0 && taxa > 0) {
      this.formData.valorBrl = Number((usd * taxa).toFixed(2));
    }
  }

  modalTaxaRetida(): number {
    const usd = Number(this.formData.valorUsd) || 0;
    const brl = Number(this.formData.valorBrl) || 0;
    const spot = this.cotacaoMercado()?.cotacaoOficial || 5.0700;
    const valorSpotTeorico = usd * spot;
    return Math.max(0, valorSpotTeorico - brl);
  }

  modalPctSpread(): number {
    const usd = Number(this.formData.valorUsd) || 0;
    const spot = this.cotacaoMercado()?.cotacaoOficial || 5.0700;
    const valorSpotTeorico = usd * spot;
    if (valorSpotTeorico <= 0) return 0;
    return (this.modalTaxaRetida() / valorSpotTeorico) * 100;
  }

  calcularTaxaRetida(item: Lancamento): number {
    if (!item.valorUsd || item.valorUsd <= 0 || !item.valorBrl) return 0;
    const spot = this.cotacaoMercado()?.cotacaoOficial || 5.0700;
    const valorSpotTeorico = item.valorUsd * spot;
    return Math.max(0, valorSpotTeorico - item.valorBrl);
  }

  openModal(item?: Lancamento) {
    if (item) {
      this.editingId.set(item.id || null);
      this.formData = {
        ...item,
        eventoId: item.eventoId,
        categoriaId: item.categoriaId,
        statusId: item.statusId
      };
    } else {
      this.editingId.set(null);
      const defaultTaxa = this.cotacaoMercado()?.cotacaoOficial ? Number((this.cotacaoMercado()!.cotacaoOficial * 0.97).toFixed(4)) : 5.5000;
      this.formData = {
        data: new Date().toISOString().split('T')[0],
        valorBrl: 0,
        valorUsd: 0,
        taxaCambioUsada: defaultTaxa,
        formaPagamento: 'Cartão de Crédito Corporativo'
      };
    }
    this.selectedFile = null;
    this.selectedFileName = '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  openDetailsModal(item: Lancamento) {
    this.selectedLancamento.set(item);
  }

  closeDetailsModal() {
    this.selectedLancamento.set(null);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  salvar() {
    this.saving.set(true);
    const req = {
      data: this.formData.data!,
      descricao: this.formData.descricao!,
      fornecedor: this.formData.fornecedor!,
      numeroNotaFiscal: this.formData.numeroNotaFiscal,
      eventoId: this.formData.eventoId!,
      categoriaId: this.formData.categoriaId!,
      valorBrl: Number(this.formData.valorBrl) || 0,
      valorUsd: Number(this.formData.valorUsd) || 0,
      taxaCambioUsada: Number(this.formData.taxaCambioUsada) || 5.5000,
      formaPagamento: this.formData.formaPagamento!,
      statusId: this.formData.statusId,
      observacoes: this.formData.observacoes
    };

    const action = this.editingId()
      ? this.api.updateLancamento(this.editingId()!, req)
      : this.api.createLancamento(req);

    action.subscribe({
      next: (res) => {
        if (this.selectedFile && res.id) {
          this.api.uploadAnexoLancamento(res.id, this.selectedFile).subscribe({
            next: () => {
              this.toast.success('Lançamento e anexo salvos com sucesso!');
              this.loadData();
              this.closeModal();
              this.saving.set(false);
            },
            error: () => {
              this.toast.warning('Lançamento salvo, mas erro ao enviar anexo.');
              this.loadData();
              this.closeModal();
              this.saving.set(false);
            }
          });
        } else {
          this.toast.success(this.editingId() ? 'Lançamento atualizado!' : 'Lançamento registrado!');
          this.loadData();
          this.closeModal();
          this.saving.set(false);
        }
      },
      error: () => {
        this.toast.error('Erro ao salvar lançamento.');
        this.saving.set(false);
      }
    });
  }

  excluir(id: number) {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      this.api.deleteLancamento(id).subscribe({
        next: () => {
          this.toast.success('Lançamento excluído com sucesso.');
          this.loadData();
        },
        error: () => this.toast.error('Erro ao excluir lançamento.')
      });
    }
  }

  downloadAnexo(item: Lancamento) {
    if (!item.id) return;
    this.api.downloadAnexoLancamento(item.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.anexoNomeOriginal || `anexo_${item.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toast.error('Erro ao baixar anexo.')
    });
  }
}

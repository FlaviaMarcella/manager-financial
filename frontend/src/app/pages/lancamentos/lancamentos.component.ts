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
          <p class="page-subtitle">Registro de despesas pagas, notas fiscais, comprovantes e controle cambial</p>
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

      <!-- Filtros Avançados -->
      <div class="card filter-card">
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label">Buscar (Descrição, Fornecedor ou NF):</label>
            <input type="text" class="form-control" [(ngModel)]="filters.busca" (input)="applyFilters()" placeholder="Digite para filtrar...">
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

        <div class="filter-actions">
          <button class="btn btn-sm btn-outline" (click)="clearFilters()">Limpar Filtros</button>
          <div class="filter-total">
            <span>Total Filtrado:</span>
            <strong>{{ totalFiltradoBrl() | currencyBrl }}</strong>
          </div>
        </div>
      </div>

      <!-- Tabela de Lançamentos -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição & Fornecedor</th>
              <th>Nº NF</th>
              <th>Evento</th>
              <th>Categoria</th>
              <th>Valor (BRL)</th>
              <th>Câmbio</th>
              <th>Forma Pgto</th>
              <th>Status</th>
              <th>Anexo</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (item of lancamentos(); track item.id) {
              <tr>
                <td>{{ item.data | date:'dd/MM/yyyy' }}</td>
                <td>
                  <strong>{{ item.descricao }}</strong>
                  <div class="supplier-text">Fornecedor: {{ item.fornecedor }}</div>
                </td>
                <td>
                  @if (item.numeroNotaFiscal) {
                    <code>{{ item.numeroNotaFiscal }}</code>
                  } @else {
                    <span class="text-muted">—</span>
                  }
                </td>
                <td><small>{{ item.eventoNome }}</small></td>
                <td><span class="badge badge-navy">{{ item.categoriaNome }}</span></td>
                <td>
                  <strong>{{ item.valorBrl | currencyBrl }}</strong>
                  @if (item.valorUsd && item.valorUsd > 0) {
                    <small class="text-muted d-block">(US$ {{ item.valorUsd | number:'1.2-2' }})</small>
                  }
                </td>
                <td>
                  <span class="cambio-tag" title="Taxa de conversão usada">
                    R$ {{ (item.taxaCambioUsada || taxaCambio()) | number:'1.2-4' }}
                  </span>
                </td>
                <td><small>{{ item.formaPagamento }}</small></td>
                <td>
                  <span class="badge" [style.background-color]="item.statusCorBadge + '22'" [style.color]="item.statusCorBadge">
                    {{ item.statusNome }}
                  </span>
                </td>
                <td>
                  @if (item.anexoUrl) {
                    <a [href]="'/api/lancamentos/' + item.id + '/anexo'" target="_blank" class="btn btn-sm btn-outline btn-anexo" title="Ver comprovante">
                      📎 Ver NF
                    </a>
                  } @else if (authService.isAdmin()) {
                    <button class="btn btn-sm btn-outline btn-upload" (click)="openUploadModal(item)" title="Fazer upload de comprovante">
                      + Anexar
                    </button>
                  } @else {
                    <span class="text-muted">Sem anexo</span>
                  }
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-outline btn-view" (click)="openDetailsModal(item)" title="Visualizar todos os detalhes">
                      👁️ Detalhes
                    </button>
                    @if (authService.isAdmin()) {
                      <button class="btn btn-sm btn-outline" (click)="openUploadModal(item)" title="Gerenciar anexo">📎</button>
                      <button class="btn btn-sm btn-outline" (click)="editLancamento(item)" title="Editar">✎</button>
                      <button class="btn btn-sm btn-danger" (click)="deleteLancamento(item.id!)" title="Excluir">🗑</button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="11" class="empty-state">
                  Nenhum lançamento financeiro encontrado para os filtros selecionados.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal de Detalhes Completos (Visualização dos Dados) -->
      @if (detailsModalOpen() && selectedLancamentoForDetails) {
        <div class="modal-backdrop" (click)="closeDetailsModal()">
          <div class="modal-content modal-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h2>👁️ Detalhes Completos do Lançamento</h2>
                <p class="modal-subtitle">ID #{{ selectedLancamentoForDetails.id }} • Registrado em {{ selectedLancamentoForDetails.criadoEm | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <button class="modal-close" (click)="closeDetailsModal()">×</button>
            </div>

            <div class="details-container">
              <!-- Bloco 1: Identificação Principal -->
              <div class="details-section">
                <div class="details-grid">
                  <div class="detail-item full-row">
                    <span class="detail-label">Descrição da Despesa</span>
                    <strong class="detail-val-highlight">{{ selectedLancamentoForDetails.descricao }}</strong>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Fornecedor / Beneficiário</span>
                    <span class="detail-val">{{ selectedLancamentoForDetails.fornecedor }}</span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Número da Nota Fiscal / Recibo</span>
                    <span class="detail-val"><code>{{ selectedLancamentoForDetails.numeroNotaFiscal || 'Não informado' }}</code></span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Data do Pagamento / Fato Gerador</span>
                    <span class="detail-val">{{ selectedLancamentoForDetails.data | date:'dd/MM/yyyy' }}</span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Evento Vinculado</span>
                    <span class="detail-val">{{ selectedLancamentoForDetails.eventoNome }}</span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Categoria de Despesa</span>
                    <span class="badge badge-navy">{{ selectedLancamentoForDetails.categoriaNome }}</span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Forma de Pagamento</span>
                    <span class="detail-val">{{ selectedLancamentoForDetails.formaPagamento }}</span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Status Financeiro</span>
                    <span class="badge" [style.background-color]="selectedLancamentoForDetails.statusCorBadge + '22'" [style.color]="selectedLancamentoForDetails.statusCorBadge">
                      {{ selectedLancamentoForDetails.statusNome }}
                    </span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Responsável pelo Registro</span>
                    <span class="detail-val">{{ selectedLancamentoForDetails.responsavelNome || 'Sistema' }}</span>
                  </div>
                </div>
              </div>

              <!-- Bloco 2: Valores & Análise Cambial Detalhada -->
              <div class="details-section cambio-details-box">
                <h4 class="section-title">Valores & Conversão Cambial</h4>
                
                <div class="financial-cards-row">
                  <div class="fin-card fin-brl">
                    <span class="fin-label">Valor Efetivo em Reais</span>
                    <h3 class="fin-value">{{ selectedLancamentoForDetails.valorBrl | currencyBrl }}</h3>
                    <small>Valor líquido final debitado</small>
                  </div>

                  <div class="fin-card fin-usd">
                    <span class="fin-label">Equivalente em Dólares</span>
                    <h3 class="fin-value">US$ {{ selectedLancamentoForDetails.valorUsd | number:'1.2-2' }}</h3>
                    <small>Cotação: 1 USD = R$ {{ (selectedLancamentoForDetails.taxaCambioUsada || taxaCambio()) | number:'1.4-4' }}</small>
                  </div>
                </div>

                @if (cotacaoOficialMercado()?.cotacaoOficial && selectedLancamentoForDetails.valorUsd) {
                  <div class="market-comparison-bar">
                    <div class="comparison-header">
                      <span class="icon">📊</span>
                      <strong>Comparativo com a Cotação Oficial de Mercado do Dia:</strong>
                    </div>
                    <div class="comparison-body">
                      <div class="comp-col">
                        <span>Valor na Cotação Oficial (R$ {{ cotacaoOficialMercado()?.cotacaoOficial | number:'1.4-4' }}):</span>
                        <strong>{{ (selectedLancamentoForDetails.valorUsd * (cotacaoOficialMercado()?.cotacaoOficial || 1)) | currencyBrl }}</strong>
                      </div>
                      <div class="comp-col comp-diff">
                        <span>Desconto de Taxas de Conversão (Spread/IOF):</span>
                        <strong class="text-danger">
                          - {{ (((selectedLancamentoForDetails.valorUsd * (cotacaoOficialMercado()?.cotacaoOficial || 1))) - selectedLancamentoForDetails.valorBrl) | currencyBrl }}
                        </strong>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Bloco 3: Observações -->
              @if (selectedLancamentoForDetails.observacoes) {
                <div class="details-section">
                  <span class="detail-label">Observações & Justificativas</span>
                  <div class="observacoes-box">
                    {{ selectedLancamentoForDetails.observacoes }}
                  </div>
                </div>
              }

              <!-- Bloco 4: Comprovante Anexo -->
              <div class="details-section">
                <span class="detail-label">Comprovante / Nota Fiscal Digitalizada</span>
                @if (selectedLancamentoForDetails.anexoUrl) {
                  <div class="attachment-view-box">
                    <div class="att-info">
                      <span class="att-icon">📎</span>
                      <div>
                        <strong>{{ selectedLancamentoForDetails.anexoNomeOriginal || 'comprovante_fiscal.pdf' }}</strong>
                        <small class="text-muted d-block">Arquivo armazenado com segurança</small>
                      </div>
                    </div>
                    <a [href]="'/api/lancamentos/' + selectedLancamentoForDetails.id + '/anexo'" target="_blank" class="btn btn-primary btn-sm">
                      Abrir Comprovante em Nova Guia ↗
                    </a>
                  </div>
                } @else {
                  <div class="no-attachment-box">
                    <span>Nenhum comprovante foi anexado a este lançamento.</span>
                    @if (authService.isAdmin()) {
                      <button class="btn btn-sm btn-outline" (click)="openUploadModal(selectedLancamentoForDetails); closeDetailsModal()">
                        + Anexar Comprovante Agora
                      </button>
                    }
                  </div>
                }
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeDetailsModal()">Fechar Detalhes</button>
              @if (authService.isAdmin()) {
                <button type="button" class="btn btn-primary" (click)="editLancamento(selectedLancamentoForDetails); closeDetailsModal()">
                  ✎ Editar Lançamento
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- Modal de Criação / Edição -->
      @if (modalOpen()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-content modal-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h2>{{ isEditing() ? 'Editar Lançamento' : 'Novo Lançamento Financeiro' }}</h2>
                <p class="modal-subtitle">Preencha os dados e confirme a taxa de câmbio e conversão para este pagamento</p>
              </div>
              <button class="modal-close" (click)="closeModal()">×</button>
            </div>

            <form (ngSubmit)="saveLancamento()">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Data do Pagamento *</label>
                  <input type="date" class="form-control" [(ngModel)]="formData.data" name="data" required>
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Nº Nota Fiscal / Recibo</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.numeroNotaFiscal" name="numeroNotaFiscal" placeholder="Ex: NF-12345">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Descrição da Despesa *</label>
                <input type="text" class="form-control" [(ngModel)]="formData.descricao" name="descricao" required placeholder="Ex: Coffee break para 50 participantes">
              </div>

              <div class="form-group">
                <label class="form-label">Fornecedor / Prestador *</label>
                <input type="text" class="form-control" [(ngModel)]="formData.fornecedor" name="fornecedor" required placeholder="Ex: Padaria & Buffet Central">
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Evento *</label>
                  <select class="form-select" [(ngModel)]="formData.eventoId" name="eventoId" required>
                    <option [ngValue]="undefined" disabled>Selecione um evento</option>
                    @for (ev of eventos(); track ev.id) {
                      <option [ngValue]="ev.id">{{ ev.nome }}</option>
                    }
                  </select>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Categoria *</label>
                  <select class="form-select" [(ngModel)]="formData.categoriaId" name="categoriaId" required>
                    <option [ngValue]="undefined" disabled>Selecione uma categoria</option>
                    @for (cat of categorias(); track cat.id) {
                      <option [ngValue]="cat.id">{{ cat.nome }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Seção de Câmbio e Conversão do Formulário -->
              <div class="form-cambio-section">
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label">Valor em BRL (R$) *</label>
                    <div class="input-prefix-group">
                      <span class="prefix">R$</span>
                      <input type="number" step="0.01" min="0" class="form-control" [(ngModel)]="formData.valorBrl" (ngModelChange)="onBrlChange()" name="valorBrl" placeholder="0.00">
                    </div>
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label">Valor em USD (US$)</label>
                    <div class="input-prefix-group">
                      <span class="prefix">US$</span>
                      <input type="number" step="0.01" min="0" class="form-control" [(ngModel)]="formData.valorUsd" (ngModelChange)="onUsdChange()" name="valorUsd" placeholder="0.00">
                    </div>
                  </div>

                  <div class="form-group flex-1">
                    <div class="label-with-action">
                      <label class="form-label">Câmbio Efetivo (R$)</label>
                      @if (cotacaoOficialMercado()?.cotacaoOficial) {
                        <button type="button" class="btn-link" (click)="usarCotacaoMercadoNoForm()">
                          Usar Mercado ({{ cotacaoOficialMercado()?.cotacaoOficial | number:'1.2-2' }})
                        </button>
                      }
                    </div>
                    <input type="number" step="0.0001" min="0.0001" class="form-control" [(ngModel)]="formData.taxaCambioUsada" (ngModelChange)="onTaxaChange()" name="taxaCambioUsada" placeholder="5.5000">
                  </div>
                </div>

                <!-- Live Dynamic Breakdown -->
                <div class="conversion-live-breakdown">
                  <div class="breakdown-item">
                    <span>💱 Câmbio Aplicado:</span>
                    <strong>1 USD = R$ {{ (formData.taxaCambioUsada || taxaCambio()) | number:'1.4-4' }}</strong>
                  </div>
                  @if (cotacaoOficialMercado()?.cotacaoOficial) {
                    <div class="breakdown-item">
                      <span>🌐 Mercado Oficial Hoje:</span>
                      <strong>1 USD = R$ {{ cotacaoOficialMercado()?.cotacaoOficial | number:'1.4-4' }}</strong>
                    </div>
                  }
                  @if (formData.valorUsd && formData.valorUsd > 0 && cotacaoOficialMercado()?.cotacaoOficial) {
                    <div class="breakdown-item text-danger">
                      <span>Desconto de Taxas/Spread:</span>
                      <strong>
                        - {{ (((formData.valorUsd || 0) * (cotacaoOficialMercado()?.cotacaoOficial || 1)) - (formData.valorBrl || 0)) | currencyBrl }}
                      </strong>
                    </div>
                  }
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Forma de Pagamento *</label>
                  <select class="form-select" [(ngModel)]="formData.formaPagamento" name="formaPagamento" required>
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Reembolso">Reembolso</option>
                  </select>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Status Financeiro</label>
                  <select class="form-select" [(ngModel)]="formData.statusId" name="statusId">
                    <option [ngValue]="undefined">Não definido</option>
                    @for (st of statusList(); track st.id) {
                      <option [ngValue]="st.id">{{ st.nome }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Observações & Justificativas</label>
                <textarea class="form-control" [(ngModel)]="formData.observacoes" name="observacoes" rows="2" placeholder="Detalhes adicionais sobre os itens adquiridos ou contexto do pagamento"></textarea>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="!formData.data || !formData.descricao || !formData.fornecedor || !formData.eventoId || !formData.categoriaId || (!formData.valorBrl && !formData.valorUsd)">
                  {{ isEditing() ? 'Atualizar Lançamento' : 'Salvar Lançamento' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal de Upload de Anexo -->
      @if (uploadModalOpen()) {
        <div class="modal-backdrop" (click)="closeUploadModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Comprovante / Nota Fiscal</h2>
              <button class="modal-close" (click)="closeUploadModal()">×</button>
            </div>

            <div class="upload-modal-body">
              <p>Lançamento: <strong>{{ selectedLancamentoForUpload?.descricao }}</strong></p>
              <p>Fornecedor: <strong>{{ selectedLancamentoForUpload?.fornecedor }}</strong> | Valor: <strong>{{ selectedLancamentoForUpload?.valorBrl | currencyBrl }}</strong></p>

              @if (selectedLancamentoForUpload?.anexoUrl) {
                <div class="current-attachment">
                  <span class="attachment-label">Arquivo atual:</span>
                  <strong>{{ selectedLancamentoForUpload?.anexoNomeOriginal || 'comprovante.pdf' }}</strong>
                  <div class="attachment-actions">
                    <a [href]="'/api/lancamentos/' + selectedLancamentoForUpload?.id + '/anexo'" target="_blank" class="btn btn-sm btn-outline">
                      Abrir Anexo
                    </a>
                    <button class="btn btn-sm btn-danger" (click)="removeAnexo(selectedLancamentoForUpload?.id!)">
                      Excluir Anexo
                    </button>
                  </div>
                </div>
              }

              <div class="file-upload-area">
                <label class="form-label">Enviar novo comprovante (PDF, JPG, PNG - máx 10MB):</label>
                <input type="file" (change)="onFileSelected($event)" accept="image/*,application/pdf" class="form-control">
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeUploadModal()">Fechar</button>
                <button type="button" class="btn btn-primary" [disabled]="!selectedFile" (click)="uploadFile()">
                  Enviar Arquivo
                </button>
              </div>
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
    .filter-card {
      padding: 1.25rem;
    }
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .filter-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--color-border-light);
      padding-top: 1rem;
      margin-top: 0.5rem;
    }
    .filter-total {
      font-size: 0.95rem;
      color: var(--color-navy);
      strong {
        color: var(--color-amber-hover);
        font-size: 1.2rem;
        margin-left: 0.5rem;
      }
    }
    .supplier-text {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }
    .text-muted {
      color: var(--color-text-muted);
    }
    .cambio-tag {
      font-size: 0.75rem;
      background: #F1F5F9;
      border: 1px solid var(--color-border);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      color: var(--color-navy);
      font-weight: 600;
    }
    .btn-anexo {
      color: var(--color-blue);
      border-color: var(--color-blue);
      &:hover { background: var(--color-blue-subtle); }
    }
    .btn-upload {
      font-size: 0.75rem;
      border-style: dashed;
    }
    .btn-view {
      color: var(--color-navy);
      font-weight: 600;
      &:hover { background: #F1F5F9; }
    }
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.35rem;
      flex-wrap: wrap;
    }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--color-text-muted);
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .flex-1 { flex: 1; }
    .input-prefix-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      .prefix {
        font-weight: 700;
        color: var(--color-navy);
      }
    }
    .label-with-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .btn-link {
      background: none;
      border: none;
      color: var(--color-blue);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      &:hover { text-decoration: underline; }
    }

    /* Form Câmbio Section */
    .form-cambio-section {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: var(--radius-md);
      padding: 1.25rem;
      margin-bottom: 1rem;
    }
    .conversion-live-breakdown {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px dashed #CBD5E1;
      font-size: 0.8rem;
    }
    .breakdown-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--color-text-secondary);
      strong { color: var(--color-navy); }
    }

    /* Modais */
    .modal-large {
      max-width: 780px;
    }
    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border);
    }
    .modal-subtitle {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      margin-top: 0.2rem;
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

    /* Details View Styling */
    .details-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .details-section {
      border-bottom: 1px solid var(--color-border-light);
      padding-bottom: 1.25rem;
      &:last-child { border-bottom: none; }
    }
    .section-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--color-navy);
      margin-bottom: 0.75rem;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      &.full-row {
        grid-column: 1 / -1;
      }
    }
    .detail-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-text-muted);
    }
    .detail-val {
      font-size: 0.9rem;
      color: var(--color-navy);
      font-weight: 500;
    }
    .detail-val-highlight {
      font-size: 1.2rem;
      color: var(--color-navy);
    }
    .cambio-details-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: var(--radius-md);
      padding: 1.25rem;
    }
    .financial-cards-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .fin-card {
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      &.fin-brl { border-left: 4px solid var(--color-amber); }
      &.fin-usd { border-left: 4px solid var(--color-blue); }
    }
    .fin-label {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      font-weight: 600;
    }
    .fin-value {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--color-navy);
      margin: 0.1rem 0;
    }
    .market-comparison-bar {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: var(--radius-sm);
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .comparison-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #92400E;
    }
    .comparison-body {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.8rem;
    }
    .comp-col {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      color: #78350F;
    }
    .observacoes-box {
      background: #F8FAFC;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 0.85rem;
      font-size: 0.85rem;
      color: #334155;
      line-height: 1.5;
      margin-top: 0.35rem;
    }
    .attachment-view-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
      margin-top: 0.35rem;
    }
    .att-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .att-icon {
      font-size: 1.5rem;
    }
    .no-attachment-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem;
      background: #F8FAFC;
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-sm);
      margin-top: 0.35rem;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }
    .current-attachment {
      background: #F8FAFC;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 1rem;
      margin: 1rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .attachment-actions {
      display: flex;
      gap: 0.5rem;
    }
    .file-upload-area {
      margin-top: 1rem;
    }
  `]
})
export class LancamentosComponent implements OnInit {
  apiService = inject(ApiService);
  authService = inject(AuthService);
  toast = inject(ToastService);

  lancamentos = signal<Lancamento[]>([]);
  eventos = signal<Evento[]>([]);
  categorias = signal<Categoria[]>([]);
  statusList = signal<StatusFinanceiro[]>([]);
  taxaCambio = signal<number>(5.50);
  cotacaoOficialMercado = signal<CotacaoDolar | null>(null);

  filters = {
    eventoId: undefined as number | undefined,
    categoriaId: undefined as number | undefined,
    statusId: undefined as number | undefined,
    dataInicio: '',
    dataFim: '',
    busca: ''
  };

  modalOpen = signal(false);
  isEditing = signal(false);
  editingId: number | null = null;

  // Modal de Detalhes
  detailsModalOpen = signal(false);
  selectedLancamentoForDetails: Lancamento | null = null;

  uploadModalOpen = signal(false);
  selectedLancamentoForUpload: Lancamento | null = null;
  selectedFile: File | null = null;

  formData: Partial<Lancamento> = {
    data: new Date().toISOString().substring(0, 10),
    descricao: '',
    fornecedor: '',
    numeroNotaFiscal: '',
    eventoId: undefined,
    categoriaId: undefined,
    valorBrl: 0,
    valorUsd: 0,
    taxaCambioUsada: 5.50,
    formaPagamento: 'PIX',
    statusId: undefined,
    observacoes: ''
  };

  ngOnInit() {
    this.loadEventos();
    this.loadCategorias();
    this.loadStatus();
    this.loadConfig();
    this.loadCotacaoMercado();
    this.applyFilters();
  }

  loadEventos() {
    this.apiService.getEventos().subscribe(res => this.eventos.set(res));
  }

  loadCategorias() {
    this.apiService.getCategorias().subscribe(res => this.categorias.set(res));
  }

  loadStatus() {
    this.apiService.getStatusFinanceiros().subscribe(res => this.statusList.set(res));
  }

  loadConfig() {
    this.apiService.getConfiguracao().subscribe(cfg => {
      this.taxaCambio.set(cfg.taxaCambioUsdBrl);
      if (!this.formData.taxaCambioUsada) {
        this.formData.taxaCambioUsada = cfg.taxaCambioUsdBrl;
      }
    });
  }

  loadCotacaoMercado() {
    this.apiService.getCotacaoDolarAtual().subscribe({
      next: (c) => this.cotacaoOficialMercado.set(c),
      error: () => {}
    });
  }

  applyFilters() {
    this.apiService.getLancamentos(this.filters).subscribe(res => {
      this.lancamentos.set(res);
    });
  }

  clearFilters() {
    this.filters = {
      eventoId: undefined,
      categoriaId: undefined,
      statusId: undefined,
      dataInicio: '',
      dataFim: '',
      busca: ''
    };
    this.applyFilters();
  }

  totalFiltradoBrl(): number {
    return this.lancamentos().reduce((acc, curr) => acc + (Number(curr.valorBrl) || 0), 0);
  }

  getTaxaAtiva(): number {
    return (this.formData.taxaCambioUsada && this.formData.taxaCambioUsada > 0)
      ? this.formData.taxaCambioUsada
      : this.taxaCambio();
  }

  onBrlChange() {
    const taxa = this.getTaxaAtiva();
    if (this.formData.valorBrl !== undefined && this.formData.valorBrl !== null && taxa > 0) {
      this.formData.valorUsd = Number((this.formData.valorBrl / taxa).toFixed(2));
    }
  }

  onUsdChange() {
    const taxa = this.getTaxaAtiva();
    if (this.formData.valorUsd !== undefined && this.formData.valorUsd !== null && taxa > 0) {
      this.formData.valorBrl = Number((this.formData.valorUsd * taxa).toFixed(2));
    }
  }

  onTaxaChange() {
    if (this.formData.valorUsd && this.formData.valorUsd > 0) {
      this.onUsdChange();
    } else if (this.formData.valorBrl && this.formData.valorBrl > 0) {
      this.onBrlChange();
    }
  }

  usarCotacaoMercadoNoForm() {
    const taxa = this.cotacaoOficialMercado()?.cotacaoOficial;
    if (taxa) {
      this.formData.taxaCambioUsada = Number(taxa.toFixed(4));
      this.onTaxaChange();
      this.toast.info(`Cotação de mercado R$ ${this.formData.taxaCambioUsada} aplicada.`);
    }
  }

  // Modal de Detalhes
  openDetailsModal(item: Lancamento) {
    this.selectedLancamentoForDetails = item;
    this.detailsModalOpen.set(true);
  }

  closeDetailsModal() {
    this.detailsModalOpen.set(false);
    this.selectedLancamentoForDetails = null;
  }

  openModal() {
    this.isEditing.set(false);
    this.editingId = null;
    this.formData = {
      data: new Date().toISOString().substring(0, 10),
      descricao: '',
      fornecedor: '',
      numeroNotaFiscal: '',
      eventoId: this.eventos()[0]?.id ?? undefined,
      categoriaId: this.categorias()[0]?.id ?? undefined,
      valorBrl: 0,
      valorUsd: 0,
      taxaCambioUsada: this.taxaCambio(),
      formaPagamento: 'PIX',
      statusId: this.statusList()[0]?.id ?? undefined,
      observacoes: ''
    };
    this.modalOpen.set(true);
  }

  editLancamento(item: Lancamento) {
    this.isEditing.set(true);
    this.editingId = item.id!;
    this.formData = {
      data: item.data,
      descricao: item.descricao,
      fornecedor: item.fornecedor,
      numeroNotaFiscal: item.numeroNotaFiscal,
      eventoId: item.eventoId,
      categoriaId: item.categoriaId,
      valorBrl: item.valorBrl,
      valorUsd: item.valorUsd,
      taxaCambioUsada: item.taxaCambioUsada || this.taxaCambio(),
      formaPagamento: item.formaPagamento,
      statusId: item.statusId,
      observacoes: item.observacoes
    };
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  saveLancamento() {
    if (this.isEditing() && this.editingId) {
      this.apiService.updateLancamento(this.editingId, this.formData).subscribe({
        next: () => {
          this.toast.success('Lançamento atualizado com sucesso!');
          this.closeModal();
          this.applyFilters();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao atualizar lançamento.')
      });
    } else {
      this.apiService.createLancamento(this.formData).subscribe({
        next: () => {
          this.toast.success('Lançamento registrado com sucesso!');
          this.closeModal();
          this.applyFilters();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao criar lançamento.')
      });
    }
  }

  deleteLancamento(id: number) {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      this.apiService.deleteLancamento(id).subscribe({
        next: () => {
          this.toast.success('Lançamento excluído com sucesso.');
          this.applyFilters();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao excluir lançamento.')
      });
    }
  }

  openUploadModal(item: Lancamento) {
    this.selectedLancamentoForUpload = item;
    this.selectedFile = null;
    this.uploadModalOpen.set(true);
  }

  closeUploadModal() {
    this.uploadModalOpen.set(false);
    this.selectedLancamentoForUpload = null;
    this.selectedFile = null;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadFile() {
    if (!this.selectedLancamentoForUpload?.id || !this.selectedFile) return;

    this.apiService.uploadAnexoLancamento(this.selectedLancamentoForUpload.id, this.selectedFile).subscribe({
      next: (updated) => {
        this.toast.success('Comprovante anexado com sucesso!');
        this.closeUploadModal();
        this.applyFilters();
      },
      error: (err) => this.toast.error(err.error?.message || 'Erro ao anexar arquivo.')
    });
  }

  removeAnexo(id: number) {
    if (confirm('Deseja realmente remover o comprovante deste lançamento?')) {
      this.apiService.removeAnexoLancamento(id).subscribe({
        next: () => {
          this.toast.success('Anexo removido.');
          this.closeUploadModal();
          this.applyFilters();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao remover anexo.')
      });
    }
  }
}

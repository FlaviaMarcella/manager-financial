import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria, CategoriaSaldoDisponivel, CotacaoDolar, Evento, ItemOrcamento, TransferenciaOrcamento } from '../../core/models/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-orcamento',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyBrlPipe],
  template: `
    <div class="page-container">
      <!-- Cabeçalho -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestão de Orçamento</h1>
          <p class="page-subtitle">Planejamento em USD convertido em BRL, controle de saldo e remanejamento entre eventos</p>
        </div>
        @if (authService.isAdmin()) {
          <div class="header-actions">
            <button class="btn btn-outline" (click)="openTransferModal()">
              <span class="icon">🔄</span>
              Transferir Saldo entre Eventos
            </button>
            <button class="btn btn-primary" (click)="openModal()">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Novo Item de Orçamento
            </button>
          </div>
        }
      </div>

      <!-- Filtro por Evento & Painel Resumo -->
      <div class="card filter-card">
        <div class="filter-row">
          <div class="filter-item">
            <label class="form-label">Filtrar por Evento:</label>
            <select class="form-select" [(ngModel)]="selectedEventoId" (change)="onFilterChange()">
              <option [ngValue]="null">Todos os eventos</option>
              @for (ev of eventos(); track ev.id) {
                <option [ngValue]="ev.id">{{ ev.nome }}</option>
              }
            </select>
          </div>

          <div class="summary-pills">
            <div class="pill">
              <span>Orçamento Aprovado:</span>
              <strong>US$ {{ totalUsd() | number:'1.2-2' }} <small class="text-muted">({{ totalBrl() | currencyBrl }})</small></strong>
            </div>
            <div class="pill pill-purple">
              <span>Gasto Consumido:</span>
              <strong>US$ {{ totalRealizadoUsd() | number:'1.2-2' }} <small class="text-muted">({{ totalRealizadoBrl() | currencyBrl }})</small></strong>
            </div>
            <div class="pill" [class.pill-mint]="totalSaldoUsd() >= 0" [class.pill-danger]="totalSaldoUsd() < 0">
              <span>Saldo Restante:</span>
              <strong>US$ {{ totalSaldoUsd() | number:'1.2-2' }} <small>({{ totalSaldoBrl() | currencyBrl }})</small></strong>
            </div>
            @if (totalTaxasRetidas() > 0) {
              <div class="pill pill-amber" title="Diferença entre o valor orçado em dólar debitado e o valor recebido pelo fornecedor em reais (spread de câmbio bancário e IOF)">
                <span>Taxas / Spread Retido:</span>
                <strong>{{ totalTaxasRetidas() | currencyBrl }}</strong>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Tabela de Orçamento -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Categoria</th>
              <th>Orçado (USD)</th>
              <th>Gasto (USD)</th>
              <th>Saldo (USD)</th>
              <th>Câmbio Base</th>
              <th>Orçado (BRL)</th>
              <th>Pago (BRL)</th>
              <th>Saldo (BRL)</th>
              <th>Taxa/Spread Retido</th>
              <th>Status</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (item of itens(); track item.id) {
              <tr>
                <td><strong>{{ item.eventoNome }}</strong></td>
                <td>
                  <span class="badge badge-navy">{{ item.categoriaNome }}</span>
                </td>
                <td><strong>US$ {{ item.valorOrcadoUsd | number:'1.2-2' }}</strong></td>
                <td class="text-usd-gasto">US$ {{ (item.valorRealizadoUsd || 0) | number:'1.2-2' }}</td>
                <td>
                  <span class="saldo-usd" [class.text-danger]="(item.saldoUsd || 0) < 0" [class.text-mint]="(item.saldoUsd || 0) > 0" [class.text-muted]="(item.saldoUsd || 0) === 0">
                    US$ {{ (item.saldoUsd || 0) | number:'1.2-2' }}
                  </span>
                </td>
                <td><small>R$ {{ item.taxaCambioUsada | number:'1.4-4' }}</small></td>
                <td>{{ item.valorOrcadoBrl | currencyBrl }}</td>
                <td class="text-realizado">{{ item.valorRealizadoBrl | currencyBrl }}</td>
                <td>
                  <span class="saldo-badge" [class.saldo-positivo]="(item.saldoBrl || 0) > 0" [class.saldo-zerado]="(item.saldoBrl || 0) === 0" [class.saldo-negativo]="(item.saldoBrl || 0) < 0">
                    {{ item.saldoBrl | currencyBrl }}
                  </span>
                </td>
                <td>
                  @if ((item.taxaRetidaTotal || 0) > 0) {
                    <span class="taxa-retida-tag" title="Perda de conversão em spread cambial e taxas">
                      -{{ item.taxaRetidaTotal | currencyBrl }}
                    </span>
                  } @else {
                    <span class="text-muted">—</span>
                  }
                </td>
                <td>
                  @if ((item.saldoUsd || 0) < 0 || (item.saldoBrl || 0) < 0) {
                    <span class="badge badge-danger">Estourado</span>
                  } @else if ((item.saldoUsd || 0) === 0 && (item.valorRealizadoUsd || 0) > 0) {
                    <span class="badge badge-navy">100% Executado</span>
                  } @else if ((item.valorRealizadoUsd || 0) > 0) {
                    <span class="badge badge-mint">Em Execução</span>
                  } @else {
                    <span class="badge badge-blue">Planejado</span>
                  }
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-outline btn-view" (click)="openItemDetailsModal(item)" title="Visualizar detalhes">
                      👁️ Detalhes
                    </button>
                    @if (authService.isAdmin()) {
                      <button class="btn btn-sm btn-outline" (click)="editItem(item)" title="Editar">
                        ✎
                      </button>
                      <button class="btn btn-sm btn-danger" (click)="deleteItem(item.id!)" title="Excluir">
                        🗑
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="12" class="empty-state">
                  Nenhum item de orçamento encontrado para os filtros selecionados.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Painel de Histórico de Transferências / Rollover -->
      <div class="card history-card">
        <div class="history-header" (click)="historyOpen.set(!historyOpen())">
          <div class="history-title">
            <span class="history-icon">📜</span>
            <h3>Histórico de Transferências & Rollover de Sobras</h3>
            <span class="badge badge-navy">{{ transferencias().length }}</span>
          </div>
          <button class="btn-toggle">
            {{ historyOpen() ? '▲ Ocultar' : '▼ Expandir Histórico' }}
          </button>
        </div>

        @if (historyOpen()) {
          <div class="table-container history-table-wrapper">
            <table class="custom-table history-table">
              <thead>
                <tr>
                  <th>Data / Hora</th>
                  <th>Origem (De)</th>
                  <th>Destino (Para)</th>
                  <th>Valor Transferido</th>
                  <th>Taxa Câmbio</th>
                  <th>Justificativa / Motivo</th>
                  <th>Autorizado por</th>
                  <th style="text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (t of transferencias(); track t.id) {
                  <tr>
                    <td><small>{{ t.criadoEm | date:'dd/MM/yyyy HH:mm' }}</small></td>
                    <td>
                      <div class="event-cat-cell">
                        <strong>{{ t.eventoOrigemNome }}</strong>
                        <span class="cat-tag">{{ t.categoriaOrigemNome }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="event-cat-cell text-mint">
                        <strong>{{ t.eventoDestinoNome }}</strong>
                        <span class="cat-tag">{{ t.categoriaDestinoNome }}</span>
                      </div>
                    </td>
                    <td>
                      <strong>US$ {{ t.valorUsd | number:'1.2-2' }}</strong>
                      <small class="text-muted d-block">({{ t.valorBrl | currencyBrl }})</small>
                    </td>
                    <td>R$ {{ t.taxaCambio | number:'1.4-4' }}</td>
                    <td><span class="motivo-text">{{ t.motivo || 'Remanejamento de saldo' }}</span></td>
                    <td>
                      <span class="user-pill">{{ t.usuarioNome }}</span>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-sm btn-outline btn-view" (click)="openTransferDetailsModal(t)" title="Visualizar detalhes da transferência">
                        👁️ Detalhes
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="empty-state">
                      Nenhuma transferência de saldo realizada até o momento.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Modal de Detalhes do Item de Orçamento -->
      @if (itemDetailsModalOpen() && selectedItemForDetails) {
        <div class="modal-backdrop" (click)="closeItemDetailsModal()">
          <div class="modal-content modal-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h2>👁️ Detalhes da Linha de Orçamento</h2>
                <p class="modal-subtitle">Dotação orçamentária para {{ selectedItemForDetails.eventoNome }}</p>
              </div>
              <button class="modal-close" (click)="closeItemDetailsModal()">×</button>
            </div>

            <div class="details-container">
              <div class="details-section">
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="detail-label">Evento Vinculado</span>
                    <strong class="detail-val-highlight">{{ selectedItemForDetails.eventoNome }}</strong>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Categoria de Despesa</span>
                    <span class="badge badge-navy">{{ selectedItemForDetails.categoriaNome }}</span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Data de Criação</span>
                    <span class="detail-val">{{ selectedItemForDetails.criadoEm | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                </div>
              </div>

              <!-- Análise Financeira -->
              <div class="details-section cambio-details-box">
                <h4 class="section-title">Valores & Execução Orçamentária</h4>
                <div class="financial-cards-row">
                  <div class="fin-card fin-usd">
                    <span class="fin-label">Orçamento em Dólar</span>
                    <h3 class="fin-value">US$ {{ selectedItemForDetails.valorOrcadoUsd | number:'1.2-2' }}</h3>
                    <small>Gasto: US$ {{ (selectedItemForDetails.valorRealizadoUsd || 0) | number:'1.2-2' }} | Saldo: <strong>US$ {{ (selectedItemForDetails.saldoUsd || 0) | number:'1.2-2' }}</strong></small>
                  </div>

                  <div class="fin-card fin-brl">
                    <span class="fin-label">Orçamento em Reais (Teto)</span>
                    <h3 class="fin-value">{{ selectedItemForDetails.valorOrcadoBrl | currencyBrl }}</h3>
                    <small>Pago a Fornecedores: {{ selectedItemForDetails.valorRealizadoBrl | currencyBrl }}</small>
                  </div>
                </div>

                <div class="execution-progress-box">
                  <div class="exec-header">
                    <span>Saldo Restante em BRL: <strong [class.text-danger]="(selectedItemForDetails.saldoBrl || 0) < 0" [class.text-mint]="(selectedItemForDetails.saldoBrl || 0) > 0">{{ selectedItemForDetails.saldoBrl | currencyBrl }}</strong></span>
                    @if ((selectedItemForDetails.taxaRetidaTotal || 0) > 0) {
                      <span class="text-amber">Custo/Spread de Câmbio Retido: <strong>{{ selectedItemForDetails.taxaRetidaTotal | currencyBrl }}</strong></span>
                    }
                  </div>
                </div>

                @if (cotacaoMercado()?.cotacaoOficial) {
                  <div class="market-comparison-bar">
                    <div class="comparison-header">
                      <span class="icon">📊</span>
                      <strong>Referência do Mercado Hoje:</strong>
                    </div>
                    <div class="comparison-body">
                      <span>Valor correspondente na cotação oficial hoje (R$ {{ cotacaoMercado()?.cotacaoOficial | number:'1.4-4' }}): <strong>{{ ((selectedItemForDetails.valorOrcadoUsd || 0) * (cotacaoMercado()?.cotacaoOficial || 1)) | currencyBrl }}</strong></span>
                    </div>
                  </div>
                }
              </div>

              @if (selectedItemForDetails.observacoes) {
                <div class="details-section">
                  <span class="detail-label">Observações & Justificativas</span>
                  <div class="observacoes-box">{{ selectedItemForDetails.observacoes }}</div>
                </div>
              }
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeItemDetailsModal()">Fechar</button>
              @if (authService.isAdmin()) {
                <button type="button" class="btn btn-primary" (click)="editItem(selectedItemForDetails); closeItemDetailsModal()">
                  ✎ Editar Orçamento
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- Modal de Detalhes da Transferência / Rollover -->
      @if (transferDetailsModalOpen() && selectedTransferForDetails) {
        <div class="modal-backdrop" (click)="closeTransferDetailsModal()">
          <div class="modal-content modal-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h2>👁️ Detalhes da Transferência de Orçamento</h2>
                <p class="modal-subtitle">Trilha de auditoria e remanejamento entre eventos</p>
              </div>
              <button class="modal-close" (click)="closeTransferDetailsModal()">×</button>
            </div>

            <div class="details-container">
              <div class="details-section">
                <div class="transfer-summary-box">
                  <div class="trans-flow-col">
                    <span class="detail-label">Origem (De)</span>
                    <strong class="flow-event">{{ selectedTransferForDetails.eventoOrigemNome }}</strong>
                    <span class="cat-tag">{{ selectedTransferForDetails.categoriaOrigemNome }}</span>
                  </div>
                  <div class="trans-flow-arrow">➔</div>
                  <div class="trans-flow-col text-mint">
                    <span class="detail-label">Destino (Para)</span>
                    <strong class="flow-event">{{ selectedTransferForDetails.eventoDestinoNome }}</strong>
                    <span class="cat-tag">{{ selectedTransferForDetails.categoriaDestinoNome }}</span>
                  </div>
                </div>
              </div>

              <div class="details-section cambio-details-box">
                <h4 class="section-title">Valores Transferidos & Câmbio</h4>
                <div class="financial-cards-row">
                  <div class="fin-card fin-usd">
                    <span class="fin-label">Valor Remanejado (USD)</span>
                    <h3 class="fin-value">US$ {{ selectedTransferForDetails.valorUsd | number:'1.2-2' }}</h3>
                    <small>Câmbio: R$ {{ selectedTransferForDetails.taxaCambio | number:'1.4-4' }}</small>
                  </div>
                  <div class="fin-card fin-brl">
                    <span class="fin-label">Equivalente em Reais (BRL)</span>
                    <h3 class="fin-value">{{ selectedTransferForDetails.valorBrl | currencyBrl }}</h3>
                    <small>Aporte no evento receptor</small>
                  </div>
                </div>
              </div>

              <div class="details-section">
                <div class="details-grid">
                  <div class="detail-item">
                    <span class="detail-label">Autorizado Por</span>
                    <span class="user-pill">{{ selectedTransferForDetails.usuarioNome }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Data e Hora da Operação</span>
                    <span class="detail-val">{{ selectedTransferForDetails.criadoEm | date:'dd/MM/yyyy HH:mm:ss' }}</span>
                  </div>
                  <div class="detail-item full-row">
                    <span class="detail-label">Justificativa / Motivo</span>
                    <div class="observacoes-box">{{ selectedTransferForDetails.motivo || 'Remanejamento de saldo' }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeTransferDetailsModal()">Fechar Detalhes</button>
            </div>
          </div>
        </div>
      }

      <!-- Modal de Criação / Edição de Orçamento -->
      @if (modalOpen()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ isEditing() ? 'Editar Linha de Orçamento' : 'Nova Linha de Orçamento' }}</h2>
              <button class="modal-close" (click)="closeModal()">×</button>
            </div>

            <form (ngSubmit)="saveItem()">
              <div class="form-group">
                <label class="form-label">Evento *</label>
                <select class="form-select" [(ngModel)]="formData.eventoId" name="eventoId" required>
                  <option [ngValue]="undefined" disabled>Selecione um evento</option>
                  @for (ev of eventos(); track ev.id) {
                    <option [ngValue]="ev.id">{{ ev.nome }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Categoria de Despesa *</label>
                <select class="form-select" [(ngModel)]="formData.categoriaId" name="categoriaId" required>
                  <option [ngValue]="undefined" disabled>Selecione uma categoria</option>
                  @for (cat of categorias(); track cat.id) {
                    <option [ngValue]="cat.id">{{ cat.nome }}</option>
                  }
                </select>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Valor Orçado em USD (US$) *</label>
                  <input type="number" step="0.01" min="0" class="form-control" [(ngModel)]="formData.valorOrcadoUsd" name="valorOrcadoUsd" required placeholder="0.00">
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Taxa de Câmbio (R$)</label>
                  <input type="number" step="0.0001" min="0.0001" class="form-control" [(ngModel)]="formData.taxaCambioUsada" name="taxaCambioUsada" placeholder="5.5000">
                </div>
              </div>

              <div class="conversion-hint" *ngIf="formData.valorOrcadoUsd">
                <small>
                  Equivalente em BRL: <strong>{{ ((formData.valorOrcadoUsd || 0) * (formData.taxaCambioUsada || taxaAtual())) | currencyBrl }}</strong>
                  @if (cotacaoMercado()?.cotacaoOficial) {
                    <span> • Mercado Hoje: <strong>1 USD = R$ {{ cotacaoMercado()?.cotacaoOficial | number:'1.4-4' }}</strong></span>
                  }
                </small>
              </div>

              <div class="form-group">
                <label class="form-label">Observações / Detalhes</label>
                <textarea class="form-control" [(ngModel)]="formData.observacoes" name="observacoes" rows="3" placeholder="Informações adicionais sobre esta dotação"></textarea>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="!formData.eventoId || !formData.categoriaId || formData.valorOrcadoUsd === undefined">
                  {{ isEditing() ? 'Atualizar Orçamento' : 'Salvar Orçamento' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal de Transferência / Rollover de Saldo -->
      @if (transferModalOpen()) {
        <div class="modal-backdrop" (click)="closeTransferModal()">
          <div class="modal-content modal-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h2>🔄 Transferir Saldo Remanescente entre Eventos</h2>
                <p class="modal-subtitle">Remaneje sobras de eventos concluídos ou em andamento para novos eventos</p>
              </div>
              <button class="modal-close" (click)="closeTransferModal()">×</button>
            </div>

            <form (ngSubmit)="executarTransferencia()">
              <div class="transfer-grid">
                <!-- Coluna de Origem -->
                <div class="transfer-col origin-col">
                  <span class="col-badge">1. Origem do Saldo</span>
                  
                  <div class="form-group">
                    <label class="form-label">Evento de Origem *</label>
                    <select class="form-select" [(ngModel)]="transferData.eventoOrigemId" name="eventoOrigemId" (change)="onOrigemEventoChange()" required>
                      <option [ngValue]="undefined" disabled>Selecione o evento com saldo</option>
                      @for (ev of eventos(); track ev.id) {
                        <option [ngValue]="ev.id">{{ ev.nome }}</option>
                      }
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Categoria de Origem *</label>
                    <select class="form-select" [(ngModel)]="transferData.categoriaOrigemId" name="categoriaOrigemId" (change)="onOrigemCategoriaChange()" required [disabled]="!transferData.eventoOrigemId">
                      <option [ngValue]="undefined" disabled>Selecione a categoria</option>
                      @for (s of saldosOrigem(); track s.categoriaId) {
                        <option [ngValue]="s.categoriaId">
                          {{ s.categoriaNome }} (Disponível: US$ {{ s.saldoDisponivelUsd | number:'1.2-2' }})
                        </option>
                      }
                    </select>
                  </div>

                  @if (selectedSaldoDisponivel()) {
                    <div class="saldo-alert">
                      <span class="alert-icon">💡</span>
                      <div>
                        <strong>Saldo Livre para Transferir:</strong>
                        <p>US$ {{ selectedSaldoDisponivel()?.saldoDisponivelUsd | number:'1.2-2' }} ({{ selectedSaldoDisponivel()?.saldoDisponivelBrl | currencyBrl }})</p>
                      </div>
                    </div>
                  }
                </div>

                <div class="transfer-arrow-col">
                  <div class="arrow-circle">➔</div>
                </div>

                <!-- Coluna de Destino -->
                <div class="transfer-col dest-col">
                  <span class="col-badge badge-dest">2. Destino do Aporte</span>

                  <div class="form-group">
                    <label class="form-label">Evento de Destino (Próximo Evento) *</label>
                    <select class="form-select" [(ngModel)]="transferData.eventoDestinoId" name="eventoDestinoId" required>
                      <option [ngValue]="undefined" disabled>Selecione o evento beneficiado</option>
                      @for (ev of eventosDestinoFiltrados(); track ev.id) {
                        <option [ngValue]="ev.id">{{ ev.nome }}</option>
                      }
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Categoria de Destino *</label>
                    <select class="form-select" [(ngModel)]="transferData.categoriaDestinoId" name="categoriaDestinoId" required>
                      <option [ngValue]="undefined" disabled>Selecione a categoria receptora</option>
                      @for (cat of categorias(); track cat.id) {
                        <option [ngValue]="cat.id">{{ cat.nome }}</option>
                      }
                    </select>
                  </div>
                </div>
              </div>

              <!-- Detalhes do Valor e Justificativa -->
              <div class="transfer-details">
                <div class="form-row">
                  <div class="form-group flex-1">
                    <div class="label-with-action">
                      <label class="form-label">Valor a Transferir em USD (US$) *</label>
                      @if (selectedSaldoDisponivel() && (selectedSaldoDisponivel()?.saldoDisponivelUsd || 0) > 0) {
                        <button type="button" class="btn-link" (click)="usarSaldoTotal()">
                          Usar Saldo Total (US$ {{ selectedSaldoDisponivel()?.saldoDisponivelUsd | number:'1.2-2' }})
                        </button>
                      }
                    </div>
                    <input type="number" step="0.01" min="0.01" [max]="selectedSaldoDisponivel()?.saldoDisponivelUsd || 99999" class="form-control" [(ngModel)]="transferData.valorUsd" name="valorUsd" required placeholder="0.00">
                  </div>

                  <div class="form-group flex-1">
                    <label class="form-label">Taxa de Câmbio Efetiva (R$)</label>
                    <input type="number" step="0.0001" min="0.0001" class="form-control" [(ngModel)]="transferData.taxaCambio" name="taxaCambio" placeholder="5.5000">
                  </div>
                </div>
                
                <div class="conversion-hint" *ngIf="transferData.valorUsd">
                  <small>
                    Equivalente em BRL: <strong>{{ ((transferData.valorUsd || 0) * (transferData.taxaCambio || taxaAtual())) | currencyBrl }}</strong> (Taxa: R$ {{ (transferData.taxaCambio || taxaAtual()) | number:'1.4-4' }})
                  </small>
                </div>

                <div class="form-group">
                  <label class="form-label">Justificativa / Motivo da Transferência *</label>
                  <textarea class="form-control" [(ngModel)]="transferData.motivo" name="motivo" rows="2" required placeholder="Ex: Sobra de alimentação do Workshop alocada para premiações do Hackathon"></textarea>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeTransferModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="!isTransferValida() || isSubmittingTransfer()">
                  {{ isSubmittingTransfer() ? 'Processando Transferência...' : 'Confirmar Transferência de Saldo' }}
                </button>
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
      font-weight: 700;
    }
    .page-subtitle {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .filter-card {
      padding: 1.25rem;
    }
    .filter-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .filter-item {
      min-width: 260px;
    }
    .summary-pills {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .pill {
      background: #F1F5F9;
      border: 1px solid var(--color-border);
      padding: 0.5rem 0.875rem;
      border-radius: var(--radius-sm);
      display: flex;
      flex-direction: column;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      strong {
        font-size: 0.95rem;
        color: var(--color-navy);
      }
      &.pill-amber { border-color: var(--color-amber); strong { color: var(--color-amber-hover); } }
      &.pill-purple { border-color: var(--color-purple); strong { color: var(--color-purple); } }
      &.pill-mint { border-color: var(--color-mint); strong { color: #00874C; } }
      &.pill-danger { border-color: var(--color-danger); strong { color: var(--color-danger); } }
    }
    .text-usd-gasto {
      color: var(--color-purple);
      font-weight: 600;
    }
    .text-realizado {
      color: var(--color-navy);
      font-weight: 600;
    }
    .text-amber {
      color: #B45309;
    }
    .saldo-usd {
      font-weight: 700;
    }
    .saldo-badge {
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-pill);
      &.saldo-positivo { background: var(--color-mint-subtle); color: #00874C; }
      &.saldo-zerado { background: #F1F5F9; color: #64748B; }
      &.saldo-negativo { background: var(--color-danger-subtle); color: var(--color-danger); }
    }
    .taxa-retida-tag {
      font-size: 0.75rem;
      font-weight: 700;
      color: #B45309;
      background: #FEF3C7;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-pill);
      border: 1px solid #FDE68A;
      display: inline-block;
    }
    .btn-view {
      color: var(--color-navy);
      font-weight: 600;
      &:hover { background: #F1F5F9; }
    }
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
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

    /* History Card */
    .history-card {
      padding: 1.25rem 1.5rem;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }
    .history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }
    .history-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      h3 {
        font-size: 1.1rem;
        color: var(--color-navy);
        margin: 0;
      }
    }
    .history-icon {
      font-size: 1.35rem;
    }
    .btn-toggle {
      background: transparent;
      border: 1px solid var(--color-border);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      cursor: pointer;
      &:hover {
        background: #F1F5F9;
        color: var(--color-navy);
      }
    }
    .history-table-wrapper {
      margin-top: 1.25rem;
      border-top: 1px solid var(--color-border-light);
      padding-top: 0.75rem;
    }
    .event-cat-cell {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .cat-tag {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
    .user-pill {
      font-size: 0.75rem;
      background: #F1F5F9;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-pill);
      color: var(--color-text-secondary);
      font-weight: 600;
    }
    .motivo-text {
      font-size: 0.85rem;
      color: #334155;
    }

    /* Modais */
    .modal-large {
      max-width: 760px;
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
    .label-with-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .btn-link {
      background: none;
      border: none;
      color: var(--color-amber-hover);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      &:hover { text-decoration: underline; }
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
      &.full-row { grid-column: 1 / -1; }
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
    .execution-progress-box {
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 0.75rem 1rem;
      margin-bottom: 0.75rem;
    }
    .exec-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .market-comparison-bar {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: var(--radius-sm);
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.8rem;
    }
    .comparison-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      color: #92400E;
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
    .transfer-summary-box {
      display: flex;
      align-items: center;
      justify-content: space-around;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: var(--radius-md);
      padding: 1.25rem;
    }
    .trans-flow-col {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .flow-event {
      font-size: 1.1rem;
      color: var(--color-navy);
    }
    .trans-flow-arrow {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--color-navy);
    }

    /* Transfer Form Grid */
    .transfer-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 1rem;
      align-items: center;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: var(--radius-md);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .transfer-col {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .col-badge {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #B45309;
      background: #FEF3C7;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-pill);
      align-self: flex-start;
      &.badge-dest {
        color: #065F46;
        background: #D1FAE5;
      }
    }
    .transfer-arrow-col {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .arrow-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-navy);
      color: #FFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .saldo-alert {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: var(--radius-sm);
      padding: 0.6rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.8rem;
      strong { color: #92400E; display: block; }
      p { margin: 0; color: #78350F; font-weight: 600; }
    }
    .transfer-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .conversion-hint {
      font-size: 0.8rem;
      color: #B45309;
      background: #FFFBEB;
      border: 1px solid #FEF3C7;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-sm);
    }

    @media (max-width: 960px) {
      .filter-row {
        flex-direction: column;
        align-items: stretch;
      }
      .summary-pills {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }
    }
    @media (max-width: 768px) {
      .transfer-grid {
        grid-template-columns: 1fr;
      }
      .arrow-circle {
        transform: rotate(90deg);
      }
      .financial-cards-row {
        grid-template-columns: 1fr;
      }
      .transfer-summary-box {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
      .details-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrcamentoComponent implements OnInit {
  apiService = inject(ApiService);
  authService = inject(AuthService);
  toast = inject(ToastService);

  itens = signal<ItemOrcamento[]>([]);
  eventos = signal<Evento[]>([]);
  categorias = signal<Categoria[]>([]);
  transferencias = signal<TransferenciaOrcamento[]>([]);
  saldosOrigem = signal<CategoriaSaldoDisponivel[]>([]);
  taxaAtual = signal<number>(5.50);
  cotacaoMercado = signal<CotacaoDolar | null>(null);

  selectedEventoId: number | null = null;
  modalOpen = signal(false);
  isEditing = signal(false);
  editingId: number | null = null;

  // Modais de Detalhes
  itemDetailsModalOpen = signal(false);
  selectedItemForDetails: ItemOrcamento | null = null;

  transferDetailsModalOpen = signal(false);
  selectedTransferForDetails: TransferenciaOrcamento | null = null;

  transferModalOpen = signal(false);
  isSubmittingTransfer = signal(false);
  historyOpen = signal(true);

  formData: Partial<ItemOrcamento> = {
    eventoId: undefined,
    categoriaId: undefined,
    valorOrcadoUsd: 0,
    taxaCambioUsada: 5.50,
    observacoes: ''
  };

  transferData: Partial<TransferenciaOrcamento> = {
    eventoOrigemId: undefined,
    categoriaOrigemId: undefined,
    eventoDestinoId: undefined,
    categoriaDestinoId: undefined,
    valorUsd: 0,
    taxaCambio: 5.50,
    motivo: ''
  };

  ngOnInit() {
    this.loadEventos();
    this.loadCategorias();
    this.loadConfig();
    this.loadCotacaoMercado();
    this.loadItens();
    this.loadTransferencias();
  }

  loadEventos() {
    this.apiService.getEventos().subscribe(res => this.eventos.set(res));
  }

  loadCategorias() {
    this.apiService.getCategorias().subscribe(res => this.categorias.set(res));
  }

  loadConfig() {
    this.apiService.getConfiguracao().subscribe(cfg => {
      this.taxaAtual.set(cfg.taxaCambioUsdBrl);
      if (!this.formData.taxaCambioUsada) {
        this.formData.taxaCambioUsada = cfg.taxaCambioUsdBrl;
      }
      if (!this.transferData.taxaCambio) {
        this.transferData.taxaCambio = cfg.taxaCambioUsdBrl;
      }
    });
  }

  loadCotacaoMercado() {
    this.apiService.getCotacaoDolarAtual().subscribe({
      next: (c) => this.cotacaoMercado.set(c),
      error: () => {}
    });
  }

  loadItens() {
    this.apiService.getOrcamento(this.selectedEventoId || undefined).subscribe(res => {
      this.itens.set(res);
    });
  }

  loadTransferencias() {
    this.apiService.getTransferencias(this.selectedEventoId || undefined).subscribe(res => {
      this.transferencias.set(res);
    });
  }

  onFilterChange() {
    this.loadItens();
    this.loadTransferencias();
  }

  totalUsd(): number {
    return this.itens().reduce((acc, curr) => acc + (Number(curr.valorOrcadoUsd) || 0), 0);
  }

  totalBrl(): number {
    return this.itens().reduce((acc, curr) => acc + (Number(curr.valorOrcadoBrl) || 0), 0);
  }

  totalRealizadoUsd(): number {
    return this.itens().reduce((acc, curr) => acc + (Number(curr.valorRealizadoUsd) || 0), 0);
  }

  totalRealizadoBrl(): number {
    return this.itens().reduce((acc, curr) => acc + (Number(curr.valorRealizadoBrl) || 0), 0);
  }

  totalSaldoUsd(): number {
    return this.itens().reduce((acc, curr) => acc + (Number(curr.saldoUsd) || 0), 0);
  }

  totalSaldoBrl(): number {
    return this.itens().reduce((acc, curr) => acc + (Number(curr.saldoBrl) || 0), 0);
  }

  totalTaxasRetidas(): number {
    return this.itens().reduce((acc, curr) => acc + (Number(curr.taxaRetidaTotal) || 0), 0);
  }

  // Modais de Detalhes
  openItemDetailsModal(item: ItemOrcamento) {
    this.selectedItemForDetails = item;
    this.itemDetailsModalOpen.set(true);
  }

  closeItemDetailsModal() {
    this.itemDetailsModalOpen.set(false);
    this.selectedItemForDetails = null;
  }

  openTransferDetailsModal(transfer: TransferenciaOrcamento) {
    this.selectedTransferForDetails = transfer;
    this.transferDetailsModalOpen.set(true);
  }

  closeTransferDetailsModal() {
    this.transferDetailsModalOpen.set(false);
    this.selectedTransferForDetails = null;
  }

  openModal() {
    this.isEditing.set(false);
    this.editingId = null;
    this.formData = {
      eventoId: this.selectedEventoId || (this.eventos()[0]?.id ?? undefined),
      categoriaId: this.categorias()[0]?.id ?? undefined,
      valorOrcadoUsd: 0,
      taxaCambioUsada: this.taxaAtual(),
      observacoes: ''
    };
    this.modalOpen.set(true);
  }

  editItem(item: ItemOrcamento) {
    this.isEditing.set(true);
    this.editingId = item.id!;
    this.formData = {
      eventoId: item.eventoId,
      categoriaId: item.categoriaId,
      valorOrcadoUsd: item.valorOrcadoUsd,
      taxaCambioUsada: item.taxaCambioUsada || this.taxaAtual(),
      observacoes: item.observacoes
    };
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  saveItem() {
    if (this.isEditing() && this.editingId) {
      this.apiService.updateItemOrcamento(this.editingId, this.formData).subscribe({
        next: () => {
          this.toast.success('Orçamento atualizado com sucesso!');
          this.closeModal();
          this.loadItens();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao atualizar orçamento.')
      });
    } else {
      this.apiService.createItemOrcamento(this.formData).subscribe({
        next: () => {
          this.toast.success('Item de orçamento criado com sucesso!');
          this.closeModal();
          this.loadItens();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao criar orçamento.')
      });
    }
  }

  deleteItem(id: number) {
    if (confirm('Tem certeza que deseja excluir este item de orçamento?')) {
      this.apiService.deleteItemOrcamento(id).subscribe({
        next: () => {
          this.toast.success('Item excluído com sucesso.');
          this.loadItens();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao excluir item.')
      });
    }
  }

  // Métodos de Transferência
  openTransferModal() {
    this.transferData = {
      eventoOrigemId: this.selectedEventoId || (this.eventos()[0]?.id ?? undefined),
      categoriaOrigemId: undefined,
      eventoDestinoId: undefined,
      categoriaDestinoId: undefined,
      valorUsd: 0,
      taxaCambio: this.taxaAtual(),
      motivo: ''
    };
    this.saldosOrigem.set([]);
    this.transferModalOpen.set(true);

    if (this.transferData.eventoOrigemId) {
      this.onOrigemEventoChange();
    }
  }

  closeTransferModal() {
    this.transferModalOpen.set(false);
  }

  onOrigemEventoChange() {
    if (!this.transferData.eventoOrigemId) return;
    this.apiService.getSaldosDisponiveis(this.transferData.eventoOrigemId).subscribe({
      next: (saldos) => {
        this.saldosOrigem.set(saldos);
        if (saldos.length > 0) {
          this.transferData.categoriaOrigemId = saldos[0].categoriaId;
        } else {
          this.transferData.categoriaOrigemId = undefined;
        }
      }
    });
  }

  onOrigemCategoriaChange() {}

  selectedSaldoDisponivel(): CategoriaSaldoDisponivel | undefined {
    return this.saldosOrigem().find(s => s.categoriaId === this.transferData.categoriaOrigemId);
  }

  eventosDestinoFiltrados(): Evento[] {
    return this.eventos().filter(e => e.id !== this.transferData.eventoOrigemId);
  }

  usarSaldoTotal() {
    const saldo = this.selectedSaldoDisponivel();
    if (saldo && saldo.saldoDisponivelUsd > 0) {
      this.transferData.valorUsd = saldo.saldoDisponivelUsd;
    }
  }

  isTransferValida(): boolean {
    const d = this.transferData;
    const saldo = this.selectedSaldoDisponivel();
    if (!d.eventoOrigemId || !d.categoriaOrigemId || !d.eventoDestinoId || !d.categoriaDestinoId) return false;
    if (!d.valorUsd || d.valorUsd <= 0) return false;
    if (saldo && d.valorUsd > saldo.saldoDisponivelUsd) return false;
    if (!d.motivo || d.motivo.trim().length === 0) return false;
    return true;
  }

  executarTransferencia() {
    if (!this.isTransferValida()) return;

    this.isSubmittingTransfer.set(true);
    this.apiService.transferirOrcamento(this.transferData).subscribe({
      next: (res) => {
        this.isSubmittingTransfer.set(false);
        this.toast.success(`Transferência de US$ ${res.valorUsd.toFixed(2)} realizada com sucesso!`);
        this.closeTransferModal();
        this.loadItens();
        this.loadTransferencias();
      },
      error: (err) => {
        this.isSubmittingTransfer.set(false);
        this.toast.error(err.error?.message || 'Erro ao realizar transferência.');
      }
    });
  }
}

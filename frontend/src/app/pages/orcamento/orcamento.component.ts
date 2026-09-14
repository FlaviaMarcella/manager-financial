import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria, Evento, ItemOrcamento } from '../../core/models/models';
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
          <p class="page-subtitle">Planejamento em USD convertido em BRL e acompanhamento do saldo executado</p>
        </div>
        @if (authService.isAdmin()) {
          <button class="btn btn-primary" (click)="openModal()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Item de Orçamento
          </button>
        }
      </div>

      <!-- Filtro por Evento -->
      <div class="card filter-card">
        <div class="filter-row">
          <div class="filter-item">
            <label class="form-label">Filtrar por Evento:</label>
            <select class="form-select" [(ngModel)]="selectedEventoId" (change)="loadItens()">
              <option [ngValue]="null">Todos os eventos</option>
              @for (ev of eventos(); track ev.id) {
                <option [ngValue]="ev.id">{{ ev.nome }}</option>
              }
            </select>
          </div>

          <div class="summary-pills">
            <div class="pill">
              <span>Total Orçado (USD):</span>
              <strong>US$ {{ totalUsd() | number:'1.2-2' }}</strong>
            </div>
            <div class="pill pill-amber">
              <span>Total Orçado (BRL):</span>
              <strong>{{ totalBrl() | currencyBrl }}</strong>
            </div>
            <div class="pill pill-purple">
              <span>Total Realizado:</span>
              <strong>{{ totalRealizado() | currencyBrl }}</strong>
            </div>
            <div class="pill" [class.pill-mint]="totalSaldo() >= 0" [class.pill-danger]="totalSaldo() < 0">
              <span>Saldo Global:</span>
              <strong>{{ totalSaldo() | currencyBrl }}</strong>
            </div>
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
              <th>Taxa Câmbio</th>
              <th>Orçado (BRL)</th>
              <th>Realizado (BRL)</th>
              <th>Saldo (BRL)</th>
              <th>Status</th>
              @if (authService.isAdmin()) {
                <th style="text-align: right;">Ações</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (item of itens(); track item.id) {
              <tr>
                <td><strong>{{ item.eventoNome }}</strong></td>
                <td>
                  <span class="badge badge-navy">{{ item.categoriaNome }}</span>
                </td>
                <td>US$ {{ item.valorOrcadoUsd | number:'1.2-2' }}</td>
                <td>R$ {{ item.taxaCambioUsada | number:'1.4-4' }}</td>
                <td><strong>{{ item.valorOrcadoBrl | currencyBrl }}</strong></td>
                <td class="text-realizado">{{ item.valorRealizadoBrl | currencyBrl }}</td>
                <td>
                  <span class="saldo-badge" [class.saldo-positivo]="(item.saldoBrl || 0) >= 0" [class.saldo-negativo]="(item.saldoBrl || 0) < 0">
                    {{ item.saldoBrl | currencyBrl }}
                  </span>
                </td>
                <td>
                  @if ((item.saldoBrl || 0) < 0) {
                    <span class="badge badge-danger">Estourado</span>
                  } @else if ((item.valorRealizadoBrl || 0) > 0) {
                    <span class="badge badge-mint">Em Execução</span>
                  } @else {
                    <span class="badge badge-blue">Planejado</span>
                  }
                </td>
                @if (authService.isAdmin()) {
                  <td style="text-align: right;">
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-outline" (click)="editItem(item)" title="Editar">
                        ✎
                      </button>
                      <button class="btn btn-sm btn-danger" (click)="deleteItem(item.id!)" title="Excluir">
                        🗑
                      </button>
                    </div>
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="authService.isAdmin() ? 9 : 8" class="empty-state">
                  Nenhum item de orçamento encontrado para os filtros selecionados.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal de Criação / Edição -->
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

              <div class="form-group">
                <label class="form-label">Valor Orçado em USD (US$) *</label>
                <input type="number" step="0.01" min="0" class="form-control" [(ngModel)]="formData.valorOrcadoUsd" name="valorOrcadoUsd" required placeholder="0.00">
                <small class="form-helper">
                  Valor estimado em BRL: <strong>{{ ((formData.valorOrcadoUsd || 0) * (taxaAtual())) | currencyBrl }}</strong> (Taxa: {{ taxaAtual() | number:'1.4-4' }})
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
    .text-realizado {
      color: var(--color-purple);
      font-weight: 600;
    }
    .saldo-badge {
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-pill);
      &.saldo-positivo { background: var(--color-mint-subtle); color: #00874C; }
      &.saldo-negativo { background: var(--color-danger-subtle); color: var(--color-danger); }
    }
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--color-text-muted);
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
    .form-helper {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      margin-top: 0.35rem;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.75rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-light);
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
  taxaAtual = signal<number>(5.50);

  selectedEventoId: number | null = null;
  modalOpen = signal(false);
  isEditing = signal(false);
  editingId: number | null = null;

  formData: Partial<ItemOrcamento> = {
    eventoId: undefined,
    categoriaId: undefined,
    valorOrcadoUsd: 0,
    observacoes: ''
  };

  ngOnInit() {
    this.loadEventos();
    this.loadCategorias();
    this.loadConfig();
    this.loadItens();
  }

  loadEventos() {
    this.apiService.getEventos().subscribe(res => this.eventos.set(res));
  }

  loadCategorias() {
    this.apiService.getCategorias().subscribe(res => this.categorias.set(res));
  }

  loadConfig() {
    this.apiService.getConfiguracao().subscribe(cfg => this.taxaAtual.set(cfg.taxaCambioUsdBrl));
  }

  loadItens() {
    this.apiService.getOrcamento(this.selectedEventoId || undefined).subscribe(res => {
      this.itens.set(res);
    });
  }

  totalUsd(): number {
    return this.itens().reduce((acc, curr) => acc + (Number(curr.valorOrcadoUsd) || 0), 0);
  }

  totalBrl(): number {
    return this.itens().reduce((acc, curr) => acc + (Number(curr.valorOrcadoBrl) || 0), 0);
  }

  totalRealizado(): number {
    return this.itens().reduce((acc, curr) => acc + (Number(curr.valorRealizadoBrl) || 0), 0);
  }

  totalSaldo(): number {
    return this.totalBrl() - this.totalRealizado();
  }

  openModal() {
    this.isEditing.set(false);
    this.editingId = null;
    this.formData = {
      eventoId: this.selectedEventoId || (this.eventos()[0]?.id ?? undefined),
      categoriaId: this.categorias()[0]?.id ?? undefined,
      valorOrcadoUsd: 0,
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
}

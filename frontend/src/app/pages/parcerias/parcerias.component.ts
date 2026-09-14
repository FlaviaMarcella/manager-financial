import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Evento, Parceria, StatusParceria, TipoParceria } from '../../core/models/models';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-parcerias',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyBrlPipe],
  template: `
    <div class="page-container">
      <!-- Cabeçalho -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Parcerias & Patrocínios</h1>
          <p class="page-subtitle">Gestão de cotas de patrocínio financeiro, permutas de espaço e apoios institucionais</p>
        </div>
        @if (authService.isAdmin()) {
          <button class="btn btn-primary" (click)="openModal()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nova Parceria
          </button>
        }
      </div>

      <!-- Filtro e Resumos -->
      <div class="card filter-card">
        <div class="filter-row">
          <div class="filter-item">
            <label class="form-label">Filtrar por Evento:</label>
            <select class="form-select" [(ngModel)]="selectedEventoId" (change)="loadParcerias()">
              <option [ngValue]="null">Todos os eventos</option>
              @for (ev of eventos(); track ev.id) {
                <option [ngValue]="ev.id">{{ ev.nome }}</option>
              }
            </select>
          </div>

          <div class="summary-pills">
            <div class="pill pill-blue">
              <span>Total de Parcerias:</span>
              <strong>{{ parcerias().length }}</strong>
            </div>
            <div class="pill pill-mint">
              <span>Captação Financeira Confirmada:</span>
              <strong>{{ totalFinanceiroFechado() | currencyBrl }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Parcerias -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Parceiro / Empresa</th>
              <th>Tipo</th>
              <th>Valor / Contrapartida</th>
              <th>Itens / Bens Recebidos</th>
              <th>Evento Vinculado</th>
              <th>Status</th>
              <th>Contato</th>
              @if (authService.isAdmin()) {
                <th style="text-align: right;">Ações</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (p of parcerias(); track p.id) {
              <tr>
                <td><strong>{{ p.parceiro }}</strong></td>
                <td>
                  <span class="badge" [class.badge-amber]="p.tipo === 'FINANCEIRA'" [class.badge-purple]="p.tipo === 'BRINDE'" [class.badge-blue]="p.tipo === 'PERMUTA'" [class.badge-navy]="p.tipo === 'APOIO_INSTITUCIONAL'">
                    {{ p.tipo }}
                  </span>
                </td>
                <td>
                  @if (p.valorContrapartida && p.valorContrapartida > 0) {
                    <strong>{{ p.valorContrapartida | currencyBrl }}</strong>
                  } @else {
                    <span class="text-muted">—</span>
                  }
                </td>
                <td>
                  <small>{{ p.itensRecebidos || '—' }}</small>
                </td>
                <td><small>{{ p.eventoNome }}</small></td>
                <td>
                  <span class="badge" [class.badge-amber]="p.status === 'NEGOCIACAO'" [class.badge-mint]="p.status === 'FECHADO'" [class.badge-blue]="p.status === 'ENTREGUE'" [class.badge-danger]="p.status === 'CANCELADO'">
                    {{ p.status }}
                  </span>
                </td>
                <td><small>{{ p.contato || '—' }}</small></td>
                @if (authService.isAdmin()) {
                  <td style="text-align: right;">
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-outline" (click)="editParceria(p)" title="Editar">✎</button>
                      <button class="btn btn-sm btn-danger" (click)="deleteParceria(p.id!)" title="Excluir">🗑</button>
                    </div>
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="authService.isAdmin() ? 8 : 7" class="empty-state">
                  Nenhuma parceria encontrada para os filtros selecionados.
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
              <h2>{{ isEditing() ? 'Editar Parceria' : 'Nova Parceria / Patrocínio' }}</h2>
              <button class="modal-close" (click)="closeModal()">×</button>
            </div>

            <form (ngSubmit)="saveParceria()">
              <div class="form-group">
                <label class="form-label">Nome da Empresa / Parceiro *</label>
                <input type="text" class="form-control" [(ngModel)]="formData.parceiro" name="parceiro" required placeholder="Ex: CloudTech Solutions">
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Tipo de Parceria *</label>
                  <select class="form-select" [(ngModel)]="formData.tipo" name="tipo" required>
                    <option value="FINANCEIRA">Financeira (Aporte em R$)</option>
                    <option value="BRINDE">Brinde (Swags / Livros)</option>
                    <option value="PERMUTA">Permuta (Espaço / Serviços)</option>
                    <option value="APOIO_INSTITUCIONAL">Apoio Institucional</option>
                  </select>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Status da Negociação *</label>
                  <select class="form-select" [(ngModel)]="formData.status" name="status" required>
                    <option value="NEGOCIACAO">Negociação</option>
                    <option value="FECHADO">Fechado</option>
                    <option value="ENTREGUE">Entregue</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Valor do Aporte em BRL (R$)</label>
                  <input type="number" step="0.01" min="0" class="form-control" [(ngModel)]="formData.valorContrapartida" name="valorContrapartida" placeholder="0.00">
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Evento Vinculado</label>
                  <select class="form-select" [(ngModel)]="formData.eventoId" name="eventoId">
                    <option [ngValue]="null">Sem evento específico</option>
                    @for (ev of eventos(); track ev.id) {
                      <option [ngValue]="ev.id">{{ ev.nome }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Itens / Contrapartidas Recebidas</label>
                <textarea class="form-control" [(ngModel)]="formData.itensRecebidos" name="itensRecebidos" rows="2" placeholder="Ex: 50 livros, camisetas, banner no palco"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Contato Responsável / E-mail / Telefone</label>
                <input type="text" class="form-control" [(ngModel)]="formData.contato" name="contato" placeholder="Ex: Maria (maria@parceiro.com)">
              </div>

              <div class="form-group">
                <label class="form-label">Observações</label>
                <textarea class="form-control" [(ngModel)]="formData.observacoes" name="observacoes" rows="2" placeholder="Outros detalhes acordados"></textarea>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="!formData.parceiro || !formData.tipo">
                  {{ isEditing() ? 'Atualizar Parceria' : 'Salvar Parceria' }}
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
      &.pill-blue { border-color: var(--color-blue); strong { color: #0077C7; } }
      &.pill-mint { border-color: var(--color-mint); strong { color: #00874C; } }
    }
    .text-muted {
      color: var(--color-text-muted);
    }
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.35rem;
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
  `]
})
export class ParceriasComponent implements OnInit {
  apiService = inject(ApiService);
  authService = inject(AuthService);
  toast = inject(ToastService);

  parcerias = signal<Parceria[]>([]);
  eventos = signal<Evento[]>([]);
  selectedEventoId: number | null = null;

  modalOpen = signal(false);
  isEditing = signal(false);
  editingId: number | null = null;

  formData: Partial<Parceria> = {
    parceiro: '',
    tipo: 'FINANCEIRA',
    valorContrapartida: 0,
    itensRecebidos: '',
    eventoId: null as any,
    status: 'NEGOCIACAO',
    contato: '',
    observacoes: ''
  };

  ngOnInit() {
    this.loadEventos();
    this.loadParcerias();
  }

  loadEventos() {
    this.apiService.getEventos().subscribe(res => this.eventos.set(res));
  }

  loadParcerias() {
    this.apiService.getParcerias(this.selectedEventoId || undefined).subscribe(res => {
      this.parcerias.set(res);
    });
  }

  totalFinanceiroFechado(): number {
    return this.parcerias()
      .filter(p => p.status === 'FECHADO' || p.status === 'ENTREGUE')
      .reduce((acc, curr) => acc + (Number(curr.valorContrapartida) || 0), 0);
  }

  openModal() {
    this.isEditing.set(false);
    this.editingId = null;
    this.formData = {
      parceiro: '',
      tipo: 'FINANCEIRA',
      valorContrapartida: 0,
      itensRecebidos: '',
      eventoId: this.selectedEventoId || null as any,
      status: 'NEGOCIACAO',
      contato: '',
      observacoes: ''
    };
    this.modalOpen.set(true);
  }

  editParceria(item: Parceria) {
    this.isEditing.set(true);
    this.editingId = item.id!;
    this.formData = {
      parceiro: item.parceiro,
      tipo: item.tipo,
      valorContrapartida: item.valorContrapartida,
      itensRecebidos: item.itensRecebidos,
      eventoId: item.eventoId,
      status: item.status,
      contato: item.contato,
      observacoes: item.observacoes
    };
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  saveParceria() {
    if (this.isEditing() && this.editingId) {
      this.apiService.updateParceria(this.editingId, this.formData).subscribe({
        next: () => {
          this.toast.success('Parceria atualizada com sucesso!');
          this.closeModal();
          this.loadParcerias();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao atualizar parceria.')
      });
    } else {
      this.apiService.createParceria(this.formData).subscribe({
        next: () => {
          this.toast.success('Parceria cadastrada com sucesso!');
          this.closeModal();
          this.loadParcerias();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao criar parceria.')
      });
    }
  }

  deleteParceria(id: number) {
    if (confirm('Tem certeza que deseja excluir esta parceria?')) {
      this.apiService.deleteParceria(id).subscribe({
        next: () => {
          this.toast.success('Parceria excluída com sucesso.');
          this.loadParcerias();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao excluir parceria.')
      });
    }
  }
}

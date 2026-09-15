import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Brinde, Evento, Parceria } from '../../core/models/models';

@Component({
  selector: 'app-brindes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Cabeçalho -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Brindes & Estoque de Swags</h1>
          <p class="page-subtitle">Controle de recebimento e distribuição de camisetas, adesivos e itens promocionais</p>
        </div>
        @if (authService.isAdmin()) {
          <button class="btn btn-primary" (click)="openModal()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Brinde / Item
          </button>
        }
      </div>

      <!-- Resumo de Estoque -->
      <div class="card filter-card">
        <div class="filter-row">
          <div class="filter-item">
            <label class="form-label">Filtrar por Evento:</label>
            <select class="form-select" [(ngModel)]="selectedEventoId" (change)="loadBrindes()">
              <option [ngValue]="null">Todos os eventos</option>
              @for (ev of eventos(); track ev.id) {
                <option [ngValue]="ev.id">{{ ev.nome }}</option>
              }
            </select>
          </div>

          <div class="summary-pills">
            <div class="pill pill-blue">
              <span>Total Recebido:</span>
              <strong>{{ totalRecebido() }} un</strong>
            </div>
            <div class="pill pill-purple">
              <span>Total Distribuído:</span>
              <strong>{{ totalDistribuido() }} un</strong>
            </div>
            <div class="pill pill-mint">
              <span>Saldo em Estoque:</span>
              <strong>{{ totalSaldoEstoque() }} un</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Brindes -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Item / Brinde</th>
              <th>Origem (Parceria)</th>
              <th>Qtd Recebida</th>
              <th>Qtd Distribuída</th>
              <th>Saldo em Estoque</th>
              <th>Evento de Distribuição</th>
              <th>Data Distribuição</th>
              <th>Status Estoque</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (b of brindes(); track b.id) {
              <tr>
                <td><strong>{{ b.item }}</strong></td>
                <td><small>{{ b.origemParceiroNome }}</small></td>
                <td>{{ b.qtdRecebida }}</td>
                <td>{{ b.qtdDistribuida }}</td>
                <td>
                  <span class="stock-count" [class.stock-ok]="(b.saldoEstoque || 0) > 0" [class.stock-zero]="(b.saldoEstoque || 0) === 0" [class.stock-danger]="(b.saldoEstoque || 0) < 0">
                    {{ b.saldoEstoque }} un
                  </span>
                </td>
                <td><small>{{ b.eventoDistribuicaoNome }}</small></td>
                <td><small>{{ b.dataDistribuicao ? (b.dataDistribuicao | date:'dd/MM/yyyy') : '—' }}</small></td>
                <td>
                  @if ((b.saldoEstoque || 0) < 0) {
                    <span class="badge badge-danger">Negativo (Inconsistente)</span>
                  } @else if ((b.saldoEstoque || 0) === 0) {
                    <span class="badge badge-amber">Esgotado</span>
                  } @else {
                    <span class="badge badge-mint">Disponível</span>
                  }
                </td>
                <td style="text-align: right;">
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-outline btn-view" (click)="openDetailsModal(b)" title="Visualizar detalhes">
                      👁️ Detalhes
                    </button>
                    @if (authService.isAdmin()) {
                      <button class="btn btn-sm btn-outline" (click)="editBrinde(b)" title="Editar">✎</button>
                      <button class="btn btn-sm btn-danger" (click)="deleteBrinde(b.id!)" title="Excluir">🗑</button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="9" class="empty-state">
                  Nenhum brinde registrado para os filtros selecionados.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal de Detalhes do Brinde (Visualização Completa) -->
      @if (detailsModalOpen() && selectedBrindeForDetails) {
        <div class="modal-backdrop" (click)="closeDetailsModal()">
          <div class="modal-content modal-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h2>👁️ Detalhes do Item Promocional / Brinde</h2>
                <p class="modal-subtitle">{{ selectedBrindeForDetails.item }}</p>
              </div>
              <button class="modal-close" (click)="closeDetailsModal()">×</button>
            </div>

            <div class="details-container">
              <div class="details-section">
                <div class="details-grid">
                  <div class="detail-item full-row">
                    <span class="detail-label">Nome do Item / Swag</span>
                    <strong class="detail-val-highlight">{{ selectedBrindeForDetails.item }}</strong>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Origem (Parceria Vinculada)</span>
                    <span class="detail-val">{{ selectedBrindeForDetails.origemParceiroNome || 'Produção Própria' }}</span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Evento de Distribuição</span>
                    <span class="detail-val">{{ selectedBrindeForDetails.eventoDistribuicaoNome || 'Estoque Geral' }}</span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Data Prevista de Distribuição</span>
                    <span class="detail-val">{{ selectedBrindeForDetails.dataDistribuicao ? (selectedBrindeForDetails.dataDistribuicao | date:'dd/MM/yyyy') : 'Não definida' }}</span>
                  </div>
                </div>
              </div>

              <!-- Análise de Estoque -->
              <div class="details-section stock-details-box">
                <h4 class="section-title">Posição de Estoque & Balanço</h4>
                <div class="stock-cards-row">
                  <div class="stk-card stk-blue">
                    <span class="stk-label">Quantidade Recebida</span>
                    <h3 class="stk-value">{{ selectedBrindeForDetails.qtdRecebida }} un</h3>
                  </div>
                  <div class="stk-card stk-purple">
                    <span class="stk-label">Quantidade Distribuída</span>
                    <h3 class="stk-value">{{ selectedBrindeForDetails.qtdDistribuida }} un</h3>
                  </div>
                  <div class="stk-card stk-mint">
                    <span class="stk-label">Saldo em Estoque</span>
                    <h3 class="stk-value">{{ selectedBrindeForDetails.saldoEstoque }} un</h3>
                  </div>
                </div>
              </div>

              @if (selectedBrindeForDetails.descricao) {
                <div class="details-section">
                  <span class="detail-label">Descrição & Detalhes do Produto</span>
                  <div class="observacoes-box">{{ selectedBrindeForDetails.descricao }}</div>
                </div>
              }
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeDetailsModal()">Fechar</button>
              @if (authService.isAdmin()) {
                <button type="button" class="btn btn-primary" (click)="editBrinde(selectedBrindeForDetails); closeDetailsModal()">
                  ✎ Editar Brinde
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- Modal de Criação / Edição -->
      @if (modalOpen()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ isEditing() ? 'Editar Brinde' : 'Novo Brinde / Item Promocional' }}</h2>
              <button class="modal-close" (click)="closeModal()">×</button>
            </div>

            <form (ngSubmit)="saveBrinde()">
              <div class="form-group">
                <label class="form-label">Nome do Item / Brinde *</label>
                <input type="text" class="form-control" [(ngModel)]="formData.item" name="item" required placeholder="Ex: Camiseta AWS Builder Preta M">
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Parceria de Origem</label>
                  <select class="form-select" [(ngModel)]="formData.origemParceriaId" name="origemParceriaId">
                    <option [ngValue]="null">Produção própria / Sem parceria vinculada</option>
                    @for (p of parcerias(); track p.id) {
                      <option [ngValue]="p.id">{{ p.parceiro }} ({{ p.tipo }})</option>
                    }
                  </select>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Evento de Distribuição</label>
                  <select class="form-select" [(ngModel)]="formData.eventoDistribuicaoId" name="eventoDistribuicaoId">
                    <option [ngValue]="null">Estoque Geral (Sem evento específico)</option>
                    @for (ev of eventos(); track ev.id) {
                      <option [ngValue]="ev.id">{{ ev.nome }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Qtd. Recebida *</label>
                  <input type="number" min="0" class="form-control" [(ngModel)]="formData.qtdRecebida" name="qtdRecebida" required>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Qtd. Distribuída *</label>
                  <input type="number" min="0" class="form-control" [(ngModel)]="formData.qtdDistribuida" name="qtdDistribuida" required>
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Data Distribuição</label>
                  <input type="date" class="form-control" [(ngModel)]="formData.dataDistribuicao" name="dataDistribuicao">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Descrição / Observações</label>
                <textarea class="form-control" [(ngModel)]="formData.descricao" name="descricao" rows="2" placeholder="Tamanhos, cores, local de armazenamento"></textarea>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="!formData.item || formData.qtdRecebida === undefined || formData.qtdDistribuida === undefined">
                  {{ isEditing() ? 'Atualizar Brinde' : 'Salvar Brinde' }}
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
      &.pill-purple { border-color: var(--color-purple); strong { color: var(--color-purple); } }
      &.pill-mint { border-color: var(--color-mint); strong { color: #00874C; } }
    }
    .stock-count {
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-pill);
      &.stock-ok { background: var(--color-mint-subtle); color: #00874C; }
      &.stock-zero { background: var(--color-amber-subtle); color: var(--color-amber-hover); }
      &.stock-danger { background: var(--color-danger-subtle); color: var(--color-danger); }
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

    /* Details View Styling */
    .modal-large {
      max-width: 700px;
    }
    .modal-subtitle {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      margin-top: 0.2rem;
    }
    .details-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .details-section {
      border-bottom: 1px solid var(--color-border-light);
      padding-bottom: 1rem;
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
    .stock-details-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: var(--radius-md);
      padding: 1.25rem;
    }
    .stock-cards-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }
    .stk-card {
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      &.stk-blue { border-left: 3px solid var(--color-blue); }
      &.stk-purple { border-left: 3px solid var(--color-purple); }
      &.stk-mint { border-left: 3px solid var(--color-mint); }
    }
    .stk-label {
      font-size: 0.7rem;
      color: var(--color-text-secondary);
      font-weight: 600;
    }
    .stk-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-navy);
      margin: 0;
    }
    .observacoes-box {
      background: #F8FAFC;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 0.75rem;
      font-size: 0.85rem;
      color: #334155;
      line-height: 1.5;
    }
  `]
})
export class BrindesComponent implements OnInit {
  apiService = inject(ApiService);
  authService = inject(AuthService);
  toast = inject(ToastService);

  brindes = signal<Brinde[]>([]);
  eventos = signal<Evento[]>([]);
  parcerias = signal<Parceria[]>([]);
  selectedEventoId: number | null = null;

  modalOpen = signal(false);
  isEditing = signal(false);
  editingId: number | null = null;

  // Modal de Detalhes
  detailsModalOpen = signal(false);
  selectedBrindeForDetails: Brinde | null = null;

  formData: Partial<Brinde> = {
    item: '',
    origemParceriaId: null as any,
    qtdRecebida: 0,
    qtdDistribuida: 0,
    eventoDistribuicaoId: null as any,
    dataDistribuicao: '',
    descricao: ''
  };

  ngOnInit() {
    this.loadEventos();
    this.loadParcerias();
    this.loadBrindes();
  }

  loadEventos() {
    this.apiService.getEventos().subscribe(res => this.eventos.set(res));
  }

  loadParcerias() {
    this.apiService.getParcerias().subscribe(res => this.parcerias.set(res));
  }

  loadBrindes() {
    this.apiService.getBrindes(this.selectedEventoId || undefined).subscribe(res => {
      this.brindes.set(res);
    });
  }

  totalRecebido(): number {
    return this.brindes().reduce((acc, curr) => acc + (curr.qtdRecebida || 0), 0);
  }

  totalDistribuido(): number {
    return this.brindes().reduce((acc, curr) => acc + (curr.qtdDistribuida || 0), 0);
  }

  totalSaldoEstoque(): number {
    return this.brindes().reduce((acc, curr) => acc + (curr.saldoEstoque || 0), 0);
  }

  openDetailsModal(b: Brinde) {
    this.selectedBrindeForDetails = b;
    this.detailsModalOpen.set(true);
  }

  closeDetailsModal() {
    this.detailsModalOpen.set(false);
    this.selectedBrindeForDetails = null;
  }

  openModal() {
    this.isEditing.set(false);
    this.editingId = null;
    this.formData = {
      item: '',
      origemParceriaId: null as any,
      qtdRecebida: 0,
      qtdDistribuida: 0,
      eventoDistribuicaoId: this.selectedEventoId || null as any,
      dataDistribuicao: '',
      descricao: ''
    };
    this.modalOpen.set(true);
  }

  editBrinde(item: Brinde) {
    this.isEditing.set(true);
    this.editingId = item.id!;
    this.formData = {
      item: item.item,
      origemParceriaId: item.origemParceriaId,
      qtdRecebida: item.qtdRecebida,
      qtdDistribuida: item.qtdDistribuida,
      eventoDistribuicaoId: item.eventoDistribuicaoId,
      dataDistribuicao: item.dataDistribuicao,
      descricao: item.descricao
    };
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  saveBrinde() {
    if (this.isEditing() && this.editingId) {
      this.apiService.updateBrinde(this.editingId, this.formData).subscribe({
        next: () => {
          this.toast.success('Brinde atualizado com sucesso!');
          this.closeModal();
          this.loadBrindes();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao atualizar brinde.')
      });
    } else {
      this.apiService.createBrinde(this.formData).subscribe({
        next: () => {
          this.toast.success('Brinde cadastrado com sucesso!');
          this.closeModal();
          this.loadBrindes();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao cadastrar brinde.')
      });
    }
  }

  deleteBrinde(id: number) {
    if (confirm('Tem certeza que deseja excluir este brinde?')) {
      this.apiService.deleteBrinde(id).subscribe({
        next: () => {
          this.toast.success('Brinde excluído com sucesso.');
          this.loadBrindes();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao excluir brinde.')
      });
    }
  }
}

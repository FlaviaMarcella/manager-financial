import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria, Evento, Lancamento, StatusFinanceiro } from '../../core/models/models';
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
          <p class="page-subtitle">Registro de despesas pagas, notas fiscais e comprovantes de eventos</p>
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
              <th>Forma Pgto</th>
              <th>Status</th>
              <th>Responsável</th>
              <th>Anexo / NF</th>
              @if (authService.isAdmin()) {
                <th style="text-align: right;">Ações</th>
              }
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
                <td><strong>{{ item.valorBrl | currencyBrl }}</strong></td>
                <td><small>{{ item.formaPagamento }}</small></td>
                <td>
                  <span class="badge" [style.background-color]="item.statusCorBadge + '22'" [style.color]="item.statusCorBadge">
                    {{ item.statusNome }}
                  </span>
                </td>
                <td><small>{{ item.responsavelNome }}</small></td>
                <td>
                  @if (item.anexoUrl) {
                    <a [href]="'/api/lancamentos/' + item.id + '/anexo'" target="_blank" class="btn btn-sm btn-outline btn-anexo" title="Ver anexo">
                      📎 Visualizar
                    </a>
                  } @else if (authService.isAdmin()) {
                    <button class="btn btn-sm btn-outline btn-upload" (click)="openUploadModal(item)" title="Fazer upload de comprovante">
                      + Anexar
                    </button>
                  } @else {
                    <span class="text-muted">Sem anexo</span>
                  }
                </td>
                @if (authService.isAdmin()) {
                  <td style="text-align: right;">
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-outline" (click)="openUploadModal(item)" title="Gerenciar anexo">📎</button>
                      <button class="btn btn-sm btn-outline" (click)="editLancamento(item)" title="Editar">✎</button>
                      <button class="btn btn-sm btn-danger" (click)="deleteLancamento(item.id!)" title="Excluir">🗑</button>
                    </div>
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="authService.isAdmin() ? 11 : 10" class="empty-state">
                  Nenhum lançamento financeiro encontrado para os filtros selecionados.
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
              <h2>{{ isEditing() ? 'Editar Lançamento' : 'Novo Lançamento Financeiro' }}</h2>
              <button class="modal-close" (click)="closeModal()">×</button>
            </div>

            <form (ngSubmit)="saveLancamento()">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Data *</label>
                  <input type="date" class="form-control" [(ngModel)]="formData.data" name="data" required>
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Nº Nota Fiscal</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.numeroNotaFiscal" name="numeroNotaFiscal" placeholder="Ex: NF-12345">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Descrição da Despesa *</label>
                <input type="text" class="form-control" [(ngModel)]="formData.descricao" name="descricao" required placeholder="Ex: Coffee break para 50 participantes">
              </div>

              <div class="form-group">
                <label class="form-label">Fornecedor *</label>
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

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Valor em BRL (R$) *</label>
                  <input type="number" step="0.01" min="0" class="form-control" [(ngModel)]="formData.valorBrl" (ngModelChange)="onBrlChange()" name="valorBrl" required placeholder="0.00">
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">Valor em USD (US$)</label>
                  <input type="number" step="0.01" min="0" class="form-control" [(ngModel)]="formData.valorUsd" name="valorUsd" placeholder="0.00">
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
                <label class="form-label">Observações</label>
                <textarea class="form-control" [(ngModel)]="formData.observacoes" name="observacoes" rows="2" placeholder="Detalhes adicionais"></textarea>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="!formData.data || !formData.descricao || !formData.fornecedor || !formData.eventoId || !formData.categoriaId || formData.valorBrl === undefined">
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
    .btn-anexo {
      color: var(--color-blue);
      border-color: var(--color-blue);
      &:hover { background: var(--color-blue-subtle); }
    }
    .btn-upload {
      font-size: 0.75rem;
      border-style: dashed;
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
    formaPagamento: 'PIX',
    statusId: undefined,
    observacoes: ''
  };

  ngOnInit() {
    this.loadEventos();
    this.loadCategorias();
    this.loadStatus();
    this.loadConfig();
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
    this.apiService.getConfiguracao().subscribe(cfg => this.taxaCambio.set(cfg.taxaCambioUsdBrl));
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

  onBrlChange() {
    if (this.formData.valorBrl && this.taxaCambio() > 0) {
      this.formData.valorUsd = Number((this.formData.valorBrl / this.taxaCambio()).toFixed(2));
    }
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

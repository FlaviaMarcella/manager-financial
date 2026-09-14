import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Categoria, ConfiguracaoGlobal, Evento, StatusEvento, StatusFinanceiro } from '../../core/models/models';
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
          <p class="page-subtitle">Parâmetros globais de câmbio, categorias, status e cadastro de eventos</p>
        </div>
      </div>

      <div class="config-grid">
        <!-- 1. Taxa de Câmbio USD -> BRL -->
        <div class="card config-card">
          <div class="card-header">
            <h3>Taxa de Câmbio (USD → BRL)</h3>
            <span class="badge badge-amber">Câmbio Oficial</span>
          </div>
          <p class="section-desc">Esta taxa é aplicada automaticamente na conversão de linhas de orçamento e despesas em dólar.</p>

          <form (ngSubmit)="saveTaxaCambio()" class="cambio-form">
            <div class="form-group">
              <label class="form-label">Taxa 1 USD em BRL (R$) *</label>
              <div class="input-prefix-group">
                <span class="prefix">R$</span>
                <input type="number" step="0.0001" min="0.0001" class="form-control" [(ngModel)]="taxaInput" name="taxaInput" required placeholder="5.5000">
              </div>
            </div>

            <div class="cambio-meta">
              <span>Última atualização: <strong>{{ config()?.atualizadoEm | date:'dd/MM/yyyy HH:mm' }}</strong></span>
              <span>Por: <strong>{{ config()?.atualizadoPor || 'sistema' }}</strong></span>
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="!taxaInput || taxaInput <= 0">
              Salvar Nova Taxa
            </button>
          </form>
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
      h3 { font-size: 1.1rem; color: var(--color-navy); }
    }
    .card-subtitle {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    .section-desc {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      margin-bottom: 1.25rem;
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
    .cambio-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin: 1rem 0;
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
export class ConfiguracoesComponent implements OnInit {
  apiService = inject(ApiService);
  toast = inject(ToastService);

  config = signal<ConfiguracaoGlobal | null>(null);
  taxaInput: number = 5.50;

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

  saveTaxaCambio() {
    this.apiService.updateConfiguracao({ taxaCambioUsdBrl: this.taxaInput }).subscribe({
      next: (updated) => {
        this.config.set(updated);
        this.toast.success('Taxa de câmbio atualizada com sucesso!');
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

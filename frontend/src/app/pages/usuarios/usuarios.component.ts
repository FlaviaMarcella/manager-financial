import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PapelUsuario, StatusUsuario, Usuario } from '../../core/models/models';

type FilterTab = 'PENDENTES' | 'ATIVOS' | 'TODOS';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Cabeçalho -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestão de Usuários e Acessos</h1>
          <p class="page-subtitle">Aprovação de novos acessos, controle de permissões e governança de dados</p>
        </div>
        <button class="btn btn-outline btn-sm" (click)="loadUsuarios()">
          🔄 Atualizar Lista
        </button>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="kpi-card" [class.kpi-warning]="pendentesCount() > 0" (click)="activeTab.set('PENDENTES')">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-info">
            <span class="kpi-label">Solicitações Pendentes</span>
            <span class="kpi-value" [class.text-warning]="pendentesCount() > 0">{{ pendentesCount() }}</span>
          </div>
          @if (pendentesCount() > 0) {
            <span class="kpi-alert-badge">Requer Atenção</span>
          }
        </div>

        <div class="kpi-card" (click)="activeTab.set('ATIVOS')">
          <div class="kpi-icon">👥</div>
          <div class="kpi-info">
            <span class="kpi-label">Usuários Aprovados / Ativos</span>
            <span class="kpi-value text-mint">{{ ativosCount() }}</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon">🛡️</div>
          <div class="kpi-info">
            <span class="kpi-label">Administradores</span>
            <span class="kpi-value text-amber">{{ adminsCount() }}</span>
          </div>
        </div>

        <div class="kpi-card" (click)="activeTab.set('TODOS')">
          <div class="kpi-icon">📊</div>
          <div class="kpi-info">
            <span class="kpi-label">Total de Registros</span>
            <span class="kpi-value">{{ usuarios().length }}</span>
          </div>
        </div>
      </div>

      <!-- Notificação / Alerta de Solicitações Pendentes -->
      @if (pendentesCount() > 0 && activeTab() !== 'PENDENTES') {
        <div class="pending-alert-banner">
          <div class="alert-left">
            <span class="alert-icon">⚠️</span>
            <div>
              <strong>Existem {{ pendentesCount() }} solicitação(ões) de acesso pendente(s).</strong>
              <p>Novos membros tentaram acessar com a conta Google e aguardam autorização.</p>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" (click)="activeTab.set('PENDENTES')">
            Ver Solicitações
          </button>
        </div>
      }

      <!-- Filtros de Navegação por Abas -->
      <div class="tab-filters">
        <button class="tab-btn" [class.active]="activeTab() === 'PENDENTES'" (click)="activeTab.set('PENDENTES')">
          ⏳ Pendentes de Aprovação 
          @if (pendentesCount() > 0) {
            <span class="tab-badge">{{ pendentesCount() }}</span>
          }
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'ATIVOS'" (click)="activeTab.set('ATIVOS')">
          ✅ Usuários Aprovados ({{ ativosCount() }})
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'TODOS'" (click)="activeTab.set('TODOS')">
          📋 Todos os Cadastros ({{ usuarios().length }})
        </button>
      </div>

      <!-- Tabela de Usuários -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>E-mail Google</th>
              <th>Papel</th>
              <th>Status do Acesso</th>
              <th>Data da Solicitação</th>
              <th style="text-align: right;">Ações de Aprovação / Gestão</th>
            </tr>
          </thead>
          <tbody>
            @for (u of filteredUsuarios(); track u.id) {
              <tr [class.row-pending]="u.status === 'PENDENTE'">
                <td>
                  <strong>{{ u.nome }}</strong>
                  @if (u.id === authService.currentUser()?.id) {
                    <span class="badge badge-mint ml-2">Você</span>
                  }
                </td>
                <td><code>{{ u.email }}</code></td>
                <td>
                  <span class="badge" [class.badge-amber]="u.papel === 'ADMIN'" [class.badge-blue]="u.papel === 'VIEWER'">
                    {{ u.papel }}
                  </span>
                </td>
                <td>
                  @if (u.status === 'PENDENTE') {
                    <span class="badge badge-warning">⏳ Aguardando Aprovação</span>
                  } @else if (u.status === 'REJEITADO') {
                    <span class="badge badge-danger">✕ Recusado</span>
                  } @else if (u.status === 'BLOQUEADO' || !u.ativo) {
                    <span class="badge badge-danger">🔒 Bloqueado</span>
                  } @else {
                    <span class="badge badge-mint">✓ Aprovado / Ativo</span>
                  }
                </td>
                <td><small>{{ u.criadoEm | date:'dd/MM/yyyy HH:mm' }}</small></td>
                <td style="text-align: right;">
                  <div class="user-actions">
                    <!-- Se o usuário está PENDENTE -->
                    @if (u.status === 'PENDENTE') {
                      <button class="btn btn-sm btn-primary" (click)="aprovar(u, 'VIEWER')" title="Aprovar como Membro (somente leitura)">
                        ✓ Aprovar como VIEWER
                      </button>
                      <button class="btn btn-sm btn-outline-amber" (click)="aprovar(u, 'ADMIN')" title="Aprovar com acesso de Administrador">
                        ★ Aprovar como ADMIN
                      </button>
                      <button class="btn btn-sm btn-danger-outline" (click)="rejeitar(u)" title="Recusar solicitação de acesso">
                        ✕ Recusar
                      </button>
                    } 
                    <!-- Se o usuário já foi aprovado ou rejeitado -->
                    @else {
                      @if (u.status === 'REJEITADO' || u.status === 'BLOQUEADO' || !u.ativo) {
                        <button class="btn btn-sm btn-primary" (click)="aprovar(u, u.papel)">
                          ✓ Reativar / Aprovar
                        </button>
                      } @else {
                        <button class="btn btn-sm" 
                                [class.btn-outline]="u.papel === 'ADMIN'" 
                                [class.btn-primary]="u.papel === 'VIEWER'" 
                                (click)="toggleRole(u)" 
                                [disabled]="u.id === authService.currentUser()?.id">
                          {{ u.papel === 'ADMIN' ? 'Rebaixar para VIEWER' : 'Promover a ADMIN' }}
                        </button>
                        <button class="btn btn-sm btn-danger-outline" 
                                (click)="bloquear(u)" 
                                [disabled]="u.id === authService.currentUser()?.id">
                          Bloquear Acesso
                        </button>
                      }
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-state">
                  @if (activeTab() === 'PENDENTES') {
                    🎉 Nenhuma solicitação de acesso pendente no momento!
                  } @else {
                    Nenhum usuário encontrado para esta visualização.
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
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
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
    }
    .kpi-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      &.kpi-warning {
        border-color: #FFE082;
        background: #FFFDF0;
      }
    }
    .kpi-icon {
      font-size: 1.75rem;
    }
    .kpi-info {
      display: flex;
      flex-direction: column;
    }
    .kpi-label {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      font-weight: 600;
    }
    .kpi-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-navy);
    }
    .text-warning { color: #E65100 !important; }
    .text-mint { color: #00875A !important; }
    .text-amber { color: #FF9900 !important; }
    .kpi-alert-badge {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: #E65100;
      color: #FFF;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: var(--radius-pill);
    }
    .pending-alert-banner {
      background: #FFF8E1;
      border: 1px solid #FFE082;
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .alert-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      p { font-size: 0.85rem; color: #5D4037; margin: 0; }
      strong { color: #E65100; }
    }
    .alert-icon { font-size: 1.5rem; }
    .tab-filters {
      display: flex;
      gap: 0.5rem;
      border-bottom: 2px solid var(--color-border);
      padding-bottom: 0.25rem;
      flex-wrap: wrap;
    }
    @media (max-width: 640px) {
      .tab-btn {
        flex: 1 1 auto;
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
        justify-content: center;
      }
      .pending-alert-banner {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
        button { width: 100%; }
      }
      .kpi-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 420px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }
    .tab-btn {
      background: none;
      border: none;
      padding: 0.6rem 1.2rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      cursor: pointer;
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
      &.active {
        color: var(--color-navy);
        background: rgba(0, 0, 0, 0.05);
        border-bottom: 3px solid var(--color-navy);
      }
    }
    .tab-badge {
      background: #E65100;
      color: #FFF;
      font-size: 0.7rem;
      padding: 0.1rem 0.45rem;
      border-radius: var(--radius-pill);
      font-weight: 700;
    }
    .row-pending {
      background-color: rgba(255, 248, 225, 0.4);
    }
    .badge-warning {
      background: #FFF3E0;
      color: #E65100;
      border: 1px solid #FFE0B2;
    }
    .user-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .btn-outline-amber {
      border: 1px solid #FF9900;
      color: #B26A00;
      background: transparent;
      &:hover {
        background: #FFF3E0;
      }
    }
    .btn-danger-outline {
      border: 1px solid #E53935;
      color: #E53935;
      background: transparent;
      &:hover {
        background: #FFEBEE;
      }
    }
    .ml-2 { margin-left: 0.5rem; }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--color-text-muted);
      font-size: 0.95rem;
    }
  `]
})
export class UsuariosComponent implements OnInit {
  apiService = inject(ApiService);
  authService = inject(AuthService);
  toast = inject(ToastService);

  usuarios = signal<Usuario[]>([]);
  activeTab = signal<FilterTab>('PENDENTES');

  pendentesCount = computed(() => this.usuarios().filter(u => u.status === 'PENDENTE').length);
  ativosCount = computed(() => this.usuarios().filter(u => u.status === 'APROVADO' || (u.ativo && u.status !== 'PENDENTE' && u.status !== 'REJEITADO' && u.status !== 'BLOQUEADO')).length);
  adminsCount = computed(() => this.usuarios().filter(u => u.papel === 'ADMIN').length);

  filteredUsuarios = computed(() => {
    const list = this.usuarios();
    const tab = this.activeTab();
    if (tab === 'PENDENTES') {
      return list.filter(u => u.status === 'PENDENTE');
    } else if (tab === 'ATIVOS') {
      return list.filter(u => u.status === 'APROVADO' || (u.ativo && u.status !== 'PENDENTE' && u.status !== 'REJEITADO' && u.status !== 'BLOQUEADO'));
    }
    return list;
  });

  ngOnInit() {
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.apiService.getUsuarios().subscribe({
      next: (res) => {
        this.usuarios.set(res);
      },
      error: () => this.toast.error('Erro ao carregar lista de usuários.')
    });
  }

  aprovar(u: Usuario, papel: PapelUsuario) {
    const papelNome = papel === 'ADMIN' ? 'Administrador (Acesso Total)' : 'Membro / Leitor (VIEWER)';
    if (confirm(`Deseja aprovar o acesso de "${u.nome}" como ${papelNome}?`)) {
      this.apiService.aprovarUsuario(u.id, papel).subscribe({
        next: (salvo) => {
          this.toast.success(`Usuário ${salvo.nome} aprovado com sucesso como ${salvo.papel}!`);
          this.loadUsuarios();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao aprovar usuário.')
      });
    }
  }

  rejeitar(u: Usuario) {
    if (confirm(`Deseja realmente RECUSAR a solicitação de acesso de "${u.nome}" (${u.email})?`)) {
      this.apiService.rejeitarUsuario(u.id).subscribe({
        next: () => {
          this.toast.info(`Solicitação de ${u.nome} foi recusada.`);
          this.loadUsuarios();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao rejeitar usuário.')
      });
    }
  }

  bloquear(u: Usuario) {
    if (confirm(`Deseja realmente BLOQUEAR o acesso de "${u.nome}"? O usuário não conseguirá acessar o sistema.`)) {
      this.apiService.updateUsuario(u.id, { papel: u.papel, status: 'BLOQUEADO', ativo: false }).subscribe({
        next: () => {
          this.toast.warning(`Acesso de ${u.nome} foi bloqueado.`);
          this.loadUsuarios();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao bloquear usuário.')
      });
    }
  }

  toggleRole(u: Usuario) {
    const novoPapel: PapelUsuario = u.papel === 'ADMIN' ? 'VIEWER' : 'ADMIN';
    const acao = novoPapel === 'ADMIN' ? 'promover este usuário a ADMIN' : 'rebaixar este usuário para VIEWER';

    if (confirm(`Deseja realmente ${acao}?`)) {
      this.apiService.updateUsuarioRole(u.id, novoPapel, u.ativo).subscribe({
        next: (salvo) => {
          this.toast.success(`Papel de ${salvo.nome} alterado para ${salvo.papel}`);
          this.loadUsuarios();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao alterar papel.')
      });
    }
  }
}

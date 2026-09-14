import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PapelUsuario, Usuario } from '../../core/models/models';

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
          <p class="page-subtitle">Controle de papéis administrativos e permissões de acesso ao sistema</p>
        </div>
      </div>

      <!-- Informação de Regras -->
      <div class="card info-card">
        <div class="info-icon">ℹ</div>
        <div class="info-content">
          <h4>Regras de Autorização</h4>
          <p>
            <strong>VIEWER:</strong> Acesso somente leitura a Dashboard, Orçamento, Lançamentos, Parcerias e Brindes.<br>
            <strong>ADMIN:</strong> Acesso total (leitura e escrita) em todos os módulos, configurações globais e gestão de usuários.
          </p>
        </div>
      </div>

      <!-- Tabela de Usuários -->
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>E-mail</th>
              <th>Papel Atual</th>
              <th>Status da Conta</th>
              <th>Registrado Em</th>
              <th style="text-align: right;">Alterar Papel / Acesso</th>
            </tr>
          </thead>
          <tbody>
            @for (u of usuarios(); track u.id) {
              <tr>
                <td><strong>{{ u.nome }}</strong></td>
                <td><code>{{ u.email }}</code></td>
                <td>
                  <span class="badge" [class.badge-amber]="u.papel === 'ADMIN'" [class.badge-blue]="u.papel === 'VIEWER'">
                    {{ u.papel }}
                  </span>
                </td>
                <td>
                  @if (u.ativo) {
                    <span class="badge badge-mint">Ativo</span>
                  } @else {
                    <span class="badge badge-danger">Inativo</span>
                  }
                </td>
                <td><small>{{ u.criadoEm | date:'dd/MM/yyyy HH:mm' }}</small></td>
                <td style="text-align: right;">
                  <div class="user-actions">
                    <button class="btn btn-sm" [class.btn-outline]="u.papel === 'ADMIN'" [class.btn-primary]="u.papel === 'VIEWER'" (click)="toggleRole(u)" [disabled]="u.id === authService.currentUser()?.id">
                      {{ u.papel === 'ADMIN' ? 'Rebaixar para VIEWER' : 'Promover a ADMIN' }}
                    </button>
                    <button class="btn btn-sm btn-outline" [class.btn-danger]="u.ativo" (click)="toggleActive(u)" [disabled]="u.id === authService.currentUser()?.id">
                      {{ u.ativo ? 'Desativar' : 'Ativar' }}
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-state">
                  Nenhum usuário cadastrado.
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
    .info-card {
      display: flex;
      gap: 1rem;
      background-color: var(--color-blue-subtle);
      border-color: rgba(65, 179, 255, 0.3);
      padding: 1rem 1.25rem;
    }
    .info-icon {
      font-size: 1.25rem;
      font-weight: bold;
      color: #0077C7;
    }
    .info-content {
      h4 { font-size: 0.95rem; color: #0077C7; margin-bottom: 0.25rem; }
      p { font-size: 0.85rem; color: var(--color-navy); line-height: 1.4; }
    }
    .user-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--color-text-muted);
    }
  `]
})
export class UsuariosComponent implements OnInit {
  apiService = inject(ApiService);
  authService = inject(AuthService);
  toast = inject(ToastService);

  usuarios = signal<Usuario[]>([]);

  ngOnInit() {
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.apiService.getUsuarios().subscribe({
      next: (res) => this.usuarios.set(res),
      error: (err) => this.toast.error('Erro ao carregar lista de usuários.')
    });
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

  toggleActive(u: Usuario) {
    const novoStatus = !u.ativo;
    const acao = novoStatus ? 'ativar' : 'desativar';

    if (confirm(`Deseja realmente ${acao} o acesso de ${u.nome}?`)) {
      this.apiService.updateUsuarioRole(u.id, u.papel, novoStatus).subscribe({
        next: () => {
          this.toast.success(`Status do usuário atualizado.`);
          this.loadUsuarios();
        },
        error: (err) => this.toast.error(err.error?.message || 'Erro ao alterar status.')
      });
    }
  }
}

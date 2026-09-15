import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfiguracoesComponent } from '../../../pages/configuracoes/configuracoes.component';
import { UsuariosComponent } from '../../../pages/usuarios/usuarios.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfiguracoesComponent, UsuariosComponent],
  template: `
    <header class="navbar">
      <div class="navbar-container">
        <!-- 1. Brand / Logo (Esquerda) -->
        <div class="navbar-brand">
          <a routerLink="/dashboard" class="brand-link" (click)="closeMenu()">
            <div class="brand-icon-wrapper" title="AWS Student Builder Group">
              <svg class="brand-svg-icon" viewBox="0 0 3000 3000" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2333.33 3000H2000V2666.67H1666.67V3000H1333.33V2666.67H1000V3000H666.667V2333.33H2333.33V3000ZM666.667 2333.33H0V2000H333.333V1666.67H0V1333.33H333.333V1000H0V666.667H666.667V2333.33ZM3000 1000H2666.67V1333.33H3000V1666.67H2666.67V2000H3000V2333.33H2333.33V666.667H3000V1000ZM1000 333.333H1333.33V0H1666.67V333.333H2000V0H2333.33V666.667H666.667V0H1000V333.333Z" fill="#FF9900"/>
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-title"><span class="aws-tag">AWS</span> SBG</span>
              <span class="brand-subtitle">Finance</span>
            </div>
          </a>
        </div>

        <!-- 2. Menu de Navegação Centralizado (Centro) - 6 Módulos Principais -->
        <nav class="navbar-nav" [class.mobile-open]="mobileMenuOpen()">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a routerLink="/orcamento" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">💰</span>
            <span>Orçamento</span>
          </a>
          <a routerLink="/lancamentos" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">🧾</span>
            <span>Lançamentos</span>
          </a>
          <a routerLink="/relatorios" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">📁</span>
            <span>Relatórios</span>
          </a>
          <a routerLink="/parcerias" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">🤝</span>
            <span>Parcerias</span>
          </a>
          <a routerLink="/brindes" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">🎁</span>
            <span>Brindes</span>
          </a>

          <!-- Opções Admin no menu mobile -->
          @if (authService.isAdmin()) {
            <div class="mobile-admin-divider"></div>
            <button class="mobile-admin-btn" (click)="openConfigModal(); closeMenu()">
              <span class="nav-icon">⚙️</span>
              <span>Configurações & Câmbio</span>
            </button>
            <button class="mobile-admin-btn" (click)="openUsersModal(); closeMenu()">
              <span class="nav-icon">👥</span>
              <span>Gestão de Usuários</span>
            </button>
          }
        </nav>

        <!-- 3. Ações Admin, Usuário & Logout (Direita) -->
        <div class="navbar-actions">
          @if (authService.isAdmin()) {
            <div class="admin-quick-actions">
              <button class="btn-admin-modal" (click)="openConfigModal()" title="Configurações do Sistema & Câmbio">
                <span class="admin-icon">⚙️</span>
                <span class="admin-label">Config</span>
              </button>
              <button class="btn-admin-modal" (click)="openUsersModal()" title="Gestão de Usuários & Permissões">
                <span class="admin-icon">👥</span>
                <span class="admin-label">Usuários</span>
              </button>
            </div>
            <span class="action-divider"></span>
          }

          @if (authService.currentUser(); as user) {
            <div class="user-pill" [title]="user.nome + ' (' + user.email + ')'">
              <div class="user-avatar">{{ user.nome.charAt(0).toUpperCase() }}</div>
              <span class="user-name">{{ user.nome }}</span>
              <span class="user-role-badge" [class.role-admin]="user.papel === 'ADMIN'" [class.role-viewer]="user.papel === 'VIEWER'">
                {{ user.papel }}
              </span>
            </div>
            <button class="btn-logout" (click)="logout()" title="Sair da conta">
              <span class="logout-text">Sair</span>
              <span class="logout-icon">🚪</span>
            </button>
          }

          <!-- Botão Hamburger Mobile -->
          <button class="mobile-toggle" (click)="toggleMenu()" aria-label="Abrir menu de navegação">
            <span class="hamburger-bar" [class.open-1]="mobileMenuOpen()"></span>
            <span class="hamburger-bar" [class.open-2]="mobileMenuOpen()"></span>
            <span class="hamburger-bar" [class.open-3]="mobileMenuOpen()"></span>
          </button>
        </div>
      </div>
      
      <!-- Backdrop móvel -->
      @if (mobileMenuOpen()) {
        <div class="menu-backdrop" (click)="closeMenu()"></div>
      }

      <!-- Modal de Configurações Acionado por Botão -->
      @if (showConfigModal()) {
        <div class="modal-backdrop modal-admin-backdrop" (click)="closeConfigModal()">
          <div class="modal-content modal-admin-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <span class="modal-badge-icon">⚙️</span>
                <div>
                  <h2 class="modal-title">Configurações do Sistema & Câmbio</h2>
                  <p class="modal-subtitle">Parâmetros de câmbio USD/BRL, simulador de spread, categorias e eventos</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeConfigModal()">✕</button>
            </div>
            <div class="modal-scroll-area">
              <app-configuracoes [isModal]="true" (onClose)="closeConfigModal()"></app-configuracoes>
            </div>
          </div>
        </div>
      }

      <!-- Modal de Gestão de Usuários Acionado por Botão -->
      @if (showUsersModal()) {
        <div class="modal-backdrop modal-admin-backdrop" (click)="closeUsersModal()">
          <div class="modal-content modal-admin-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <span class="modal-badge-icon">👥</span>
                <div>
                  <h2 class="modal-title">Gestão de Usuários & Acessos</h2>
                  <p class="modal-subtitle">Aprovação de solicitações pendentes, permissões e governança</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeUsersModal()">✕</button>
            </div>
            <div class="modal-scroll-area">
              <app-usuarios [isModal]="true" (onClose)="closeUsersModal()"></app-usuarios>
            </div>
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(180deg, #121924 0%, #0F1722 100%);
      color: var(--color-white);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      top: 0;
      z-index: 500;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
      width: 100%;
    }
    
    .navbar-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 1.25rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      position: relative;
    }

    /* 1. Brand */
    .navbar-brand {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
      color: inherit;
      padding: 0.25rem 0.4rem;
      border-radius: 8px;
      transition: opacity 0.2s ease;
      &:hover {
        opacity: 0.9;
      }
    }

    .brand-icon-wrapper {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 153, 0, 0.12);
      border: 1px solid rgba(255, 153, 0, 0.35);
      border-radius: 8px;
      padding: 4px;
      box-shadow: 0 0 12px rgba(255, 153, 0, 0.15);
    }

    .brand-svg-icon {
      width: 22px;
      height: 22px;
      display: block;
    }

    .brand-text {
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
    }

    .brand-title {
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #FFFFFF;
      .aws-tag {
        color: #FF9900;
      }
    }

    .brand-subtitle {
      font-size: 0.78rem;
      font-weight: 600;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* 2. Menu Centralizado */
    .navbar-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      flex: 1;

      a {
        color: #94A3B8;
        text-decoration: none;
        padding: 0.45rem 0.75rem;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.15s ease-in-out;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        white-space: nowrap;

        .nav-icon {
          font-size: 0.85rem;
          opacity: 0.85;
        }

        &:hover {
          color: #FFFFFF;
          background-color: rgba(255, 255, 255, 0.06);
        }

        &.active {
          color: #FFFFFF;
          background-color: rgba(255, 255, 255, 0.1);
          font-weight: 600;
          box-shadow: inset 0 -2px 0 #FF9900;
          .nav-icon {
            opacity: 1;
          }
        }
      }
    }

    /* 3. Ações Admin e Perfil */
    .navbar-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.65rem;
      flex-shrink: 0;
    }

    .admin-quick-actions {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-admin-modal {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #CBD5E1;
      padding: 0.35rem 0.6rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s ease;

      .admin-icon { font-size: 0.85rem; }
      &:hover {
        background: rgba(255, 153, 0, 0.15);
        border-color: rgba(255, 153, 0, 0.35);
        color: #FFB340;
      }
    }

    .action-divider {
      width: 1px;
      height: 20px;
      background: rgba(255, 255, 255, 0.12);
      margin: 0 0.15rem;
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.04);
      padding: 0.25rem 0.6rem 0.25rem 0.35rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .user-avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FF9900, #E68A00);
      color: #0F1722;
      font-weight: 700;
      font-size: 0.78rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-name {
      font-size: 0.8rem;
      font-weight: 500;
      color: #E2E8F0;
      max-width: 110px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role-badge {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;

      &.role-admin {
        background: rgba(255, 153, 0, 0.18);
        color: #FFB340;
        border: 1px solid rgba(255, 153, 0, 0.35);
      }

      &.role-viewer {
        background: rgba(56, 189, 248, 0.18);
        color: #7DD3FC;
        border: 1px solid rgba(56, 189, 248, 0.35);
      }
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #CBD5E1;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s ease;

      .logout-icon {
        font-size: 0.85rem;
      }

      &:hover {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.4);
        color: #F87171;
      }
    }

    /* Mobile Hamburger */
    .mobile-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.4rem;
      width: 36px;
      height: 36px;

      .hamburger-bar {
        display: block;
        width: 22px;
        height: 2px;
        background-color: var(--color-white);
        border-radius: 2px;
        transition: all 0.2s ease;
      }
      .open-1 { transform: translateY(7px) rotate(45deg); }
      .open-2 { opacity: 0; }
      .open-3 { transform: translateY(-7px) rotate(-45deg); }
    }

    .mobile-admin-divider {
      width: 100%;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0.5rem 0;
    }

    .mobile-admin-btn {
      background: transparent;
      border: none;
      color: #CBD5E1;
      padding: 0.75rem 1rem;
      font-size: 0.92rem;
      font-weight: 500;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      border-radius: 8px;
      &:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #FFFFFF;
      }
    }

    .menu-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(2px);
      z-index: 501;
    }

    /* Modais Grandes de Administração */
    .modal-admin-backdrop {
      z-index: 1000;
    }
    .modal-admin-large {
      max-width: 1100px;
      width: 95%;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      background: #161D26;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 0;
      overflow: hidden;
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      background: #0E1620;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .modal-badge-icon {
      font-size: 1.5rem;
    }
    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.15rem;
    }
    .modal-subtitle {
      font-size: 0.8rem;
      color: #94A3B8;
    }
    .modal-scroll-area {
      padding: 1.5rem;
      overflow-y: auto;
      max-height: calc(88vh - 80px);
    }

    /* Breakpoints */
    @media (max-width: 1100px) {
      .mobile-toggle {
        display: flex;
      }
      .admin-quick-actions {
        display: none;
      }
      .action-divider {
        display: none;
      }
      .navbar-nav {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: #0E1620;
        flex-direction: column;
        align-items: stretch;
        padding: 1rem;
        border-bottom: 2px solid #FF9900;
        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
        z-index: 503;
        gap: 0.35rem;

        &.mobile-open {
          display: flex;
        }

        a {
          padding: 0.75rem 1rem;
          font-size: 0.92rem;
          border-radius: 8px;
        }
      }
    }

    @media (max-width: 600px) {
      .navbar-container {
        padding: 0 0.85rem;
      }
      .user-name {
        display: none;
      }
      .logout-text {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  mobileMenuOpen = signal(false);

  showConfigModal = signal(false);
  showUsersModal = signal(false);

  toggleMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.mobileMenuOpen.set(false);
  }

  openConfigModal() {
    this.showConfigModal.set(true);
  }

  closeConfigModal() {
    this.showConfigModal.set(false);
  }

  openUsersModal() {
    this.showUsersModal.set(true);
  }

  closeUsersModal() {
    this.showUsersModal.set(false);
  }

  logout() {
    this.authService.logout();
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar">
      <div class="navbar-container">
        <!-- Logo e Título -->
        <div class="navbar-brand">
          <a routerLink="/dashboard" class="brand-link" (click)="closeMenu()">
            <img src="/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png" 
                 alt="AWS Student Builder Group" 
                 class="brand-logo"
                 (error)="handleLogoError($event)">
            <div class="brand-text">
              <span class="brand-title">AWS SBG Finance</span>
              <span class="brand-subtitle">Gestão Financeira</span>
            </div>
          </a>
        </div>

        <!-- Menu Desktop & Mobile -->
        <nav class="navbar-nav" [class.mobile-open]="mobileMenuOpen()">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">📊</span> Dashboard
          </a>
          <a routerLink="/orcamento" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">💰</span> Orçamento
          </a>
          <a routerLink="/lancamentos" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">🧾</span> Lançamentos & NFs
          </a>
          <a routerLink="/relatorios" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">📁</span> Relatórios
          </a>
          <a routerLink="/parcerias" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">🤝</span> Parcerias
          </a>
          <a routerLink="/brindes" routerLinkActive="active" (click)="closeMenu()">
            <span class="nav-icon">🎁</span> Brindes
          </a>
          
          @if (authService.isAdmin()) {
            <a routerLink="/configuracoes" routerLinkActive="active" (click)="closeMenu()">
              <span class="nav-icon">⚙️</span> Configurações
            </a>
            <a routerLink="/usuarios" routerLinkActive="active" (click)="closeMenu()">
              <span class="nav-icon">👥</span> Usuários
            </a>
          }
        </nav>

        <!-- Ações e Perfil do Usuário -->
        <div class="navbar-actions">
          @if (authService.currentUser(); as user) {
            <div class="user-badge-container">
              <span class="user-name" [title]="user.nome">{{ user.nome }}</span>
              <span class="badge" [class.badge-amber]="user.papel === 'ADMIN'" [class.badge-blue]="user.papel === 'VIEWER'">
                {{ user.papel }}
              </span>
            </div>
            <button class="btn btn-sm btn-outline btn-logout" (click)="logout()" title="Sair da conta">
              Sair
            </button>
          }

          <!-- Botão Mobile Menu -->
          <button class="mobile-toggle" (click)="toggleMenu()" aria-label="Abrir menu de navegação">
            <span class="hamburger-bar" [class.open-1]="mobileMenuOpen()"></span>
            <span class="hamburger-bar" [class.open-2]="mobileMenuOpen()"></span>
            <span class="hamburger-bar" [class.open-3]="mobileMenuOpen()"></span>
          </button>
        </div>
      </div>
      
      <!-- Backdrop móvel para fechar o menu ao clicar fora -->
      @if (mobileMenuOpen()) {
        <div class="menu-backdrop" (click)="closeMenu()"></div>
      }
    </header>
  `,
  styles: [`
    .navbar {
      background-color: var(--color-navy);
      color: var(--color-white);
      border-bottom: 1px solid var(--color-navy-subtle);
      position: sticky;
      top: 0;
      z-index: 500;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      width: 100%;
    }
    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0.65rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      position: relative;
      z-index: 502;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }
    .brand-logo {
      height: 34px;
      width: auto;
      object-fit: contain;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--color-white);
      line-height: 1.1;
      white-space: nowrap;
    }
    .brand-subtitle {
      font-size: 0.65rem;
      color: var(--color-amber);
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .navbar-nav {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-wrap: wrap;
      a {
        color: #CBD5E1;
        text-decoration: none;
        padding: 0.45rem 0.65rem;
        border-radius: var(--radius-sm);
        font-size: 0.85rem;
        font-weight: 600;
        transition: all var(--transition-fast);
        display: flex;
        align-items: center;
        gap: 0.35rem;
        white-space: nowrap;
        .nav-icon { font-size: 0.85rem; }
        &:hover {
          color: var(--color-white);
          background-color: rgba(255, 255, 255, 0.08);
        }
        &.active {
          color: var(--color-white);
          background-color: var(--color-navy-light);
          border-bottom: 2px solid var(--color-amber);
        }
      }
    }
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-shrink: 0;
    }
    .user-badge-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.06);
      padding: 0.3rem 0.65rem;
      border-radius: var(--radius-pill);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .user-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-white);
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .btn-logout {
      border-color: rgba(255, 255, 255, 0.2);
      color: #E2E8F0;
      padding: 0.35rem 0.65rem;
      font-size: 0.8rem;
      &:hover {
        background-color: rgba(255, 77, 79, 0.2);
        border-color: var(--color-danger);
        color: var(--color-danger);
      }
    }
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
    .menu-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 501;
    }

    @media (max-width: 1100px) {
      .user-name {
        display: none;
      }
    }

    @media (max-width: 960px) {
      .mobile-toggle {
        display: flex;
      }
      .navbar-nav {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: var(--color-navy-dark);
        flex-direction: column;
        align-items: stretch;
        padding: 1rem;
        border-bottom: 2px solid var(--color-amber);
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        z-index: 503;
        gap: 0.5rem;
        &.mobile-open {
          display: flex;
        }
        a {
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
        }
      }
    }

    @media (max-width: 480px) {
      .navbar-container {
        padding: 0.5rem 0.75rem;
      }
      .brand-title {
        font-size: 0.95rem;
      }
      .brand-logo {
        height: 28px;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  mobileMenuOpen = signal(false);

  toggleMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.mobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }

  handleLogoError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png';
  }
}

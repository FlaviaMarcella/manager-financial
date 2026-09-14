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
          <a routerLink="/dashboard" class="brand-link">
            <img src="/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png" 
                 alt="AWS Student Builder Group" 
                 class="brand-logo">
            <div class="brand-text">
              <span class="brand-title">Gestão Financeira</span>
              <span class="brand-subtitle">AWS Student Builder Group</span>
            </div>
          </a>
        </div>

        <!-- Menu Desktop -->
        <nav class="navbar-nav" [class.mobile-open]="mobileMenuOpen()">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMenu()">Dashboard</a>
          <a routerLink="/orcamento" routerLinkActive="active" (click)="closeMenu()">Orçamento</a>
          <a routerLink="/lancamentos" routerLinkActive="active" (click)="closeMenu()">Lançamentos & NFs</a>
          <a routerLink="/parcerias" routerLinkActive="active" (click)="closeMenu()">Parcerias</a>
          <a routerLink="/brindes" routerLinkActive="active" (click)="closeMenu()">Brindes</a>
          
          @if (authService.isAdmin()) {
            <a routerLink="/configuracoes" routerLinkActive="active" (click)="closeMenu()">Configurações</a>
            <a routerLink="/usuarios" routerLinkActive="active" (click)="closeMenu()">Usuários</a>
          }
        </nav>

        <!-- Ações e Perfil do Usuário -->
        <div class="navbar-actions">
          @if (authService.currentUser(); as user) {
            <div class="user-badge-container">
              <span class="user-name">{{ user.nome }}</span>
              <span class="badge" [class.badge-amber]="user.papel === 'ADMIN'" [class.badge-blue]="user.papel === 'VIEWER'">
                {{ user.papel }}
              </span>
            </div>
            <button class="btn btn-sm btn-outline btn-logout" (click)="logout()" title="Sair da conta">
              Sair
            </button>
          }

          <!-- Botão Mobile Menu -->
          <button class="mobile-toggle" (click)="toggleMenu()" aria-label="Abrir menu">
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background-color: var(--color-navy);
      color: var(--color-white);
      border-bottom: 1px solid var(--color-navy-subtle);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      text-decoration: none;
      color: inherit;
    }
    .brand-logo {
      height: 38px;
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
    }
    .brand-subtitle {
      font-size: 0.7rem;
      color: var(--color-amber);
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .navbar-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      a {
        color: #A0AEC0;
        text-decoration: none;
        padding: 0.5rem 0.85rem;
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        font-weight: 600;
        transition: all var(--transition-fast);
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
      gap: 1rem;
    }
    .user-badge-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-pill);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .user-name {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--color-white);
      max-width: 140px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .btn-logout {
      border-color: rgba(255, 255, 255, 0.2);
      color: #E2E8F0;
      &:hover {
        background-color: rgba(255, 77, 79, 0.2);
        border-color: var(--color-danger);
        color: var(--color-danger);
      }
    }
    .mobile-toggle {
      display: none;
      flex-direction: column;
      gap: 4px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      .hamburger-bar {
        display: block;
        width: 22px;
        height: 2px;
        background-color: var(--color-white);
        border-radius: 2px;
      }
    }
    @media (max-width: 992px) {
      .mobile-toggle {
        display: flex;
      }
      .user-name {
        display: none;
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
        box-shadow: var(--shadow-lg);
        &.mobile-open {
          display: flex;
        }
        a {
          padding: 0.75rem 1rem;
        }
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
    // Fallback to PNG if SVG is not found
    const target = event.target as HTMLImageElement;
    target.src = '/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png';
  }
}

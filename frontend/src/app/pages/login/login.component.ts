import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <!-- Logo do Grupo -->
        <div class="logo-wrapper">
          <img src="/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png" 
               alt="AWS Student Builder Group" 
               class="login-logo">
        </div>

        <div class="login-header">
          <h1 class="login-title">Gestão Financeira</h1>
          <p class="login-subtitle">Sistema unificado de orçamento, notas fiscais, parcerias e brindes</p>
        </div>

        <!-- Botão Google Sign-In Oficial -->
        <div class="auth-section">
          <div id="google-btn-container" class="google-btn-wrapper"></div>
          
          <button class="btn btn-google-custom" (click)="loginWithGooglePrompt()">
            <svg class="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Entrar com Conta Google
          </button>
        </div>

        <div class="divider">
          <span>OU ACESSO RÁPIDO PARA AVALIAÇÃO</span>
        </div>

        <!-- Login Rápido para Demonstração Local -->
        <div class="quick-access">
          <button class="btn btn-primary quick-btn" (click)="quickLogin('admin@studentbuilder.aws', 'Administrador SBG')">
            <span class="btn-role-tag">ADMIN</span>
            Entrar como Líder / Administrador
          </button>
          <button class="btn btn-outline quick-btn quick-btn-viewer" (click)="quickLogin('membro@studentbuilder.aws', 'Membro da Equipe')">
            <span class="btn-role-tag role-viewer">VIEWER</span>
            Entrar como Visitante / Membro
          </button>
        </div>

        <div class="login-footer">
          <p>Acesso público em modo leitura para todos os membros autenticados. Edição restrita à equipe de organização.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 20%, #1f2b37 0%, #151D25 70%, #0d1319 100%);
      padding: 1.5rem;
    }
    .login-card {
      background-color: var(--color-surface);
      width: 100%;
      max-width: 480px;
      border-radius: var(--radius-lg);
      padding: 2.5rem 2rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
    }
    .logo-wrapper {
      background: var(--color-navy);
      padding: 1.25rem;
      border-radius: var(--radius-md);
      display: inline-block;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--color-navy-subtle);
    }
    .login-logo {
      height: 48px;
      width: auto;
      display: block;
    }
    .login-title {
      font-size: 1.6rem;
      color: var(--color-navy);
      margin-bottom: 0.5rem;
    }
    .login-subtitle {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
      margin-bottom: 2rem;
    }
    .auth-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .btn-google-custom {
      width: 100%;
      background: #FFFFFF;
      color: #3C4043;
      border: 1px solid #DADCE0;
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      font-weight: 600;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      transition: all var(--transition-fast);
      &:hover {
        background: #F8F9FA;
        border-color: #C2C6CA;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
      }
    }
    .google-icon {
      width: 20px;
      height: 20px;
    }
    .divider {
      position: relative;
      margin: 1.5rem 0;
      text-align: center;
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--color-border);
      }
      span {
        position: relative;
        background: var(--color-surface);
        padding: 0 0.75rem;
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--color-text-muted);
        letter-spacing: 0.05em;
      }
    }
    .quick-access {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.75rem;
    }
    .quick-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .quick-btn-viewer {
      border-color: var(--color-purple);
      color: var(--color-purple);
      &:hover {
        background-color: var(--color-purple-subtle);
      }
    }
    .btn-role-tag {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-pill);
      background: rgba(0, 0, 0, 0.2);
      color: #FFFFFF;
      &.role-viewer {
        background: var(--color-purple);
      }
    }
    .login-footer {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      line-height: 1.4;
      border-top: 1px solid var(--color-border-light);
      padding-top: 1.25rem;
    }
  `]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  loginWithGooglePrompt() {
    // Simula autenticação com token do Google
    this.quickLogin('admin@studentbuilder.aws', 'Admin Student Builder');
  }

  quickLogin(email: string, name: string) {
    this.isLoading.set(true);
    const devToken = `dev-token:${email}:${name}`;

    this.authService.loginWithGoogle(devToken).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toast.success(`Bem-vindo, ${res.nome}!`);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error(err.error?.message || 'Falha ao autenticar.');
      }
    });
  }

  handleLogoError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png';
  }
}

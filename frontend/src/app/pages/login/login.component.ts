import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <!-- Logo do Grupo -->
        <div class="logo-wrapper">
          <img src="/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png" 
               alt="AWS Student Builder Group" 
               class="login-logo"
               (error)="handleLogoError($event)">
        </div>

        <div class="login-header">
          <span class="app-tag">AWS SBG Finance</span>
          <h1 class="login-title">Gestão Financeira</h1>
          <p class="login-subtitle">Sistema oficial de controle orçamentário, prestação de contas, parcerias e brindes do <strong>AWS Student Builder Group</strong>.</p>
        </div>

        <!-- Estado: Solicitação Pendente de Aprovação -->
        @if (pendingUser()) {
          <div class="pending-card">
            <div class="pending-icon">⏳</div>
            <h2 class="pending-title">Solicitação em Análise</h2>
            <p class="pending-desc">
              Olá, <strong>{{ pendingUser()?.nome }}</strong> (<code>{{ pendingUser()?.email }}</code>)!
            </p>
            <div class="pending-box">
              <p>
                Sua solicitação de acesso foi registrada no sistema. Por razões de confidencialidade dos dados financeiros, 
                um <strong>Administrador do grupo</strong> precisa aprovar seu perfil antes de liberar o acesso.
              </p>
              <div class="pending-status-badge">
                Status: Aguardando Aprovação
              </div>
            </div>
            <p class="pending-hint">
              Assim que o seu acesso for aprovado pela liderança, basta clicar novamente em <em>Entrar com Google</em>.
            </p>
            <button class="btn btn-outline full-width" (click)="resetPending()">
              Voltar à tela de login
            </button>
          </div>
        } @else {
          <!-- Formulário Normal de Login Google -->
          <div class="auth-section">
            <div id="google-btn-container" class="google-btn-wrapper"></div>
            @if (isLoading()) {
              <div class="loading-indicator">
                <span class="spinner"></span> Validando credenciais do Google...
              </div>
            }
          </div>

          <div class="security-notice">
            <span class="lock-icon">🔒</span>
            <span>Acesso seguro e restrito a membros autorizados do AWS Student Builder Group.</span>
          </div>
        }

        <div class="login-footer">
          <p>
            Ao utilizar este sistema, você concorda com nossos 
            <a routerLink="/termos" class="legal-link">Termos de Serviço</a> e 
            <a routerLink="/privacidade" class="legal-link">Política de Privacidade</a>.
          </p>
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
      margin-bottom: 1.25rem;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--color-navy-subtle);
    }
    .login-logo {
      height: 48px;
      width: auto;
      display: block;
    }
    .app-tag {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #FF9900;
      background: rgba(255, 153, 0, 0.12);
      border: 1px solid rgba(255, 153, 0, 0.3);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-pill);
      margin-bottom: 0.5rem;
      letter-spacing: 0.05em;
    }
    .login-title {
      font-size: 1.6rem;
      color: var(--color-navy);
      margin-bottom: 0.5rem;
    }
    .login-subtitle {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.45;
      margin-bottom: 2rem;
    }
    .auth-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .google-btn-wrapper {
      display: flex;
      justify-content: center;
      width: 100%;
      min-height: 44px;
    }
    .security-notice {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--color-text-muted);
      margin-bottom: 1.5rem;
      padding: 0.6rem;
      background: rgba(0, 0, 0, 0.03);
      border-radius: var(--radius-sm);
    }
    .pending-card {
      background: #FFFDF0;
      border: 1px solid #FFE082;
      border-radius: var(--radius-md);
      padding: 1.5rem 1.25rem;
      margin-bottom: 1.5rem;
      text-align: left;
    }
    .pending-icon {
      font-size: 2rem;
      text-align: center;
      margin-bottom: 0.5rem;
    }
    .pending-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #B78103;
      text-align: center;
      margin-bottom: 0.5rem;
    }
    .pending-desc {
      font-size: 0.85rem;
      color: var(--color-navy);
      text-align: center;
      margin-bottom: 1rem;
    }
    .pending-box {
      background: #FFFFFF;
      border: 1px solid rgba(183, 129, 3, 0.2);
      border-radius: var(--radius-sm);
      padding: 1rem;
      font-size: 0.825rem;
      color: var(--color-text-secondary);
      line-height: 1.45;
      margin-bottom: 1rem;
    }
    .pending-status-badge {
      display: inline-block;
      margin-top: 0.75rem;
      background: #FFF3E0;
      color: #E65100;
      font-weight: 700;
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-pill);
      border: 1px solid #FFE0B2;
    }
    .pending-hint {
      font-size: 0.78rem;
      color: var(--color-text-muted);
      text-align: center;
      margin-bottom: 1rem;
    }
    .full-width {
      width: 100%;
    }
    .login-footer {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      line-height: 1.5;
      border-top: 1px solid var(--color-border-light);
      padding-top: 1.25rem;
    }
    .legal-link {
      color: var(--color-blue);
      text-decoration: underline;
      font-weight: 600;
      &:hover {
        color: #0077C7;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  pendingUser = signal<{ nome: string; email: string } | null>(null);
  private readonly GOOGLE_CLIENT_ID = '270889581394-8snua48fsgd0t7fbfbhstrh2jfbjho14.apps.googleusercontent.com';

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.initGoogleAuth();
  }

  initGoogleAuth() {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      google.accounts.id.initialize({
        client_id: this.GOOGLE_CLIENT_ID,
        callback: (response: any) => this.handleGoogleCredential(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Renderiza o botão oficial do Google no container
      const btnContainer = document.getElementById('google-btn-container');
      if (btnContainer) {
        google.accounts.id.renderButton(btnContainer, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          logo_alignment: 'left',
          width: 360,
          locale: 'pt-BR'
        });
      }
    } else {
      setTimeout(() => this.initGoogleAuth(), 500);
    }
  }

  handleGoogleCredential(response: any) {
    if (!response || !response.credential) {
      this.toast.error('Não foi possível obter as credenciais do Google.');
      return;
    }

    this.isLoading.set(true);
    this.authService.loginWithGoogle(response.credential).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toast.success(`Bem-vindo(a), ${res.nome}!`);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errObj = err.error || {};

        if (errObj.error === 'PENDENTE' || (errObj.message && errObj.message.includes('aguardando aprovação'))) {
          this.pendingUser.set({
            nome: errObj.nome || 'Membro',
            email: errObj.email || 'sua conta'
          });
          this.toast.warning('Sua solicitação de acesso foi registrada e aguarda aprovação da liderança.');
        } else if (errObj.error === 'REJEITADO') {
          this.toast.error('Sua solicitação de acesso foi recusada.');
        } else if (errObj.error === 'BLOQUEADO') {
          this.toast.error('Sua conta foi desativada. Entre em contato com a organização.');
        } else {
          this.toast.error(errObj.message || 'Falha ao autenticar com o Google.');
        }
      }
    });
  }

  resetPending() {
    this.pendingUser.set(null);
    setTimeout(() => this.initGoogleAuth(), 100);
  }

  handleLogoError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png';
  }
}

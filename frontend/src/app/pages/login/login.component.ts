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
    <div class="login-layout">
      <!-- Painel Esquerdo: Identidade Institucional, Finalidade & Recursos -->
      <div class="showcase-panel">
        <div class="showcase-content">
          <!-- Logo Oficial do Grupo -->
          <div class="brand-header">
            <div class="logo-box">
              <img src="/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png" 
                   alt="AWS Student Builder Group" 
                   class="brand-logo"
                   (error)="handleLogoError($event)">
            </div>
            <span class="badge-tag">AWS SBG Finance</span>
          </div>

          <div class="hero-text">
            <h1 class="hero-title">Governança financeira e prestação de contas transparente</h1>
            <p class="hero-subtitle">
              Plataforma oficial do <strong>AWS Student Builder Group</strong> para planejamento orçamentário, auditoria de notas fiscais, controle de patrocínios e inventário de brindes.
            </p>
          </div>

          <!-- Feature Cards / Pilares do Sistema -->
          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-icon icon-amber">📊</div>
              <div class="feature-body">
                <h4>Orçamento & Câmbio em Tempo Real</h4>
                <p>Controle de tetos de gastos por categoria e conversão bidirecional instantânea USD ↔ BRL.</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon icon-blue">🧾</div>
              <div class="feature-body">
                <h4>Guarda Fiscal & Pacotes ZIP</h4>
                <p>Armazenamento de notas fiscais no Amazon S3 e exportação consolidada para prestação de contas.</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon icon-purple">🎁</div>
              <div class="feature-body">
                <h4>Patrocínios & Brindes</h4>
                <p>Gestão de parcerias com empresas, contrapartidas e controle de distribuição de brindes.</p>
              </div>
            </div>
          </div>

          <!-- Rodapé Institucional -->
          <div class="showcase-footer">
            <div class="security-pill">
              <span class="dot-live"></span>
              <span>Ambiente Protegido AWS Cloud • Criptografia TLS 1.3 • LGPD</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Painel Direito: Formulário de Autenticação -->
      <div class="auth-panel">
        <div class="auth-container">
          <div class="auth-header">
            <div class="auth-icon-wrapper">
              <span class="auth-icon">🔐</span>
            </div>
            <h2 class="auth-title">Acesso ao Portal</h2>
            <p class="auth-desc">Autentique-se com sua conta Google institucional ou pessoal para acessar o sistema.</p>
          </div>

          <!-- Estado 1: Solicitação Pendente de Aprovação -->
          @if (pendingUser()) {
            <div class="pending-box">
              <div class="pending-badge-header">
                <span class="pending-icon">⏳</span>
                <div>
                  <h3>Solicitação em Análise</h3>
                  <span class="status-pill">Aguardando Aprovação</span>
                </div>
              </div>

              <div class="pending-user-card">
                <p class="user-greeting">Olá, <strong>{{ pendingUser()?.nome }}</strong>!</p>
                <p class="user-email"><code>{{ pendingUser()?.email }}</code></p>
              </div>

              <p class="pending-message">
                Seu acesso foi registrado no sistema. Por razões de confidencialidade e segurança dos dados financeiros da comunidade, 
                um <strong>Administrador do grupo</strong> precisa autorizar o seu perfil.
              </p>

              <div class="pending-action">
                <p class="pending-hint">Após a aprovação, basta clicar novamente em <em>Entrar com Google</em>.</p>
                <button class="btn btn-outline full-width" (click)="resetPending()">
                  ← Tentar com outra conta
                </button>
              </div>
            </div>
          } 
          <!-- Estado 2: Botão de Login Google -->
          @else {
            <div class="login-box">
              <div class="google-button-wrapper">
                <div id="google-btn-container"></div>
                @if (isLoading()) {
                  <div class="loading-state">
                    <span class="spinner-circle"></span>
                    <span>Validando credenciais...</span>
                  </div>
                }
              </div>

              <div class="access-notice">
                <div class="notice-icon">🛡️</div>
                <div class="notice-text">
                  <strong>Acesso Controlado</strong>
                  <p>Novos usuários passam por aprovação prévia de um administrador antes de terem acesso liberado.</p>
                </div>
              </div>
            </div>
          }

          <!-- Links de Conformidade no Rodapé -->
          <div class="auth-footer">
            <div class="legal-links">
              <a routerLink="/termos" class="legal-anchor">Termos de Uso</a>
              <span class="sep">•</span>
              <a routerLink="/privacidade" class="legal-anchor">Política de Privacidade</a>
            </div>
            <span class="copyright">AWS Student Builder Group © 2026</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-layout {
      min-height: 100vh;
      display: flex;
      background-color: var(--color-bg);
    }

    /* =========================================
       Painel Esquerdo (Showcase & Institucional)
       ========================================= */
    .showcase-panel {
      flex: 1.15;
      background: radial-gradient(circle at 20% 20%, #1f2b37 0%, #151D25 60%, #0d1319 100%);
      color: #FFFFFF;
      padding: 3.5rem 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -100px;
        right: -100px;
        width: 350px;
        height: 350px;
        background: radial-gradient(circle, rgba(255, 153, 0, 0.12) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
      }
    }

    .showcase-content {
      max-width: 580px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2.25rem;
      position: relative;
      z-index: 2;
    }

    .brand-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-box {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 0.6rem 1rem;
      border-radius: var(--radius-sm);
      backdrop-filter: blur(8px);
    }

    .brand-logo {
      height: 38px;
      width: auto;
      display: block;
    }

    .badge-tag {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--color-amber);
      background: rgba(255, 153, 0, 0.15);
      border: 1px solid rgba(255, 153, 0, 0.35);
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-pill);
      letter-spacing: 0.05em;
    }

    .hero-title {
      font-size: 2.1rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.25;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }

    .hero-subtitle {
      font-size: 0.95rem;
      color: #94A3B8;
      line-height: 1.55;
      font-weight: 400;

      strong {
        color: #F8FAFC;
      }
    }

    .features-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.15);
        transform: translateX(4px);
      }
    }

    .feature-icon {
      font-size: 1.35rem;
      padding: 0.5rem;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.icon-amber { background: rgba(255, 153, 0, 0.15); color: #FF9900; }
      &.icon-blue { background: rgba(65, 179, 255, 0.15); color: #41B3FF; }
      &.icon-purple { background: rgba(172, 91, 255, 0.15); color: #AC5BFF; }
    }

    .feature-body {
      h4 {
        font-size: 0.925rem;
        font-weight: 700;
        color: #F8FAFC;
        margin-bottom: 0.2rem;
      }
      p {
        font-size: 0.8rem;
        color: #94A3B8;
        line-height: 1.4;
        margin: 0;
      }
    }

    .showcase-footer {
      padding-top: 0.5rem;
    }

    .security-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: #94A3B8;
      background: rgba(0, 0, 0, 0.3);
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-pill);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .dot-live {
      width: 8px;
      height: 8px;
      background-color: var(--color-mint);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--color-mint);
    }

    /* =========================================
       Painel Direito (Autenticação)
       ========================================= */
    .auth-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      background-color: #FFFFFF;
    }

    .auth-container {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .auth-header {
      text-align: center;
    }

    .auth-icon-wrapper {
      width: 52px;
      height: 52px;
      background: #F1F5F9;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .auth-title {
      font-size: 1.65rem;
      color: var(--color-navy);
      font-weight: 800;
      margin-bottom: 0.4rem;
    }

    .auth-desc {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.45;
    }

    .login-box {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .google-button-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      width: 100%;
    }

    .loading-state {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }

    .spinner-circle {
      width: 18px;
      height: 18px;
      border: 2px solid var(--color-border);
      border-top-color: var(--color-amber);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .access-notice {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: var(--radius-md);
      padding: 1rem;

      .notice-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      .notice-text {
        strong {
          display: block;
          font-size: 0.825rem;
          color: var(--color-navy);
          margin-bottom: 0.15rem;
        }
        p {
          font-size: 0.775rem;
          color: var(--color-text-secondary);
          line-height: 1.35;
          margin: 0;
        }
      }
    }

    /* Painel de Estado Pendente */
    .pending-box {
      background: #FFFDF0;
      border: 1px solid #FFE082;
      border-radius: var(--radius-md);
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .pending-badge-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .pending-icon {
        font-size: 1.75rem;
      }

      h3 {
        font-size: 1.15rem;
        color: #B78103;
        margin: 0;
      }
    }

    .status-pill {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      background: #FFF3E0;
      color: #E65100;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-pill);
      border: 1px solid #FFE0B2;
      margin-top: 0.25rem;
    }

    .pending-user-card {
      background: #FFFFFF;
      border: 1px solid rgba(183, 129, 3, 0.18);
      border-radius: var(--radius-sm);
      padding: 0.75rem 1rem;

      .user-greeting {
        font-size: 0.9rem;
        color: var(--color-navy);
        margin-bottom: 0.2rem;
      }
      .user-email {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
      }
    }

    .pending-message {
      font-size: 0.825rem;
      color: #475569;
      line-height: 1.5;
    }

    .pending-action {
      border-top: 1px solid #FFE082;
      padding-top: 0.75rem;
      text-align: center;
    }

    .pending-hint {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-bottom: 0.75rem;
    }

    .full-width {
      width: 100%;
    }

    .auth-footer {
      text-align: center;
      border-top: 1px solid var(--color-border-light);
      padding-top: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .legal-links {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.8rem;
    }

    .legal-anchor {
      color: var(--color-text-secondary);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;

      &:hover {
        color: var(--color-navy);
        text-decoration: underline;
      }
    }

    .sep {
      color: var(--color-border);
    }

    .copyright {
      font-size: 0.725rem;
      color: var(--color-text-muted);
    }

    /* Responsividade para Tablets e Telas Menores */
    @media (max-width: 960px) {
      .login-layout {
        flex-direction: column;
      }
      .showcase-panel {
        padding: 2.5rem 1.5rem;
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .auth-panel {
        padding: 2.5rem 1.5rem;
      }
      .hero-title {
        font-size: 1.6rem;
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

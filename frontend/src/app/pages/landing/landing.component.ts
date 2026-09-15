import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-page">
      <!-- Barra de Navegação Superior Pública -->
      <header class="navbar">
        <div class="nav-container">
          <div class="brand">
            <img src="/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png" 
                 alt="AWS Student Builder Group" 
                 class="brand-logo"
                 (error)="handleLogoError($event)">
            <span class="brand-title">AWS SBG Finance</span>
          </div>
          
          <nav class="nav-links">
            <a href="#recursos">Recursos</a>
            <a href="#seguranca">Governança & Segurança</a>
            <a href="#sobre">Sobre o Grupo</a>
            <a routerLink="/privacidade">Privacidade</a>
            <a routerLink="/termos">Termos</a>
          </nav>

          <div class="nav-actions">
            @if (authService.isAuthenticated()) {
              <a routerLink="/dashboard" class="btn btn-primary">Ir para o Dashboard &rarr;</a>
            } @else {
              <a routerLink="/login" class="btn btn-primary">Acessar Sistema</a>
            }
          </div>
        </div>
      </header>

      <!-- Seção Principal (Hero) -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="badge-pill">
            <span class="dot-live"></span>
            <span>Plataforma Oficial do AWS Student Builder Group</span>
          </div>

          <h1 class="hero-heading">
            <span class="highlight">AWS SBG Finance</span><br>
            Governança Financeira e Prestação de Contas Transparente
          </h1>

          <p class="hero-subtext">
            O <strong>AWS SBG Finance</strong> é a aplicação centralizada de gestão orçamentária, custódia de notas fiscais, controle de patrocínios e inventário de brindes da comunidade estudantil AWS Student Builder Group.
          </p>

          <div class="hero-cta-group">
            <a routerLink="/login" class="btn btn-hero-primary">
              <span>Acessar com Conta Google</span>
              <span class="arrow">&rarr;</span>
            </a>
            <a href="#recursos" class="btn btn-hero-secondary">Conhecer Recursos</a>
          </div>

          <!-- Destaque de métricas / pilares -->
          <div class="hero-badges">
            <div class="stat-item">
              <span class="stat-number">100%</span>
              <span class="stat-label">Auditável & Transparente</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">USD ↔ BRL</span>
              <span class="stat-label">Câmbio em Tempo Real</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">Amazon S3</span>
              <span class="stat-label">Guarda Fiscal Criptografada</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Seção de Recursos Principais -->
      <section id="recursos" class="section features-section">
        <div class="section-container">
          <div class="section-header">
            <span class="section-tag">Funcionalidades</span>
            <h2>Tudo o que o grupo precisa para uma gestão financeira impecável</h2>
            <p>Desenvolvido para atender aos mais altos padrões de conformidade e auditoria de projetos estudantis.</p>
          </div>

          <div class="cards-grid">
            <div class="feature-card">
              <div class="icon-circle icon-amber">📊</div>
              <h3>Orçamento & Teto de Gastos</h3>
              <p>Definição de orçamentos por categoria, acompanhamento de despesas em tempo real e conversão cambial automática USD e BRL via API do Banco Central.</p>
            </div>

            <div class="feature-card">
              <div class="icon-circle icon-blue">🧾</div>
              <h3>Guarda Fiscal no Amazon S3</h3>
              <p>Upload seguro e armazenamento em nuvem de notas fiscais, recibos e faturas em PDF/PNG com geração de pacotes ZIP consolidados para prestação de contas.</p>
            </div>

            <div class="feature-card">
              <div class="icon-circle icon-purple">🎁</div>
              <h3>Patrocínios & Brindes</h3>
              <p>Controle de parcerias com empresas, tracking de cotas de patrocínio, contrapartidas e inventário de distribuição de brindes e swag para eventos.</p>
            </div>

            <div class="feature-card">
              <div class="icon-circle icon-green">📑</div>
              <h3>Relatórios & Auditoria</h3>
              <p>Exportação instantânea de demonstrativos em Excel e PDF prontos para envio às instituições de ensino e patrocinadores mantenedores.</p>
            </div>

            <div class="feature-card">
              <div class="icon-circle icon-orange">🔐</div>
              <h3>Autenticação Google & RBAC</h3>
              <p>Login seguro via Google OAuth com controle de acesso baseado em perfis (Administrador e Visualizador) e fluxo de aprovação prévia de novos membros.</p>
            </div>

            <div class="feature-card">
              <div class="icon-circle icon-cyan">⚡</div>
              <h3>Infraestrutura AWS</h3>
              <p>Hospedado em instâncias Amazon EC2 com banco de dados PostgreSQL estruturado, certificados SSL/TLS automáticos e backups frequentes.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Seção de Governança e Segurança -->
      <section id="seguranca" class="section security-section">
        <div class="section-container">
          <div class="security-box">
            <div class="security-text">
              <span class="section-tag">Governança & Confidencialidade</span>
              <h2>Segurança e Privacidade em Primeiro Lugar</h2>
              <p>
                O <strong>AWS SBG Finance</strong> adota políticas rigorosas de proteção de dados alinhadas à LGPD. O acesso aos dados financeiros é estritamente restrito a membros autorizados da liderança e requer aprovação explícita de um administrador do grupo.
              </p>
              <ul class="security-list">
                <li>🛡️ <strong>Criptografia em trânsito:</strong> Conexões HTTPS/TLS 1.3 obrigatórias em todas as rotas.</li>
                <li>🔑 <strong>Google OAuth 2.0:</strong> Utilização apenas de escopos básicos de identificação (e-mail e nome).</li>
                <li>📧 <strong>Notificações Automáticas:</strong> Alertas em tempo real à liderança sobre novas solicitações de acesso.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Seção Sobre o Grupo e Contato -->
      <section id="sobre" class="section about-section">
        <div class="section-container">
          <div class="section-header">
            <span class="section-tag">Institucional</span>
            <h2>Sobre o AWS Student Builder Group</h2>
            <p>
              O <strong>AWS Student Builder Group (AWS SBG)</strong> é uma iniciativa acadêmica focada na capacitação de estudantes em computação em nuvem, desenvolvimento de software e boas práticas de engenharia com tecnologias Amazon Web Services.
            </p>
          </div>

          <div class="contact-box">
            <div class="contact-info">
              <h3>Dúvidas ou Solicitação de Acesso?</h3>
              <p>Entre em contato diretamente com a equipe de administração do projeto:</p>
              <div class="contact-email">
                <span class="email-icon">✉️</span>
                <a href="mailto:studentbuildergroup@gmail.com">studentbuildergroup@gmail.com</a>
              </div>
            </div>
            <div class="contact-action">
              <a routerLink="/login" class="btn btn-primary btn-large">Ir para Login / Cadastro</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Rodapé Público -->
      <footer class="footer">
        <div class="footer-container">
          <div class="footer-top">
            <div class="footer-brand">
              <div class="brand">
                <img src="/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png" 
                     alt="AWS Student Builder Group" 
                     class="brand-logo"
                     (error)="handleLogoError($event)">
                <span class="brand-title">AWS SBG Finance</span>
              </div>
              <p class="footer-desc">
                Sistema Oficial de Gestão Financeira e Prestação de Contas do AWS Student Builder Group.
              </p>
            </div>

            <div class="footer-links-col">
              <h4>Navegação</h4>
              <a href="#recursos">Recursos</a>
              <a href="#seguranca">Segurança</a>
              <a href="#sobre">Sobre o Grupo</a>
              <a routerLink="/login">Acesso ao Sistema</a>
            </div>

            <div class="footer-links-col">
              <h4>Legal & Conformidade</h4>
              <a routerLink="/privacidade">Política de Privacidade</a>
              <a routerLink="/termos">Termos de Uso</a>
              <a href="mailto:studentbuildergroup@gmail.com">Contato do Desenvolvedor</a>
            </div>
          </div>

          <div class="footer-bottom">
            <p>&copy; 2026 <strong>AWS SBG Finance</strong> — AWS Student Builder Group. Todos os direitos reservados.</p>
            <div class="footer-legal-inline">
              <a routerLink="/privacidade">Privacidade</a> &bull;
              <a routerLink="/termos">Termos de Serviço</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
      background-color: #0F172A;
      color: #F8FAFC;
      font-family: inherit;
    }

    /* Navbar */
    .navbar {
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      text-decoration: none;
    }

    .brand-logo {
      height: 34px;
      width: auto;
    }

    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.01em;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.75rem;

      a {
        color: #94A3B8;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        transition: color 0.2s;

        &:hover {
          color: #FFFFFF;
        }
      }
    }

    .nav-actions {
      display: flex;
      align-items: center;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;

      &.btn-primary {
        background-color: var(--color-amber);
        color: var(--color-navy);

        &:hover {
          background-color: var(--color-amber-hover);
          transform: translateY(-1px);
        }
      }

      &.btn-large {
        padding: 0.85rem 1.75rem;
        font-size: 1rem;
      }
    }

    /* Hero Section */
    .hero-section {
      padding: 5rem 1.5rem 4rem;
      background: radial-gradient(circle at 50% 20%, rgba(255, 153, 0, 0.12) 0%, transparent 60%);
      text-align: center;
    }

    .hero-container {
      max-width: 860px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.75rem;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(255, 153, 0, 0.12);
      border: 1px solid rgba(255, 153, 0, 0.3);
      color: var(--color-amber);
      font-size: 0.825rem;
      font-weight: 700;
      padding: 0.4rem 1rem;
      border-radius: var(--radius-pill);
    }

    .dot-live {
      width: 8px;
      height: 8px;
      background-color: var(--color-amber);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--color-amber);
    }

    .hero-heading {
      font-size: 2.85rem;
      font-weight: 800;
      line-height: 1.2;
      color: #FFFFFF;
      letter-spacing: -0.03em;
      margin: 0;

      .highlight {
        color: var(--color-amber);
      }
    }

    .hero-subtext {
      font-size: 1.15rem;
      color: #94A3B8;
      line-height: 1.6;
      max-width: 720px;
      margin: 0;

      strong {
        color: #F8FAFC;
      }
    }

    .hero-cta-group {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .btn-hero-primary {
      background-color: var(--color-amber);
      color: var(--color-navy);
      font-weight: 700;
      font-size: 1rem;
      padding: 0.85rem 1.85rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      box-shadow: 0 4px 14px rgba(255, 153, 0, 0.3);
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--color-amber-hover);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 153, 0, 0.4);
      }
    }

    .btn-hero-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: #F8FAFC;
      border: 1px solid rgba(255, 255, 255, 0.15);
      font-weight: 600;
      font-size: 1rem;
      padding: 0.85rem 1.75rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.3);
      }
    }

    .hero-badges {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin-top: 2rem;
      padding: 1.25rem 2rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-md);
      backdrop-filter: blur(8px);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
    }

    .stat-number {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--color-amber);
    }

    .stat-label {
      font-size: 0.75rem;
      color: #94A3B8;
    }

    .stat-divider {
      width: 1px;
      height: 32px;
      background: rgba(255, 255, 255, 0.1);
    }

    /* Sections Common */
    .section {
      padding: 5rem 1.5rem;
    }

    .section-container {
      max-width: 1100px;
      margin: 0 auto;
    }

    .section-header {
      text-align: center;
      max-width: 680px;
      margin: 0 auto 3.5rem;

      h2 {
        font-size: 2rem;
        font-weight: 800;
        color: #FFFFFF;
        margin: 0.75rem 0;
        letter-spacing: -0.02em;
      }

      p {
        font-size: 1rem;
        color: #94A3B8;
        line-height: 1.5;
        margin: 0;
      }
    }

    .section-tag {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-amber);
      background: rgba(255, 153, 0, 0.12);
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-pill);
      display: inline-block;
    }

    /* Feature Cards */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-md);
      padding: 1.75rem;
      transition: all 0.25s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 153, 0, 0.35);
        transform: translateY(-4px);
      }

      h3 {
        font-size: 1.15rem;
        font-weight: 700;
        color: #FFFFFF;
        margin: 1rem 0 0.5rem;
      }

      p {
        font-size: 0.875rem;
        color: #94A3B8;
        line-height: 1.55;
        margin: 0;
      }
    }

    .icon-circle {
      width: 46px;
      height: 46px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;

      &.icon-amber { background: rgba(255, 153, 0, 0.15); color: #FF9900; }
      &.icon-blue { background: rgba(65, 179, 255, 0.15); color: #41B3FF; }
      &.icon-purple { background: rgba(172, 91, 255, 0.15); color: #AC5BFF; }
      &.icon-green { background: rgba(0, 214, 143, 0.15); color: #00D68F; }
      &.icon-orange { background: rgba(255, 92, 0, 0.15); color: #FF5C00; }
      &.icon-cyan { background: rgba(0, 229, 255, 0.15); color: #00E5FF; }
    }

    /* Security Box */
    .security-box {
      background: linear-gradient(135deg, rgba(21, 29, 37, 0.9) 0%, rgba(13, 19, 25, 0.9) 100%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-lg);
      padding: 3rem 2.5rem;
    }

    .security-text {
      max-width: 800px;

      h2 {
        font-size: 1.85rem;
        font-weight: 800;
        color: #FFFFFF;
        margin: 0.75rem 0 1rem;
      }

      p {
        font-size: 0.95rem;
        color: #94A3B8;
        line-height: 1.6;
      }
    }

    .security-list {
      list-style: none;
      padding: 0;
      margin: 1.5rem 0 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      li {
        font-size: 0.9rem;
        color: #E2E8F0;
        line-height: 1.5;

        strong {
          color: #FFFFFF;
        }
      }
    }

    /* About & Contact */
    .contact-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-md);
      padding: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .contact-info {
      h3 {
        font-size: 1.25rem;
        color: #FFFFFF;
        margin-bottom: 0.4rem;
      }
      p {
        font-size: 0.9rem;
        color: #94A3B8;
        margin-bottom: 0.75rem;
      }
    }

    .contact-email {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
      color: var(--color-amber);

      a {
        color: var(--color-amber);
        text-decoration: none;
        font-weight: 600;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    /* Footer */
    .footer {
      background: #090D16;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 4rem 1.5rem 2rem;
    }

    .footer-container {
      max-width: 1100px;
      margin: 0 auto;
    }

    .footer-top {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 3rem;
      padding-bottom: 3rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .footer-desc {
      font-size: 0.85rem;
      color: #94A3B8;
      line-height: 1.5;
      margin-top: 1rem;
      max-width: 360px;
    }

    .footer-links-col {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      h4 {
        font-size: 0.85rem;
        font-weight: 700;
        color: #FFFFFF;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.25rem;
      }

      a {
        font-size: 0.85rem;
        color: #94A3B8;
        text-decoration: none;
        transition: color 0.2s;

        &:hover {
          color: #FFFFFF;
        }
      }
    }

    .footer-bottom {
      padding-top: 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.8rem;
      color: #64748B;
    }

    .footer-legal-inline {
      a {
        color: #94A3B8;
        text-decoration: none;
        margin: 0 0.25rem;

        &:hover {
          color: #FFFFFF;
        }
      }
    }

    @media (max-width: 860px) {
      .nav-links {
        display: none;
      }
      .hero-heading {
        font-size: 2.1rem;
      }
      .hero-badges {
        flex-direction: column;
        gap: 1rem;
      }
      .stat-divider {
        display: none;
      }
      .contact-box {
        flex-direction: column;
        align-items: flex-start;
      }
      .footer-top {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .footer-bottom {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class LandingComponent {
  authService = inject(AuthService);

  handleLogoError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png';
  }
}

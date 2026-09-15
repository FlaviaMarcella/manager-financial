import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-page">
      <div class="legal-card">
        <div class="legal-header">
          <img src="/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png" alt="AWS SBG" class="legal-logo">
          <h1>Política de Privacidade</h1>
          <p class="subtitle">AWS Student Builder Group — Gestão Financeira</p>
        </div>

        <div class="legal-content">
          <section>
            <h2>1. Informações Coletadas</h2>
            <p>O sistema de Gestão Financeira do AWS Student Builder Group utiliza a autenticação via <strong>Google OAuth 2.0</strong> para identificar membros autorizados. Coletamos unicamente:</p>
            <ul>
              <li><strong>Nome completo</strong>: para identificação do responsável nos registros financeiros.</li>
              <li><strong>Endereço de e-mail</strong>: para controle de acesso, permissões (Admin/Viewer) e auditoria.</li>
              <li><strong>Foto de perfil</strong>: para exibição no menu de navegação do usuário autenticado.</li>
            </ul>
          </section>

          <section>
            <h2>2. Finalidade do Uso dos Dados</h2>
            <p>Os dados coletados são utilizados estritamente para:</p>
            <ul>
              <li>Autenticar e autorizar o acesso às funcionalidades de controle de orçamento, lançamentos e relatórios.</li>
              <li>Registrar a autoria de lançamentos financeiros e prestação de contas dos eventos da comunidade.</li>
              <li>Não compartilhamos, vendemos ou transferimos dados pessoais para terceiros.</li>
            </ul>
          </section>

          <section>
            <h2>3. Armazenamento e Segurança</h2>
            <p>Todas as comunicações são criptografadas via protocolo HTTPS/TLS. Os dados e notas fiscais são protegidos na infraestrutura da Amazon Web Services (AWS) com controles de acesso e políticas de segurança.</p>
          </section>

          <section>
            <h2>4. Contato</h2>
            <p>Para dúvidas sobre a privacidade dos dados, entre em contato com a equipe organizadora pelo e-mail: <strong>studentbuildergroup&#64;gmail.com</strong>.</p>
          </section>
        </div>

        <div class="legal-footer">
          <a routerLink="/login" class="btn btn-primary">Voltar para o Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-page {
      min-height: 100vh;
      background: radial-gradient(circle at 50% 20%, #1f2b37 0%, #151D25 70%, #0d1319 100%);
      padding: 3rem 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .legal-card {
      background: #FFFFFF;
      max-width: 800px;
      width: 100%;
      border-radius: var(--radius-lg);
      padding: 2.5rem 3rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
    }
    .legal-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--color-border);
    }
    .legal-logo {
      height: 44px;
      background: #151D25;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;
    }
    .legal-header h1 {
      font-size: 1.75rem;
      color: var(--color-navy);
      margin: 0;
    }
    .subtitle {
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }
    .legal-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      color: #334155;
      line-height: 1.6;
      font-size: 0.95rem;
    }
    .legal-content h2 {
      font-size: 1.15rem;
      color: var(--color-navy);
      margin-bottom: 0.5rem;
    }
    .legal-content ul {
      padding-left: 1.25rem;
      margin-top: 0.5rem;
    }
    .legal-footer {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-border);
      text-align: center;
    }
  `]
})
export class PrivacyComponent {}

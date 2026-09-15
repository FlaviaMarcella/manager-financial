import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-page">
      <div class="legal-card">
        <div class="legal-header">
          <img src="/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png" alt="AWS SBG" class="legal-logo">
          <h1>Termos de Uso do Serviço</h1>
          <p class="subtitle">AWS Student Builder Group — Gestão Financeira</p>
        </div>

        <div class="legal-content">
          <section>
            <h2>1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar o sistema de Gestão Financeira do AWS Student Builder Group, você concorda com as diretrizes e regras aqui descritas para prestação de contas, registro de orçamentos e controle financeiro de eventos.</p>
          </section>

          <section>
            <h2>2. Perfis de Acesso e Responsabilidades</h2>
            <ul>
              <li><strong>Administradores</strong>: Responsáveis pelo cadastro fidedigno de notas fiscais, orçamentos, aprovações e anexos comprobatórios.</li>
              <li><strong>Visualizadores</strong>: Acesso em modo leitura para consulta de relatórios, saldos e dashboards de transparência.</li>
            </ul>
          </section>

          <section>
            <h2>3. Uso Adequado da Plataforma</h2>
            <p>Os usuários comprometem-se a utilizar a plataforma exclusivamente para fins legítimos de gestão e prestação de contas do grupo de estudos/comunidade acadêmica, sendo vedado o upload de arquivos impróprios ou dados falsos.</p>
          </section>

          <section>
            <h2>4. Contato</h2>
            <p>Para suporte ou dúvidas, contate a coordenação pelo e-mail: <strong>studentbuildergroup&#64;gmail.com</strong>.</p>
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
export class TermsComponent {}

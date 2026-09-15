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
          <img src="/assets/brandmarks/AWS Student Builder Group_RGB_Brandmark_White.png" alt="AWS SBG Finance" class="legal-logo">
          <span class="app-badge">AWS SBG Finance</span>
          <h1>Política de Privacidade de Dados</h1>
          <p class="subtitle">Última atualização: 15 de Setembro de 2026</p>
        </div>

        <div class="legal-content">
          <section>
            <h2>1. Apresentação e Identificação</h2>
            <p>
              Esta Política de Privacidade descreve como a aplicação <strong>AWS SBG Finance</strong> 
              (sistema de gestão orçamentária e prestação de contas do grupo acadêmico <em>AWS Student Builder Group</em>) 
              coleta, armazena, utiliza e protege os dados dos usuários em conformidade com a 
              <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong> e com a 
              <strong>Política de Dados do Usuário dos Serviços de API do Google</strong>.
            </p>
          </section>

          <section>
            <h2>2. Dados Coletados via Google OAuth 2.0</h2>
            <p>
              A aplicação <strong>AWS SBG Finance</strong> solicita apenas os escopos básicos de autenticação do Google (<em>openid</em>, <em>email</em> e <em>profile</em>). Os únicos dados acessados e tratados são:
            </p>
            <ul>
              <li><strong>Nome Completo:</strong> utilizado para identificar o membro responsável nos registros de transações financeiras e no cabeçalho do sistema.</li>
              <li><strong>Endereço de E-mail (Google):</strong> utilizado como credencial única de login, verificação de identidade e controle de nível de acesso (Administrador ou Leitor/Membro).</li>
              <li><strong>Foto de Perfil / Avatar:</strong> exibida exclusivamente na interface gráfica do usuário autenticado.</li>
              <li><strong>Identificador de Usuário Google (Google Sub ID):</strong> identificador numérico único e imutável para associação segura da conta.</li>
            </ul>
            <p class="highlight-box">
              ⚠️ <strong>Importante:</strong> Não solicitamos nem acessamos e-mails do Gmail, arquivos do Google Drive, contatos, calendários ou qualquer outra informação pessoal fora do perfil básico público de autenticação.
            </p>
          </section>

          <section>
            <h2>3. Finalidade e Base Legal do Tratamento</h2>
            <p>O tratamento de dados pessoais é realizado estritamente para as seguintes finalidades:</p>
            <ul>
              <li><strong>Autenticação e Controle de Acesso:</strong> garantir que apenas membros autorizados e aprovados pela liderança tenham acesso aos dados da comunidade.</li>
              <li><strong>Auditoria e Governança Financeira:</strong> vincular comprovantes fiscais, relatórios orçamentários e despesas aos membros responsáveis pelos lançamentos.</li>
              <li><strong>Segurança da Informação:</strong> prevenir acessos indevidos e manter logs de atividade do sistema.</li>
            </ul>
          </section>

          <section>
            <h2>4. Não Compartilhamento e Não Comercialização de Dados</h2>
            <p>
              Declaramos formalmente que a aplicação <strong>AWS SBG Finance</strong>:
            </p>
            <ul>
              <li><strong>NUNCA comercializa, aluga ou vende</strong> dados de usuários a terceiros.</li>
              <li><strong>NÃO compartilha</strong> dados com redes de publicidade, corretores de dados ou plataformas de marketing.</li>
              <li><strong>NÃO utiliza</strong> os dados obtidos através das APIs do Google para desenvolver, treinar ou aprimorar modelos de inteligência artificial ou aprendizado de máquina generalizados.</li>
            </ul>
          </section>

          <section>
            <h2>5. Armazenamento, Segurança e Retenção</h2>
            <p>
              Adotamos elevados padrões técnicos de segurança para salvaguardar todos os dados tratados:
            </p>
            <ul>
              <li><strong>Comunicação Criptografada:</strong> 100% do tráfego é transmitido sob protocolo seguro <strong>HTTPS com TLS 1.3</strong> e certificados Let's Encrypt válidos.</li>
              <li><strong>Sessões Seguras:</strong> A autenticação utiliza tokens JWT (JSON Web Token) criptografados com expiração automática de 24 horas e cookies <code>HttpOnly</code>.</li>
              <li><strong>Infraestrutura em Nuvem:</strong> O banco de dados e os comprovantes digitais são armazenados em ambiente protegido da Amazon Web Services (AWS) com controle restrito de IAM Roles e criptografia em repouso.</li>
            </ul>
          </section>

          <section>
            <h2>6. Direitos do Usuário e Revogação de Acesso</h2>
            <p>
              O usuário pode a qualquer momento:
            </p>
            <ul>
              <li>Solicitar a visualização, correção ou exclusão definitiva de sua conta e dados cadastrais no sistema através do e-mail oficial de suporte.</li>
              <li>Revogar a qualquer momento a permissão de acesso concedida ao aplicativo diretamente no painel de segurança da sua Conta Google em: 
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>.
              </li>
            </ul>
          </section>

          <section>
            <h2>7. Contato e Encarregado pelo Tratamento de Dados</h2>
            <p>
              Para esclarecimentos, dúvidas sobre esta política ou solicitação de exclusão de dados cadastrais, entre em contato com a liderança do <strong>AWS Student Builder Group</strong>:
            </p>
            <div class="contact-card">
              <p><strong>Aplicação:</strong> AWS SBG Finance</p>
              <p><strong>Organização:</strong> AWS Student Builder Group</p>
              <p><strong>E-mail oficial de suporte:</strong> <a href="mailto:studentbuildergroup@gmail.com">studentbuildergroup&#64;gmail.com</a></p>
              <p><strong>Endereço Web Oficial:</strong> <a href="https://aws-sbg-finance.duckdns.org">https://aws-sbg-finance.duckdns.org</a></p>
            </div>
          </section>
        </div>

        <div class="legal-footer">
          <a routerLink="/login" class="btn btn-primary">Voltar à Página Principal</a>
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
      max-width: 860px;
      width: 100%;
      border-radius: var(--radius-lg);
      padding: 3rem 2.5rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
    }
    .legal-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--color-border);
    }
    .legal-logo {
      height: 48px;
      background: #151D25;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      margin-bottom: 0.75rem;
    }
    .app-badge {
      display: block;
      font-size: 0.8rem;
      font-weight: 700;
      color: #FF9900;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .legal-header h1 {
      font-size: 1.85rem;
      color: var(--color-navy);
      margin: 0;
    }
    .subtitle {
      color: var(--color-text-secondary);
      font-size: 0.85rem;
      margin-top: 0.35rem;
    }
    .legal-content {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      color: #334155;
      line-height: 1.65;
      font-size: 0.95rem;
    }
    .legal-content h2 {
      font-size: 1.15rem;
      color: var(--color-navy);
      margin-bottom: 0.5rem;
      border-bottom: 2px solid #F1F5F9;
      padding-bottom: 0.35rem;
    }
    .legal-content ul {
      padding-left: 1.25rem;
      margin-top: 0.5rem;
    }
    .legal-content li {
      margin-bottom: 0.4rem;
    }
    .highlight-box {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
      font-size: 0.9rem;
      color: #92400E;
      margin-top: 0.75rem;
    }
    .contact-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: var(--radius-sm);
      padding: 1rem 1.25rem;
      margin-top: 0.5rem;
      p { margin: 0.25rem 0; font-size: 0.9rem; }
      a { color: var(--color-blue); text-decoration: underline; font-weight: 600; }
    }
    .legal-footer {
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-border);
      text-align: center;
    }
  `]
})
export class PrivacyComponent {}

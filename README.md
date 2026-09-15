# 🚀 AWS Student Builder Group - Sistema de Gestão Financeira

<p align="center">
  <img src="frontend/public/assets/brandmarks/color-horizontal.svg" alt="AWS Student Builder Group" width="360" />
</p>

<p align="center">
  <strong>Plataforma Web Full-Stack para Gestão Orçamentária, Lançamentos Fiscais, Parcerias e Inventário de Brindes</strong>
  <br>
  <em>Desenvolvido com foco em alta eficiência, segurança RBAC e otimização para AWS Free Tier.</em>
</p>

---

## 📋 Índice
- [1. Visão Geral](#1-visão-geral)
- [2. Stack Tecnológica](#2-stack-tecnológica)
- [3. Módulos da Aplicação](#3-módulos-da-aplicação)
- [4. Design System & Identidade Visual](#4-design-system--identidade-visual)
- [5. Execução Local com Docker Compose](#5-execução-local-com-docker-compose)
- [6. Execução em Desenvolvimento (Sem Docker)](#6-execução-em-desenvolvimento-sem-docker)
- [7. Guia Completo de Deploy na AWS (Free Tier)](#7-guia-completo-de-deploy-na-aws-free-tier)
- [8. Configuração de Autenticação Google OAuth](#8-configuração-de-autenticação-google-oauth)
- [9. Primeiro Acesso e Permissões de Administrador](#9-primeiro-acesso-e-permissões-de-administrador)
- [10. Pipeline CI/CD com GitHub Actions](#10-pipeline-cicd-com-github-actions)
- [11. Documentação da API (Swagger/OpenAPI)](#11-documentação-da-api-swaggeropenapi)

---

## 1. Visão Geral

O **AWS Student Builder Group Financial Manager** substitui planilhas descentralizadas por um sistema web centralizado, seguro e em conformidade com as diretrizes do programa. 

### Principais Objetivos:
- 🌐 **Acesso Público Controlado**: Qualquer membro com conta Google pode visualizar orçamentos, métricas e comprovantes (`VIEWER`).
- 🔐 **Gestão Restrita**: Apenas administradores (`ADMIN`) podem cadastrar, alterar e excluir lançamentos, eventos e configurações.
- 💵 **Orçamento Multimoeda**: Suporte nativo a orçamentos em USD com conversão dinâmica para BRL via taxa parametrizável e histórico de fechamento.
- 📦 **Inventário de Swags**: Rastreamento em tempo real de brindes recebidos, distribuídos e saldo em estoque.
- ⚡ **Otimizado para Free Tier**: Arquitetura enxuta para rodar com alta performance em uma única instância EC2 `t2.micro` / `t3.micro` (1 GB RAM) e armazenamento em S3.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Backend** | Java 21 / Spring Boot 3.3.4 | Spring Web, Spring Data JPA, Spring Security (OAuth2/JWT), Flyway, Bean Validation |
| **Frontend** | Angular 21 | Standalone Components, Reactive Signals, Chart.js, SCSS Custom Properties |
| **Banco de Dados** | PostgreSQL 16 | Relacionamentos com FKs, índices compostos, migrações automatizadas via Flyway |
| **Storage de Arquivos** | Local Disk / Amazon S3 | AWS SDK v2 (`software.amazon.awssdk:s3`), suporte a armazenamento local ou S3 |
| **Proxy & Servidor Web** | Nginx Alpine | Compressão Gzip, cache de assets estáticos, proxy reverso para `/api/` |
| **Contêineres** | Docker & Docker Compose | Multi-stage builds, isolamento de rede e limites de memória |
| **CI/CD** | GitHub Actions | Testes automatizados no backend/frontend, build Docker e deploy SSH contínuo |

---

## 3. Módulos da Aplicação

### 📊 Dashboard
- **KPIs Principais**: Orçamento total aprovado (BRL e USD), total realizado/gasto, saldo remanescente com alerta de déficit e total de parcerias ativas.
- **Gráfico de Despesas por Categoria**: Visualização em rosca (Chart.js Doughnut) com percentuais automáticos.
- **Gráfico Orçado vs. Realizado por Evento**: Gráfico de barras comparativo por evento cadastrado.
- **Funil de Parcerias**: Resumo visual dos status das parcerias (Em Negociação, Fechado, Entregue, Cancelado).

### 💰 Gestão de Orçamento
- **Itens Orçamentários**: Vinculação a evento e categoria.
- **Cálculo Automático**: Aplica taxa de câmbio USD->BRL do momento e recalcula saldo remanescente em tempo real com base nos lançamentos realizados.
- **Alertas Visuais**: Destaque em vermelho (`danger`) quando o valor realizado ultrapassa o teto orçado.

### 🧾 Lançamentos e Notas Fiscais
- **Filtros Avançados**: Busca combinada por Evento, Categoria, Status de Pagamento, Período de Datas e texto descritivo.
- **Comprovantes**: Upload de notas fiscais/recibos (PDF, PNG, JPEG) com pré-visualização e download direto.
- **Auditoria**: Registro automático do usuário responsável e data de lançamento.

### 🤝 Parcerias & Patrocínios
- **Tipos de Apoio**: Financeiro, Brindes/Swags, Espaço Físico, Divulgação e Mentoria.
- **Acompanhamento de Funil**: Gestão de contrapartidas, valores captados e brindes recebidos.

### 🎁 Brindes & Swags (Inventário)
- **Controle de Estoque**: Saldo em estoque calculado dinamicamente (`quantidade_recebida - quantidade_distribuida`).
- **Alerta de Estoque Crítico**: Indicador visual quando o saldo atinge 0 ou fica abaixo do mínimo configurado.

### ⚙️ Configurações & Parâmetros
- **Câmbio USD/BRL**: Atualização global da cotação com impacto nos cálculos orçamentários.
- **CRUD de Eventos**: Definição de datas, locais e status (Planejado, Em Andamento, Concluído).
- **CRUD de Categorias**: Cores personalizadas e descrições.
- **CRUD de Status Financeiro**: Personalização de badges e estados de pagamento.

### 👥 Gestão de Usuários (RBAC)
- Listagem de usuários registrados via Google.
- Promoção ou revogação do papel `ADMIN`.
- Ativação ou desativação de contas.

---

## 4. Design System & Identidade Visual

A interface segue a paleta e tipografia oficial do **AWS Student Builder Group**:

- **Cores Oficiais**:
  - `Navy Principal`: `#151D25` (Fundo e superfícies)
  - `Surface Dark`: `#1E2832` / `#263340` (Cards e modais)
  - `Amber / Laranja AWS`: `#FF9900` (Acentos e botões principais)
  - `Purple`: `#AC5BFF` (Destaques e métricas)
  - `Blue`: `#41B3FF` (Informativo e gráficos)
  - `Mint`: `#00E582` (Sucesso e saldos positivos)
  - `Magenta`: `#FF57E9` (Alertas e categorias)
- **Tipografia**: Amazon Ember Display (Fontes TTF integradas via `@font-face`).
- **Layout**: Cards com cantos arredondados (12px), sombras suaves, modais responsivos e tabelas dinâmicas.

---

## 5. Execução Local com Docker Compose

A forma mais rápida de subir toda a aplicação (PostgreSQL + Backend + Frontend/Nginx):

### 1. Clonar o repositório e preparar o `.env`
```bash
git clone https://github.com/seu-usuario/manager-financer.git
cd manager-financer
cp .env.example .env
```

### 2. Iniciar os contêineres
```bash
docker compose up -d --build
```

### 3. Acessar a aplicação
- **Frontend**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Health Check**: [http://localhost:8080/api/health](http://localhost:8080/api/health)

---

## 6. Execução em Desenvolvimento (Sem Docker)

### Backend (Spring Boot)
- **Requisitos**: JDK 21+ instalado.
```bash
cd backend
./mvnw clean spring-boot:run
```
*O backend iniciará na porta `8080` conectado ao PostgreSQL configurado em `backend/src/main/resources/application.properties`.*

### Frontend (Angular)
- **Requisitos**: Node.js 20+ e npm instalados.
```bash
cd frontend
npm install
npm start
```
*O frontend iniciará na porta `4200` com hot-reload habilitado em [http://localhost:4200](http://localhost:4200).*

---

## 7. Guia Completo de Deploy na AWS (Free Tier)

A aplicação foi rigorosamente projetada para operar dentro dos limites do **AWS Free Tier**:

```
                  ┌────────────────────────────────────────────────────────┐
                  │                    AWS EC2 t2.micro                    │
                  │              (1 vCPU / 1GB RAM + 2GB Swap)             │
                  │                                                        │
                  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ │
[Usuário / Web] ──┼─►│ Nginx Frontend│─┼► Spring Boot  │─┼► PostgreSQL  │ │
 (Porta 80/443)   │  │   (Porta 80)  │ │ (Porta 8080)  │ │ (Porta 5432)  │ │
                  │  └───────────────┘ └───────┬───────┘ └───────────────┘ │
                  │                            │                           │
                  └────────────────────────────┼───────────────────────────┘
                                               ▼
                                      ┌────────────────┐
                                      │ Amazon S3      │
                                      │ (Comprovantes) │
                                      └────────────────┘
```

### Passo 1: Criar a Instância EC2 (Ubuntu 24.04 / 22.04 LTS)
1. Acesse o **AWS Console -> EC2 -> Launch Instance**.
2. **Nome**: `aws-sbg-finance-server`.
3. **AMI**: `Ubuntu Server 24.04 LTS` (Free tier eligible).
4. **Tipo de Instância**: `t2.micro` (ou `t3.micro` em regiões que suportam).
5. **Key Pair**: Crie ou selecione seu par de chaves `.pem`.
6. **Armazenamento**: 20 GB gp3 (Free tier permite até 30 GB EBS).
7. **Security Group**:
   - Inbound Rule 1: SSH (`Port 22`) de seu IP ou `0.0.0.0/0`.
   - Inbound Rule 2: HTTP (`Port 80`) de `0.0.0.0/0`.
   - Inbound Rule 3: HTTPS (`Port 443`) de `0.0.0.0/0`.

### Passo 2: Configurar Memória Swap no EC2
Para garantir que a JVM e os contêineres rodem com folga no `1 GB` de RAM da instância:
```bash
ssh -i sua-chave.pem ubuntu@SEU_EC2_PUBLIC_IP

# Criar arquivo de Swap de 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Otimizar agressividade do swap
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

### Passo 3: Instalar Docker e Docker Compose no EC2
```bash
# Atualizar repositórios e instalar Docker
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker ubuntu
newgrp docker
```

### Passo 4: Configurar Bucket S3 para Comprovantes (Opcional)
1. Acesse o **AWS Console -> S3 -> Create bucket**.
2. Nome: `aws-sbg-finance-receipts-[seu-id]`.
3. Mantenha o bucket privado (o backend gera o acesso seguro via credenciais IAM).
4. Crie um usuário IAM no **AWS IAM -> Users** com permissão `AmazonS3FullAccess` (ou política restrita ao bucket) e gere uma Access Key & Secret Key.

### Passo 5: Clonar o Projeto e Rodar em Produção
```bash
git clone https://github.com/seu-usuario/manager-financer.git
cd manager-financer

# Criar o .env de produção
cp .env.example .env
nano .env # Preencha JWT_SECRET, GOOGLE_CLIENT_ID, INITIAL_ADMIN_EMAIL, etc.

# Subir com o perfil de produção
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 8. Configuração de Autenticação Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto (ex: `AWS SBG Finance`).
3. Em **APIs & Services -> OAuth consent screen**:
   - Selecione **External** (ou Internal se tiver Google Workspace institucional).
   - Preencha o nome da aplicação e o e-mail de suporte.
4. Em **APIs & Services -> Credentials**:
   - Clique em **Create Credentials -> OAuth client ID**.
   - Tipo de aplicação: **Web application**.
   - **Authorized JavaScript origins**: `http://localhost`, `http://localhost:4200`, `http://SEU_EC2_IP_OU_DOMINIO`.
   - **Authorized redirect URIs**: `http://localhost`, `http://SEU_EC2_IP_OU_DOMINIO`.
5. Copie o **Client ID** gerado e configure no `.env` (`GOOGLE_CLIENT_ID`) e no frontend.

---

## 9. Primeiro Acesso e Permissões de Administrador

1. No arquivo `.env`, defina a variável:
   ```env
   INITIAL_ADMIN_EMAIL=seu-email@gmail.com
   ```
2. Ao realizar o primeiro login com essa conta Google, o sistema automaticamente atribuirá o papel `ADMIN`.
3. Alternativamente, você pode promover qualquer usuário diretamente pelo banco de dados:
   ```bash
   docker exec -it finance-postgres psql -U postgres -d finance_db -c "UPDATE usuarios SET papel = 'ADMIN' WHERE email = 'seu-email@gmail.com';"
   ```
4. Com a conta `ADMIN`, você terá acesso total ao menu **Usuários** para promover ou rebaixar outros membros pela própria interface gráfica.

---

## 10. Pipeline CI/CD com GitHub Actions

O repositório já inclui a pipeline em `.github/workflows/ci-cd.yml` que executa:
1. Compilação e testes unitários do Backend (Java 21 / Maven).
2. Lint e build de produção do Frontend (Angular 21).
3. Verificação de build dos contêineres Docker.
4. Deploy automatizado via SSH no EC2 em cada push na branch `main`.

### Secrets do GitHub necessários:
Em **Settings -> Secrets and variables -> Actions**, configure:
- `EC2_HOST`: IP Público ou DNS da instância EC2.
- `EC2_USER`: `ubuntu`.
- `EC2_SSH_KEY`: Conteúdo da sua chave privada `.pem`.
- `EC2_PORT`: `22` (padrão).

---

## 11. Documentação da API (Swagger/OpenAPI)

A documentação interativa de todos os endpoints REST está disponível no backend através do SpringDoc OpenAPI:

- **Swagger UI interativo**: `http://localhost:8080/swagger-ui.html` (ou no IP do servidor).
- **Especificação OpenAPI JSON**: `http://localhost:8080/api/v3/api-docs`.

---

## 📄 Licença

Este projeto é desenvolvido para o **AWS Student Builder Group** sob a licença [MIT](LICENSE).

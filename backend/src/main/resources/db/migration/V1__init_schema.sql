-- ==========================================================
-- Schema Inicial: Gestão Financeira AWS Student Builder Group
-- ==========================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    google_sub VARCHAR(255) UNIQUE,
    papel VARCHAR(50) NOT NULL DEFAULT 'VIEWER',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANEJADO',
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categorias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao VARCHAR(500),
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS status_financeiro (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    cor_badge VARCHAR(50) DEFAULT '#41B3FF'
);

CREATE TABLE IF NOT EXISTS configuracao_global (
    id BIGSERIAL PRIMARY KEY,
    taxa_cambio_usd_brl NUMERIC(10, 4) NOT NULL DEFAULT 5.5000,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_por VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS itens_orcamento (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    categoria_id BIGINT NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    valor_orcado_usd NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    taxa_cambio_usada NUMERIC(10, 4) NOT NULL DEFAULT 5.5000,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_evento_categoria UNIQUE (evento_id, categoria_id)
);

CREATE TABLE IF NOT EXISTS lancamentos (
    id BIGSERIAL PRIMARY KEY,
    data DATE NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    fornecedor VARCHAR(255) NOT NULL,
    numero_nota_fiscal VARCHAR(100),
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE RESTRICT,
    categoria_id BIGINT NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    valor_usd NUMERIC(15, 2) DEFAULT 0.00,
    valor_brl NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    forma_pagamento VARCHAR(100) NOT NULL,
    status_id BIGINT REFERENCES status_financeiro(id) ON DELETE RESTRICT,
    responsavel_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    anexo_url VARCHAR(1000),
    anexo_nome_original VARCHAR(255),
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parcerias (
    id BIGSERIAL PRIMARY KEY,
    parceiro VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL, -- Financeira, Brinde, Permuta, Apoio institucional
    valor_contrapartida NUMERIC(15, 2) DEFAULT 0.00,
    itens_recebidos TEXT,
    evento_id BIGINT REFERENCES eventos(id) ON DELETE SET NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'NEGOCIACAO', -- NEGOCIACAO, FECHADO, ENTREGUE, CANCELADO
    contato VARCHAR(255),
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brindes (
    id BIGSERIAL PRIMARY KEY,
    item VARCHAR(255) NOT NULL,
    origem_parceria_id BIGINT REFERENCES parcerias(id) ON DELETE SET NULL,
    qtd_recebida INTEGER NOT NULL DEFAULT 0,
    qtd_distribuida INTEGER NOT NULL DEFAULT 0,
    evento_distribuicao_id BIGINT REFERENCES eventos(id) ON DELETE SET NULL,
    data_distribuicao DATE,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_lancamentos_evento ON lancamentos(evento_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_categoria ON lancamentos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data);
CREATE INDEX IF NOT EXISTS idx_itens_orcamento_evento ON itens_orcamento(evento_id);
CREATE INDEX IF NOT EXISTS idx_brindes_parceria ON brindes(origem_parceria_id);

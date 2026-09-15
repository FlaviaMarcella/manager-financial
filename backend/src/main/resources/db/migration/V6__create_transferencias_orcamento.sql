-- ==========================================================
-- Tabela de Histórico e Auditoria de Transferência de Orçamento
-- ==========================================================
CREATE TABLE IF NOT EXISTS transferencias_orcamento (
    id BIGSERIAL PRIMARY KEY,
    evento_origem_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    categoria_origem_id BIGINT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    evento_destino_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    categoria_destino_id BIGINT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    valor_usd DECIMAL(12, 2) NOT NULL,
    taxa_cambio DECIMAL(10, 4) NOT NULL,
    valor_brl DECIMAL(12, 2) NOT NULL,
    motivo TEXT,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transf_evento_origem ON transferencias_orcamento(evento_origem_id);
CREATE INDEX IF NOT EXISTS idx_transf_evento_destino ON transferencias_orcamento(evento_destino_id);
CREATE INDEX IF NOT EXISTS idx_transf_criado_em ON transferencias_orcamento(criado_em);

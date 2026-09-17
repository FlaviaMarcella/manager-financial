-- V8: Criar tabela para múltiplos anexos de lançamentos/notas fiscais
CREATE TABLE IF NOT EXISTS lancamento_anexos (
    id BIGSERIAL PRIMARY KEY,
    lancamento_id BIGINT NOT NULL REFERENCES lancamentos(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    tamanho_bytes BIGINT,
    content_type VARCHAR(100),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lancamento_anexos_lancamento_id ON lancamento_anexos(lancamento_id);

-- Migrar anexos existentes da tabela lancamentos para a tabela lancamento_anexos
INSERT INTO lancamento_anexos (lancamento_id, url, nome_original, criado_em)
SELECT id, anexo_url, COALESCE(anexo_nome_original, 'comprovante'), criado_em
FROM lancamentos
WHERE anexo_url IS NOT NULL AND anexo_url <> '';

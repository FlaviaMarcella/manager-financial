-- ==========================================================
-- Migration V9: Permitir múltiplos orçamentos/aportes por evento
-- e adicionar campo de descrição/título do aporte
-- ==========================================================

-- 1. Remove restrição de unicidade (evento_id, categoria_id)
ALTER TABLE itens_orcamento DROP CONSTRAINT IF EXISTS uk_evento_categoria;

-- 2. Adiciona coluna opcional descricao para identificar o aporte/origem do recurso
ALTER TABLE itens_orcamento ADD COLUMN IF NOT EXISTS descricao VARCHAR(255);

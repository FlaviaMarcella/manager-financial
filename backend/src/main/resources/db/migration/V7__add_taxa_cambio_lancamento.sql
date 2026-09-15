-- V7: Adicionar taxa_cambio_usada na tabela lancamentos
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS taxa_cambio_usada DECIMAL(10,4) DEFAULT 5.5000;

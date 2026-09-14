-- Atualizar valores legados de tipo_parceria para maiúsculas (compatibilidade enum)
UPDATE parcerias SET tipo = 'FINANCEIRA' WHERE UPPER(tipo) = 'FINANCEIRA';
UPDATE parcerias SET tipo = 'BRINDE' WHERE UPPER(tipo) = 'BRINDE';
UPDATE parcerias SET tipo = 'PERMUTA' WHERE UPPER(tipo) = 'PERMUTA';
UPDATE parcerias SET tipo = 'APOIO_INSTITUCIONAL' WHERE UPPER(tipo) = 'APOIO_INSTITUCIONAL';

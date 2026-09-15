-- ==========================================================
-- Promove e garante permissões de ADMIN ao e-mail oficial
-- ==========================================================
UPDATE usuarios 
SET papel = 'ADMIN', status = 'APROVADO', ativo = TRUE 
WHERE LOWER(email) = 'studentbuildergroup@gmail.com';

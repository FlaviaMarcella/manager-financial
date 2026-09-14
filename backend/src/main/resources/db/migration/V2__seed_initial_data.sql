-- ==========================================================
-- Carga Inicial de Dados: AWS Student Builder Group
-- ==========================================================

-- Configuração Global de Câmbio (USD -> BRL)
INSERT INTO configuracao_global (id, taxa_cambio_usd_brl, atualizado_em, atualizado_por)
VALUES (1, 5.5000, CURRENT_TIMESTAMP, 'sistema')
ON CONFLICT (id) DO NOTHING;

-- Status Financeiros Padrão
INSERT INTO status_financeiro (id, nome, cor_badge) VALUES
(1, 'Pago', '#00E582'),
(2, 'Pendente', '#FF9900'),
(3, 'Atrasado', '#FF57E9'),
(4, 'Reembolsado', '#41B3FF')
ON CONFLICT (id) DO NOTHING;

-- Categorias de Despesas
INSERT INTO categorias (id, nome, descricao) VALUES
(1, 'Coffe Break & Alimentação', 'Despesas com lanches, bebidas e refeições em eventos'),
(2, 'Swag & Brindes', 'Produção de camisetas, adesivos, canecas e brindes personalizados'),
(3, 'Infraestrutura & Espaço', 'Locação de salas, projetores, som e materiais de apoio'),
(4, 'Marketing & Divulgação', 'Banners, flyers, anúncios e artes gráficas'),
(5, 'Premiações & Hackathons', 'Prêmios, medalhas e vouchers para participantes'),
(6, 'Transporte & Logística', 'Deslocamento de palestrantes e envio de materiais')
ON CONFLICT (id) DO NOTHING;

-- Eventos Iniciais
INSERT INTO eventos (id, nome, data, status) VALUES
(1, 'AWS Community Day 2026', '2026-10-15', 'PLANEJADO'),
(2, 'Workshop Cloud Practitioner Hands-on', '2026-08-20', 'CONCLUIDO'),
(3, 'Hackathon Serverless Challenge', '2026-11-05', 'PLANEJADO'),
(4, 'Meetup: Introdução a IA Generativa na AWS', '2026-09-02', 'CONCLUIDO')
ON CONFLICT (id) DO NOTHING;

-- Usuário Administrador Inicial Padrão
INSERT INTO usuarios (id, nome, email, google_sub, papel, ativo) VALUES
(1, 'Admin Student Builder', 'admin@studentbuilder.aws', 'demo-admin-sub', 'ADMIN', TRUE),
(2, 'Membro Equipe Demo', 'member@studentbuilder.aws', 'demo-member-sub', 'VIEWER', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Linhas de Orçamento
INSERT INTO itens_orcamento (id, evento_id, categoria_id, valor_orcado_usd, taxa_cambio_usada, observacoes) VALUES
(1, 1, 1, 400.00, 5.5000, 'Alimentação para 150 pessoas no Community Day'),
(2, 1, 2, 600.00, 5.5000, 'Kits de boas-vindas e camisetas'),
(3, 1, 3, 300.00, 5.5000, 'Equipamentos audiovisuais'),
(4, 2, 1, 100.00, 5.5000, 'Café para 40 participantes'),
(5, 2, 2, 150.00, 5.5000, 'Adesivos e canetas'),
(6, 3, 5, 800.00, 5.5000, 'Prêmios para 1º, 2º e 3º lugar do Hackathon')
ON CONFLICT (id) DO NOTHING;

-- Lançamentos Realizados
INSERT INTO lancamentos (id, data, descricao, fornecedor, numero_nota_fiscal, evento_id, categoria_id, valor_usd, valor_brl, forma_pagamento, status_id, responsavel_id, observacoes) VALUES
(1, '2026-08-18', 'Coffee Break workshop presencial', 'Padaria & Buffet Central', 'NF-10492', 2, 1, 95.00, 522.50, 'PIX', 1, 1, 'Coffee break entregue no horário'),
(2, '2026-08-10', 'Adesivos personalizados AWS Student Builder', 'Gráfica Rápida Express', 'NF-8921', 2, 2, 120.00, 660.00, 'Cartão de Crédito', 1, 1, '500 adesivos holográficos'),
(3, '2026-09-01', 'Lanches para o Meetup IA Generativa', 'Lanches & Cia', 'NF-11203', 4, 1, 80.00, 440.00, 'PIX', 1, 1, 'Salgados e refrigerantes'),
(4, '2026-09-10', 'Camisetas para o Community Day (Sinal 50%)', 'Confecções Estilo', 'NF-5541', 1, 2, 250.00, 1375.00, 'Boleto', 1, 1, 'Primeira parcela paga')
ON CONFLICT (id) DO NOTHING;

-- Parcerias
INSERT INTO parcerias (id, parceiro, tipo, valor_contrapartida, itens_recebidos, evento_id, status, contato, observacoes) VALUES
(1, 'CloudTech Solutions', 'FINANCEIRA', 2500.00, 'Logo em todos os materiais e banner no palco', 1, 'FECHADO', 'contato@cloudtech.com.br', 'Patrocínio cota Ouro'),
(2, 'Editora Novatec / Livros Tech', 'BRINDE', 0.00, '15 livros de AWS e Arquitetura Cloud', 3, 'FECHADO', 'parcerias@editoratech.com', 'Para premiação do Hackathon'),
(3, 'Coworking Hub Innovation', 'PERMUTA', 0.00, 'Espaço gratuito para o evento presencial', 1, 'ENTREGUE', 'eventos@hubinnovation.com', 'Sala principal para 200 pessoas')
ON CONFLICT (id) DO NOTHING;

-- Brindes
INSERT INTO brindes (id, item, origem_parceria_id, qtd_recebida, qtd_distribuida, evento_distribuicao_id, data_distribuicao, observacoes) VALUES
(1, 'Camisetas AWS Student Builder', NULL, 150, 40, 2, '2026-08-20', 'Distribuídas no Workshop'),
(2, 'Adesivos Holográficos Logo', NULL, 500, 150, 2, '2026-08-20', 'Restam 350 para os próximos eventos'),
(3, 'Livros de Arquitetura Cloud', 2, 15, 0, 3, '2026-11-05', 'Guardados para premiação do Hackathon')
ON CONFLICT (id) DO NOTHING;

-- Ajustar sequências do PostgreSQL para novos registros
SELECT setval('usuarios_id_seq', (SELECT COALESCE(MAX(id), 1) FROM usuarios));
SELECT setval('eventos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM eventos));
SELECT setval('categorias_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categorias));
SELECT setval('status_financeiro_id_seq', (SELECT COALESCE(MAX(id), 1) FROM status_financeiro));
SELECT setval('configuracao_global_id_seq', (SELECT COALESCE(MAX(id), 1) FROM configuracao_global));
SELECT setval('itens_orcamento_id_seq', (SELECT COALESCE(MAX(id), 1) FROM itens_orcamento));
SELECT setval('lancamentos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM lancamentos));
SELECT setval('parcerias_id_seq', (SELECT COALESCE(MAX(id), 1) FROM parcerias));
SELECT setval('brindes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM brindes));

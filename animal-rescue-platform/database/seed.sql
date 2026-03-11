-- =============================================================================
-- seed.sql – ResgatePet
-- Dados iniciais de desenvolvimento e demonstração.
-- NÃO executar em produção sem revisar os dados.
--
-- Para aplicar:
--   psql -U postgres -d resgatepet -f database/seed.sql
--
-- Pré-requisito: schema.sql já aplicado.
-- As senhas abaixo são o hash bcrypt de "senha123" (custo 10).
-- =============================================================================

-- Limpa dados existentes respeitando a ordem das FK (do filho para o pai)
TRUNCATE TABLE
  case_updates,
  rescue_images,
  rescue_cases,
  animals,
  organizations,
  users
RESTART IDENTITY CASCADE;

-- =============================================================================
-- USUÁRIOS
-- =============================================================================

INSERT INTO users (name, email, password_hash, phone, role) VALUES
  -- Administrador do sistema
  ('Admin ResgatePet',
   'admin@resgatepet.com',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   '11999990000',
   'admin'),

  -- Voluntária
  ('Maria Silva',
   'maria@voluntaria.com',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   '11988880001',
   'volunteer'),

  -- Veterinário
  ('Dr. Carlos Souza',
   'carlos@veterinario.com',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   '11977770002',
   'veterinarian'),

  -- Voluntário
  ('João Voluntário',
   'joao@voluntario.com',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   '11966660003',
   'volunteer');

-- =============================================================================
-- ORGANIZAÇÕES
-- =============================================================================

INSERT INTO organizations (name, description, city, state) VALUES
  ('ONG Patas Livres',
   'ONG dedicada ao resgate e adoção de cães e gatos abandonados em São Paulo.',
   'São Paulo',
   'SP'),

  ('Grupo Resgate Animal Santos',
   'Grupo voluntário de resgate na Baixada Santista.',
   'Santos',
   'SP'),

  ('Instituto Vida Animal',
   'Instituto focado em reabilitação de animais silvestres e domésticos.',
   'Campinas',
   'SP');

-- =============================================================================
-- ANIMAIS
-- =============================================================================

INSERT INTO animals (species, breed, color, estimated_age, gender, description) VALUES
  ('dog', 'SRD',      'caramelo',          '2 anos',   'male',    'Animal dócil, com ferimento na pata dianteira direita.'),
  ('cat', 'Siamês',   'branco e cinza',    '1 ano',    'female',  'Gata muito assustada, possível maus-tratos.'),
  ('dog', 'Labrador', 'amarelo',           'filhote',  'male',    'Filhote encontrado sozinho, aparentemente saudável.'),
  ('cat', 'SRD',      'preto',             '3 anos',   'unknown', 'Gato com sarna generalizada.'),
  ('dog', 'Pitbull',  'branco com manchas','adulto',   'female',  'Cadela gestante encontrada em terreno baldio.');

-- =============================================================================
-- OCORRÊNCIAS DE RESGATE
-- =============================================================================

INSERT INTO rescue_cases
  (animal_id, reported_by, organization_id, status, priority,
   location_description, latitude, longitude)
VALUES
  -- Caso 1: cão com ferimento – em resgate (alta prioridade)
  (1, 2, 1, 'in_rescue', 'high',
   'Av. Paulista, próximo ao número 1500, São Paulo – SP',
   -23.5613,  -46.6558),

  -- Caso 2: gata assustada – aguardando resgate
  (2, 2, 1, 'awaiting_rescue', 'medium',
   'Rua Augusta, 300, Consolação, São Paulo – SP',
   -23.5529,  -46.6546),

  -- Caso 3: filhote de labrador – em tratamento
  (3, 4, 2, 'under_treatment', 'low',
   'Praça da República, Santos – SP',
   -23.9608,  -46.3336),

  -- Caso 4: gato com sarna – apenas registrado
  (4, 4, NULL, 'reported', 'medium',
   'Vila Madalena, São Paulo – SP',
   -23.5563,  -46.6922),

  -- Caso 5: cadela gestante – resolvido
  (5, 2, 3, 'resolved', 'critical',
   'Rodovia Anhanguera, km 94, Campinas – SP',
   -22.9105,  -47.0630);

-- =============================================================================
-- IMAGENS DAS OCORRÊNCIAS
-- (URLs de placeholder – substituir por uploads reais)
-- =============================================================================

INSERT INTO rescue_images (rescue_case_id, image_url) VALUES
  (1, '/uploads/cases/1/foto1.jpg'),
  (1, '/uploads/cases/1/foto2.jpg'),
  (2, '/uploads/cases/2/foto1.jpg'),
  (3, '/uploads/cases/3/foto1.jpg'),
  (5, '/uploads/cases/5/foto1.jpg'),
  (5, '/uploads/cases/5/foto2.jpg');

-- =============================================================================
-- HISTÓRICO DE ATUALIZAÇÕES
-- =============================================================================

INSERT INTO case_updates (rescue_case_id, updated_by, status, notes) VALUES
  -- Caso 1: registrado → em resgate
  (1, 2, 'reported',    'Ocorrência reportada por voluntária Maria.'),
  (1, 2, 'awaiting_rescue', 'Aguardando equipe disponível da ONG Patas Livres.'),
  (1, 1, 'in_rescue',   'Equipe da ONG em deslocamento para o local.'),

  -- Caso 2: registrado → aguardando
  (2, 2, 'reported',    'Gata avistada várias vezes no mesmo local.'),
  (2, 2, 'awaiting_rescue', 'Armadilha humanitária instalada no local.'),

  -- Caso 3: registrado → em tratamento
  (3, 4, 'reported',    'Filhote encontrado por João voluntário.'),
  (3, 3, 'under_treatment', 'Dr. Carlos iniciou protocolo de vacinação e vermifugação.'),

  -- Caso 4: apenas registrado
  (4, 4, 'reported',    'Gato com sarna observado na calçada.'),

  -- Caso 5: completo até resolução
  (5, 2, 'reported',    'Cadela gestante em terreno baldio, sinais de desnutrição.'),
  (5, 1, 'awaiting_rescue', 'Prioridade máxima – cadela gestante vulnerável.'),
  (5, 1, 'in_rescue',   'Equipe do Instituto Vida Animal no local.'),
  (5, 3, 'under_treatment', 'Cadela sob cuidados veterinários, parto assistido.'),
  (5, 3, 'resolved',    'Cadela e filhotes saudáveis. Encaminhados para adoção.');

-- =============================================================================
-- schema.sql – ResgatePet
-- Schema completo e consolidado do banco de dados.
-- Equivale a executar todas as migrações (001 a 006) em sequência.
--
-- Para aplicar:
--   psql -U postgres -d resgatepet -f database/schema.sql
--
-- Ordem de criação respeitando as dependências entre tabelas:
--   1. users
--   2. organizations
--   3. animals
--   4. rescue_cases  (depende de users, organizations, animals)
--   5. rescue_images (depende de rescue_cases)
--   6. case_updates  (depende de rescue_cases, users)
-- =============================================================================

-- Garante que o script pode ser executado múltiplas vezes sem erros
-- (todas as instruções usam IF NOT EXISTS / OR REPLACE)

-- =============================================================================
-- TIPOS ENUMERADOS
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'volunteer', 'veterinarian');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE animal_species AS ENUM ('dog', 'cat', 'bird', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE animal_gender AS ENUM ('male', 'female', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE case_status AS ENUM (
    'reported',
    'awaiting_rescue',
    'in_rescue',
    'under_treatment',
    'resolved'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- FUNÇÃO UTILITÁRIA – updated_at automático
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABELA: users
-- Todos os usuários do sistema, independente do papel.
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL        PRIMARY KEY,
  name          VARCHAR(150)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  phone         VARCHAR(20),
  role          user_role     NOT NULL DEFAULT 'volunteer',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE  users               IS 'Usuários do sistema (voluntários, veterinários e admins)';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt – nunca armazenar texto puro';
COMMENT ON COLUMN users.role          IS 'Papel: admin | volunteer | veterinarian';

-- =============================================================================
-- TABELA: organizations
-- ONGs e grupos de resgate animal.
-- =============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id          SERIAL        PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  description TEXT,
  city        VARCHAR(100),
  state       CHAR(2),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_name  ON organizations (name);
CREATE INDEX IF NOT EXISTS idx_organizations_city  ON organizations (city);
CREATE INDEX IF NOT EXISTS idx_organizations_state ON organizations (state);

COMMENT ON TABLE organizations IS 'ONGs e grupos de resgate animal';

-- =============================================================================
-- TABELA: animals
-- Informações do animal resgatado.
-- =============================================================================

CREATE TABLE IF NOT EXISTS animals (
  id            SERIAL          PRIMARY KEY,
  species       animal_species  NOT NULL,
  breed         VARCHAR(100),
  color         VARCHAR(100),
  estimated_age VARCHAR(50),
  gender        animal_gender   NOT NULL DEFAULT 'unknown',
  description   TEXT,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_animals_species ON animals (species);

COMMENT ON TABLE  animals               IS 'Animais cadastrados no sistema de resgate';
COMMENT ON COLUMN animals.species       IS 'Espécie: dog | cat | bird | other';
COMMENT ON COLUMN animals.estimated_age IS 'Idade estimada em texto livre (ex.: "2 anos", "filhote")';

-- =============================================================================
-- TABELA: rescue_cases
-- Ocorrência central do sistema. Liga animal, usuário e organização.
-- =============================================================================

CREATE TABLE IF NOT EXISTS rescue_cases (
  id                   SERIAL          PRIMARY KEY,

  animal_id            INTEGER         NOT NULL
                         REFERENCES animals(id)       ON DELETE RESTRICT,

  reported_by          INTEGER         NOT NULL
                         REFERENCES users(id)         ON DELETE RESTRICT,

  organization_id      INTEGER
                         REFERENCES organizations(id) ON DELETE SET NULL,

  status               case_status     NOT NULL DEFAULT 'reported',
  priority             case_priority   NOT NULL DEFAULT 'medium',

  location_description TEXT,
  latitude             DECIMAL(10, 7),
  longitude            DECIMAL(10, 7),

  created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rescue_cases_status      ON rescue_cases (status);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_priority    ON rescue_cases (priority);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_animal_id   ON rescue_cases (animal_id);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_reported_by ON rescue_cases (reported_by);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_org_id      ON rescue_cases (organization_id);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_created_at  ON rescue_cases (created_at DESC);

DROP TRIGGER IF EXISTS trg_rescue_cases_updated_at ON rescue_cases;
CREATE TRIGGER trg_rescue_cases_updated_at
  BEFORE UPDATE ON rescue_cases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE  rescue_cases          IS 'Ocorrências de resgate animal – entidade central do sistema';
COMMENT ON COLUMN rescue_cases.status   IS 'reported|awaiting_rescue|in_rescue|under_treatment|resolved';
COMMENT ON COLUMN rescue_cases.priority IS 'Prioridade: low|medium|high|critical';
COMMENT ON COLUMN rescue_cases.latitude IS 'Latitude WGS84';
COMMENT ON COLUMN rescue_cases.longitude IS 'Longitude WGS84';

-- =============================================================================
-- TABELA: rescue_images
-- Fotos associadas a uma ocorrência.
-- =============================================================================

CREATE TABLE IF NOT EXISTS rescue_images (
  id              SERIAL      PRIMARY KEY,
  rescue_case_id  INTEGER     NOT NULL
                    REFERENCES rescue_cases(id) ON DELETE CASCADE,
  image_url       TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rescue_images_case_id ON rescue_images (rescue_case_id);

COMMENT ON TABLE  rescue_images               IS 'Fotos das ocorrências de resgate';
COMMENT ON COLUMN rescue_images.image_url     IS 'Caminho relativo ou URL pública da imagem';

-- =============================================================================
-- TABELA: case_updates
-- Histórico imutável de mudanças de status de uma ocorrência.
-- =============================================================================

CREATE TABLE IF NOT EXISTS case_updates (
  id              SERIAL      PRIMARY KEY,
  rescue_case_id  INTEGER     NOT NULL
                    REFERENCES rescue_cases(id) ON DELETE CASCADE,
  updated_by      INTEGER     NOT NULL
                    REFERENCES users(id)        ON DELETE RESTRICT,
  status          case_status NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_updates_case_id    ON case_updates (rescue_case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_updates_updated_by ON case_updates (updated_by);

COMMENT ON TABLE  case_updates            IS 'Histórico imutável de mudanças de status das ocorrências';
COMMENT ON COLUMN case_updates.notes      IS 'Observações livres do voluntário ou veterinário';
COMMENT ON COLUMN case_updates.created_at IS 'Imutável após inserção – representa o momento exato da mudança';

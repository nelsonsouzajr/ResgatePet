-- =============================================================================
-- Migration 001 – Tabela users
-- Armazena todos os usuários do sistema independente do papel (role).
-- Papéis possíveis: admin | volunteer | veterinarian
-- =============================================================================

-- Extensão para geração de UUIDs (opcional, mantemos SERIAL por simplicidade)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tipo enumerado para papéis de usuário
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'volunteer', 'veterinarian');
EXCEPTION
  WHEN duplicate_object THEN NULL; -- ignora se já existir
END $$;

-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL          PRIMARY KEY,

  -- Dados pessoais
  name          VARCHAR(150)    NOT NULL,
  email         VARCHAR(255)    NOT NULL UNIQUE,

  -- Autenticação – senha armazenada como hash bcrypt (nunca texto puro)
  password_hash VARCHAR(255)    NOT NULL,

  phone         VARCHAR(20),

  -- Papel do usuário no sistema
  role          user_role       NOT NULL DEFAULT 'volunteer',

  -- Controle de tempo
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Índices
-- -----------------------------------------------------------------------------

-- Busca rápida por e-mail (login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Filtro por papel (listar voluntários, veterinários, etc.)
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- -----------------------------------------------------------------------------
-- Função + Trigger: atualiza updated_at automaticamente a cada UPDATE
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- Comentários de documentação inline no banco
-- -----------------------------------------------------------------------------

COMMENT ON TABLE  users               IS 'Usuários do sistema (voluntários, veterinários e admins)';
COMMENT ON COLUMN users.id            IS 'Identificador único auto-incremental';
COMMENT ON COLUMN users.email         IS 'E-mail de login – deve ser único';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt da senha – nunca armazenar texto puro';
COMMENT ON COLUMN users.role          IS 'Papel do usuário: admin | volunteer | veterinarian';

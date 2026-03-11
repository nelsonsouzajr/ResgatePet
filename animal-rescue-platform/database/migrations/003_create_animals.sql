-- =============================================================================
-- Migration 003 – Tabela animals
-- Armazena informações sobre o animal resgatado.
-- Um animal pode estar associado a mais de um caso ao longo do tempo
-- (ex.: resgatado, solto, resgatado novamente).
-- =============================================================================

-- Tipos enumerados para espécie e gênero do animal
DO $$ BEGIN
  CREATE TYPE animal_species AS ENUM ('dog', 'cat', 'bird', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE animal_gender AS ENUM ('male', 'female', 'unknown');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS animals (
  id            SERIAL          PRIMARY KEY,

  -- Características do animal
  species       animal_species  NOT NULL,
  breed         VARCHAR(100),           -- raça; NULL ou "SRD" se indefinida
  color         VARCHAR(100),           -- cores predominantes da pelagem
  estimated_age VARCHAR(50),            -- ex.: "2 anos", "filhote", "adulto"
  gender        animal_gender   NOT NULL DEFAULT 'unknown',

  -- Observações livres sobre o estado do animal
  description   TEXT,

  -- Controle de tempo
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Índices
-- -----------------------------------------------------------------------------

-- Filtro por espécie (cão, gato, etc.) – uso frequente nas telas de listagem
CREATE INDEX IF NOT EXISTS idx_animals_species ON animals (species);

-- -----------------------------------------------------------------------------
-- Comentários inline
-- -----------------------------------------------------------------------------

COMMENT ON TABLE  animals               IS 'Animais cadastrados no sistema de resgate';
COMMENT ON COLUMN animals.id            IS 'Identificador único auto-incremental';
COMMENT ON COLUMN animals.species       IS 'Espécie: dog | cat | bird | other';
COMMENT ON COLUMN animals.breed         IS 'Raça do animal; "SRD" para sem raça definida';
COMMENT ON COLUMN animals.color         IS 'Cores predominantes (ex.: caramelo, preto e branco)';
COMMENT ON COLUMN animals.estimated_age IS 'Idade estimada em formato textual livre';
COMMENT ON COLUMN animals.gender        IS 'Sexo: male | female | unknown';
COMMENT ON COLUMN animals.description   IS 'Observações gerais sobre o animal (estado de saúde, comportamento)';

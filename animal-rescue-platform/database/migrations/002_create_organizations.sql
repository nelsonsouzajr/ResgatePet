-- =============================================================================
-- Migration 002 – Tabela organizations
-- Representa ONGs, grupos de resgate ou entidades de proteção animal.
-- Uma organização pode gerenciar múltiplos casos de resgate.
-- =============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id          SERIAL        PRIMARY KEY,

  -- Identificação
  name        VARCHAR(150)  NOT NULL,
  description TEXT,

  -- Localização da organização
  city        VARCHAR(100),
  state       CHAR(2),        -- UF brasileira (SP, RJ, MG, ...)

  -- Controle de tempo
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Índices
-- -----------------------------------------------------------------------------

-- Busca textual por nome de organização
CREATE INDEX IF NOT EXISTS idx_organizations_name  ON organizations (name);

-- Filtro geográfico por cidade/estado
CREATE INDEX IF NOT EXISTS idx_organizations_city  ON organizations (city);
CREATE INDEX IF NOT EXISTS idx_organizations_state ON organizations (state);

-- -----------------------------------------------------------------------------
-- Comentários inline
-- -----------------------------------------------------------------------------

COMMENT ON TABLE  organizations             IS 'ONGs e grupos de resgate animal';
COMMENT ON COLUMN organizations.id          IS 'Identificador único auto-incremental';
COMMENT ON COLUMN organizations.name        IS 'Nome oficial da organização';
COMMENT ON COLUMN organizations.description IS 'Breve descrição das atividades da ONG';
COMMENT ON COLUMN organizations.city        IS 'Cidade principal de atuação';
COMMENT ON COLUMN organizations.state       IS 'UF de atuação (2 caracteres, ex.: SP)';

-- =============================================================================
-- Migration 004 – Tabela rescue_cases
-- Entidade central do sistema: cada linha representa uma ocorrência de resgate.
-- Liga animal (animals), usuário que reportou (users) e organização responsável
-- (organizations). Mantém status e localização geográfica.
--
-- Dependências: users, organizations, animals (executar migrações 001-003 antes)
-- =============================================================================

-- Tipo enumerado para status da ocorrência
DO $$ BEGIN
  CREATE TYPE case_status AS ENUM (
    'reported',         -- registrado, aguardando triagem
    'awaiting_rescue',  -- triado, aguardando equipe
    'in_rescue',        -- equipe em deslocamento ou realizando o resgate
    'under_treatment',  -- animal em tratamento veterinário
    'resolved'          -- caso encerrado
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Tipo enumerado para prioridade
DO $$ BEGIN
  CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rescue_cases (
  id                   SERIAL          PRIMARY KEY,

  -- ── Relacionamentos ────────────────────────────────────────────────────────
  -- Animal envolvido na ocorrência (obrigatório)
  animal_id            INTEGER         NOT NULL
                         REFERENCES animals(id)
                         ON DELETE RESTRICT,   -- impede remover animal com casos

  -- Usuário que registrou a ocorrência (obrigatório)
  reported_by          INTEGER         NOT NULL
                         REFERENCES users(id)
                         ON DELETE RESTRICT,

  -- Organização responsável pelo atendimento (opcional)
  organization_id      INTEGER
                         REFERENCES organizations(id)
                         ON DELETE SET NULL,   -- caso permanece se ONG for removida

  -- ── Status e Prioridade ────────────────────────────────────────────────────
  status               case_status     NOT NULL DEFAULT 'reported',
  priority             case_priority   NOT NULL DEFAULT 'medium',

  -- ── Localização ───────────────────────────────────────────────────────────
  location_description TEXT,                   -- endereço textual livre
  latitude             DECIMAL(10, 7),         -- coordenada geográfica
  longitude            DECIMAL(10, 7),         -- coordenada geográfica

  -- ── Controle de Tempo ─────────────────────────────────────────────────────
  created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Índices – cobrem os filtros mais comuns da interface
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_rescue_cases_status       ON rescue_cases (status);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_priority     ON rescue_cases (priority);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_animal_id    ON rescue_cases (animal_id);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_reported_by  ON rescue_cases (reported_by);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_org_id       ON rescue_cases (organization_id);

-- Índice composto para ordenação por criação (paginação eficiente)
CREATE INDEX IF NOT EXISTS idx_rescue_cases_created_at   ON rescue_cases (created_at DESC);

-- -----------------------------------------------------------------------------
-- Trigger: atualiza updated_at automaticamente
-- (reutiliza a função set_updated_at() criada na migration 001)
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_rescue_cases_updated_at ON rescue_cases;
CREATE TRIGGER trg_rescue_cases_updated_at
  BEFORE UPDATE ON rescue_cases
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- Comentários inline
-- -----------------------------------------------------------------------------

COMMENT ON TABLE  rescue_cases                    IS 'Ocorrências de resgate animal – entidade central do sistema';
COMMENT ON COLUMN rescue_cases.id                 IS 'Identificador único auto-incremental';
COMMENT ON COLUMN rescue_cases.animal_id          IS 'FK para animals.id – animal envolvido';
COMMENT ON COLUMN rescue_cases.reported_by        IS 'FK para users.id – usuário que registrou';
COMMENT ON COLUMN rescue_cases.organization_id    IS 'FK para organizations.id – ONG responsável (opcional)';
COMMENT ON COLUMN rescue_cases.status             IS 'Status atual: reported|awaiting_rescue|in_rescue|under_treatment|resolved';
COMMENT ON COLUMN rescue_cases.priority           IS 'Prioridade de atendimento: low|medium|high|critical';
COMMENT ON COLUMN rescue_cases.location_description IS 'Endereço ou ponto de referência em texto livre';
COMMENT ON COLUMN rescue_cases.latitude           IS 'Latitude geográfica (WGS84)';
COMMENT ON COLUMN rescue_cases.longitude          IS 'Longitude geográfica (WGS84)';

-- =============================================================================
-- Migration 006 – Tabela case_updates
-- Histórico imutável de mudanças de status de uma ocorrência.
-- Cada linha é um registro de auditoria: quem mudou, para qual status,
-- quando e com quais observações. Nunca deve ser atualizada, apenas inserida.
--
-- Dependências: rescue_cases (004), users (001)
-- =============================================================================

CREATE TABLE IF NOT EXISTS case_updates (
  id              SERIAL      PRIMARY KEY,

  -- Ocorrência que recebeu a atualização
  rescue_case_id  INTEGER     NOT NULL
                    REFERENCES rescue_cases(id)
                    ON DELETE CASCADE,

  -- Usuário responsável pela mudança de status
  updated_by      INTEGER     NOT NULL
                    REFERENCES users(id)
                    ON DELETE RESTRICT, -- histórico não pode perder a referência

  -- Novo status registrado no momento da atualização
  -- (reutiliza o tipo case_status criado na migration 004)
  status          case_status NOT NULL,

  -- Observações livres do voluntário/veterinário
  notes           TEXT,

  -- Timestamp de criação (imutável – nunca atualizar esta coluna)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Índices
-- -----------------------------------------------------------------------------

-- Carregamento eficiente do histórico de um caso (do mais recente para o mais antigo)
CREATE INDEX IF NOT EXISTS idx_case_updates_case_id    ON case_updates (rescue_case_id, created_at DESC);

-- Auditoria: todas as ações de um usuário específico
CREATE INDEX IF NOT EXISTS idx_case_updates_updated_by ON case_updates (updated_by);

-- -----------------------------------------------------------------------------
-- Comentários inline
-- -----------------------------------------------------------------------------

COMMENT ON TABLE  case_updates                IS 'Histórico imutável de mudanças de status das ocorrências';
COMMENT ON COLUMN case_updates.id             IS 'Identificador único auto-incremental';
COMMENT ON COLUMN case_updates.rescue_case_id IS 'FK para rescue_cases.id – ocorrência atualizada';
COMMENT ON COLUMN case_updates.updated_by     IS 'FK para users.id – quem realizou a atualização';
COMMENT ON COLUMN case_updates.status         IS 'Novo status registrado no momento da atualização';
COMMENT ON COLUMN case_updates.notes          IS 'Observações livres (ex.: condição do animal, próximos passos)';
COMMENT ON COLUMN case_updates.created_at     IS 'Data/hora da atualização – imutável após inserção';

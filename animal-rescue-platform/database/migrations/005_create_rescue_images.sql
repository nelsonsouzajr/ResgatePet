-- =============================================================================
-- Migration 005 – Tabela rescue_images
-- Armazena URLs/caminhos das fotos associadas a uma ocorrência de resgate.
-- Um caso pode ter múltiplas imagens; quando o caso é excluído, as imagens
-- associadas são removidas automaticamente (ON DELETE CASCADE).
--
-- Dependências: rescue_cases (executar migration 004 antes)
-- =============================================================================

CREATE TABLE IF NOT EXISTS rescue_images (
  id              SERIAL      PRIMARY KEY,

  -- Referência ao caso – exclusão em cascata garante consistência
  rescue_case_id  INTEGER     NOT NULL
                    REFERENCES rescue_cases(id)
                    ON DELETE CASCADE,

  -- Caminho relativo ou URL pública da imagem
  -- Ex.: "/uploads/cases/42/foto1.jpg"  ou  "https://cdn.example.com/img.jpg"
  image_url       TEXT        NOT NULL,

  -- Controle de tempo
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Índices
-- -----------------------------------------------------------------------------

-- Carregamento eficiente de todas as fotos de um caso
CREATE INDEX IF NOT EXISTS idx_rescue_images_case_id ON rescue_images (rescue_case_id);

-- -----------------------------------------------------------------------------
-- Comentários inline
-- -----------------------------------------------------------------------------

COMMENT ON TABLE  rescue_images                IS 'Fotos das ocorrências de resgate';
COMMENT ON COLUMN rescue_images.id             IS 'Identificador único auto-incremental';
COMMENT ON COLUMN rescue_images.rescue_case_id IS 'FK para rescue_cases.id – caso ao qual a imagem pertence';
COMMENT ON COLUMN rescue_images.image_url      IS 'Caminho relativo ou URL pública da imagem';
COMMENT ON COLUMN rescue_images.created_at     IS 'Data e hora do upload';

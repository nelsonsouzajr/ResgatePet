/**
 * repositories/case.repository.ts
 * Queries SQL para rescue_cases, rescue_images e case_updates.
 * Contém as queries mais complexas do sistema (JOINs e paginação).
 */

import { query } from '../config/database';
import {
  RescueCase,
  CreateCaseDTO,
  UpdateCaseStatusDTO,
  CaseStatus,
  CasePriority,
} from '../models/RescueCase';

// ─── Tipos de retorno enriquecidos (usados pela listagem e detalhes) ──────────

export interface RescueCaseListItem extends RescueCase {
  animal_species: string;
  animal_breed: string | null;
  reported_by_name: string;
  organization_name: string | null;
  image_count: number;
}

export interface RescueCaseDetail extends RescueCase {
  animal: {
    id: number;
    species: string;
    breed: string | null;
    color: string | null;
    estimated_age: string | null;
    gender: string;
    description: string | null;
  };
  reporter: { id: number; name: string; email: string };
  organization: { id: number; name: string } | null;
  images: { id: number; image_url: string; created_at: Date }[];
  updates: {
    id: number;
    status: string;
    notes: string | null;
    updated_by_name: string;
    created_at: Date;
  }[];
}

export interface ListCasesFilter {
  status?: CaseStatus;
  priority?: CasePriority;
  page?: number;
  limit?: number;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const CaseRepository = {
  /**
   * Lista casos com filtros opcionais e paginação.
   * Retorna os dados resumidos suficientes para a tabela de listagem.
   */
  async findAll(
    filter: ListCasesFilter
  ): Promise<{ data: RescueCaseListItem[]; total: number }> {
    const { status, priority, page = 1, limit = 20 } = filter;
    const offset = (page - 1) * limit;

    // Monta cláusulas WHERE dinamicamente
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`rc.status = $${paramIndex++}`);
      params.push(status);
    }
    if (priority) {
      conditions.push(`rc.priority = $${paramIndex++}`);
      params.push(priority);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Query de contagem total (para paginação no frontend)
    const countRows = await query<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM rescue_cases rc
       ${whereClause}`,
      params
    );
    const total = parseInt(countRows[0].count, 10);

    // Query principal com JOINs
    const dataParams = [...params, limit, offset];
    const data = await query<RescueCaseListItem>(
      `SELECT
         rc.*,
         a.species  AS animal_species,
         a.breed    AS animal_breed,
         u.name     AS reported_by_name,
         o.name     AS organization_name,
         COUNT(ri.id)::int AS image_count
       FROM rescue_cases rc
       JOIN animals      a  ON a.id = rc.animal_id
       JOIN users        u  ON u.id = rc.reported_by
       LEFT JOIN organizations o ON o.id = rc.organization_id
       LEFT JOIN rescue_images ri ON ri.rescue_case_id = rc.id
       ${whereClause}
       GROUP BY rc.id, a.id, u.id, o.id
       ORDER BY rc.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      dataParams
    );

    return { data, total };
  },

  /**
   * Busca um caso completo com animal, imagens e histórico.
   * Retorna null se não encontrado.
   */
  async findById(id: number): Promise<RescueCaseDetail | null> {
    // Caso base
    const cases = await query<RescueCase & {
      animal_id: number; reported_by: number; organization_id: number | null;
    }>(
      'SELECT * FROM rescue_cases WHERE id = $1 LIMIT 1',
      [id]
    );
    if (!cases[0]) return null;

    const rc = cases[0];

    // Animal
    const animals = await query<RescueCaseDetail['animal']>(
      `SELECT id, species, breed, color, estimated_age, gender, description
       FROM animals WHERE id = $1`,
      [rc.animal_id]
    );

    // Quem reportou
    const reporters = await query<RescueCaseDetail['reporter']>(
      'SELECT id, name, email FROM users WHERE id = $1',
      [rc.reported_by]
    );

    // Organização (pode ser null)
    let organization: RescueCaseDetail['organization'] = null;
    if (rc.organization_id) {
      const orgs = await query<{ id: number; name: string }>(
        'SELECT id, name FROM organizations WHERE id = $1',
        [rc.organization_id]
      );
      organization = orgs[0] ?? null;
    }

    // Imagens
    const images = await query<RescueCaseDetail['images'][number]>(
      `SELECT id, image_url, created_at
       FROM rescue_images WHERE rescue_case_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    // Histórico de atualizações
    const updates = await query<RescueCaseDetail['updates'][number]>(
      `SELECT cu.id, cu.status, cu.notes, u.name AS updated_by_name, cu.created_at
       FROM case_updates cu
       JOIN users u ON u.id = cu.updated_by
       WHERE cu.rescue_case_id = $1
       ORDER BY cu.created_at ASC`,
      [id]
    );

    return {
      ...rc,
      animal: animals[0],
      reporter: reporters[0],
      organization,
      images,
      updates,
    } as RescueCaseDetail;
  },

  /** Insere um novo caso e retorna o registro criado */
  async create(data: CreateCaseDTO): Promise<RescueCase> {
    const rows = await query<RescueCase>(
      `INSERT INTO rescue_cases
         (animal_id, reported_by, organization_id, priority,
          location_description, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.animal_id,
        data.reported_by,
        data.organization_id ?? null,
        data.priority        ?? 'medium',
        data.location_description ?? null,
        data.latitude  ?? null,
        data.longitude ?? null,
      ]
    );
    return rows[0];
  },

  /**
   * Atualiza o status de um caso E registra no histórico (case_updates).
   * Ambas as operações devem acontecer juntas – transação SQL.
   */
  async updateStatus(
    id: number,
    dto: UpdateCaseStatusDTO
  ): Promise<RescueCase | null> {
    // Atualiza rescue_cases
    const updated = await query<RescueCase>(
      `UPDATE rescue_cases SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [dto.status, id]
    );
    if (!updated[0]) return null;

    // Registra no histórico
    await query(
      `INSERT INTO case_updates (rescue_case_id, updated_by, status, notes)
       VALUES ($1, $2, $3, $4)`,
      [id, dto.updated_by, dto.status, dto.notes ?? null]
    );

    return updated[0];
  },

  /** Insere URLs de imagens para um caso e retorna os registros criados */
  async addImages(
    rescueCaseId: number,
    imageUrls: string[]
  ): Promise<{ id: number; image_url: string; created_at: Date }[]> {
    // INSERT com múltiplos valores gerados dinamicamente
    const placeholders = imageUrls
      .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
      .join(', ');
    const params = imageUrls.flatMap((url) => [rescueCaseId, url]);

    return query<{ id: number; image_url: string; created_at: Date }>(
      `INSERT INTO rescue_images (rescue_case_id, image_url)
       VALUES ${placeholders}
       RETURNING id, image_url, created_at`,
      params
    );
  },

  /** Verifica se o caso existe (usado em validações) */
  async exists(id: number): Promise<boolean> {
    const rows = await query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM rescue_cases WHERE id = $1',
      [id]
    );
    return parseInt(rows[0].count, 10) > 0;
  },
};

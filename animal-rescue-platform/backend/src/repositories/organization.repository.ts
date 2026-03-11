/**
 * repositories/organization.repository.ts
 * Queries SQL para a tabela `organizations`.
 */

import { query } from '../config/database';
import { Organization, CreateOrganizationDTO } from '../models/Organization';

export const OrganizationRepository = {
  /** Lista todas as organizações ordenadas por nome */
  async findAll(): Promise<Organization[]> {
    return query<Organization>(
      'SELECT * FROM organizations ORDER BY name ASC'
    );
  },

  /** Busca uma organização pelo id */
  async findById(id: number): Promise<Organization | null> {
    const rows = await query<Organization>(
      'SELECT * FROM organizations WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  },

  /** Insere uma nova organização e retorna o registro criado */
  async create(data: CreateOrganizationDTO): Promise<Organization> {
    const rows = await query<Organization>(
      `INSERT INTO organizations (name, description, city, state)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.description ?? null, data.city ?? null, data.state ?? null]
    );
    return rows[0];
  },
};

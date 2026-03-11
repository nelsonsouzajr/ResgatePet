/**
 * repositories/animal.repository.ts
 * Queries SQL para a tabela `animals`.
 */

import { query } from '../config/database';
import { Animal, CreateAnimalDTO } from '../models/Animal';

export const AnimalRepository = {
  /** Busca um animal pelo id */
  async findById(id: number): Promise<Animal | null> {
    const rows = await query<Animal>(
      'SELECT * FROM animals WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  },

  /**
   * Insere um novo animal e retorna o registro criado.
   * Chamado sempre que uma nova ocorrência é registrada.
   */
  async create(data: CreateAnimalDTO): Promise<Animal> {
    const rows = await query<Animal>(
      `INSERT INTO animals (species, breed, color, estimated_age, gender, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.species,
        data.breed   ?? null,
        data.color   ?? null,
        data.estimated_age ?? null,
        data.gender  ?? 'unknown',
        data.description   ?? null,
      ]
    );
    return rows[0];
  },
};

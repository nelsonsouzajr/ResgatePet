/**
 * repositories/user.repository.ts
 * Responsável por toda a comunicação com a tabela `users` no banco de dados.
 * Nenhuma lógica de negócio deve existir aqui – apenas queries SQL.
 */

import { query } from '../config/database';
import { User, CreateUserDTO, UserPublic } from '../models/User';

export const UserRepository = {
  /**
   * Busca um usuário pelo e-mail.
   * Retorna o objeto completo (incluindo password_hash) para uso no login.
   */
  async findByEmail(email: string): Promise<User | null> {
    const rows = await query<User>(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return rows[0] ?? null;
  },

  /**
   * Busca um usuário pelo id.
   * Retorna sem o password_hash (uso seguro nas respostas da API).
   */
  async findById(id: number): Promise<UserPublic | null> {
    const rows = await query<UserPublic>(
      `SELECT id, name, email, phone, role, created_at, updated_at
       FROM users WHERE id = $1 LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  },

  /**
   * Verifica se um e-mail já está cadastrado.
   * Usado na validação de registro.
   */
  async emailExists(email: string): Promise<boolean> {
    const rows = await query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM users WHERE email = $1',
      [email]
    );
    return parseInt(rows[0].count, 10) > 0;
  },

  /**
   * Insere um novo usuário e retorna o registro criado (sem senha).
   * O password_hash já deve vir hasheado pelo service.
   */
  async create(data: CreateUserDTO & { password_hash: string }): Promise<UserPublic> {
    const rows = await query<UserPublic>(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, created_at, updated_at`,
      [data.name, data.email, data.password_hash, data.phone ?? null, data.role ?? 'volunteer']
    );
    return rows[0];
  },
};

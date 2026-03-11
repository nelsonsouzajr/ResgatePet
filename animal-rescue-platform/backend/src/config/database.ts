/**
 * config/database.ts
 * Configura o pool de conexões com o PostgreSQL usando a biblioteca `pg`.
 * O pool reutiliza conexões abertas, melhorando a performance em APIs REST.
 */

import { Pool } from 'pg';
import { env } from './env';

// Pool de conexões – compartilhado por toda a aplicação
export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  // Configurações de pool para produção
  max: 20,                  // máximo de conexões simultâneas
  idleTimeoutMillis: 30000, // fecha conexão ociosa após 30 s
  connectionTimeoutMillis: 2000, // timeout ao tentar obter conexão do pool
});

// Testa a conexão ao iniciar o servidor
pool.connect((err, client, release) => {
  if (err) {
    console.error('[DB] Erro ao conectar com o PostgreSQL:', err.message);
    return;
  }
  console.log('[DB] Conexão com PostgreSQL estabelecida com sucesso.');
  release();
});

/**
 * Executa uma query SQL parametrizada.
 * @param text  - Query SQL com placeholders $1, $2, ...
 * @param params - Array de valores para os placeholders
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

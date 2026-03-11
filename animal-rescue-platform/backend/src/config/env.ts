/**
 * config/env.ts
 * Centraliza a leitura e validação das variáveis de ambiente.
 * Lança erro imediatamente se uma variável obrigatória estiver ausente,
 * evitando falhas silenciosas em runtime.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${key}`);
  }
  return value;
}

export const env = {
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',

  // Banco de dados
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT ?? '5432', 10),
  DB_NAME: requireEnv('DB_NAME'),
  DB_USER: requireEnv('DB_USER'),
  DB_PASSWORD: requireEnv('DB_PASSWORD'),

  // JWT
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',

  // Upload
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? 'uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB ?? '5', 10),
} as const;

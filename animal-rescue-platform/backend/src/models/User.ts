/**
 * models/User.ts
 * Interface TypeScript que representa a entidade User do banco de dados.
 * Serve como contrato entre camadas (repository → service → controller).
 */

export type UserRole = 'admin' | 'volunteer' | 'veterinarian';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

/** Dados necessários para criar um novo usuário */
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string; // texto puro – será hasheado no service
  phone?: string;
  role?: UserRole;
}

/** Payload retornado ao cliente (sem password_hash) */
export type UserPublic = Omit<User, 'password_hash'>;

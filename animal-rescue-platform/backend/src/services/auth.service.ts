/**
 * services/auth.service.ts
 * Lógica de negócio para autenticação: registro e login de usuários.
 * Usa bcryptjs para hash de senha e jsonwebtoken para geração do JWT.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDTO, UserPublic } from '../models/User';
import { env } from '../config/env';

/** Payload retornado pelo login */
export interface LoginResult {
  token: string;
  user: UserPublic;
}

/** Erros de domínio lançados pelo service */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AuthService = {
  /**
   * Registra um novo usuário.
   * Valida se o e-mail já existe antes de inserir.
   */
  async register(dto: CreateUserDTO): Promise<UserPublic> {
    // Verifica duplicidade de e-mail
    const exists = await UserRepository.emailExists(dto.email);
    if (exists) {
      throw new AuthError('E-mail já cadastrado.', 409);
    }

    // Hash da senha com custo 10 (equilibra segurança e performance)
    const password_hash = await bcrypt.hash(dto.password, 10);

    return UserRepository.create({ ...dto, password_hash });
  },

  /**
   * Autentica um usuário e retorna o JWT.
   * Lança AuthError se as credenciais forem inválidas.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    // Busca usuário com hash (findByEmail retorna senha)
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AuthError('Credenciais inválidas.', 401);
    }

    // Compara senha informada com o hash armazenado
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AuthError('Credenciais inválidas.', 401);
    }

    // Gera o token JWT com payload mínimo necessário para autorização
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    // Retorna dados públicos do usuário (sem password_hash)
    const { password_hash: _hash, ...userPublic } = user;
    return { token, user: userPublic as UserPublic };
  },
};

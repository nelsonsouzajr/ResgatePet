/**
 * middlewares/auth.ts
 * Middleware de autenticação JWT.
 * Valida o token Bearer no header Authorization e injeta os dados
 * do usuário autenticado em req.user para uso nos controllers.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Extensão da interface Request do Express para incluir dados do usuário
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
    };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

/**
 * Fábrica de middleware para verificar se o usuário possui um dos papéis permitidos.
 * Uso: router.delete('/resource', authenticate, authorize('admin'), handler)
 */
export function authorize(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      return;
    }
    next();
  };
}

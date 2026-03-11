/**
 * controllers/auth.controller.ts
 * Handlers HTTP para registro e login de usuários.
 * Cada função extrai os dados da requisição, chama o AuthService
 * e serializa a resposta. Erros são repassados ao errorHandler global.
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService, AuthError } from '../services/auth.service';

export const AuthController = {
  /**
   * POST /api/auth/register
   * Registra um novo usuário e retorna os dados públicos (sem senha).
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Verifica erros de validação definidos nas rotas
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const user = await AuthService.register(req.body);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof AuthError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },

  /**
   * POST /api/auth/login
   * Autentica usuário e retorna JWT + dados do usuário.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof AuthError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
};

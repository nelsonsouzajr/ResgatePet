/**
 * routes/auth.routes.ts
 * Rotas de autenticação.
 *
 * POST /api/auth/register  → cria usuário
 * POST /api/auth/login     → autentica e retorna JWT
 */

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middlewares/validate';

const router = Router();

router.post('/register', validateRegister, AuthController.register);
router.post('/login',    validateLogin,    AuthController.login);

export default router;

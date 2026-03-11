/**
 * routes/organizations.routes.ts
 * Rotas de organizações (ONGs e grupos de resgate).
 *
 * GET  /api/organizations      → lista (pública)
 * GET  /api/organizations/:id  → detalhes (pública)
 * POST /api/organizations      → cria (autenticado, role admin)
 */

import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validateCreateOrg } from '../middlewares/validate';

const router = Router();

router.get('/', OrganizationController.list);
router.get('/:id', OrganizationController.getById);

// Apenas admins podem criar organizações
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateCreateOrg,
  OrganizationController.create
);

export default router;

/**
 * routes/cases.routes.ts
 * Rotas das ocorrências de resgate.
 *
 * GET    /api/cases              → lista (pública)
 * POST   /api/cases              → cria (autenticado)
 * GET    /api/cases/:id          → detalhes (pública)
 * PATCH  /api/cases/:id/status   → atualiza status (autenticado)
 * POST   /api/cases/:id/images   → upload de imagens (autenticado)
 */

import { Router } from 'express';
import { CaseController } from '../controllers/case.controller';
import { authenticate } from '../middlewares/auth';
import { upload } from '../config/upload';
import {
  validateCreateCase,
  validateUpdateStatus,
} from '../middlewares/validate';

const router = Router();

// Listagem pública
router.get('/', CaseController.list);

// Detalhes públicos
router.get('/:id', CaseController.getById);

// Criação requer autenticação
router.post(
  '/',
  authenticate,
  validateCreateCase,
  CaseController.create as never
);

// Atualização de status requer autenticação
router.patch(
  '/:id/status',
  authenticate,
  validateUpdateStatus,
  CaseController.updateStatus as never
);

// Upload de imagens requer autenticação
// multer processa o campo "images" (array) antes do controller
router.post(
  '/:id/images',
  authenticate,
  upload.array('images', 5),
  CaseController.uploadImages as never
);

export default router;

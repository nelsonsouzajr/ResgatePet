/**
 * controllers/case.controller.ts
 * Handlers HTTP para as ocorrências de resgate.
 * Implementa todos os endpoints do módulo /api/cases.
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { CaseService, CaseError } from '../services/case.service';
import { AuthenticatedRequest } from '../middlewares/auth';
import { CaseStatus, CasePriority } from '../models/RescueCase';

export const CaseController = {
  /**
   * GET /api/cases
   * Lista ocorrências com filtros opcionais e paginação.
   * Query params: status, priority, page, limit
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, priority, page, limit } = req.query;

      const result = await CaseService.list({
        status:   status   as CaseStatus   | undefined,
        priority: priority as CasePriority | undefined,
        page:     page     ? parseInt(page as string, 10)  : undefined,
        limit:    limit    ? parseInt(limit as string, 10) : undefined,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/cases/:id
   * Retorna detalhes completos de uma ocorrência (animal, imagens, histórico).
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido.' });
        return;
      }

      const caseDetail = await CaseService.getById(id);
      res.status(200).json(caseDetail);
    } catch (err) {
      if (err instanceof CaseError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },

  /**
   * POST /api/cases
   * Registra uma nova ocorrência de resgate.
   * Requer autenticação (reported_by vem do token JWT).
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      // reported_by é injetado a partir do token JWT pelo middleware authenticate
      const reported_by = req.user!.id;

      const rescueCase = await CaseService.create({
        ...req.body,
        reported_by,
      });

      res.status(201).json(rescueCase);
    } catch (err) {
      if (err instanceof CaseError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },

  /**
   * PATCH /api/cases/:id/status
   * Atualiza o status de uma ocorrência e registra no histórico.
   * Requer autenticação.
   */
  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido.' });
        return;
      }

      const updated = await CaseService.updateStatus(id, {
        status:     req.body.status,
        notes:      req.body.notes,
        updated_by: req.user!.id,
      });

      res.status(200).json(updated);
    } catch (err) {
      if (err instanceof CaseError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },

  /**
   * POST /api/cases/:id/images
   * Faz upload de imagens para uma ocorrência.
   * Requer autenticação. Os arquivos são processados pelo multer antes
   * de chegar aqui (disponíveis em req.files).
   */
  async uploadImages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido.' });
        return;
      }

      // req.files é populado pelo multer (array field "images")
      const files = req.files as Express.Multer.File[];
      if (!files?.length) {
        res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        return;
      }

      // Gera os caminhos relativos que serão armazenados no banco
      const imageUrls = files.map((f) => `/uploads/cases/${id}/${f.filename}`);

      const uploaded = await CaseService.addImages(id, imageUrls);
      res.status(201).json({ uploaded });
    } catch (err) {
      if (err instanceof CaseError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
};

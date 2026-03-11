/**
 * controllers/organization.controller.ts
 * Handlers HTTP para organizações (ONGs e grupos de resgate).
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { OrganizationService, OrgError } from '../services/organization.service';

export const OrganizationController = {
  /**
   * GET /api/organizations
   * Retorna todas as organizações cadastradas.
   */
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgs = await OrganizationService.listAll();
      res.status(200).json(orgs);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/organizations/:id
   * Retorna uma organização específica.
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido.' });
        return;
      }
      const org = await OrganizationService.getById(id);
      res.status(200).json(org);
    } catch (err) {
      if (err instanceof OrgError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },

  /**
   * POST /api/organizations
   * Cria uma nova organização. Requer autenticação com role admin.
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const org = await OrganizationService.create(req.body);
      res.status(201).json(org);
    } catch (err) {
      if (err instanceof OrgError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
};

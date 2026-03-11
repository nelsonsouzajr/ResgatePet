/**
 * services/organization.service.ts
 * Lógica de negócio para organizações (ONGs e grupos de resgate).
 */

import { OrganizationRepository } from '../repositories/organization.repository';
import { Organization, CreateOrganizationDTO } from '../models/Organization';

export class OrgError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'OrgError';
  }
}

export const OrganizationService = {
  /** Retorna todas as organizações cadastradas */
  async listAll(): Promise<Organization[]> {
    return OrganizationRepository.findAll();
  },

  /** Retorna uma organização pelo id ou lança 404 */
  async getById(id: number): Promise<Organization> {
    const org = await OrganizationRepository.findById(id);
    if (!org) {
      throw new OrgError(`Organização #${id} não encontrada.`, 404);
    }
    return org;
  },

  /** Cria uma nova organização */
  async create(dto: CreateOrganizationDTO): Promise<Organization> {
    if (!dto.name?.trim()) {
      throw new OrgError('O nome da organização é obrigatório.');
    }
    return OrganizationRepository.create(dto);
  },
};

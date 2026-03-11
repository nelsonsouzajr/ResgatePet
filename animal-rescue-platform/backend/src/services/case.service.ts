/**
 * services/case.service.ts
 * Lógica de negócio para ocorrências de resgate.
 * Coordena repositories de caso e animal, valida regras de negócio.
 */

import { CaseRepository, ListCasesFilter, RescueCaseDetail } from '../repositories/case.repository';
import { AnimalRepository } from '../repositories/animal.repository';
import { RescueCase, UpdateCaseStatusDTO, CaseStatus } from '../models/RescueCase';
import { CreateAnimalDTO } from '../models/Animal';

/** Dados necessários para abrir uma nova ocorrência via API */
export interface CreateCaseInput {
  animal: CreateAnimalDTO;
  organization_id?: number;
  priority?: RescueCase['priority'];
  location_description?: string;
  latitude?: number;
  longitude?: number;
  reported_by: number; // injetado pelo middleware de autenticação
}

/** Erro de domínio para regras de negócio de casos */
export class CaseError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'CaseError';
  }
}

/** Mapeamento de transições de status permitidas */
const ALLOWED_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  reported:         ['awaiting_rescue', 'resolved'],
  awaiting_rescue:  ['in_rescue', 'resolved'],
  in_rescue:        ['under_treatment', 'resolved'],
  under_treatment:  ['resolved'],
  resolved:         [], // status terminal
};

export const CaseService = {
  /**
   * Lista casos com filtros e paginação.
   */
  async list(filter: ListCasesFilter) {
    return CaseRepository.findAll(filter);
  },

  /**
   * Retorna os detalhes completos de um caso.
   * Lança 404 se não encontrado.
   */
  async getById(id: number): Promise<RescueCaseDetail> {
    const caseDetail = await CaseRepository.findById(id);
    if (!caseDetail) {
      throw new CaseError(`Ocorrência #${id} não encontrada.`, 404);
    }
    return caseDetail;
  },

  /**
   * Cria um animal e uma ocorrência de resgate em sequência.
   * O animal é sempre criado junto com o caso (não existe animal sem caso no fluxo de registro).
   */
  async create(input: CreateCaseInput): Promise<RescueCase> {
    // 1. Cria o animal
    const animal = await AnimalRepository.create(input.animal);

    // 2. Cria o caso vinculando o animal recém-criado
    const rescueCase = await CaseRepository.create({
      animal_id:            animal.id,
      reported_by:          input.reported_by,
      organization_id:      input.organization_id,
      priority:             input.priority,
      location_description: input.location_description,
      latitude:             input.latitude,
      longitude:            input.longitude,
    });

    return rescueCase;
  },

  /**
   * Atualiza o status de um caso validando a transição.
   * Garante que o fluxo de status siga a sequência definida no sistema.
   */
  async updateStatus(
    id: number,
    dto: UpdateCaseStatusDTO
  ): Promise<RescueCase> {
    const current = await CaseRepository.findById(id);
    if (!current) {
      throw new CaseError(`Ocorrência #${id} não encontrada.`, 404);
    }

    // Valida se a transição de status é permitida
    const allowed = ALLOWED_TRANSITIONS[current.status];
    if (!allowed.includes(dto.status)) {
      throw new CaseError(
        `Transição de status inválida: "${current.status}" → "${dto.status}". ` +
        `Permitidos: ${allowed.join(', ') || 'nenhum (status terminal)'}`,
        422
      );
    }

    const updated = await CaseRepository.updateStatus(id, dto);
    if (!updated) {
      throw new CaseError('Erro ao atualizar o caso.', 500);
    }
    return updated;
  },

  /**
   * Associa imagens (já salvas no disco) a um caso existente.
   */
  async addImages(
    id: number,
    imageUrls: string[]
  ): Promise<{ id: number; image_url: string; created_at: Date }[]> {
    const exists = await CaseRepository.exists(id);
    if (!exists) {
      throw new CaseError(`Ocorrência #${id} não encontrada.`, 404);
    }
    if (!imageUrls.length) {
      throw new CaseError('Nenhuma imagem fornecida.', 400);
    }
    return CaseRepository.addImages(id, imageUrls);
  },
};

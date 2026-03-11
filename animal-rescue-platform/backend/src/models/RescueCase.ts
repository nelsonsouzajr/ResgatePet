/**
 * models/RescueCase.ts
 * Interfaces TypeScript para a entidade central do sistema: a ocorrência de resgate.
 */

export type CaseStatus =
  | 'reported'
  | 'awaiting_rescue'
  | 'in_rescue'
  | 'under_treatment'
  | 'resolved';

export type CasePriority = 'low' | 'medium' | 'high' | 'critical';

export interface RescueCase {
  id: number;
  animal_id: number;
  reported_by: number;
  organization_id?: number;
  status: CaseStatus;
  priority: CasePriority;
  location_description?: string;
  latitude?: number;
  longitude?: number;
  created_at: Date;
  updated_at: Date;
}

/** Dados necessários para abrir uma nova ocorrência */
export interface CreateCaseDTO {
  animal_id: number;
  reported_by: number;
  organization_id?: number;
  priority?: CasePriority;
  location_description?: string;
  latitude?: number;
  longitude?: number;
}

/** Dados para atualizar o status de uma ocorrência */
export interface UpdateCaseStatusDTO {
  status: CaseStatus;
  notes?: string;
  updated_by: number;
}

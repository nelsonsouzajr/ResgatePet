/**
 * models/CaseUpdate.ts
 * Interface TypeScript para o histórico de atualizações de uma ocorrência.
 */

import { CaseStatus } from './RescueCase';

export interface CaseUpdate {
  id: number;
  rescue_case_id: number;
  updated_by: number;
  status: CaseStatus;
  notes?: string;
  created_at: Date;
}

export type CaseStatus =
  | 'reported'
  | 'awaiting_rescue'
  | 'in_rescue'
  | 'under_treatment'
  | 'resolved';

export type CasePriority = 'low' | 'medium' | 'high' | 'critical';

export interface CaseListItem {
  id: number;
  animal_id: number;
  reported_by: number;
  organization_id: number | null;
  status: CaseStatus;
  priority: CasePriority;
  location_description: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  animal_species: string;
  animal_breed: string | null;
  reported_by_name: string;
  organization_name: string | null;
  image_count: number;
}

export interface CaseDetail {
  id: number;
  animal_id: number;
  reported_by: number;
  organization_id: number | null;
  status: CaseStatus;
  priority: CasePriority;
  location_description: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  animal: {
    id: number;
    species: string;
    breed: string | null;
    color: string | null;
    estimated_age: string | null;
    gender: string;
    description: string | null;
  };
  reporter: {
    id: number;
    name: string;
    email: string;
  };
  organization: {
    id: number;
    name: string;
  } | null;
  images: Array<{
    id: number;
    image_url: string;
    created_at: string;
  }>;
  updates: Array<{
    id: number;
    status: CaseStatus;
    notes: string | null;
    updated_by_name: string;
    created_at: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ListCaseFilters {
  status?: CaseStatus;
  priority?: CasePriority;
  city?: string;
  page?: number;
  limit?: number;
}

export interface CreateCasePayload {
  animal: {
    species: 'dog' | 'cat' | 'bird' | 'other';
    breed?: string;
    color?: string;
    estimated_age?: string;
    gender?: 'male' | 'female' | 'unknown';
    description?: string;
  };
  organization_id?: number;
  priority?: CasePriority;
  location_description?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateCaseStatusPayload {
  status: CaseStatus;
  notes?: string;
}

export const statusLabel: Record<CaseStatus, string> = {
  reported: 'Reportado',
  awaiting_rescue: 'Aguardando resgate',
  in_rescue: 'Em resgate',
  under_treatment: 'Em tratamento',
  resolved: 'Resolvido',
};

export const priorityLabel: Record<CasePriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

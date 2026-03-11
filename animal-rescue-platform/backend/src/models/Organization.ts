/**
 * models/Organization.ts
 * Interface TypeScript para a entidade Organization (ONGs e grupos de resgate).
 */

export interface Organization {
  id: number;
  name: string;
  description?: string;
  city?: string;
  state?: string;
  created_at: Date;
}

export interface CreateOrganizationDTO {
  name: string;
  description?: string;
  city?: string;
  state?: string;
}

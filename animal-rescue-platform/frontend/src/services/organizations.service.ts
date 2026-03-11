import { api } from './api';

export interface OrganizationOption {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
}

export async function listOrganizations(): Promise<OrganizationOption[]> {
  const response = await api.get<OrganizationOption[]>('/organizations');
  return response.data;
}

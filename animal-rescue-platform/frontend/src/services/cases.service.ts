import { api } from './api';
import {
  CaseDetail,
  CaseListItem,
  CreateCasePayload,
  ListCaseFilters,
  PaginatedResponse,
  UpdateCaseStatusPayload,
} from '@/types/case';

export async function listCases(
  filters: ListCaseFilters = {}
): Promise<PaginatedResponse<CaseListItem>> {
  const { city: _city, ...apiFilters } = filters;
  const response = await api.get<PaginatedResponse<CaseListItem>>('/cases', {
    params: apiFilters,
  });
  return response.data;
}

export async function getCaseById(id: number): Promise<CaseDetail> {
  const response = await api.get<CaseDetail>(`/cases/${id}`);
  return response.data;
}

export async function createCase(payload: CreateCasePayload) {
  const response = await api.post('/cases', payload);
  return response.data;
}

export async function updateCaseStatus(
  id: number,
  payload: UpdateCaseStatusPayload
) {
  const response = await api.patch(`/cases/${id}/status`, payload);
  return response.data;
}

export async function uploadCaseImages(id: number, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await api.post(`/cases/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data as {
    uploaded: Array<{ id: number; image_url: string; created_at: string }>;
  };
}

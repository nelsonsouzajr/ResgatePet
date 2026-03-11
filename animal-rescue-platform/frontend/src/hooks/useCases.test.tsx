import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CaseListItem, PaginatedResponse } from '@/types/case';
import { useCases } from '@/hooks/useCases';
import { listCases } from '@/services/cases.service';

vi.mock('@/services/cases.service', () => ({
  listCases: vi.fn(),
}));

const mockedListCases = vi.mocked(listCases);

const baseItem: CaseListItem = {
  id: 1,
  animal_id: 1,
  reported_by: 1,
  organization_id: null,
  status: 'reported',
  priority: 'medium',
  location_description: 'Sao Paulo - Centro',
  latitude: -23.55,
  longitude: -46.63,
  created_at: '2026-01-01T10:00:00.000Z',
  updated_at: '2026-01-01T10:00:00.000Z',
  animal_species: 'dog',
  animal_breed: null,
  reported_by_name: 'Voluntario A',
  organization_name: null,
  image_count: 0,
};

function paginated(data: CaseListItem[]): PaginatedResponse<CaseListItem> {
  return {
    data,
    total: data.length,
    page: 1,
    limit: 20,
  };
}

describe('useCases', () => {
  beforeEach(() => {
    mockedListCases.mockReset();
  });

  it('filtra ocorrencias por cidade e ajusta total local', async () => {
    mockedListCases.mockResolvedValue(
      paginated([
        baseItem,
        {
          ...baseItem,
          id: 2,
          location_description: 'Campinas - Centro',
        },
      ])
    );

    const { result } = renderHook(() => useCases({ city: 'sao' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedListCases).toHaveBeenCalledWith({ city: 'sao', page: 1, limit: 20 });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.total).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('retorna erro amigavel quando a API falha', async () => {
    mockedListCases.mockRejectedValue(new Error('falha de rede'));

    const { result } = renderHook(() => useCases());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
    expect(result.current.error).toBe('Não foi possível carregar as ocorrências.');
  });
});

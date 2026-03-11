import { useCallback, useEffect, useMemo, useState } from 'react';
import { listCases } from '@/services/cases.service';
import { CaseListItem, ListCaseFilters } from '@/types/case';

const defaultFilters: ListCaseFilters = {
  page: 1,
  limit: 20,
};

export function useCases(initialFilters: ListCaseFilters = defaultFilters) {
  const [filters, setFilters] = useState<ListCaseFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [items, setItems] = useState<CaseListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listCases(filters);

      let filtered = response.data;
      if (filters.city?.trim()) {
        const search = filters.city.trim().toLowerCase();
        filtered = response.data.filter((item) =>
          (item.location_description ?? '').toLowerCase().includes(search)
        );
      }

      setItems(filtered);
      setTotal(filters.city?.trim() ? filtered.length : response.total);
    } catch (err) {
      setError('Não foi possível carregar as ocorrências.');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const totalPages = useMemo(() => {
    const limit = filters.limit ?? 20;
    return Math.max(1, Math.ceil(total / limit));
  }, [filters.limit, total]);

  return {
    filters,
    setFilters,
    items,
    total,
    totalPages,
    loading,
    error,
    refetch: fetchCases,
  };
}

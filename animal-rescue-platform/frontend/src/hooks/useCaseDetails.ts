import { useCallback, useEffect, useState } from 'react';
import { getCaseById } from '@/services/cases.service';
import { CaseDetail } from '@/types/case';

export function useCaseDetails(id?: number) {
  const [data, setData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const detail = await getCaseById(id);
      setData(detail);
    } catch {
      setError('Não foi possível carregar os detalhes da ocorrência.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return { data, loading, error, refetch: fetchDetails };
}

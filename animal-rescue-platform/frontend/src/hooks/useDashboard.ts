import { useEffect, useState } from 'react';
import { listCases } from '@/services/cases.service';
import { CaseListItem, CaseStatus } from '@/types/case';

export function useDashboard(status?: CaseStatus) {
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError(null);

      try {
        const response = await listCases({ status, page: 1, limit: 8 });
        setCases(response.data);
      } catch {
        setError('Não foi possível carregar o dashboard.');
        setCases([]);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [status]);

  return { cases, loading, error };
}

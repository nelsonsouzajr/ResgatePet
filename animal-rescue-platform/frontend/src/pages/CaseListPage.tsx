import { useMemo } from 'react';
import { AppShell } from '@/components/AppShell';
import { CaseTable } from '@/components/CaseTable';
import { useCases } from '@/hooks/useCases';
import { CasePriority, CaseStatus } from '@/types/case';

export default function CaseListPage() {
  const { filters, setFilters, items, total, totalPages, loading, error } = useCases({
    page: 1,
    limit: 20,
  });

  const page = filters.page ?? 1;

  const summary = useMemo(() => {
    if (!total) return 'Nenhum resultado encontrado';
    return `${total} ocorrência(s) encontrada(s)`;
  }, [total]);

  return (
    <AppShell
      title="Lista de Ocorrências"
      subtitle="Filtre por status, cidade e prioridade para localizar rapidamente os casos."
    >
      <section className="card border border-sand-200">
        <div className="grid gap-3 md:grid-cols-4">
          <select
            className="rounded-lg border border-sand-300 px-3 py-2 text-sm font-semibold text-ink-700"
            value={filters.status ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              setFilters((prev) => ({
                ...prev,
                page: 1,
                status: value ? (value as CaseStatus) : undefined,
              }));
            }}
          >
            <option value="">Status: todos</option>
            <option value="reported">Reportado</option>
            <option value="awaiting_rescue">Aguardando resgate</option>
            <option value="in_rescue">Em resgate</option>
            <option value="under_treatment">Em tratamento</option>
            <option value="resolved">Resolvido</option>
          </select>

          <input
            className="rounded-lg border border-sand-300 px-3 py-2 text-sm font-semibold text-ink-700"
            type="text"
            placeholder="Cidade (filtro textual)"
            value={filters.city ?? ''}
            onChange={(event) => {
              setFilters((prev) => ({ ...prev, page: 1, city: event.target.value }));
            }}
          />

          <select
            className="rounded-lg border border-sand-300 px-3 py-2 text-sm font-semibold text-ink-700"
            value={filters.priority ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              setFilters((prev) => ({
                ...prev,
                page: 1,
                priority: value ? (value as CasePriority) : undefined,
              }));
            }}
          >
            <option value="">Prioridade: todas</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setFilters({ page: 1, limit: 20 });
            }}
          >
            Limpar filtros
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-600">{summary}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              disabled={page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page ?? 1) - 1) }))}
            >
              Página anterior
            </button>
            <span className="rounded-md bg-sand-100 px-3 py-1 text-xs font-bold text-ink-700">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              disabled={page >= totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
            >
              Próxima página
            </button>
          </div>
        </div>

        {loading && <div className="card border border-sand-200 text-sm text-ink-500">Carregando ocorrências...</div>}
        {error && <div className="card border border-rose-200 bg-rose-50 text-sm text-rose-700">{error}</div>}

        {!loading && !error && <CaseTable rows={items} />}
      </section>
    </AppShell>
  );
}

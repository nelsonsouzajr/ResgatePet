import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { CaseCard } from '@/components/CaseCard';
import { MapBoard } from '@/components/MapBoard';
import { useDashboard } from '@/hooks/useDashboard';
import { CaseStatus } from '@/types/case';

const statusOptions: Array<{ value: CaseStatus | ''; label: string }> = [
  { value: '', label: 'Todos os status' },
  { value: 'reported', label: 'Reportado' },
  { value: 'awaiting_rescue', label: 'Aguardando resgate' },
  { value: 'in_rescue', label: 'Em resgate' },
  { value: 'under_treatment', label: 'Em tratamento' },
  { value: 'resolved', label: 'Resolvido' },
];

export default function DashboardPage() {
  const [status, setStatus] = useState<CaseStatus | undefined>();
  const { cases, loading, error } = useDashboard(status);

  return (
    <AppShell
      title="Dashboard Operacional"
      subtitle="Acompanhe as ocorrências recentes com visão rápida em mapa e status."
      actions={<Link to="/cases/new" className="btn-primary">Registrar ocorrência</Link>}
    >
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card border border-sand-200">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-ink-900">Mapa de ocorrências</h2>
            <select
              className="rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm font-semibold text-ink-700"
              value={status ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                setStatus(value ? (value as CaseStatus) : undefined);
              }}
            >
              {statusOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <MapBoard
            pins={cases.map((item) => ({
              id: item.id,
              label: `#${item.id} · ${item.animal_species}`,
              latitude: item.latitude,
              longitude: item.longitude,
            }))}
          />
        </div>

        <div className="card border border-sand-200">
          <h2 className="text-lg font-black text-ink-900">Resumo rápido</h2>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl bg-sand-100 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Ocorrências carregadas</p>
              <p className="text-2xl font-black text-ink-900">{cases.length}</p>
            </div>
            <div className="rounded-xl bg-brand/10 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-600">Atualização</p>
              <p className="text-sm font-semibold text-ink-700">Painel sincronizado com API em tempo real por recarga.</p>
            </div>
            <Link to="/cases" className="btn-secondary text-center">Abrir lista completa</Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-ink-900">Casos recentes</h2>
          <Link to="/cases" className="text-sm font-bold text-brand hover:underline">Ver todos</Link>
        </div>

        {loading && <div className="card border border-sand-200 text-sm text-ink-500">Carregando dashboard...</div>}
        {error && <div className="card border border-rose-200 bg-rose-50 text-sm text-rose-700">{error}</div>}

        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cases.map((item) => (
              <CaseCard key={item.id} item={item} />
            ))}
            {!cases.length && (
              <div className="card border border-sand-200 text-sm text-ink-500">
                Nenhuma ocorrência encontrada para o filtro atual.
              </div>
            )}
          </div>
        )}
      </section>
    </AppShell>
  );
}

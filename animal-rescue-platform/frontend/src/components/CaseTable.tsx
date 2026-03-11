import { Link } from 'react-router-dom';
import { CaseListItem } from '@/types/case';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';

interface CaseTableProps {
  rows: CaseListItem[];
}

export function CaseTable({ rows }: CaseTableProps) {
  if (!rows.length) {
    return (
      <div className="card border border-sand-200 text-sm text-ink-500">
        Nenhuma ocorrência encontrada para os filtros aplicados.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-sand-200">
          <thead className="bg-sand-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-ink-600">ID</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-ink-600">Espécie</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-ink-600">Localização</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-ink-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-ink-600">Prioridade</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-ink-600">Data</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.1em] text-ink-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {rows.map((item) => (
              <tr key={item.id} className="hover:bg-sand-50/60">
                <td className="px-4 py-3 text-sm font-bold text-ink-900">#{item.id}</td>
                <td className="px-4 py-3 text-sm text-ink-700">
                  {item.animal_species.toUpperCase()}
                  {item.animal_breed ? ` · ${item.animal_breed}` : ''}
                </td>
                <td className="max-w-[280px] truncate px-4 py-3 text-sm text-ink-600">
                  {item.location_description ?? 'Sem localização'}
                </td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={item.priority} /></td>
                <td className="px-4 py-3 text-sm text-ink-600">
                  {new Date(item.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/cases/${item.id}`} className="btn-secondary px-3 py-1.5 text-xs">Detalhes</Link>
                    <Link to={`/cases/${item.id}/edit`} className="btn-primary px-3 py-1.5 text-xs">Atualizar</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

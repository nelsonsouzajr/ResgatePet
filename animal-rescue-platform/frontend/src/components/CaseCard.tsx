import { Link } from 'react-router-dom';
import { CaseListItem } from '@/types/case';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';

interface CaseCardProps {
  item: CaseListItem;
}

export function CaseCard({ item }: CaseCardProps) {
  return (
    <article className="card border border-sand-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">
            Ocorrência #{item.id}
          </p>
          <h3 className="mt-1 text-lg font-black text-ink-900">
            {item.animal_species.toUpperCase()} {item.animal_breed ? `· ${item.animal_breed}` : ''}
          </h3>
        </div>
        <PriorityBadge priority={item.priority} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-ink-600">
        {item.location_description ?? 'Sem localização informada'}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <StatusBadge status={item.status} />
        <span className="text-xs font-semibold text-ink-500">{item.image_count} foto(s)</span>
      </div>

      <div className="mt-4 flex gap-2">
        <Link to={`/cases/${item.id}`} className="btn-secondary w-full text-center">
          Detalhes
        </Link>
        <Link to={`/cases/${item.id}/edit`} className="btn-primary w-full text-center">
          Atualizar
        </Link>
      </div>
    </article>
  );
}

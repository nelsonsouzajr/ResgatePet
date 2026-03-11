import { CaseStatus, statusLabel } from '@/types/case';

const statusClass: Record<CaseStatus, string> = {
  reported: 'bg-slate-100 text-slate-700',
  awaiting_rescue: 'bg-amber-100 text-amber-700',
  in_rescue: 'bg-orange-100 text-orange-700',
  under_treatment: 'bg-cyan-100 text-cyan-700',
  resolved: 'bg-emerald-100 text-emerald-700',
};

interface StatusBadgeProps {
  status: CaseStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`badge ${statusClass[status]}`}>{statusLabel[status]}</span>;
}

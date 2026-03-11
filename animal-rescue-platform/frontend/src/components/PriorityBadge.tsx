import { CasePriority, priorityLabel } from '@/types/case';

const priorityClass: Record<CasePriority, string> = {
  low: 'bg-zinc-100 text-zinc-700',
  medium: 'bg-sky-100 text-sky-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-rose-100 text-rose-700',
};

interface PriorityBadgeProps {
  priority: CasePriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return <span className={`badge ${priorityClass[priority]}`}>{priorityLabel[priority]}</span>;
}

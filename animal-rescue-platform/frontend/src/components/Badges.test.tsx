import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';

describe('Badges de ocorrencia', () => {
  it('renderiza label e classe correta para status', () => {
    render(<StatusBadge status="in_rescue" />);

    const badge = screen.getByText('Em resgate');
    expect(badge.className).toContain('bg-orange-100');
  });

  it('renderiza label e classe correta para prioridade', () => {
    render(<PriorityBadge priority="critical" />);

    const badge = screen.getByText('Crítica');
    expect(badge.className).toContain('bg-rose-100');
  });
});

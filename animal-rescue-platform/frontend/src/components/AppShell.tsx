import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { getCurrentUser, logout } from '@/services/auth.service';

interface AppShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? 'rounded-lg bg-ink-900 px-3 py-2 text-sm font-semibold text-white'
    : 'rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 transition hover:bg-sand-100';
}

export function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b border-sand-200/70 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-sm font-black text-white">RP</div>
            <div>
              <p className="text-sm font-black tracking-wide text-ink-900">ResgatePet Control</p>
              <p className="text-xs text-ink-500">Gestão de ocorrências de resgate animal</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/cases" className={linkClass}>Ocorrências</NavLink>
            <NavLink to="/cases/new" className={linkClass}>Cadastrar</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-ink-700 sm:inline-flex">
              {user?.name ?? 'Visitante'}
            </span>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-ink-900">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
            </div>
            {actions && <div>{actions}</div>}
          </div>
        </section>

        {children}
      </main>
    </div>
  );
}

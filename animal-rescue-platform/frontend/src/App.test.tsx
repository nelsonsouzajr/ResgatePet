import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/pages/DashboardPage', () => ({
  default: () => <div>Dashboard Mock</div>,
}));
vi.mock('@/pages/CaseListPage', () => ({
  default: () => <div>Cases Mock</div>,
}));
vi.mock('@/pages/NewCasePage', () => ({
  default: () => <div>New Case Mock</div>,
}));
vi.mock('@/pages/CaseDetailPage', () => ({
  default: () => <div>Case Detail Mock</div>,
}));
vi.mock('@/pages/UpdateCasePage', () => ({
  default: () => <div>Update Case Mock</div>,
}));
vi.mock('@/pages/LoginPage', () => ({
  default: () => <div>Login Mock</div>,
}));

import App from '@/App';

afterEach(() => {
  localStorage.clear();
  window.history.pushState({}, '', '/');
});

describe('Roteamento principal', () => {
  it('redireciona para login quando acessa rota protegida sem token', async () => {
    window.history.pushState({}, '', '/dashboard');

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Login Mock')).not.toBeNull();
    });
  });

  it('permite rota protegida quando token existe', async () => {
    localStorage.setItem('token', 'jwt-teste');
    window.history.pushState({}, '', '/dashboard');

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Dashboard Mock')).not.toBeNull();
    });
  });

  it('na raiz sem token redireciona para login', async () => {
    window.history.pushState({}, '', '/');

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Login Mock')).not.toBeNull();
    });
  });
});

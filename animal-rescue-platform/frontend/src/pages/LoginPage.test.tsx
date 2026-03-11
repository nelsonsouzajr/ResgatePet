import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import { login } from '@/services/auth.service';

const mockNavigate = vi.fn();

vi.mock('@/services/auth.service', () => ({
  login: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockedLogin = vi.mocked(login);

describe('LoginPage', () => {
  beforeEach(() => {
    mockedLogin.mockReset();
    mockNavigate.mockReset();
  });

  it('exibe validacoes locais para email e senha invalidos', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'email-invalido' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe um e-mail válido.')).not.toBeNull();
    expect(screen.getByText('A senha deve ter pelo menos 6 caracteres.')).not.toBeNull();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('autentica e navega para dashboard com credenciais validas', async () => {
    mockedLogin.mockResolvedValue({
      token: 'jwt-token',
      user: {
        id: 1,
        name: 'Voluntario',
        email: 'voluntario@resgatepet.org',
        role: 'volunteer',
      },
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'voluntario@resgatepet.org' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith('voluntario@resgatepet.org', '123456');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('exibe mensagem amigavel quando a autenticacao falha', async () => {
    mockedLogin.mockRejectedValue(new Error('unauthorized'));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'voluntario@resgatepet.org' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Falha ao autenticar. Verifique e-mail e senha.')).not.toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

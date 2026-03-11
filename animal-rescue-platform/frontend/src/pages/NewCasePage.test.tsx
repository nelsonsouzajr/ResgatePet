import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NewCasePage from '@/pages/NewCasePage';
import { createCase, uploadCaseImages } from '@/services/cases.service';
import { listOrganizations } from '@/services/organizations.service';

const mockNavigate = vi.fn();

vi.mock('@/services/cases.service', () => ({
  createCase: vi.fn(),
  uploadCaseImages: vi.fn(),
}));

vi.mock('@/services/organizations.service', () => ({
  listOrganizations: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockedCreateCase = vi.mocked(createCase);
const mockedUploadCaseImages = vi.mocked(uploadCaseImages);
const mockedListOrganizations = vi.mocked(listOrganizations);

describe('NewCasePage', () => {
  beforeEach(() => {
    mockedCreateCase.mockReset();
    mockedUploadCaseImages.mockReset();
    mockedListOrganizations.mockReset();
    mockNavigate.mockReset();

    mockedListOrganizations.mockResolvedValue([]);
  });

  it('bloqueia envio quando campos obrigatorios estao ausentes', async () => {
    render(
      <MemoryRouter>
        <NewCasePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Registrar ocorrência' }));

    expect(await screen.findByText('Descrição do animal é obrigatória.')).not.toBeNull();
    expect(screen.getByText('Localização é obrigatória.')).not.toBeNull();
    expect(screen.getByText('Adicione ao menos uma foto do animal.')).not.toBeNull();
    expect(mockedCreateCase).not.toHaveBeenCalled();
  });

  it('registra caso, envia foto e redireciona para detalhes', async () => {
    mockedCreateCase.mockResolvedValue({ id: 101 } as never);
    mockedUploadCaseImages.mockResolvedValue({ uploaded: [] });

    render(
      <MemoryRouter>
        <NewCasePage />
      </MemoryRouter>
    );

    const descriptionField = screen.getByPlaceholderText('Estado físico, comportamento, sinais clínicos...');

    fireEvent.change(descriptionField, {
      target: { value: 'Animal com ferimento leve na pata esquerda.' },
    });

    fireEvent.change(screen.getByPlaceholderText('Rua, bairro, cidade, ponto de referência'), {
      target: { value: 'Campinas, bairro Centro' },
    });

    const file = new File(['conteudo'], 'animal.jpg', { type: 'image/jpeg' });
    fireEvent.change(descriptionField.closest('form')!.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Registrar ocorrência' }));

    await waitFor(() => {
      expect(mockedCreateCase).toHaveBeenCalledTimes(1);
      expect(mockedUploadCaseImages).toHaveBeenCalledWith(101, [file]);
      expect(mockNavigate).toHaveBeenCalledWith('/cases/101');
    });
  });

  it('mostra erro amigavel quando a criacao falha', async () => {
    mockedCreateCase.mockRejectedValue(new Error('unauthorized'));

    render(
      <MemoryRouter>
        <NewCasePage />
      </MemoryRouter>
    );

    const descriptionField = screen.getByPlaceholderText('Estado físico, comportamento, sinais clínicos...');

    fireEvent.change(descriptionField, {
      target: { value: 'Animal assustado e sem coleira.' },
    });

    fireEvent.change(screen.getByPlaceholderText('Rua, bairro, cidade, ponto de referência'), {
      target: { value: 'São Paulo, Vila Mariana' },
    });

    const file = new File(['conteudo'], 'animal.jpg', { type: 'image/jpeg' });
    fireEvent.change(descriptionField.closest('form')!.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Registrar ocorrência' }));

    expect(await screen.findByText('Falha ao registrar ocorrência. Verifique se você está autenticado.')).not.toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

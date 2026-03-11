import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { CaseDetail, CaseStatus } from '@/types/case';
import UpdateCasePage from '@/pages/UpdateCasePage';
import { useCaseDetails } from '@/hooks/useCaseDetails';
import { updateCaseStatus, uploadCaseImages } from '@/services/cases.service';

const mockNavigate = vi.fn();

vi.mock('@/hooks/useCaseDetails', () => ({
  useCaseDetails: vi.fn(),
}));

vi.mock('@/services/cases.service', () => ({
  updateCaseStatus: vi.fn(),
  uploadCaseImages: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '12' }),
  };
});

const mockedUseCaseDetails = vi.mocked(useCaseDetails);
const mockedUpdateCaseStatus = vi.mocked(updateCaseStatus);
const mockedUploadCaseImages = vi.mocked(uploadCaseImages);

function buildCase(status: CaseStatus): CaseDetail {
  return {
    id: 12,
    animal_id: 1,
    reported_by: 1,
    organization_id: null,
    status,
    priority: 'medium',
    location_description: 'Campinas, Centro',
    latitude: -22.9,
    longitude: -47.0,
    created_at: '2026-01-01T10:00:00.000Z',
    updated_at: '2026-01-01T10:00:00.000Z',
    animal: {
      id: 1,
      species: 'dog',
      breed: null,
      color: null,
      estimated_age: null,
      gender: 'unknown',
      description: 'Animal em observacao',
    },
    reporter: {
      id: 1,
      name: 'Voluntario A',
      email: 'voluntario@resgatepet.org',
    },
    organization: null,
    images: [],
    updates: [],
  };
}

describe('UpdateCasePage', () => {
  beforeEach(() => {
    mockedUseCaseDetails.mockReset();
    mockedUpdateCaseStatus.mockReset();
    mockedUploadCaseImages.mockReset();
    mockNavigate.mockReset();
  });

  it('bloqueia atualizacao para status terminal', async () => {
    mockedUseCaseDetails.mockReturnValue({
      data: buildCase('resolved'),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <UpdateCasePage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Caso em status terminal: não há transições disponíveis.')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Salvar atualização' })).toBeDisabled();
    expect(mockedUpdateCaseStatus).not.toHaveBeenCalled();
  });

  it('atualiza status, envia anexos e redireciona para detalhes', async () => {
    mockedUseCaseDetails.mockReturnValue({
      data: buildCase('reported'),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockedUpdateCaseStatus.mockResolvedValue({} as never);
    mockedUploadCaseImages.mockResolvedValue({ uploaded: [] });

    render(
      <MemoryRouter>
        <UpdateCasePage />
      </MemoryRouter>
    );

    const notesField = screen.getByPlaceholderText('Descreva o progresso do caso, condutas e estado do animal.');

    fireEvent.change(notesField, {
      target: { value: 'Equipe a caminho do local.' },
    });

    const file = new File(['conteudo'], 'atualizacao.jpg', { type: 'image/jpeg' });
    fireEvent.change(notesField.closest('form')!.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar atualização' }));

    await waitFor(() => {
      expect(mockedUpdateCaseStatus).toHaveBeenCalledWith(12, {
        status: 'awaiting_rescue',
        notes: 'Equipe a caminho do local.',
      });
      expect(mockedUploadCaseImages).toHaveBeenCalledWith(12, [file]);
      expect(mockNavigate).toHaveBeenCalledWith('/cases/12');
    });
  });
});

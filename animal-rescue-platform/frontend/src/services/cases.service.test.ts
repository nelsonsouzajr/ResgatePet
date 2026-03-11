import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/services/api';
import {
  createCase,
  listCases,
  updateCaseStatus,
  uploadCaseImages,
} from '@/services/cases.service';

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);
const mockedApiPost = vi.mocked(api.post);
const mockedApiPatch = vi.mocked(api.patch);

describe('cases.service', () => {
  beforeEach(() => {
    mockedApiGet.mockReset();
    mockedApiPost.mockReset();
    mockedApiPatch.mockReset();
  });

  it('remove filtro de cidade da chamada da API ao listar casos', async () => {
    mockedApiGet.mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 20 },
    } as never);

    await listCases({ city: 'campinas', status: 'reported', page: 2, limit: 10 });

    expect(mockedApiGet).toHaveBeenCalledWith('/cases', {
      params: {
        status: 'reported',
        page: 2,
        limit: 10,
      },
    });
  });

  it('envia payload correto para criacao de caso', async () => {
    mockedApiPost.mockResolvedValue({ data: { id: 10 } } as never);

    await createCase({
      animal: {
        species: 'dog',
      },
      location_description: 'Campinas',
      priority: 'high',
    });

    expect(mockedApiPost).toHaveBeenCalledWith('/cases', {
      animal: {
        species: 'dog',
      },
      location_description: 'Campinas',
      priority: 'high',
    });
  });

  it('atualiza status do caso na rota correta', async () => {
    mockedApiPatch.mockResolvedValue({ data: { ok: true } } as never);

    await updateCaseStatus(99, { status: 'resolved', notes: 'Atendimento concluido' });

    expect(mockedApiPatch).toHaveBeenCalledWith('/cases/99/status', {
      status: 'resolved',
      notes: 'Atendimento concluido',
    });
  });

  it('faz upload de imagens com multipart/form-data', async () => {
    mockedApiPost.mockResolvedValue({ data: { uploaded: [] } } as never);

    const file = new File(['conteudo'], 'foto.jpg', { type: 'image/jpeg' });
    await uploadCaseImages(7, [file]);

    expect(mockedApiPost).toHaveBeenCalledTimes(1);

    const [url, body, config] = mockedApiPost.mock.calls[0];
    expect(url).toBe('/cases/7/images');
    expect(body).toBeInstanceOf(FormData);
    expect(config).toEqual({
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  });
});

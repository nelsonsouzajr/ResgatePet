import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('resolveAssetUrl', () => {
  it('retorna string vazia para valores ausentes', async () => {
    const { resolveAssetUrl } = await import('./api');
    expect(resolveAssetUrl(undefined)).toBe('');
    expect(resolveAssetUrl(null)).toBe('');
  });

  it('mantem URLs absolutas sem alteracao', async () => {
    const { resolveAssetUrl } = await import('./api');
    expect(resolveAssetUrl('https://cdn.site.com/imagem.jpg')).toBe('https://cdn.site.com/imagem.jpg');
  });

  it('resolve caminho relativo usando a origem da API', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.resgatepet.local/api');
    const { resolveAssetUrl } = await import('./api');

    expect(resolveAssetUrl('/uploads/foto.jpg')).toBe('http://api.resgatepet.local/uploads/foto.jpg');
    expect(resolveAssetUrl('uploads/foto.jpg')).toBe('http://api.resgatepet.local/uploads/foto.jpg');
  });
});

/**
 * services/api.ts
 * Camada de acesso à API REST do backend.
 * Configura uma instância axios centralizada com interceptors para
 * injetar o token JWT em todas as requisições autenticadas.
 */

import axios from 'axios';

// URL base lida da variável de ambiente definida no .env
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/** Origem do backend sem o sufixo /api (ex.: http://localhost:3000) */
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

/** Instância axios compartilhada por toda a aplicação */
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Resolve paths relativos de upload para URL absoluta do backend */
export function resolveAssetUrl(url?: string | null): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

// ─── Interceptor de Requisição ────────────────────────────────────────────────
// Injeta o token JWT no header Authorization antes de cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Interceptor de Resposta ──────────────────────────────────────────────────
// Redireciona para login em caso de 401 (token inválido ou expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

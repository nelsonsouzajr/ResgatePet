/**
 * services/api.ts
 * Camada de acesso à API REST do backend.
 * Configura uma instância axios centralizada com interceptors para
 * injetar o token JWT em todas as requisições autenticadas.
 */

import axios from 'axios';

// URL base lida da variável de ambiente definida no .env
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/** Instância axios compartilhada por toda a aplicação */
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

/**
 * __tests__/organizations.test.ts
 * Testes de integração para o módulo de organizações.
 *
 * Cobertura:
 *  GET  /api/organizations      – listagem pública
 *  GET  /api/organizations/:id  – detalhes, 404
 *  POST /api/organizations      – criação por admin, validação, acesso negado
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

jest.mock('../config/database', () => ({
  query: jest.fn(),
  pool:  { connect: jest.fn(), end: jest.fn() },
}));

import { query } from '../config/database';
const mockQuery = query as jest.MockedFunction<typeof query>;

function makeToken(role = 'admin', id = 1) {
  return jwt.sign(
    { id, email: 'admin@test.com', role },
    process.env.JWT_SECRET ?? 'test-secret',
    { expiresIn: '1h' }
  );
}

const ORG_FIXTURE = {
  id: 1,
  name: 'ONG Patas Livres',
  description: 'ONG de resgate',
  city: 'São Paulo',
  state: 'SP',
  created_at: new Date(),
};

afterEach(() => jest.clearAllMocks());

// =============================================================================
// LISTAGEM
// =============================================================================

describe('GET /api/organizations', () => {
  test('deve retornar array de organizações', async () => {
    mockQuery.mockResolvedValueOnce([ORG_FIXTURE]);

    const res = await request(app).get('/api/organizations');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'ONG Patas Livres');
  });

  test('deve retornar array vazio quando não há organizações', async () => {
    mockQuery.mockResolvedValueOnce([]);

    const res = await request(app).get('/api/organizations');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

// =============================================================================
// DETALHES
// =============================================================================

describe('GET /api/organizations/:id', () => {
  test('deve retornar a organização existente', async () => {
    mockQuery.mockResolvedValueOnce([ORG_FIXTURE]);

    const res = await request(app).get('/api/organizations/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
  });

  test('deve retornar 404 para organização inexistente', async () => {
    mockQuery.mockResolvedValueOnce([]);

    const res = await request(app).get('/api/organizations/9999');

    expect(res.status).toBe(404);
  });
});

// =============================================================================
// CRIAÇÃO
// =============================================================================

describe('POST /api/organizations', () => {
  test('deve criar organização como admin', async () => {
    const token = makeToken('admin');
    mockQuery.mockResolvedValueOnce([ORG_FIXTURE]);

    const res = await request(app)
      .post('/api/organizations')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ONG Patas Livres', city: 'São Paulo', state: 'SP' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('deve retornar 403 para usuário não-admin', async () => {
    const token = makeToken('volunteer');

    const res = await request(app)
      .post('/api/organizations')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ONG Teste' });

    expect(res.status).toBe(403);
  });

  test('deve retornar 401 sem autenticação', async () => {
    const res = await request(app)
      .post('/api/organizations')
      .send({ name: 'ONG Teste' });

    expect(res.status).toBe(401);
  });

  test('deve retornar 400 quando o nome está ausente', async () => {
    const token = makeToken('admin');

    const res = await request(app)
      .post('/api/organizations')
      .set('Authorization', `Bearer ${token}`)
      .send({ city: 'São Paulo' }); // sem nome

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('deve retornar 400 para UF com mais de 2 caracteres', async () => {
    const token = makeToken('admin');

    const res = await request(app)
      .post('/api/organizations')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'ONG Teste', state: 'SPP' }); // UF inválida

    expect(res.status).toBe(400);
  });
});

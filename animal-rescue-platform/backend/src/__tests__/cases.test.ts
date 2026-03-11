/**
 * __tests__/cases.test.ts
 * Testes de integração para o módulo de ocorrências de resgate.
 * O banco de dados é mockado; JWT real é gerado para rotas autenticadas.
 *
 * Cobertura:
 *  GET    /api/cases              – listagem, filtros
 *  GET    /api/cases/:id          – detalhes, 404
 *  POST   /api/cases              – criação autenticada, validação
 *  PATCH  /api/cases/:id/status   – atualização de status, transição inválida
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

// ─── Mock do banco ────────────────────────────────────────────────────────────
jest.mock('../config/database', () => ({
  query: jest.fn(),
  pool:  { connect: jest.fn(), end: jest.fn() },
}));

import { query } from '../config/database';
const mockQuery = query as jest.MockedFunction<typeof query>;

// ─── Helper: gera token JWT válido para testes ────────────────────────────────
function makeToken(role = 'volunteer', id = 2) {
  return jwt.sign(
    { id, email: 'test@test.com', role },
    process.env.JWT_SECRET ?? 'test-secret',
    { expiresIn: '1h' }
  );
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const BASE_CASE = {
  id: 1,
  animal_id: 1,
  reported_by: 2,
  organization_id: null,
  status: 'reported',
  priority: 'medium',
  location_description: 'Av. Paulista, 1000',
  latitude: -23.5613,
  longitude: -46.6558,
  created_at: new Date('2026-03-11T10:00:00Z'),
  updated_at: new Date('2026-03-11T10:00:00Z'),
};

afterEach(() => jest.clearAllMocks());

// =============================================================================
// LISTAGEM
// =============================================================================

describe('GET /api/cases', () => {
  test('deve retornar lista paginada de casos', async () => {
    // COUNT → total
    mockQuery.mockResolvedValueOnce([{ count: '1' }]);
    // dados
    mockQuery.mockResolvedValueOnce([{
      ...BASE_CASE,
      animal_species:    'dog',
      animal_breed:      'SRD',
      reported_by_name:  'Maria',
      organization_name: null,
      image_count:       0,
    }]);

    const res = await request(app).get('/api/cases');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total', 1);
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('limit', 20);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('deve aceitar filtro por status via query param', async () => {
    mockQuery.mockResolvedValueOnce([{ count: '0' }]);
    mockQuery.mockResolvedValueOnce([]);

    const res = await request(app).get('/api/cases?status=in_rescue');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

// =============================================================================
// DETALHES
// =============================================================================

describe('GET /api/cases/:id', () => {
  test('deve retornar os detalhes completos de um caso existente', async () => {
    // Cada query sub-call em CaseRepository.findById
    mockQuery.mockResolvedValueOnce([BASE_CASE]);   // rescue_cases
    mockQuery.mockResolvedValueOnce([{              // animals
      id: 1, species: 'dog', breed: 'SRD',
      color: 'caramelo', estimated_age: '2 anos',
      gender: 'male', description: null,
    }]);
    mockQuery.mockResolvedValueOnce([{ id: 2, name: 'Maria', email: 'maria@teste.com' }]); // users
    mockQuery.mockResolvedValueOnce([]);  // images (vazio)
    mockQuery.mockResolvedValueOnce([]);  // updates (vazio)

    const res = await request(app).get('/api/cases/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('animal');
    expect(res.body.animal).toHaveProperty('species', 'dog');
  });

  test('deve retornar 404 para caso inexistente', async () => {
    mockQuery.mockResolvedValueOnce([]); // rescue_cases vazio

    const res = await request(app).get('/api/cases/9999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('deve retornar 400 para ID não numérico', async () => {
    const res = await request(app).get('/api/cases/abc');
    expect(res.status).toBe(400);
  });
});

// =============================================================================
// CRIAÇÃO
// =============================================================================

describe('POST /api/cases', () => {
  const VALID_PAYLOAD = {
    animal: {
      species: 'dog',
      breed:   'SRD',
      color:   'caramelo',
      gender:  'male',
    },
    priority:             'high',
    location_description: 'Av. Paulista, 1000',
    latitude:             -23.5613,
    longitude:            -46.6558,
  };

  test('deve criar um caso para usuário autenticado', async () => {
    const token = makeToken('volunteer', 2);

    // AnimalRepository.create
    mockQuery.mockResolvedValueOnce([{ id: 1, ...VALID_PAYLOAD.animal, created_at: new Date() }]);
    // CaseRepository.create
      mockQuery.mockResolvedValueOnce([{ ...BASE_CASE, id: 10, animal_id: 1, reported_by: 2 }]);

    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('status', 'reported');
  });

  test('deve retornar 401 sem token de autenticação', async () => {
    const res = await request(app)
      .post('/api/cases')
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(401);
  });

  test('deve retornar 400 quando a espécie do animal está ausente', async () => {
    const token = makeToken();
    const { animal: { species: _s, ...animalWithoutSpecies }, ...rest } = VALID_PAYLOAD as any;

    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...rest, animal: animalWithoutSpecies });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('deve retornar 400 para latitude inválida', async () => {
    const token = makeToken();

    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_PAYLOAD, latitude: 999 });

    expect(res.status).toBe(400);
  });
});

// =============================================================================
// ATUALIZAÇÃO DE STATUS
// =============================================================================

describe('PATCH /api/cases/:id/status', () => {
  test('deve atualizar status com transição válida', async () => {
    const token = makeToken('volunteer', 2);

    // CaseRepository.findById (current case – status: reported)
    mockQuery.mockResolvedValueOnce([BASE_CASE]);
    mockQuery.mockResolvedValueOnce([{ id: 1, species: 'dog', breed: null, color: null, estimated_age: null, gender: 'unknown', description: null }]);
    mockQuery.mockResolvedValueOnce([{ id: 2, name: 'Maria', email: 'maria@teste.com' }]);
    mockQuery.mockResolvedValueOnce([]); // images
    mockQuery.mockResolvedValueOnce([]); // updates

    // CaseRepository.updateStatus – UPDATE rescue_cases
    mockQuery.mockResolvedValueOnce([{ ...BASE_CASE, status: 'awaiting_rescue' }]);
    // CaseRepository.updateStatus – INSERT case_updates
    mockQuery.mockResolvedValueOnce([]);

    const res = await request(app)
      .patch('/api/cases/1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'awaiting_rescue', notes: 'Aguardando equipe.' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'awaiting_rescue');
  });

  test('deve retornar 422 para transição de status inválida', async () => {
    const token = makeToken('volunteer', 2);

    // Caso com status 'resolved' (terminal) – não permite mais transições
    mockQuery.mockResolvedValueOnce([{ ...BASE_CASE, status: 'resolved' }]);
    mockQuery.mockResolvedValueOnce([{ id: 1, species: 'dog', breed: null, color: null, estimated_age: null, gender: 'unknown', description: null }]);
    mockQuery.mockResolvedValueOnce([{ id: 2, name: 'Maria', email: 'maria@teste.com' }]);
    mockQuery.mockResolvedValueOnce([]);
    mockQuery.mockResolvedValueOnce([]);

    const res = await request(app)
      .patch('/api/cases/1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'reported' });

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/terminal/i);
  });

  test('deve retornar 401 sem autenticação', async () => {
    const res = await request(app)
      .patch('/api/cases/1/status')
      .send({ status: 'in_rescue' });

    expect(res.status).toBe(401);
  });

  test('deve retornar 400 para status inválido', async () => {
    const token = makeToken();

    const res = await request(app)
      .patch('/api/cases/1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'status_invalido' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });
});

// =============================================================================
// HEALTH CHECK (extra)
// =============================================================================

describe('GET /health', () => {
  test('deve retornar status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

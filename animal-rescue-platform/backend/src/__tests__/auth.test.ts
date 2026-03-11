/**
 * __tests__/auth.test.ts
 * Testes de integração para o módulo de autenticação.
 * O banco de dados é mockado para que os testes rodem sem PostgreSQL.
 *
 * Cobertura:
 *  POST /api/auth/register – campos obrigatórios, e-mail duplicado, senha curta
 *  POST /api/auth/login    – credenciais válidas, inválidas, usuário inexistente
 */

import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';

// ─── Mock do módulo de banco de dados ─────────────────────────────────────────
// Impede qualquer conexão real com PostgreSQL durante os testes
jest.mock('../config/database', () => ({
  query: jest.fn(),
  pool:  { connect: jest.fn(), end: jest.fn() },
}));

// Importa o mock tipado para configurar retornos por teste
import { query } from '../config/database';
const mockQuery = query as jest.MockedFunction<typeof query>;

// ─── Dados de Fixture ─────────────────────────────────────────────────────────

const VALID_USER = {
  name:     'Maria Teste',
  email:    'maria@teste.com',
  password: 'senha123',
  role:     'volunteer',
};

// Hash bcrypt fixo de "senha123" para o fixture de login
let HASH_SENHA123: string;

beforeAll(async () => {
  HASH_SENHA123 = await bcrypt.hash('senha123', 10);
});

// Limpa todos os mocks entre testes
afterEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// REGISTRO
// =============================================================================

describe('POST /api/auth/register', () => {
  test('deve registrar um novo usuário com dados válidos', async () => {
    // emailExists → false (e-mail disponível)
    mockQuery.mockResolvedValueOnce([{ count: '0' }]);
    // create → usuário criado
    mockQuery.mockResolvedValueOnce([{
      id: 1,
      name:       VALID_USER.name,
      email:      VALID_USER.email,
      phone:      null,
      role:       'volunteer',
      created_at: new Date(),
      updated_at: new Date(),
    }]);

    const res = await request(app)
      .post('/api/auth/register')
      .send(VALID_USER);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', VALID_USER.email);
    // Nunca deve retornar o hash da senha
    expect(res.body).not.toHaveProperty('password_hash');
  });

  test('deve retornar 409 quando o e-mail já está cadastrado', async () => {
    // emailExists → true (e-mail já existe)
    mockQuery.mockResolvedValueOnce([{ count: '1' }]);

    const res = await request(app)
      .post('/api/auth/register')
      .send(VALID_USER);

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error', 'E-mail já cadastrado.');
  });

  test('deve retornar 400 quando o e-mail é inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_USER, email: 'email-invalido' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('deve retornar 400 quando a senha é muito curta', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_USER, email: 'novo@teste.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toMatch(/6 caracteres/);
  });

  test('deve retornar 400 quando o nome está ausente', async () => {
    const { name: _n, ...withoutName } = VALID_USER;
    const res = await request(app)
      .post('/api/auth/register')
      .send(withoutName);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });
});

// =============================================================================
// LOGIN
// =============================================================================

describe('POST /api/auth/login', () => {
  test('deve autenticar com credenciais válidas e retornar JWT', async () => {
    // findByEmail → usuário com hash correto
    mockQuery.mockResolvedValueOnce([{
      id:            1,
      name:          'Maria Teste',
      email:         VALID_USER.email,
      password_hash: HASH_SENHA123,
      phone:         null,
      role:          'volunteer',
      created_at:    new Date(),
      updated_at:    new Date(),
    }]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: VALID_USER.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', VALID_USER.email);
    expect(res.body.user).not.toHaveProperty('password_hash');
    // Token deve ser uma string não vazia
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(10);
  });

  test('deve retornar 401 com senha incorreta', async () => {
    mockQuery.mockResolvedValueOnce([{
      id:            1,
      email:         VALID_USER.email,
      password_hash: HASH_SENHA123,
      role:          'volunteer',
    }]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: 'senhaErrada' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Credenciais inválidas.');
  });

  test('deve retornar 401 quando o usuário não existe', async () => {
    // findByEmail → nenhum resultado
    mockQuery.mockResolvedValueOnce([]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'naoexiste@teste.com', password: 'qualquer' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Credenciais inválidas.');
  });

  test('deve retornar 400 quando o e-mail é inválido', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nao-e-email', password: 'senha123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('deve retornar 400 quando a senha está ausente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });
});

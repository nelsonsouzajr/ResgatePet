/**
 * app.ts
 * Configuração central do Express: middlewares globais e registro de rotas.
 * Separado do server.ts para facilitar testes de integração.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes         from './routes/auth.routes';
import casesRoutes        from './routes/cases.routes';
import organizationsRoutes from './routes/organizations.routes';
import { errorHandler }   from './middlewares/errorHandler';

const app = express();

// ─── Middlewares Globais ──────────────────────────────────────────────────────

// Habilita CORS para o frontend (ajuste a origin em produção)
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}));

// Parseia JSON no body das requisições
app.use(express.json());

// Parseia dados de formulário URL-encoded
app.use(express.urlencoded({ extended: true }));

// Serve a pasta de uploads como arquivos estáticos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Rota de Health Check ─────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Registro de Rotas da API ─────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/cases',         casesRoutes);
app.use('/api/organizations', organizationsRoutes);

// ─── Handler 404 ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// ─── Middleware Global de Erros (deve ser o último) ───────────────────────────
app.use(errorHandler);

export default app;

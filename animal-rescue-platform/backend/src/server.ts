/**
 * server.ts
 * Ponto de entrada da aplicação backend.
 * Inicializa o Express, carrega middlewares globais e sobe o servidor HTTP.
 */

import 'dotenv/config';
import app from './app';
import { env } from './config/env';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`[ResgatePet] Servidor rodando em http://localhost:${PORT}`);
  console.log(`[ResgatePet] Ambiente: ${env.NODE_ENV}`);
});

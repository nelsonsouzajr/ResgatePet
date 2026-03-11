/**
 * middlewares/errorHandler.ts
 * Middleware global de tratamento de erros do Express.
 * Captura qualquer erro não tratado e retorna resposta JSON padronizada.
 */

import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message =
    statusCode === 500 ? 'Erro interno do servidor.' : err.message;

  // Em desenvolvimento, expõe o stack trace para facilitar debug
  const response: Record<string, unknown> = { error: message };
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response['stack'] = err.stack;
  }

  res.status(statusCode).json(response);
}

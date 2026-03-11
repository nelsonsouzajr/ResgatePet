/**
 * __tests__/setup.ts
 * Arquivo de configuração executado antes de todos os testes.
 * Define variáveis de ambiente mínimas necessárias para os testes
 * rodarem sem um arquivo .env real.
 */

// Variáveis obrigatórias para inicialização do módulo config/env.ts
process.env.DB_NAME     = 'resgatepet_test';
process.env.DB_USER     = 'postgres';
process.env.DB_PASSWORD = 'test';
process.env.JWT_SECRET  = 'test-secret-key-apenas-para-testes';
process.env.NODE_ENV    = 'test';

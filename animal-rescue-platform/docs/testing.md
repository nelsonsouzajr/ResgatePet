# Guia de Testes e Qualidade - ResgatePet

## Visao Geral

Este documento centraliza a estrategia de testes automatizados do projeto,
os comandos de execucao e os resultados atuais de cobertura.

A validacao esta dividida em duas camadas:

- Backend: testes de API com Jest + Supertest
- Frontend: testes de componentes, paginas, hooks e servicos com Vitest + Testing Library

---

## Stack de Testes

| Camada | Ferramentas |
|---|---|
| Backend | Jest, ts-jest, Supertest |
| Frontend | Vitest, @testing-library/react, @testing-library/jest-dom, jsdom |

---

## Escopo Coberto

### Backend

- Registro e login de usuarios
- Listagem e detalhes de ocorrencias
- Criacao de ocorrencias
- Atualizacao de status com regras de transicao
- Regras de autorizacao para organizacoes

Arquivos principais de teste:

- backend/src/__tests__/auth.test.ts
- backend/src/__tests__/cases.test.ts
- backend/src/__tests__/organizations.test.ts

### Frontend

- Roteamento principal e protecao de rotas
- Badges de status e prioridade
- Hook de listagem com filtro local por cidade
- Fluxo de Login
- Fluxo de Nova Ocorrencia
- Fluxo de Atualizacao de Caso
- Servicos de casos com mocks da API
- Utilitario de resolucao de URL de assets

Arquivos principais de teste:

- frontend/src/App.test.tsx
- frontend/src/components/Badges.test.tsx
- frontend/src/hooks/useCases.test.tsx
- frontend/src/pages/LoginPage.test.tsx
- frontend/src/pages/NewCasePage.test.tsx
- frontend/src/pages/UpdateCasePage.test.tsx
- frontend/src/services/api.test.ts
- frontend/src/services/cases.service.test.ts

---

## Comandos de Execucao

### Backend

- npm test
- npm run test:watch
- npm run test:coverage

### Frontend

- npm test
- npm run test:watch
- npm run test:coverage

---

## Resultado Atual

- Backend: 33 testes passando
- Frontend: 22 testes passando

Cobertura frontend (Vitest):

- Statements: 78.36%
- Branches: 75.32%
- Functions: 67.21%
- Lines: 78.57%

---

## Criterios de Qualidade da Entrega

- Nenhum teste quebrado no backend
- Nenhum teste quebrado no frontend
- Build de producao do frontend sem regressao
- Contratos principais da API validados por teste

---

## Melhorias Futuras Recomendadas

- Adicionar testes de upload com simulacao de arquivo no backend
- Adicionar testes E2E de fluxo completo (login -> cadastro -> atualizacao)
- Aumentar cobertura de modulos de servico de autenticacao no frontend
- Incluir relatorio de cobertura do backend consolidado na documentacao final

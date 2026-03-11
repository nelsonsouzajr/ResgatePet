# ResgatePet – Sistema de Gestão de Ocorrências de Resgate Animal

Projeto acadêmico desenvolvido para a disciplina de Computação — UNIVESP 2026.

## Objetivo

Centralizar e organizar pedidos de resgate de animais abandonados que hoje chegam
de forma fragmentada por redes sociais e aplicativos de mensagens.

## Usuários

| Perfil | Acesso |
|---|---|
| Voluntário | Registrar e acompanhar ocorrências |
| Protetor Independente | Registrar e acompanhar ocorrências |
| ONG | Gerenciar casos atribuídos à organização |
| Médico Veterinário | Registrar tratamentos e atualizar status |
| Admin | Gestão completa do sistema |

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Banco de Dados | PostgreSQL 15 |
| Autenticação | JWT (JSON Web Tokens) |
| Upload | Multer (armazenamento local, extensível para cloud) |

## Estrutura do Projeto

```
animal-rescue-platform/
├── backend/          → API REST Node.js/Express
├── frontend/         → Interface React
├── database/         → Schema SQL e migrações
└── docs/             → Documentação técnica completa
```

## Início Rápido

Veja o guia completo em [docs/setup.md](docs/setup.md).

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (outro terminal)
cd frontend && npm install && npm run dev
```

## Documentação

| Documento | Descrição |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Arquitetura do sistema e decisões técnicas |
| [docs/api.md](docs/api.md) | Referência dos endpoints REST |
| [docs/database.md](docs/database.md) | Schema, relacionamentos e modelo de dados |
| [docs/setup.md](docs/setup.md) | Instalação e execução |
| [docs/testing.md](docs/testing.md) | Estratégia de testes, cobertura e critérios de qualidade |

## Fases de Desenvolvimento

- [x] **FASE 1** – Planejamento e estruturação
- [x] **FASE 2** – Banco de dados (schema SQL e migrações)
- [x] **FASE 3** – Backend (controllers, services, repositories)
- [x] **FASE 4** – Frontend (páginas, componentes, hooks e validações)
- [x] **FASE 5** – Integração frontend ↔ backend
- [x] **FASE 6** – Testes
- [x] **FASE 7** – Documentação final

## Entregas da Fase 4

- Rotas React Router completas para dashboard, cadastro, lista, detalhes, atualização e login
- Componentes reutilizáveis de layout, tabela, badges e mapa de ocorrências
- Hooks customizados para listagem, dashboard e detalhes de casos
- Formulários controlados com validação local para cadastro e atualização
- Build de produção validado com sucesso via Vite + TypeScript

## Entregas da Fase 5

- Contrato de paginação padronizado no endpoint de listagem de casos (`data`, `total`, `page`, `limit`)
- Resolução correta de URLs de imagens (uploads) no frontend para ambiente local e produção
- Proxy de `/uploads` no Vite para exibição de imagens durante desenvolvimento
- Fluxo de atualização de status alinhado às transições permitidas no backend
- Revalidação completa: testes do backend e build do frontend com sucesso

## Entregas da Fase 6

- Setup de testes de frontend com Vitest + Testing Library + jsdom
- Scripts adicionados no frontend: `npm test`, `npm run test:watch`, `npm run test:coverage`
- Testes de roteamento e proteção de rotas no App
- Testes de renderização para badges de status e prioridade
- Testes de comportamento do hook `useCases` (filtro local por cidade e tratamento de erro)
- Testes utilitários de resolução de URL de assets (`resolveAssetUrl`)
- Testes de páginas críticas: Login, Nova Ocorrência e Atualização de Caso
- Testes de integração da camada de serviços de casos com mocks de API
- Execução validada no frontend: 22 testes passando
- Cobertura de testes do frontend: 78.36% de statements, 75.32% de branches, 67.21% de funções e 78.57% de linhas
- Revalidação completa: testes de backend (33) e frontend (22) passando, com build de produção sem regressão

## Entregas da Fase 7

- Consolidação da documentação técnica final (arquitetura, API, banco, setup e qualidade)
- Atualização da referência de API com contratos e códigos de erro alinhados ao comportamento real
- Criação do guia de testes e qualidade em `docs/testing.md`
- Padronização do guia de setup com passos de validação pós-instalação
- Projeto finalizado com todas as fases concluídas (1 a 7)

---

Desenvolvido com fins educacionais – UNIVESP 2026.

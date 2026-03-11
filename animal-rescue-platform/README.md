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

## Fases de Desenvolvimento

- [x] **FASE 1** – Planejamento e estruturação
- [x] **FASE 2** – Banco de dados (schema SQL e migrações)
- [x] **FASE 3** – Backend (controllers, services, repositories)
- [x] **FASE 4** – Frontend (páginas, componentes, hooks e validações)
- [ ] **FASE 5** – Integração frontend ↔ backend
- [ ] **FASE 6** – Testes
- [ ] **FASE 7** – Documentação final

## Entregas da Fase 4

- Rotas React Router completas para dashboard, cadastro, lista, detalhes, atualização e login
- Componentes reutilizáveis de layout, tabela, badges e mapa de ocorrências
- Hooks customizados para listagem, dashboard e detalhes de casos
- Formulários controlados com validação local para cadastro e atualização
- Build de produção validado com sucesso via Vite + TypeScript

---

Desenvolvido com fins educacionais – UNIVESP 2026.

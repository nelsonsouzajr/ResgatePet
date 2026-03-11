# Arquitetura do Sistema – ResgatePet

## Visão Geral

O ResgatePet é um sistema web de gestão de ocorrências de resgate animal construído
sobre uma arquitetura **cliente‑servidor com API REST**. A separação clara entre
frontend e backend garante independência de implantação e facilita a evolução de cada
camada sem impactar a outra.

```
┌─────────────────────────────────────────────────────────┐
│                     USUÁRIO (Browser)                    │
│               React + TypeScript + Vite                  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / REST (JSON)
┌───────────────────────▼─────────────────────────────────┐
│                  API BACKEND (Node.js)                   │
│             Express + TypeScript + JWT                   │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐ ┌─────────┐  │
│  │  Routes   │ │ Controllers│ │  Services │ │  Repos  │  │
│  └───────────┘ └──────────┘ └────────────┘ └────┬────┘  │
└───────────────────────────────────────────────────┼──────┘
                                                    │ SQL
┌───────────────────────────────────────────────────▼──────┐
│                   PostgreSQL Database                     │
│  users · organizations · animals · rescue_cases           │
│  rescue_images · case_updates                            │
└──────────────────────────────────────────────────────────┘
```

---

## Camadas da Aplicação

### Frontend (`/frontend`)
Responsável pela interface com o usuário. Construído com **React + TypeScript** e
empacotado via **Vite** para builds rápidos. O **Tailwind CSS** cuida da estilização.
Toda comunicação com o servidor ocorre via chamadas HTTP aos endpoints REST expostos
pelo backend (sem acesso direto ao banco de dados).

| Subpasta | Responsabilidade |
|---|---|
| `components/` | Componentes visuais reutilizáveis (botões, cards, modais, tabelas) |
| `pages/` | Páginas completas de rota: Dashboard, Ocorrências, Detalhes, etc. |
| `services/` | Camada de acesso à API REST (axios/fetch encapsulado) |
| `hooks/` | Custom hooks React (estado assíncrono, formulários, filtros) |
| `styles/` | Arquivo de entrada do Tailwind e variáveis CSS globais |

### Backend (`/backend`)
API RESTful que centraliza a lógica de negócio e persiste os dados.

| Subpasta | Responsabilidade |
|---|---|
| `config/` | Configuração de banco de dados, variáveis de ambiente e upload |
| `controllers/` | Recebem as requisições HTTP, validam e delegam para Services |
| `routes/` | Mapeiam as URLs para os Controllers corretos |
| `services/` | Contêm a lógica de negócio (regras, validações, orquestração) |
| `repositories/` | Executam queries SQL no banco de dados (separação do acesso a dados) |
| `models/` | Tipos TypeScript / interfaces que representam as entidades do domínio |
| `middlewares/` | Autenticação JWT, tratamento de erros, upload de imagens, logging |

### Banco de Dados (`/database`)
PostgreSQL gerenciado via migrações SQL versionadas.

| Subpasta | Responsabilidade |
|---|---|
| `migrations/` | Arquivos SQL numerados que criam/alteram tabelas incrementalmente |

### Documentação (`/docs`)
Mantém toda a documentação técnica do projeto.

| Arquivo | Conteúdo |
|---|---|
| `architecture.md` | Este arquivo — visão arquitetural |
| `api.md` | Referência completa dos endpoints REST |
| `database.md` | Schema, relacionamentos e decisões do banco de dados |
| `setup.md` | Guia de instalação e execução local |

---

## Fluxo de Dados Completo

```
1. Usuário acessa o browser (Frontend React)
       │
2. Frontend faz requisição HTTP para o Backend
   (ex.: GET /api/cases?status=reported)
       │
3. Router Express identifica a rota e chama o Controller
       │
4. Controller valida o payload e delega ao Service
       │
5. Service aplica regras de negócio e chama o Repository
       │
6. Repository executa a query SQL no PostgreSQL
       │
7. PostgreSQL retorna os registros → Repository → Service → Controller
       │
8. Controller serializa a resposta em JSON e envia ao Frontend
       │
9. Frontend atualiza o estado React (hook) e renderiza os dados
       │
10. Usuário visualiza as ocorrências na tela
```

---

## Decisões Técnicas

| Decisão | Justificativa |
|---|---|
| **React + Vite** | DX rápida, HMR eficiente para desenvolvimento acadêmico |
| **TypeScript** | Tipagem estática reduz erros em runtime em ambas as camadas |
| **Express** | Framework minimalista e amplamente documentado |
| **PostgreSQL** | RDBMS robusto com suporte a dados geoespaciais (lat/lng) |
| **JWT** | Autenticação stateless adequada para API REST |
| **Migrações SQL** | Versionamento do schema, fácil rollback e onboarding |
| **Padrão Repository** | Desacoplamento entre lógica de negócio e acesso a dados |
| **Tailwind CSS** | Produtividade alta sem CSS customizado excessivo |

---

## Segurança e Governança

- Autenticação baseada em JWT com expiração configurável via ambiente.
- Rotas sensíveis protegidas por middleware de autenticação.
- Controle de autorização por role em endpoints administrativos.
- Validação de entrada centralizada com express-validator.
- Tratamento global de erros para padronização das respostas.

---

## Qualidade e Testes

- Backend validado com Jest + Supertest.
- Frontend validado com Vitest + Testing Library + jsdom.
- Fluxos críticos cobertos em API, páginas principais, hooks e serviços.
- Build de produção validado ao final das fases de implementação e testes.

Para detalhes operacionais de testes e cobertura, consultar `docs/testing.md`.

---

## Estado Atual da Solução

- Arquitetura por camadas implementada e em funcionamento (Controller -> Service -> Repository).
- Contrato principal entre frontend e backend estabilizado na Fase 5.
- Regras de transição de status aplicadas no backend e refletidas na UI.
- Documentação técnica consolidada para instalação, API, banco, arquitetura e qualidade.

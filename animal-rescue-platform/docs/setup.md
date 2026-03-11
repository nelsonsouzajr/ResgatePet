# Guia de Instalação e Execução – ResgatePet

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 20.x |
| npm | 10.x |
| PostgreSQL | 15.x |
| Git | 2.x |

---

## 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd animal-rescue-platform
```

---

## 2. Configurar o Backend

```bash
cd backend
npm install
```

Criar o arquivo de variáveis de ambiente:

```bash
cp .env.example .env
```

Editar `.env` com suas configurações:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resgatepet
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# JWT
JWT_SECRET=troque_por_um_segredo_longo_e_aleatorio
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
```

---

## 3. Configurar o Banco de Dados

Criar o banco no PostgreSQL:

```sql
CREATE DATABASE resgatepet;
```

Executar o schema inicial:

```bash
psql -U postgres -d resgatepet -f database/schema.sql
```

Ou executar as migrações individualmente:

```bash
psql -U postgres -d resgatepet -f database/migrations/001_create_users.sql
psql -U postgres -d resgatepet -f database/migrations/002_create_organizations.sql
psql -U postgres -d resgatepet -f database/migrations/003_create_animals.sql
psql -U postgres -d resgatepet -f database/migrations/004_create_rescue_cases.sql
psql -U postgres -d resgatepet -f database/migrations/005_create_rescue_images.sql
psql -U postgres -d resgatepet -f database/migrations/006_create_case_updates.sql
```

---

## 4. Iniciar o Backend

```bash
# Modo desenvolvimento (hot reload)
npm run dev

# Build de produção
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3000`.

---

## 5. Configurar o Frontend

```bash
cd ../frontend
npm install
```

Criar arquivo de ambiente:

```bash
cp .env.example .env
```

Conteúdo do `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 6. Iniciar o Frontend

```bash
# Modo desenvolvimento
npm run dev

# Build de produção
npm run build
npm run preview
```

O frontend estará disponível em `http://localhost:5173`.

---

## 7. Estrutura de Pastas Resumida

```
animal-rescue-platform/
├── backend/
│   ├── config/          → conexão DB, env, multer
│   ├── controllers/     → handlers HTTP
│   ├── routes/          → mapeamento de rotas
│   ├── services/        → lógica de negócio
│   ├── repositories/    → acesso ao banco
│   ├── models/          → tipos TypeScript
│   ├── middlewares/     → auth, erros, upload
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── components/      → componentes reutilizáveis
│   ├── pages/           → páginas das rotas
│   ├── services/        → chamadas à API
│   ├── hooks/           → custom hooks
│   ├── styles/          → Tailwind e CSS global
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── database/
│   ├── migrations/      → arquivos SQL numerados
│   └── schema.sql       → schema completo
│
└── docs/
    ├── architecture.md
    ├── api.md
    ├── database.md
    └── setup.md
```

---

## 8. Scripts Disponíveis

### Backend

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia com ts-node-dev (hot reload) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Executa o build compilado |
| `npm test` | Executa os testes automatizados |

### Frontend

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor Vite em modo desenvolvimento |
| `npm run build` | Gera build otimizado em `dist/` |
| `npm run preview` | Visualiza o build localmente |
| `npm run lint` | Executa ESLint |

---

## Variáveis de Ambiente – Referência Completa

### Backend (`.env`)

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `PORT` | Não | 3000 | Porta do servidor Express |
| `NODE_ENV` | Não | development | Ambiente de execução |
| `DB_HOST` | Sim | — | Host do PostgreSQL |
| `DB_PORT` | Não | 5432 | Porta do PostgreSQL |
| `DB_NAME` | Sim | — | Nome do banco de dados |
| `DB_USER` | Sim | — | Usuário do banco |
| `DB_PASSWORD` | Sim | — | Senha do banco |
| `JWT_SECRET` | Sim | — | Chave secreta para assinar tokens |
| `JWT_EXPIRES_IN` | Não | 7d | Expiração do token JWT |
| `UPLOAD_DIR` | Não | uploads | Diretório local de uploads |
| `MAX_FILE_SIZE_MB` | Não | 5 | Tamanho máximo por arquivo |

### Frontend (`.env`)

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `VITE_API_URL` | Sim | — | URL base da API backend |

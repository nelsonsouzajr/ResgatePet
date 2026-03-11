# Banco de Dados – ResgatePet

**SGBD:** PostgreSQL 15+  
**Arquivo de schema:** `database/schema.sql`  
**Migrações:** `database/migrations/`

---

## Diagrama de Entidades e Relacionamentos

```
users ──────────────────────────────────────────────────┐
  │ id (PK)                                              │
  │ name, email, password_hash                          │
  │ phone, role, created_at, updated_at                 │
  │                                                     │
  │ (1)─────────────────────(N)                         │
  ▼                                                     │
rescue_cases ◄────── organizations (id, name, ...)      │
  │ id (PK)                                             │
  │ animal_id (FK → animals)                            │
  │ reported_by (FK → users)                            │
  │ organization_id (FK → organizations)                │
  │ status, priority                                    │
  │ location_description, latitude, longitude           │
  │ created_at, updated_at                              │
  │                                                     │
  ├─(1)──────────────(N)──► rescue_images               │
  │                           id, rescue_case_id        │
  │                           image_url, created_at     │
  │                                                     │
  └─(1)──────────────(N)──► case_updates ◄──────────────┘
                              id, rescue_case_id
                              updated_by (FK → users)
                              status, notes, created_at

animals
  id (PK)
  species, breed, color
  estimated_age, gender
  description, created_at
  └──(1)──────────────(N)──► rescue_cases
```

---

## Tabelas

### `users`
Armazena todos os usuários do sistema independente do papel.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | SERIAL | PK | Identificador único |
| `name` | VARCHAR(150) | NOT NULL | Nome completo |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | E-mail de login |
| `password_hash` | VARCHAR(255) | NOT NULL | Hash bcrypt da senha |
| `phone` | VARCHAR(20) | | Telefone de contato |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'volunteer' | admin / volunteer / veterinarian |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Última atualização |

**Índices:** `email` (UNIQUE)

---

### `organizations`
Representa ONGs ou grupos de resgate.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | SERIAL | PK | Identificador único |
| `name` | VARCHAR(150) | NOT NULL | Nome da organização |
| `description` | TEXT | | Descrição da ONG |
| `city` | VARCHAR(100) | | Cidade de atuação |
| `state` | CHAR(2) | | UF (ex.: SP, RJ) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Data de criação |

---

### `animals`
Informações do animal resgatado. Uma entrada por animal físico.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | SERIAL | PK | Identificador único |
| `species` | VARCHAR(50) | NOT NULL | dog / cat / bird / other |
| `breed` | VARCHAR(100) | | Raça (SRD se indefinido) |
| `color` | VARCHAR(100) | | Cores predominantes |
| `estimated_age` | VARCHAR(50) | | Idade estimada em texto |
| `gender` | VARCHAR(10) | | male / female / unknown |
| `description` | TEXT | | Observações sobre o animal |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Data de cadastro |

---

### `rescue_cases`
Ocorrência central do sistema. Liga animal, usuário e organização.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | SERIAL | PK | Identificador único |
| `animal_id` | INTEGER | FK → animals.id | Animal da ocorrência |
| `reported_by` | INTEGER | FK → users.id | Usuário que registrou |
| `organization_id` | INTEGER | FK → organizations.id, nullable | ONG responsável |
| `status` | VARCHAR(30) | NOT NULL | reported / awaiting_rescue / in_rescue / under_treatment / resolved |
| `priority` | VARCHAR(10) | NOT NULL, DEFAULT 'medium' | low / medium / high / critical |
| `location_description` | TEXT | | Endereço textual |
| `latitude` | DECIMAL(10,7) | | Coordenada geográfica |
| `longitude` | DECIMAL(10,7) | | Coordenada geográfica |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Última atualização |

**Índices:** `status`, `priority`, `animal_id`, `reported_by`

---

### `rescue_images`
Fotos associadas a uma ocorrência.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | SERIAL | PK | Identificador único |
| `rescue_case_id` | INTEGER | FK → rescue_cases.id ON DELETE CASCADE | Ocorrência pai |
| `image_url` | TEXT | NOT NULL | Caminho/URL da imagem |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Data de upload |

---

### `case_updates`
Histórico imutável de mudanças de status de uma ocorrência.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | SERIAL | PK | Identificador único |
| `rescue_case_id` | INTEGER | FK → rescue_cases.id ON DELETE CASCADE | Ocorrência relacionada |
| `updated_by` | INTEGER | FK → users.id | Usuário que fez a atualização |
| `status` | VARCHAR(30) | NOT NULL | Novo status registrado |
| `notes` | TEXT | | Observações livres |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Data da atualização |

---

## Relacionamentos Detalhados

| Relacionamento | Tipo | Descrição |
|---|---|---|
| `users` → `rescue_cases` (reported_by) | 1:N | Um usuário pode registrar várias ocorrências; cada ocorrência tem exatamente um responsável pelo registro |
| `users` → `case_updates` (updated_by) | 1:N | Um usuário pode gerar múltiplas atualizações de status em diferentes casos |
| `animals` → `rescue_cases` | 1:N | Um animal pode estar ligado a mais de uma ocorrência (ex.: resgate, retorno à rua, novo resgate); cada ocorrência referencia um único animal |
| `organizations` → `rescue_cases` | 1:N | Uma ONG pode gerenciar muitos casos; um caso pode (opcionalmente) ser atribuído a uma organização |
| `rescue_cases` → `rescue_images` | 1:N | Uma ocorrência tem zero ou mais fotos; cada foto pertence a exatamente uma ocorrência. `ON DELETE CASCADE` garante limpeza automática |
| `rescue_cases` → `case_updates` | 1:N | Cada mudança de status gera uma entrada imutável no histórico; o histórico completo reconstrói a linha do tempo do caso |

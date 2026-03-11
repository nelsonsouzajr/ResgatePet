# Documentação da API – ResgatePet

Base URL de desenvolvimento: `http://localhost:3000/api`

Todas as respostas seguem o formato JSON. Erros retornam `{ "error": "mensagem" }`.

---

## Autenticação

Rotas protegidas exigem o header:

```
Authorization: Bearer <token_jwt>
```

---

## Health Check

### GET `/health`
Verifica se a API está ativa.

**Resposta 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-11T14:00:00.000Z"
}
```

---

## Módulo: Casos de Resgate (`/cases`)

### POST `/cases`
Registra uma nova ocorrência de resgate.

**Autenticação:** requerida

**Body (JSON):**
```json
{
  "animal": {
    "species": "dog",
    "breed": "SRD",
    "color": "caramelo",
    "estimated_age": "2 anos",
    "gender": "male",
    "description": "Animal com ferimento na pata dianteira"
  },
  "location_description": "Av. Brasil, próximo ao número 450",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "priority": "high",
  "organization_id": 1
}
```

**Resposta 201:**
```json
{
  "id": 42,
  "status": "reported",
  "created_at": "2026-03-11T14:00:00Z"
}
```

---

### GET `/cases`
Lista ocorrências com filtros opcionais.

**Query params:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `status` | string | Filtra por status (`reported`, `in_rescue`, etc.) |
| `priority` | string | `low`, `medium`, `high`, `critical` |
| `page` | number | Paginação (padrão: 1) |
| `limit` | number | Itens por página (padrão: 20) |

**Resposta 200:**
```json
{
  "data": [ { ...caseObject } ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

---

### GET `/cases/:id`
Retorna os detalhes completos de uma ocorrência, incluindo animal, imagens e histórico.

**Resposta 200:**
```json
{
  "id": 42,
  "status": "in_rescue",
  "priority": "high",
  "location_description": "Av. Brasil, 450",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "created_at": "2026-03-11T14:00:00Z",
  "updated_at": "2026-03-11T16:30:00Z",
  "animal": { ...animalObject },
  "reporter": { "id": 5, "name": "Maria Silva", "email": "maria@email.com" },
  "organization": { "id": 1, "name": "ONG Patas Livres" },
  "images": [ { "id": 1, "image_url": "https://..." } ],
  "updates": [ { "id": 1, "status": "reported", "notes": "...", "created_at": "..." } ]
}
```

---

### PATCH `/cases/:id/status`
Atualiza o status de uma ocorrência e registra a mudança no histórico.

**Autenticação:** requerida

**Body (JSON):**
```json
{
  "status": "under_treatment",
  "notes": "Animal captado e levado à clínica parceira"
}
```

**Status possíveis:**
- `reported` → caso registrado, aguardando triagem
- `awaiting_rescue` → triado, aguardando equipe de resgate
- `in_rescue` → equipe a caminho ou realizando o resgate
- `under_treatment` → animal em tratamento veterinário
- `resolved` → caso encerrado (animal adotado, tratado ou encaminhado)

**Resposta 200:**
```json
{
  "id": 42,
  "status": "under_treatment",
  "updated_at": "2026-03-11T17:00:00Z"
}
```

---

### POST `/cases/:id/images`
Faz upload de imagens associadas a uma ocorrência.

**Autenticação:** requerida  
**Content-Type:** `multipart/form-data`

**Campo:** `images` (array de arquivos, máx. 5 por requisição)

**Resposta 201:**
```json
{
  "uploaded": [
    { "id": 10, "image_url": "/uploads/cases/42/img1.jpg" }
  ]
}
```

---

## Módulo: Usuários (`/auth`)

### POST `/auth/register`
Cria um novo usuário.

**Body (JSON):**
```json
{
  "name": "João Voluntário",
  "email": "joao@email.com",
  "password": "senhaSegura123",
  "phone": "11999990000",
  "role": "volunteer"
}
```

**Resposta 201:**
```json
{ "id": 7, "email": "joao@email.com", "role": "volunteer" }
```

---

### POST `/auth/login`
Autentica o usuário e retorna o token JWT.

**Body (JSON):**
```json
{ "email": "joao@email.com", "password": "senhaSegura123" }
```

**Resposta 200:**
```json
{ "token": "<jwt>", "user": { "id": 7, "name": "João Voluntário", "role": "volunteer" } }
```

---

## Módulo: Organizações (`/organizations`)

### GET `/organizations`
Lista todas as organizações cadastradas.

### GET `/organizations/:id`
Retorna os detalhes de uma organização específica.

### POST `/organizations`
Cadastra uma nova ONG. **Autenticação:** requerida (role: admin)

---

## Respostas de Erro

### Erro de domínio
```json
{ "error": "mensagem" }
```

### Erro de validação
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Senha deve ter pelo menos 6 caracteres.",
      "path": "password",
      "location": "body"
    }
  ]
}
```

---

## Códigos de Status HTTP

| Código | Significado |
|---|---|
| 200 | Sucesso |
| 201 | Recurso criado |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Conflito (ex.: e-mail já cadastrado) |
| 422 | Regra de negócio inválida (ex.: transição de status) |
| 500 | Erro interno do servidor |

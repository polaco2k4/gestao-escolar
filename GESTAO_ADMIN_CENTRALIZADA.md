# Gestão Centralizada de Admin - Sistema de Licenças

## 📋 Visão Geral

Sistema completo de gestão centralizada para administradores, incluindo:
- **Gestão de Licenças** por escola
- **Controle de Limites** (alunos, professores, turmas)
- **Painel de Administração** com estatísticas globais
- **Verificação Automática** de limites antes de criar recursos

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `license_plans`
Planos de licença disponíveis no sistema.

```sql
- id (UUID)
- name (VARCHAR) - Identificador único (trial, basic, premium, enterprise)
- display_name (VARCHAR) - Nome para exibição
- description (TEXT)
- max_students (INTEGER) - NULL = ilimitado
- max_teachers (INTEGER) - NULL = ilimitado
- max_classes (INTEGER) - NULL = ilimitado
- max_storage_mb (INTEGER) - NULL = ilimitado
- features (JSONB) - Recursos adicionais
- price_monthly (DECIMAL)
- active (BOOLEAN)
```

### Tabela: `licenses`
Licenças atribuídas a cada escola.

```sql
- id (UUID)
- school_id (UUID) - FK para schools
- plan_id (UUID) - FK para license_plans
- status (VARCHAR) - active, suspended, expired, trial
- start_date (DATE)
- end_date (DATE) - NULL = sem expiração
- trial_ends_at (DATE) - Para licenças trial
- auto_renew (BOOLEAN)
- notes (TEXT)
```

### Planos Padrão

| Plano | Alunos | Professores | Turmas | Preço/mês |
|-------|--------|-------------|--------|-----------|
| **Trial** | 50 | 5 | 10 | Grátis |
| **Básico** | 200 | 20 | 20 | €99.99 |
| **Premium** | 500 | 50 | 50 | €249.99 |
| **Enterprise** | ∞ | ∞ | ∞ | €999.99 |

---

## 🔧 Backend - API Endpoints

### Planos de Licença (Admin apenas)

```
GET    /api/licenses/plans          - Listar planos
GET    /api/licenses/plans/:id      - Obter plano por ID
POST   /api/licenses/plans          - Criar plano
PUT    /api/licenses/plans/:id      - Atualizar plano
```

### Licenças (Admin e Gestor)

```
GET    /api/licenses                - Listar licenças
GET    /api/licenses/:id            - Obter licença por ID
GET    /api/licenses/school/:id     - Obter licença da escola
POST   /api/licenses                - Criar licença (Admin)
PUT    /api/licenses/:id            - Atualizar licença (Admin)
DELETE /api/licenses/:id            - Eliminar licença (Admin)
```

### Verificação e Estatísticas

```
GET    /api/licenses/check/:schoolId    - Verificar limites da escola
GET    /api/licenses/usage/:schoolId    - Obter uso atual da escola
GET    /api/licenses/stats/global       - Estatísticas globais (Admin)
```

---

## 🛡️ Middleware de Verificação

### `checkResourceLimit(resourceType)`

Middleware que verifica limites antes de criar recursos.

**Uso:**
```typescript
// Em students.routes.ts
router.post('/', 
  authorize('admin', 'gestor'), 
  checkResourceLimit('students'),  // ← Verifica limite
  validate(createStudentSchema), 
  controller.create
);
```

**Recursos Protegidos:**
- ✅ `students` - Criação de alunos
- ✅ `teachers` - Criação de professores
- ✅ `classes` - Criação de turmas

**Comportamento:**
- Admin **bypassa** todas as verificações
- Gestor/outros roles são **bloqueados** se limite atingido
- Retorna erro `403` com mensagem clara

---

## 📊 Painel de Admin

### Rota Frontend
`/admin` - Painel de administração centralizado

### Funcionalidades

#### 1. **Estatísticas Globais**
- Total de escolas ativas
- Total de alunos no sistema
- Total de professores
- Total de turmas

#### 2. **Estatísticas de Licenças**
- Licenças ativas
- Licenças em trial
- Licenças expiradas
- Licenças suspensas

#### 3. **Distribuição por Plano**
Gráfico mostrando quantas escolas usam cada plano.

#### 4. **Alertas de Expiração**
Lista de licenças que expiram nos próximos 30 dias.

#### 5. **Ações Rápidas**
- Criar nova escola
- Atribuir licença
- Gerir planos

---

## 🎨 Página de Gestão de Licenças

### Rota Frontend
`/licencas` - Gestão completa de licenças

### Funcionalidades

#### Filtros
- Todas
- Ativas
- Trial
- Expiradas
- Suspensas

#### Tabela de Licenças
Exibe para cada licença:
- Nome da escola
- Plano atual
- Status (badge colorido)
- Limites (alunos/professores/turmas)
- Data de validade
- Ações (Editar, Ver Uso, Eliminar)

---

## 🚀 Como Usar

### 1. Executar Migration

```bash
# No PostgreSQL
psql -U postgres -d gestao_escolar -f database/migrations/005_create_licenses.sql
```

### 2. Reiniciar Backend

```bash
cd backend
npm run dev
```

### 3. Acessar Painel Admin

1. Login como **admin**
2. Navegar para `/admin` ou clicar em "Painel Admin" no menu
3. Ver estatísticas globais
4. Gerir licenças em `/licencas`

---

## 📝 Exemplos de Uso

### Criar Nova Licença

```typescript
POST /api/licenses
{
  "school_id": "uuid-da-escola",
  "plan_id": "uuid-do-plano",
  "status": "active",
  "start_date": "2026-04-28",
  "end_date": "2027-04-28",
  "auto_renew": true,
  "notes": "Licença anual"
}
```

### Verificar Limites de uma Escola

```typescript
GET /api/licenses/check/uuid-da-escola

Response:
{
  "valid": false,
  "license": { ... },
  "usage": {
    "current_students": 210,
    "max_students": 200,
    "students_percentage": 105
  },
  "violations": [
    "Limite de alunos excedido (210/200)"
  ]
}
```

### Obter Estatísticas Globais

```typescript
GET /api/licenses/stats/global

Response:
{
  "summary": {
    "total_schools": 15,
    "total_students": 3450,
    "total_teachers": 245,
    "active_licenses": 12,
    "trial_licenses": 3
  },
  "licenses_by_plan": [
    { "plan_name": "Premium", "count": 8 },
    { "plan_name": "Básico", "count": 4 }
  ],
  "expiring_soon": [ ... ]
}
```

---

## 🔒 Controle de Acesso

### Permissões por Role

| Endpoint | Admin | Gestor | Professor | Estudante | Encarregado |
|----------|-------|--------|-----------|-----------|-------------|
| Painel Admin | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gerir Licenças | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver Própria Licença | ✅ | ✅ | ❌ | ❌ | ❌ |
| Criar Planos | ✅ | ❌ | ❌ | ❌ | ❌ |
| Estatísticas Globais | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## ⚠️ Comportamento de Limites

### Quando Limite é Atingido

**Gestor tenta criar aluno quando limite atingido:**
```
❌ 403 Forbidden
"Limite de alunos atingido (200/200). Atualize seu plano."
```

**Admin cria aluno (sem verificação):**
```
✅ 201 Created
Aluno criado com sucesso
```

### Avisos no Frontend

Headers HTTP adicionados automaticamente:
```
X-License-Students-Usage: 180/200
X-License-Teachers-Usage: 18/20
X-License-Warnings: students,teachers
```

Use estes headers para mostrar avisos quando uso > 80%.

---

## 📁 Arquivos Criados/Modificados

### Backend
```
✅ database/migrations/005_create_licenses.sql
✅ src/modules/licenses/licenses.service.ts
✅ src/modules/licenses/licenses.controller.ts
✅ src/modules/licenses/licenses.routes.ts
✅ src/middleware/licenseCheck.ts
✅ src/app.ts (adicionada rota /api/licenses)
✅ src/modules/students/students.routes.ts (middleware)
✅ src/modules/teachers/teachers.routes.ts (middleware)
✅ src/modules/classes/classes.routes.ts (middleware)
```

### Frontend
```
✅ src/services/licenses.service.ts
✅ src/pages/AdminDashboard.tsx
✅ src/pages/Licencas.tsx
✅ src/App.tsx (rotas /admin e /licencas)
✅ src/components/Layout.tsx (links no menu)
```

---

## 🎯 Próximos Passos Recomendados

### Funcionalidades Adicionais

1. **Formulário de Criação/Edição de Licença**
   - Página `/licencas/nova`
   - Página `/licencas/:id/editar`

2. **Página de Uso Detalhado**
   - Rota `/licencas/:id/uso`
   - Gráficos de uso ao longo do tempo

3. **Notificações Automáticas**
   - Email quando licença próxima de expirar
   - Email quando limite atingido (>90%)

4. **Histórico de Licenças**
   - Tabela de auditoria
   - Registro de mudanças de plano

5. **Pagamentos Integrados**
   - Integração com Stripe/PayPal
   - Renovação automática

---

## 🧪 Testes

### Testar Verificação de Limites

1. Criar escola com licença Trial (50 alunos)
2. Login como gestor dessa escola
3. Criar 50 alunos
4. Tentar criar 51º aluno → Deve bloquear
5. Login como admin
6. Criar 51º aluno → Deve permitir

### Testar Painel Admin

1. Login como admin
2. Acessar `/admin`
3. Verificar estatísticas
4. Verificar alertas de expiração
5. Acessar `/licencas`
6. Filtrar por status
7. Editar licença

---

## 📞 Suporte

Para dúvidas ou problemas:
- Verificar logs do backend
- Verificar console do navegador
- Confirmar que migration foi executada
- Verificar permissões de role

---

**Sistema implementado com sucesso! 🎉**

O admin agora tem controle total sobre escolas, licenças e limites de uso do sistema.

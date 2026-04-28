# Guia de Relatórios Personalizados - CRUD Completo com Segregação

## 📋 Visão Geral

Sistema completo de CRUD para relatórios personalizados com segregação automática por escola. Permite que gestores e professores criem, editem, executem e compartilhem relatórios customizados.

## 🗄️ Estrutura do Banco de Dados

### Tabela: `custom_reports`
Armazena os relatórios personalizados criados pelos usuários.

**Campos:**
- `id` - UUID (PK)
- `school_id` - UUID (FK para schools) - **Segregação automática**
- `name` - Nome do relatório
- `description` - Descrição opcional
- `report_type` - Tipo: 'students', 'attendance', 'grades', 'financial', 'enrollments'
- `filters` - JSONB com filtros salvos
- `columns` - JSONB com colunas a exibir
- `sort_by` - Campo de ordenação
- `sort_order` - 'asc' ou 'desc'
- `created_by` - UUID do criador
- `is_public` - Se outros usuários da escola podem ver
- `created_at`, `updated_at` - Timestamps

### Tabela: `report_executions`
Histórico de execuções de relatórios.

**Campos:**
- `id` - UUID (PK)
- `report_id` - UUID (FK para custom_reports)
- `executed_by` - UUID do usuário
- `executed_at` - Timestamp da execução
- `row_count` - Número de registros retornados
- `execution_time_ms` - Tempo de execução em ms
- `filters_used` - JSONB com filtros aplicados

## 🔐 Segregação de Escolas

### Regras de Acesso

1. **Admin**: Acesso total a todos os relatórios de todas as escolas
2. **Gestor/Professor**: Acesso apenas aos relatórios da sua escola

### Implementação

```typescript
// Service - Criação
const reportData = {
  ...data,
  school_id: user.role === 'admin' && data.school_id 
    ? data.school_id 
    : user.school_id,
  created_by: user.id
};

// Service - Listagem
query = applySchoolFilter(query, user, 'cr');

// Service - Acesso Individual
if (!canAccessSchool(user, report.school_id)) {
  throw { message: 'Acesso negado', statusCode: 403 };
}
```

## 🚀 API Endpoints

### 1. Criar Relatório
```http
POST /api/relatorios/custom
Authorization: Bearer {token}

{
  "name": "Relatório de Alunos Ativos",
  "description": "Lista todos os alunos com matrícula ativa",
  "report_type": "students",
  "filters": {
    "status": "active"
  },
  "is_public": true
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Relatório criado com sucesso",
  "data": {
    "id": "uuid",
    "school_id": "uuid",
    "name": "Relatório de Alunos Ativos",
    ...
  }
}
```

### 2. Listar Relatórios
```http
GET /api/relatorios/custom
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Relatório de Alunos Ativos",
      "report_type": "students",
      "creator_first_name": "João",
      "creator_last_name": "Silva",
      "school_name": "Escola ABC",
      "is_public": true,
      ...
    }
  ]
}
```

### 3. Obter Relatório por ID
```http
GET /api/relatorios/custom/:id
Authorization: Bearer {token}
```

### 4. Atualizar Relatório
```http
PUT /api/relatorios/custom/:id
Authorization: Bearer {token}

{
  "name": "Novo nome",
  "description": "Nova descrição"
}
```

**Validações:**
- Apenas o criador ou admin pode editar
- Deve ter acesso à escola do relatório

### 5. Excluir Relatório
```http
DELETE /api/relatorios/custom/:id
Authorization: Bearer {token}
```

**Validações:**
- Apenas o criador ou admin pode excluir
- Deve ter acesso à escola do relatório

### 6. Executar Relatório
```http
GET /api/relatorios/custom/:id/execute
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "report_info": {
      "id": "uuid",
      "name": "Relatório de Alunos",
      ...
    },
    "data": [
      {
        "student_number": "2024001",
        "first_name": "Maria",
        "last_name": "Santos",
        ...
      }
    ],
    "metadata": {
      "row_count": 150,
      "execution_time_ms": 245,
      "executed_at": "2024-04-28T14:30:00Z"
    }
  }
}
```

## 📊 Tipos de Relatórios Disponíveis

### 1. Students (Alunos)
- Filtros: `class_id`, `status`
- Dados: número, nome, email, data nascimento, gênero, turma

### 2. Attendance (Assiduidade)
- Filtros: `class_id`, `date_from`, `date_to`, `status`
- Dados: aluno, turma, disciplina, data, status

### 3. Grades (Avaliações)
- Filtros: `class_id`, `subject_id`, `trimester`, `academic_year_id`
- Dados: aluno, turma, disciplina, avaliação, nota, nota máxima

### 4. Financial (Financeiro)
- Filtros: `academic_year_id`, `status`
- Dados: aluno, tipo de taxa, valor, data vencimento, valor pago, status

### 5. Enrollments (Matrículas)
- Filtros: `academic_year_id`, `class_id`, `status`
- Dados: aluno, turma, ano letivo, data matrícula, status

## 💻 Frontend - Componente React

### Uso do Componente

```tsx
import RelatoriosPersonalizados from './components/RelatoriosPersonalizados';

function App() {
  return <RelatoriosPersonalizados />;
}
```

### Funcionalidades

1. **Listagem de Relatórios**
   - Cards com informações do relatório
   - Indicador de relatórios públicos
   - Informação do criador

2. **Criar/Editar Relatório**
   - Modal com formulário
   - Campos: nome, descrição, tipo, público/privado
   - Validação de campos obrigatórios

3. **Executar Relatório**
   - Botão de execução em cada card
   - Exibe resultado com contagem de registros
   - Registra execução no histórico

4. **Excluir Relatório**
   - Confirmação antes de excluir
   - Apenas criador ou admin

## 🔧 Instalação e Configuração

### 1. Aplicar Migration

```bash
node scripts/apply-custom-reports-migration.js
```

### 2. Verificar Tabelas

```sql
SELECT * FROM custom_reports;
SELECT * FROM report_executions;
```

### 3. Testar API

```bash
# Criar relatório
curl -X POST http://localhost:3000/api/relatorios/custom \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "report_type": "students",
    "is_public": false
  }'

# Listar relatórios
curl http://localhost:3000/api/relatorios/custom \
  -H "Authorization: Bearer {token}"
```

## 🎯 Casos de Uso

### Caso 1: Gestor cria relatório público
```typescript
// Gestor da Escola A cria relatório
POST /api/relatorios/custom
{
  "name": "Alunos com Mensalidade Atrasada",
  "report_type": "financial",
  "filters": { "status": "overdue" },
  "is_public": true  // Outros usuários da Escola A podem ver
}

// Professor da Escola A pode ver e executar
GET /api/relatorios/custom  // Retorna o relatório
GET /api/relatorios/custom/:id/execute  // Pode executar

// Professor da Escola B NÃO pode ver
GET /api/relatorios/custom  // NÃO retorna o relatório
```

### Caso 2: Admin cria relatório para escola específica
```typescript
// Admin cria relatório para Escola B
POST /api/relatorios/custom
{
  "name": "Relatório Específico",
  "school_id": "escola-b-uuid",  // Admin pode especificar
  "report_type": "students"
}

// Apenas usuários da Escola B podem ver
```

### Caso 3: Histórico de Execuções
```typescript
// Cada execução é registrada
GET /api/relatorios/custom/:id/execute

// Grava em report_executions:
{
  "report_id": "uuid",
  "executed_by": "user-uuid",
  "row_count": 150,
  "execution_time_ms": 245,
  "filters_used": { "status": "active" }
}
```

## 🔍 Monitoramento

### Queries Úteis

```sql
-- Relatórios mais executados
SELECT 
  cr.name,
  COUNT(re.id) as executions,
  AVG(re.execution_time_ms) as avg_time_ms
FROM custom_reports cr
LEFT JOIN report_executions re ON re.report_id = cr.id
GROUP BY cr.id, cr.name
ORDER BY executions DESC;

-- Relatórios por escola
SELECT 
  s.name as school,
  COUNT(cr.id) as total_reports,
  SUM(CASE WHEN cr.is_public THEN 1 ELSE 0 END) as public_reports
FROM schools s
LEFT JOIN custom_reports cr ON cr.school_id = s.id
GROUP BY s.id, s.name;

-- Últimas execuções
SELECT 
  cr.name,
  u.first_name || ' ' || u.last_name as executed_by,
  re.executed_at,
  re.row_count,
  re.execution_time_ms
FROM report_executions re
JOIN custom_reports cr ON cr.id = re.report_id
JOIN users u ON u.id = re.executed_by
ORDER BY re.executed_at DESC
LIMIT 10;
```

## ✅ Checklist de Implementação

- [x] Migration criada (`007_create_custom_reports.sql`)
- [x] Service com CRUD completo (`relatorios.service.ts`)
- [x] Controller com todos os métodos (`relatorios.controller.ts`)
- [x] Rotas configuradas (`relatorios.routes.ts`)
- [x] Segregação por escola implementada
- [x] Validações de permissão (criador/admin)
- [x] Componente React criado (`RelatoriosPersonalizados.tsx`)
- [x] Script de migration (`apply-custom-reports-migration.js`)
- [x] Histórico de execuções
- [x] Documentação completa

## 🚨 Segurança

1. **Autenticação**: Todas as rotas exigem token JWT
2. **Autorização**: Apenas admin, gestor e professor
3. **Segregação**: Filtro automático por school_id
4. **Validação de Acesso**: canAccessSchool() em todas as operações
5. **Permissões de Edição**: Apenas criador ou admin

## 📝 Próximos Passos

1. Adicionar filtros avançados no frontend
2. Implementar exportação para Excel/PDF
3. Criar agendamento de relatórios
4. Dashboard de analytics dos relatórios
5. Templates de relatórios predefinidos
6. Compartilhamento por email

---

**Sistema implementado com sucesso! ✨**

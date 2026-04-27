# Implementação de Segregação de Dados por Escola

## Objetivo
Garantir que usuários de uma escola **não vejam dados de outras escolas**. Apenas **admin** pode ver dados de todas as escolas.

## Regras de Segregação

| Role | Acesso aos Dados |
|------|------------------|
| **Admin** | ✅ Vê **todas** as escolas e todos os dados |
| **Gestor** | ✅ Vê apenas dados da **sua escola** |
| **Professor** | ✅ Vê apenas dados da **sua escola** |
| **Estudante** | ✅ Vê apenas dados da **sua escola** |
| **Encarregado** | ✅ Vê apenas dados da **sua escola** |

## Implementação

### 1. Middleware de Segregação (`schoolSegregation.ts`)

Criado middleware com 3 funções principais:

#### `enforceSchoolSegregation()`
- Valida se usuário tem school_id (exceto admin)
- Bloqueia acesso se usuário não tiver escola associada

#### `applySchoolFilter(query, user)`
- Aplica filtro automático em queries Knex
- Admin: sem filtro
- Outros: adiciona `.where('school_id', user.school_id)`

#### `canAccessSchool(user, targetSchoolId)`
- Valida se usuário pode acessar recurso de escola específica
- Útil para operações de update/delete

### 2. Atualização dos Serviços

Todos os serviços devem ser atualizados para:

1. **Receber o usuário autenticado** nos métodos
2. **Aplicar filtro de school_id** em todas as queries
3. **Validar acesso** antes de update/delete

#### Exemplo - Students Service

```typescript
import { applySchoolFilter, canAccessSchool } from '../../middleware/schoolSegregation';

export class StudentsService {
  async list(page = 1, limit = 20, filters: any = {}, user?: AuthPayload) {
    const { offset } = paginate(page, limit);
    
    let query = db('students as s')
      .join('users as u', 'u.id', 's.user_id')
      .select('s.*', 'u.first_name', 'u.last_name', 'u.email');
    
    // Aplicar filtro de escola
    query = applySchoolFilter(query.where('s.school_id'), user);
    
    // Resto da lógica...
    const students = await query.orderBy('u.first_name', 'asc').limit(limit).offset(offset);
    return { students, meta };
  }

  async getById(id: string, user?: AuthPayload) {
    const student = await db('students as s')
      .join('users as u', 'u.id', 's.user_id')
      .where('s.id', id)
      .first();

    if (!student) throw new AppError('Estudante não encontrado', 404);
    
    // Validar acesso à escola
    if (!canAccessSchool(user, student.school_id)) {
      throw new AppError('Sem permissão para acessar este estudante', 403);
    }
    
    return student;
  }

  async update(id: string, data: any, user?: AuthPayload) {
    // Buscar estudante primeiro
    const student = await this.getById(id, user);
    
    // Validar acesso (já validado no getById)
    const [updated] = await db('students')
      .where('id', id)
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    
    return updated;
  }
}
```

#### Exemplo - Controller

```typescript
export class StudentsController {
  async list(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      // Passar req.user para o serviço
      const result = await service.list(Number(page), Number(limit), filters, req.user);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      // Passar req.user para validação
      const student = await service.getById(req.params.id, req.user);
      return sendSuccess(res, student);
    } catch (error: any) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
}
```

### 3. Serviços que Precisam de Atualização

#### Alta Prioridade (Dados Sensíveis)
- ✅ `students.service.ts` - Estudantes
- ✅ `teachers.service.ts` - Professores
- ✅ `guardians.service.ts` - Encarregados
- ✅ `classes.service.ts` - Turmas
- ✅ `courses.service.ts` - Cursos
- ✅ `subjects.service.ts` - Disciplinas
- ✅ `matriculas.service.ts` - Matrículas
- ✅ `avaliacoes.service.ts` - Avaliações
- ✅ `assiduidade.service.ts` - Assiduidade
- ✅ `financeiro.service.ts` - Financeiro
- ✅ `horarios.service.ts` - Horários
- ✅ `salas.service.ts` - Salas
- ✅ `documentos.service.ts` - Documentos

#### Média Prioridade
- ✅ `comunicacao.service.ts` - Comunicação
- ✅ `relatorios.service.ts` - Relatórios

#### Não Requer Segregação
- ❌ `schools.service.ts` - Admin gerencia escolas
- ❌ `academicYears.service.ts` - Global
- ❌ `assessmentTypes.service.ts` - Global

### 4. Queries que Precisam de Filtro

#### Padrão de Atualização

**ANTES:**
```typescript
const students = await db('students')
  .select('*')
  .orderBy('created_at', 'desc');
```

**DEPOIS:**
```typescript
let query = db('students').select('*');

// Aplicar filtro de escola
if (user?.role !== 'admin' && user?.school_id) {
  query = query.where('school_id', user.school_id);
}

const students = await query.orderBy('created_at', 'desc');
```

**OU usando helper:**
```typescript
let query = db('students').select('*');
query = applySchoolFilter(query, user);
const students = await query.orderBy('created_at', 'desc');
```

### 5. Validações Importantes

#### Ao Criar Recursos
```typescript
async create(data: any, user?: AuthPayload) {
  // Gestor/Professor/etc: usar school_id do usuário
  const schoolId = user?.role === 'admin' 
    ? data.school_id  // Admin pode escolher
    : user?.school_id; // Outros: forçar sua escola

  if (!schoolId) {
    throw new AppError('Escola não especificada', 400);
  }

  const [resource] = await db('table')
    .insert({ ...data, school_id: schoolId })
    .returning('*');
  
  return resource;
}
```

#### Ao Atualizar/Deletar
```typescript
async update(id: string, data: any, user?: AuthPayload) {
  // Buscar recurso primeiro
  const resource = await db('table').where('id', id).first();
  
  if (!resource) {
    throw new AppError('Recurso não encontrado', 404);
  }

  // Validar acesso
  if (!canAccessSchool(user, resource.school_id)) {
    throw new AppError('Sem permissão para acessar este recurso', 403);
  }

  // Atualizar
  const [updated] = await db('table')
    .where('id', id)
    .update(data)
    .returning('*');
  
  return updated;
}
```

### 6. Joins com Segregação

Quando fazer joins, aplicar filtro em **todas as tabelas** que têm school_id:

```typescript
let query = db('students as s')
  .join('users as u', 'u.id', 's.user_id')
  .join('classes as c', 'c.id', 's.class_id')
  .select('s.*', 'u.first_name', 'c.name as class_name');

// Aplicar filtro em students
if (user?.role !== 'admin' && user?.school_id) {
  query = query
    .where('s.school_id', user.school_id)
    .where('c.school_id', user.school_id); // Também em classes
}
```

### 7. Testes de Segregação

#### Cenário 1: Gestor da Escola A
```bash
# Login como gestor da Escola A
POST /api/auth/login
{ "email": "gestor.a@escola.com", "password": "senha123" }

# Listar estudantes - deve retornar apenas da Escola A
GET /api/students
# ✅ Retorna apenas estudantes da Escola A

# Tentar acessar estudante da Escola B
GET /api/students/{id_estudante_escola_b}
# ❌ 403 Forbidden - Sem permissão
```

#### Cenário 2: Admin
```bash
# Login como admin
POST /api/auth/login
{ "email": "admin@sistema.com", "password": "admin123" }

# Listar estudantes - deve retornar de TODAS as escolas
GET /api/students
# ✅ Retorna estudantes de todas as escolas

# Acessar estudante de qualquer escola
GET /api/students/{id_qualquer_estudante}
# ✅ 200 OK - Admin pode acessar tudo
```

### 8. Checklist de Implementação

Para cada serviço:

- [ ] Adicionar parâmetro `user?: AuthPayload` nos métodos
- [ ] Aplicar `applySchoolFilter()` em queries de listagem
- [ ] Validar com `canAccessSchool()` em getById/update/delete
- [ ] Forçar `school_id` do usuário ao criar (exceto admin)
- [ ] Atualizar controller para passar `req.user`
- [ ] Testar com usuários de escolas diferentes
- [ ] Testar com admin (deve ver tudo)

### 9. Segurança Adicional

#### Frontend
- Não confiar apenas no frontend
- Backend deve sempre validar

#### Database
- Considerar Row-Level Security (RLS) no PostgreSQL para camada extra
- Criar policies que forcem school_id

#### Logs
- Registrar tentativas de acesso não autorizado
- Alertar admin sobre possíveis violações

## Próximos Passos

1. ✅ Criar middleware de segregação
2. ⏳ Atualizar serviços um por um
3. ⏳ Atualizar controllers
4. ⏳ Testar cada módulo
5. ⏳ Documentar casos especiais
6. ⏳ Implementar logs de auditoria

## Notas Importantes

- **Admin sempre vê tudo** - não aplicar filtros
- **School_id obrigatório** para usuários não-admin
- **Validar em todas as operações** (CRUD completo)
- **Joins requerem atenção** - filtrar todas as tabelas
- **Transações** devem manter segregação
- **Relatórios** devem respeitar segregação

# Passos Manuais Necessários Após o Script

## ⚠️ IMPORTANTE

O script automatizou:
- ✅ Adição de imports
- ✅ Atualização de assinaturas de métodos
- ✅ Atualização de chamadas no controller

## 🔧 Você ainda precisa fazer MANUALMENTE em cada service:

### 1. No método `list()`

```typescript
async list(page = 1, limit = 20, filters: any = {}, user?: AuthPayload) {
  const { offset } = paginate(page, limit);
  
  // ADICIONAR ESTAS LINHAS:
  let query = db('table');
  query = applySchoolFilter(query, user);
  
  const results = await query.select('*').limit(limit).offset(offset);
  return results;
}
```

### 2. No método `getById()`

```typescript
async getById(id: string, user?: AuthPayload) {
  const item = await db('table').where('id', id).first();
  if (!item) throw new AppError('Não encontrado', 404);
  
  // ADICIONAR ESTAS LINHAS:
  if (user && !canAccessSchool(user, item.school_id)) {
    throw new AppError('Sem permissão', 403);
  }
  
  return item;
}
```

### 3. No método `create()`

```typescript
async create(data: any, user?: AuthPayload) {
  // ADICIONAR ESTAS LINHAS NO INÍCIO:
  const schoolId = user?.role === 'admin' ? data.school_id : user?.school_id;
  if (!schoolId) throw new AppError('Escola não especificada', 400);
  
  const [item] = await db('table')
    .insert({ ...data, school_id: schoolId }) // Usar schoolId aqui
    .returning('*');
  return item;
}
```

### 4. No método `update()`

```typescript
async update(id: string, data: any, user?: AuthPayload) {
  // ADICIONAR ESTA LINHA NO INÍCIO:
  await this.getById(id, user); // Valida acesso
  
  const [item] = await db('table').where('id', id).update(data).returning('*');
  return item;
}
```

### 5. No método `delete()`

```typescript
async delete(id: string, user?: AuthPayload) {
  // ADICIONAR ESTA LINHA NO INÍCIO:
  await this.getById(id, user); // Valida acesso
  
  await db('table').where('id', id).delete();
}
```

## 📋 Checklist por Serviço

### Assiduidade
- [ ] list() - Adicionar applySchoolFilter
- [ ] getById() - Adicionar canAccessSchool
- [ ] create() - Forçar school_id
- [ ] update() - Validar acesso
- [ ] delete() - Validar acesso

### Financeiro
- [ ] list() - Adicionar applySchoolFilter
- [ ] getById() - Adicionar canAccessSchool
- [ ] create() - Forçar school_id
- [ ] update() - Validar acesso
- [ ] delete() - Validar acesso

### Horarios
- [ ] list() - Adicionar applySchoolFilter
- [ ] getById() - Adicionar canAccessSchool
- [ ] create() - Forçar school_id
- [ ] update() - Validar acesso
- [ ] delete() - Validar acesso

### Documentos
- [ ] list() - Adicionar applySchoolFilter
- [ ] getById() - Adicionar canAccessSchool
- [ ] create() - Forçar school_id
- [ ] update() - Validar acesso
- [ ] delete() - Validar acesso

### Relatorios
- [ ] list() - Adicionar applySchoolFilter
- [ ] getById() - Adicionar canAccessSchool
- [ ] Métodos de agregação - Aplicar filtros

### Comunicacao
- [ ] list() - Adicionar applySchoolFilter
- [ ] getById() - Adicionar canAccessSchool
- [ ] create() - Forçar school_id
- [ ] update() - Validar acesso
- [ ] delete() - Validar acesso

## 🧪 Testar Cada Serviço

Após completar manualmente:

1. Login como Gestor A
2. Criar recurso
3. Listar recursos (deve ver apenas da sua escola)
4. Tentar acessar recurso de outra escola (deve dar 403)
5. Login como Admin
6. Listar recursos (deve ver de todas as escolas)

## 📖 Referências

Consulte os serviços já implementados como exemplo:
- students.service.ts
- teachers.service.ts
- classes.service.ts
- courses.service.ts
- subjects.service.ts
- guardians.service.ts
- matriculas.service.ts
- avaliacoes.service.ts

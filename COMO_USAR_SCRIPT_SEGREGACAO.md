# Como Usar o Script de Segregação Automática

## 📋 O que o Script Faz

O script `apply-segregation-all.js` automatiza **40%** do trabalho de implementar segregação de escola:

### ✅ Automatizado pelo Script:
1. **Adiciona imports necessários** nos services
2. **Atualiza assinaturas de métodos** (adiciona `user?: AuthPayload`)
3. **Atualiza chamadas no controller** (adiciona `req.user`)
4. **Cria backups** de todos os arquivos modificados

### ⚠️ Requer Trabalho Manual (60%):
1. Adicionar `applySchoolFilter(query, user)` nas queries
2. Adicionar `canAccessSchool(user, school_id)` nas validações
3. Forçar `school_id` do usuário no método `create()`
4. Adicionar validação de acesso nos métodos `update()` e `delete()`

## 🚀 Como Executar

### 1. Executar o Script

```bash
cd "c:\Users\SDBD\Downloads\PROJECTOS\GESTÃO ESCOLAR"
node scripts/apply-segregation-all.js
```

### 2. O que Acontece

O script processa automaticamente estes serviços:
- ✅ assiduidade
- ✅ financeiro
- ✅ horarios
- ✅ documentos
- ✅ relatorios
- ✅ comunicacao

Para cada serviço, ele:
1. Cria backup (`.backup`)
2. Adiciona imports
3. Atualiza assinaturas
4. Atualiza controller

### 3. Verificar Resultados

Após executar, você verá:
```
✅ Script concluído! 12/12 arquivos processados
📄 Arquivo criado: PASSOS_MANUAIS_SEGREGACAO.md
```

### 4. Completar Manualmente

Abra o arquivo `PASSOS_MANUAIS_SEGREGACAO.md` e siga as instruções para cada serviço.

## 📝 Exemplo: Completar Assiduidade Manualmente

### Antes (após o script):
```typescript
async list(page = 1, limit = 20, filters: any = {}, user?: AuthPayload) {
  const { offset } = paginate(page, limit);
  const query = db('attendance_records as ar')
    .join('students as s', 's.id', 'ar.student_id')
    .select('ar.*', 's.student_number');
  
  const records = await query.limit(limit).offset(offset);
  return records;
}
```

### Depois (completado manualmente):
```typescript
async list(page = 1, limit = 20, filters: any = {}, user?: AuthPayload) {
  const { offset } = paginate(page, limit);
  let query = db('attendance_records as ar')
    .join('students as s', 's.id', 'ar.student_id');
  
  // ✅ ADICIONAR: Aplicar filtro de escola
  query = applySchoolFilter(query, user);
  
  query = query.select('ar.*', 's.student_number');
  
  const records = await query.limit(limit).offset(offset);
  return records;
}
```

## 🔍 Verificar Implementação

Para cada serviço, verifique:

### Service (`*.service.ts`)
- [ ] Imports adicionados no topo
- [ ] `list()` - Tem `applySchoolFilter(query, user)`
- [ ] `getById()` - Tem `canAccessSchool(user, item.school_id)`
- [ ] `create()` - Força `school_id` do usuário
- [ ] `update()` - Chama `this.getById(id, user)` primeiro
- [ ] `delete()` - Chama `this.getById(id, user)` primeiro

### Controller (`*.controller.ts`)
- [ ] Todas as chamadas ao service passam `req.user`

## 🧪 Testar Implementação

### 1. Criar Duas Escolas
```sql
INSERT INTO schools (name, code, active) 
VALUES ('Escola A', 'ESC-A', true), ('Escola B', 'ESC-B', true);
```

### 2. Criar Gestores
```javascript
// Gestor Escola A
POST /api/auth/register
{
  "email": "gestor.a@escola.com",
  "password": "senha123",
  "first_name": "Gestor",
  "last_name": "A",
  "role": "gestor",
  "school_id": "{id_escola_a}"
}
```

### 3. Testar Segregação
```javascript
// Login como Gestor A
POST /api/auth/login
{ "email": "gestor.a@escola.com", "password": "senha123" }

// Criar recurso
POST /api/assiduidade { ... }

// Listar (deve ver apenas da Escola A)
GET /api/assiduidade
// ✅ Retorna apenas registros da Escola A

// Tentar acessar recurso da Escola B
GET /api/assiduidade/{id_escola_b}
// ❌ 403 Forbidden

// Login como Admin
POST /api/auth/login
{ "email": "admin@sistema.com", "password": "admin123" }

// Listar (deve ver TODAS as escolas)
GET /api/assiduidade
// ✅ Retorna registros de todas as escolas
```

## 📊 Progresso

### Antes do Script
- ✅ 8/16 serviços completos (50%)
- ⏳ 8/16 serviços pendentes

### Depois do Script (40% automatizado)
- ✅ 8/16 serviços completos (50%)
- 🔄 6/16 serviços parcialmente completos (imports + assinaturas)
- ⏳ 6/16 serviços precisam de trabalho manual

### Após Completar Manualmente
- ✅ 14/16 serviços completos (87.5%)
- ✅ 2/16 não requerem segregação

## 🛟 Ajuda

### Se algo der errado:
1. **Restaurar backup**: Copie `.backup` de volta para o arquivo original
2. **Consultar exemplos**: Veja `students.service.ts`, `teachers.service.ts`
3. **Verificar documentação**: `SEGREGACAO_ESCOLA_IMPLEMENTACAO.md`

### Arquivos de Referência (100% Completos):
- `src/modules/students/students.service.ts`
- `src/modules/teachers/teachers.service.ts`
- `src/modules/classes/classes.service.ts`
- `src/modules/courses/courses.service.ts`
- `src/modules/subjects/subjects.service.ts`
- `src/modules/guardians/guardians.service.ts`
- `src/modules/matriculas/matriculas.service.ts`
- `src/modules/avaliacoes/avaliacoes.service.ts`

## 📖 Documentação Completa

- `SEGREGACAO_ESCOLA_IMPLEMENTACAO.md` - Guia completo
- `SEGREGACAO_PROGRESSO_FINAL.md` - Status e progresso
- `PASSOS_MANUAIS_SEGREGACAO.md` - Passos manuais após o script
- `SEGREGACAO_STATUS.md` - Status detalhado

## ⏱️ Tempo Estimado

- **Script automático**: ~2 segundos
- **Trabalho manual por serviço**: ~5-10 minutos
- **Total para 6 serviços**: ~30-60 minutos

## ✅ Checklist Final

Após completar tudo:

- [ ] Todos os services têm imports
- [ ] Todos os métodos têm `user?: AuthPayload`
- [ ] Todos os controllers passam `req.user`
- [ ] Filtros `applySchoolFilter` aplicados
- [ ] Validações `canAccessSchool` aplicadas
- [ ] `school_id` forçado no create
- [ ] Testes realizados com 2 escolas
- [ ] Testes com gestor e admin
- [ ] Backups deletados
- [ ] Documentação atualizada

## 🎉 Resultado Final

Após completar:
- ✅ **14/16 serviços** com segregação completa
- ✅ Usuários só veem dados da sua escola
- ✅ Admin vê dados de todas as escolas
- ✅ Sistema seguro e isolado por escola

**Boa sorte! 🚀**

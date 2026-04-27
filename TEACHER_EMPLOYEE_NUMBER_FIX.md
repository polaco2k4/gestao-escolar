# Correção: Número de Funcionário Único por Escola

## Problema Identificado

Ao tentar criar um professor com número de funcionário "001", o sistema retornava erro 409, mesmo que esse número pertencesse a um professor de **outra escola**.

### Causa Raiz

A constraint UNIQUE do campo `employee_number` era **global** (aplicada a todas as escolas):

```sql
-- ❌ ERRADO - Constraint global
CREATE TABLE teachers (
    ...
    employee_number VARCHAR(50) UNIQUE,  -- Único em TODAS as escolas
    ...
);
```

Isso impedia que escolas diferentes usassem o mesmo número de funcionário, o que não faz sentido em um sistema multi-escola.

## Solução Implementada

### 1. Migração 004 - Constraint Composta

**Arquivo**: `database/migrations/004_fix_teacher_employee_number_unique_per_school.sql`

Alterada a constraint para ser única **por escola**:

```sql
-- Remover constraint global
ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_employee_number_key;

-- Adicionar constraint composta (employee_number + school_id)
ALTER TABLE teachers 
ADD CONSTRAINT teachers_employee_number_school_unique 
UNIQUE (employee_number, school_id);
```

### Comportamento Agora

✅ **Escola A** pode ter professor com número "001"  
✅ **Escola B** pode ter professor com número "001"  
❌ **Escola A** NÃO pode ter dois professores com número "001"

### 2. Backend - Mensagem de Erro Atualizada

**Arquivo**: `src/modules/teachers/teachers.service.ts`

```typescript
else if (error.constraint === 'teachers_employee_number_school_unique') {
  throw new AppError('Número de funcionário já está em uso nesta escola', 409);
}
```

### 3. Frontend - Texto de Ajuda Atualizado

**Arquivo**: `frontend/src/pages/TeacherForm.tsx`

```typescript
<p className="mt-1 text-xs text-gray-500">
  Opcional, mas deve ser único dentro da escola
</p>
```

## Execução da Migração

```bash
node scripts/migrate-004.js
```

**Resultado**:
```
✅ Migração 004 executada com sucesso!
📊 Número de funcionário agora é único por escola (não globalmente).
Agora cada escola pode ter seu próprio professor com número "001".
```

## Teste de Validação

### Cenário 1: Escolas Diferentes ✅
```sql
-- Escola A
INSERT INTO teachers (school_id, employee_number, ...) 
VALUES ('escola-a-uuid', '001', ...);  -- ✅ OK

-- Escola B
INSERT INTO teachers (school_id, employee_number, ...) 
VALUES ('escola-b-uuid', '001', ...);  -- ✅ OK (escola diferente)
```

### Cenário 2: Mesma Escola ❌
```sql
-- Escola A
INSERT INTO teachers (school_id, employee_number, ...) 
VALUES ('escola-a-uuid', '001', ...);  -- ✅ OK

-- Escola A (novamente)
INSERT INTO teachers (school_id, employee_number, ...) 
VALUES ('escola-a-uuid', '001', ...);  -- ❌ ERRO: Número já existe nesta escola
```

## Impacto em Outras Tabelas

Esta mesma lógica deveria ser aplicada a outras tabelas com números únicos:

### Verificar e Corrigir (se necessário):

1. ✅ **teachers.employee_number** - Corrigido
2. ⚠️ **students.student_number** - Verificar se é único por escola
3. ⚠️ **rooms.room_number** - Verificar se é único por escola
4. ⚠️ Outros campos com UNIQUE que deveriam ser por escola

## Arquivos Modificados

1. ✅ `database/migrations/004_fix_teacher_employee_number_unique_per_school.sql` (novo)
2. ✅ `scripts/migrate-004.js` (novo)
3. ✅ `src/modules/teachers/teachers.service.ts` (atualizado)
4. ✅ `frontend/src/pages/TeacherForm.tsx` (atualizado)

## Resultado Final

✅ Cada escola pode ter sua própria numeração de professores  
✅ Segregação de dados correta entre escolas  
✅ Mensagens de erro mais claras  
✅ Sistema multi-escola funcionando corretamente  

**Agora você pode criar o professor "Fernando Luis" com número "001" na sua escola!**

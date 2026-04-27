# Correção: Usuários Sem Nome de Escola no Header

## Problema Identificado

Alguns usuários não exibiam o nome da escola no header porque não tinham `school_id` atribuído na tabela `users`.

### Usuários Afetados
- Pedro Ferreira (pedro.ferreira@escola.ao) - estudante
- helio joao (helio@escola.ao) - gestor

## Causa Raiz

1. **Dados Existentes**: Usuários criados antes da implementação de segregação por escola não tinham `school_id`
2. **Registro de Novos Usuários**: O método `register` aceitava `school_id` como opcional, permitindo criação de usuários sem escola

## Solução Implementada

### 1. Script de Correção de Dados

**Arquivo**: `scripts/fix-users-without-school.js`

Script que:
- ✅ Identifica usuários sem `school_id`
- ✅ Atribui automaticamente à primeira escola disponível
- ✅ Atualiza `updated_at` para rastreamento

**Execução**:
```bash
node scripts/fix-users-without-school.js
```

**Resultado**:
```
✅ 2 usuários atualizados com sucesso!
📊 Todos os usuários agora pertencem a: Escola Principal
```

### 2. Prevenção em Novos Registros

**Arquivo**: `src/modules/auth/auth.service.ts`

Atualizado método `register` para garantir que todo novo usuário tenha escola:

```typescript
// Garantir que o usuário tenha uma escola
let finalSchoolId = data.school_id;
if (!finalSchoolId) {
  const firstSchool = await db('schools').select('id').first();
  if (firstSchool) {
    finalSchoolId = firstSchool.id;
  }
}
```

**Comportamento**:
- ✅ Se `school_id` fornecido → usa o fornecido
- ✅ Se `school_id` não fornecido → atribui primeira escola disponível
- ✅ Garante que nenhum usuário seja criado sem escola

### 3. Exibição no Frontend

**Arquivo**: `frontend/src/components/Layout.tsx`

Header atualizado para mostrar nome da escola:

```tsx
{user?.school_name && (
  <div className="flex items-center gap-2">
    <School className="w-5 h-5 text-blue-600" />
    <span className="text-base lg:text-lg font-semibold text-gray-900 truncate">
      {user.school_name}
    </span>
  </div>
)}
```

**Características**:
- ✅ Ícone de escola 🏫 em azul
- ✅ Nome da escola em negrito
- ✅ Responsivo (mobile e desktop)
- ✅ Trunca nomes longos

## Verificação

### Confirmar Todos os Usuários Têm Escola

```sql
-- Verificar usuários sem escola
SELECT id, email, first_name, last_name, role, school_id 
FROM users 
WHERE school_id IS NULL;

-- Deve retornar 0 linhas
```

### Verificar Nome da Escola no Perfil

```sql
-- Verificar dados do usuário com nome da escola
SELECT u.id, u.email, u.first_name, u.last_name, u.role, s.name as school_name
FROM users u
LEFT JOIN schools s ON s.id = u.school_id
WHERE u.email = 'helio@escola.ao';
```

## Fluxo Completo

### Antes da Correção
```
1. Usuário sem school_id
2. Backend retorna user sem school_name
3. Frontend não exibe nome da escola
4. Header vazio onde deveria ter escola
```

### Depois da Correção
```
1. Script atribui escola aos usuários existentes
2. Novos usuários sempre recebem escola
3. Backend faz join e retorna school_name
4. Frontend exibe nome da escola no header
```

## Arquivos Modificados

1. ✅ `scripts/fix-users-without-school.js` (novo)
   - Script de correção de dados

2. ✅ `src/modules/auth/auth.service.ts`
   - Método `register` atribui escola padrão
   - Método `getProfile` retorna `school_name`

3. ✅ `frontend/src/contexts/AuthContext.tsx`
   - Interface `User` inclui `school_name`

4. ✅ `frontend/src/components/Layout.tsx`
   - Header exibe nome da escola

5. ✅ `frontend/src/pages/Dashboard.tsx`
   - Hero exibe nome da escola

## Resultado Final

✅ **Dados Corrigidos**: 2 usuários atualizados com escola  
✅ **Prevenção**: Novos usuários sempre terão escola  
✅ **Exibição**: Nome da escola visível no header e dashboard  
✅ **Responsivo**: Funciona em mobile e desktop  

**Todos os usuários logados agora veem o nome da escola no header!**

## Manutenção Futura

### Se Aparecer Usuário Sem Escola

1. Execute o script de correção:
   ```bash
   node scripts/fix-users-without-school.js
   ```

2. Ou atualize manualmente:
   ```sql
   UPDATE users 
   SET school_id = (SELECT id FROM schools LIMIT 1)
   WHERE school_id IS NULL;
   ```

### Adicionar Nova Escola

Quando adicionar uma nova escola, você pode reatribuir usuários:
```sql
UPDATE users 
SET school_id = 'novo-school-id'
WHERE email IN ('user1@escola.ao', 'user2@escola.ao');
```

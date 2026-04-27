# Correção do Erro 409 ao Criar Professor

## Problema Identificado

Ao tentar criar um professor, o sistema retornava erro 409 (Conflict):
```
POST http://localhost:5000/api/teachers 409 (Conflict)
Erro ao salvar professor: AxiosError: Request failed with status code 409
```

## Causa Raiz

O erro 409 ocorre quando há violação de constraints UNIQUE no banco de dados. No caso de professores, existem duas constraints:

1. **Email** - `users.email` deve ser único (constraint: `users_email_key`)
2. **Número de Funcionário** - `teachers.employee_number` deve ser único (constraint: `teachers_employee_number_key`)

O erro estava sendo lançado corretamente, mas a mensagem não especificava qual campo causou o conflito.

## Solução Implementada

### 1. Backend - Mensagens de Erro Específicas

**Arquivo**: `src/modules/teachers/teachers.service.ts`

Melhorado o tratamento de erros para identificar qual constraint foi violada:

```typescript
catch (error: any) {
  await trx.rollback();
  if (error.code === '23505') {
    // Verificar qual campo causou o conflito
    if (error.constraint === 'users_email_key') {
      throw new AppError('Email já está em uso', 409);
    } else if (error.constraint === 'teachers_employee_number_key') {
      throw new AppError('Número de funcionário já está em uso', 409);
    } else {
      throw new AppError('Já existe um registo com estes dados', 409);
    }
  }
  throw error;
}
```

### 2. Frontend - Melhorias na UX

**Arquivo**: `frontend/src/pages/TeacherForm.tsx`

#### a) Email não editável em modo de edição

```typescript
<input
  type="email"
  name="email"
  value={formData.email}
  onChange={handleChange}
  required
  disabled={isEditing}  // ← Novo
  className="... disabled:bg-gray-100 disabled:cursor-not-allowed"
  placeholder="professor@escola.com"
/>
{isEditing && (
  <p className="mt-1 text-xs text-gray-500">O email não pode ser alterado</p>
)}
```

#### b) Texto de ajuda para número de funcionário

```typescript
<input
  type="text"
  name="employee_number"
  value={formData.employee_number}
  onChange={handleChange}
  placeholder="Ex: FUNC-001"
/>
<p className="mt-1 text-xs text-gray-500">
  Opcional, mas deve ser único se fornecido
</p>
```

## Como Resolver o Erro 409

Se você recebeu este erro, significa que:

### Cenário 1: Email Duplicado
**Mensagem**: "Email já está em uso"

**Solução**: 
- Verifique se já existe um utilizador (professor, estudante, admin, etc.) com este email
- Use um email diferente
- Se for o mesmo professor, use a função de edição em vez de criar novo

### Cenário 2: Número de Funcionário Duplicado
**Mensagem**: "Número de funcionário já está em uso"

**Solução**:
- Verifique se outro professor já tem este número
- Use um número diferente
- Deixe o campo vazio (é opcional)

## Verificação no Banco de Dados

Para verificar emails ou números duplicados:

```sql
-- Verificar se email existe
SELECT u.email, u.role, u.first_name, u.last_name 
FROM users u 
WHERE u.email = 'professor@exemplo.com';

-- Verificar se número de funcionário existe
SELECT t.employee_number, u.first_name, u.last_name 
FROM teachers t
JOIN users u ON u.id = t.user_id
WHERE t.employee_number = 'FUNC-001';
```

## Melhorias Futuras (Opcional)

1. **Validação em tempo real**: Verificar disponibilidade do email enquanto o utilizador digita
2. **Sugestões automáticas**: Sugerir próximo número de funcionário disponível
3. **Lista de conflitos**: Mostrar quais professores já usam determinado email/número

## Arquivos Modificados

1. ✅ `src/modules/teachers/teachers.service.ts` - Mensagens de erro específicas
2. ✅ `frontend/src/pages/TeacherForm.tsx` - Email não editável + textos de ajuda

## Resultado

✅ Mensagens de erro mais claras e específicas
✅ Email não pode ser alterado em modo de edição (previne conflitos)
✅ Textos de ajuda orientam o utilizador
✅ Melhor experiência ao lidar com erros de duplicação

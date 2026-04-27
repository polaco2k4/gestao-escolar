# Adição do Campo de Senha Inicial ao Criar Professor

## Implementação

Adicionado campo de senha inicial ao formulário de criação de professores, permitindo que o admin/gestor defina a senha em vez de usar uma senha padrão hardcoded.

## Mudanças Implementadas

### 1. Frontend - TeacherForm.tsx

#### a) Estado do Formulário
Adicionado campo `password` ao estado:

```typescript
const [formData, setFormData] = useState({
  first_name: '',
  last_name: '',
  email: '',
  password: '',  // ← Novo campo
  employee_number: '',
  department: '',
  specialization: '',
  hire_date: '',
});
```

#### b) Campo de Senha no Formulário
Adicionado input de senha (apenas ao criar, não ao editar):

```tsx
{!isEditing && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Senha Inicial <span className="text-red-500">*</span>
    </label>
    <input
      type="password"
      name="password"
      value={formData.password}
      onChange={handleChange}
      required
      minLength={6}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Mínimo 6 caracteres"
    />
    <p className="mt-1 text-xs text-gray-500">
      O professor poderá alterar esta senha após o primeiro login
    </p>
  </div>
)}
```

**Características:**
- ✅ Campo obrigatório (`required`)
- ✅ Mínimo 6 caracteres (`minLength={6}`)
- ✅ Tipo `password` (oculta caracteres)
- ✅ Texto de ajuda informativo
- ✅ Apenas visível ao criar (não ao editar)

### 2. Backend - teachers.service.ts

#### a) Aceitar Senha do Request
```typescript
// Usar senha fornecida ou padrão se não fornecida
const passwordToHash = data.password || 'professor123';

// Validar senha
if (passwordToHash.length < 6) {
  await trx.rollback();
  throw new AppError('A senha deve ter no mínimo 6 caracteres', 400);
}

const password_hash = await bcrypt.hash(passwordToHash, 12);
```

**Comportamento:**
- ✅ Usa senha fornecida no request
- ✅ Fallback para 'professor123' se não fornecida (retrocompatibilidade)
- ✅ Valida mínimo de 6 caracteres
- ✅ Hash com bcrypt (12 rounds)

## Fluxo de Criação

### Antes (Senha Hardcoded)
```
1. Admin preenche dados do professor
2. Backend cria usuário com senha "professor123"
3. Admin precisa informar senha padrão ao professor
4. Professor faz login e troca senha
```

### Agora (Senha Customizável)
```
1. Admin preenche dados do professor
2. Admin define senha inicial personalizada
3. Backend cria usuário com senha fornecida
4. Admin informa senha ao professor
5. Professor faz login e pode trocar senha
```

## Validações

### Frontend
- ✅ Campo obrigatório (HTML5 `required`)
- ✅ Mínimo 6 caracteres (HTML5 `minLength`)
- ✅ Validação visual em tempo real

### Backend
- ✅ Validação de comprimento mínimo (6 caracteres)
- ✅ Mensagem de erro clara: "A senha deve ter no mínimo 6 caracteres"
- ✅ Rollback da transação se senha inválida

## Segurança

### Boas Práticas Implementadas
1. ✅ **Hash com bcrypt** - Senha nunca armazenada em texto plano
2. ✅ **12 rounds** - Custo computacional adequado
3. ✅ **Input type="password"** - Oculta caracteres ao digitar
4. ✅ **Mínimo 6 caracteres** - Previne senhas muito fracas
5. ✅ **Não retorna senha** - API nunca expõe senhas

### Melhorias Futuras (Opcional)
- [ ] Validação de força de senha (maiúsculas, números, símbolos)
- [ ] Gerador de senha aleatória
- [ ] Opção "Enviar senha por email"
- [ ] Forçar troca de senha no primeiro login
- [ ] Histórico de senhas (prevenir reutilização)

## Exemplo de Uso

### Criar Professor com Senha Personalizada
```json
POST /api/teachers
{
  "first_name": "Fernando",
  "last_name": "Luis",
  "email": "fluis@escola.ao",
  "password": "Senha@123",  // ← Senha inicial
  "employee_number": "002",
  "department": "Gestão",
  "specialization": "Contabilidade",
  "hire_date": "2025-04-27"
}
```

### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Professor criado",
  "data": {
    "id": "uuid...",
    "first_name": "Fernando",
    "last_name": "Luis",
    "email": "fluis@escola.ao",
    // Senha não é retornada
  }
}
```

### Erro - Senha Muito Curta
```json
{
  "success": false,
  "message": "A senha deve ter no mínimo 6 caracteres"
}
```

## Retrocompatibilidade

✅ **Mantida** - Se o campo `password` não for enviado, o sistema usa a senha padrão "professor123"

Isso garante que:
- Scripts antigos continuam funcionando
- APIs externas não quebram
- Migração gradual é possível

## Arquivos Modificados

1. ✅ `frontend/src/pages/TeacherForm.tsx`
   - Adicionado campo `password` ao estado
   - Adicionado input de senha ao formulário
   - Validação HTML5 (required, minLength)

2. ✅ `src/modules/teachers/teachers.service.ts`
   - Aceita `password` do request
   - Validação de comprimento mínimo
   - Fallback para senha padrão

## Resultado

✅ Admin/Gestor pode definir senha inicial personalizada  
✅ Validação de mínimo 6 caracteres (frontend e backend)  
✅ Senha oculta ao digitar (type="password")  
✅ Texto de ajuda claro para o usuário  
✅ Retrocompatibilidade mantida  
✅ Segurança com bcrypt hash  

**Agora você pode criar professores com senhas personalizadas!**

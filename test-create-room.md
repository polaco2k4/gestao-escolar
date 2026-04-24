# 🧪 Teste de Criação de Sala

## Passo a Passo para Testar

### 1. Verifique se o servidor está rodando
```bash
# No terminal do backend
npm run dev
```

### 2. Verifique se você está logado
- Abra o console do navegador (F12)
- Digite: `localStorage.getItem('school_id')`
- Deve retornar um UUID (ex: "123e4567-e89b-12d3-a456-426614174000")
- Se retornar `null`, faça login novamente

### 3. Teste via Console do Navegador

Cole este código no console do navegador:

```javascript
// Obter o token de autenticação
const token = localStorage.getItem('token');
const schoolId = localStorage.getItem('school_id');

console.log('Token:', token ? 'Presente' : 'Ausente');
console.log('School ID:', schoolId);

// Dados da sala de teste
const roomData = {
  name: "Sala de Teste",
  building: "Bloco A",
  capacity: 30,
  type: "classroom",
  school_id: schoolId,
  active: true
};

console.log('Enviando dados:', roomData);

// Fazer a requisição
fetch('http://localhost:5000/api/horarios/rooms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(roomData)
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Resposta:', data);
  if (data.success) {
    console.log('✅ Sala criada com sucesso!');
  } else {
    console.error('❌ Erro:', data.message);
  }
})
.catch(error => {
  console.error('❌ Erro na requisição:', error);
});
```

### 4. Possíveis Problemas e Soluções

#### Problema 1: `school_id` é `null`
**Solução:** Faça login novamente

#### Problema 2: Token expirado
**Solução:** Faça login novamente

#### Problema 3: Erro 500 - "column does not exist"
**Solução:** Verifique se a migração foi executada corretamente
```bash
# No terminal do backend
npm run migrate
```

#### Problema 4: Erro 500 - "violates foreign key constraint"
**Solução:** O `school_id` não existe na tabela `schools`
- Verifique se a escola está cadastrada
- Ou use um `school_id` válido

### 5. Verificar Logs do Backend

Abra o terminal onde o backend está rodando e procure por:
```
Creating room with data: { ... }
```

Se houver erro, você verá:
```
Error creating room: ...
```

### 6. Testar Criação Manual no Banco de Dados

Se tudo mais falhar, teste diretamente no PostgreSQL:

```sql
-- Verificar se a tabela existe
SELECT * FROM rooms LIMIT 1;

-- Verificar estrutura da tabela
\d rooms

-- Inserir sala manualmente
INSERT INTO rooms (school_id, name, building, capacity, type, active)
VALUES (
  'SEU_SCHOOL_ID_AQUI',
  'Sala Teste Manual',
  'Bloco A',
  30,
  'classroom',
  true
);

-- Verificar se foi criada
SELECT * FROM rooms ORDER BY created_at DESC LIMIT 1;
```

## ✅ Checklist de Verificação

- [ ] Servidor backend está rodando
- [ ] Usuário está logado (token presente)
- [ ] `school_id` está no localStorage
- [ ] Migração foi executada
- [ ] Tabela `rooms` existe no banco
- [ ] Escola existe na tabela `schools`
- [ ] Dados enviados estão no formato correto

## 📊 Formato Esperado dos Dados

```json
{
  "name": "Sala 101",
  "building": "Bloco A",
  "capacity": 30,
  "type": "classroom",
  "school_id": "uuid-da-escola",
  "active": true
}
```

## 🔍 Debugging Avançado

Se o erro persistir, verifique:

1. **Logs do PostgreSQL**
2. **Permissões do usuário do banco**
3. **Constraints da tabela rooms**
4. **Triggers na tabela**

---

**Após seguir estes passos, você saberá exatamente onde está o problema!**

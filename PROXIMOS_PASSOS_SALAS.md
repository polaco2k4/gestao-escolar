# 🔍 Próximos Passos para Resolver o Erro 500

## ✅ O que já foi feito:

1. ✅ Interface TypeScript corrigida
2. ✅ Formulário atualizado com campos corretos
3. ✅ Validação de `school_id` adicionada
4. ✅ Logging adicionado no backend e frontend
5. ✅ Tratamento de erro melhorado

## 🎯 Próximos Passos:

### 1. **Reiniciar o Servidor Backend**

O backend precisa ser reiniciado para carregar as alterações no controller:

```bash
# Pare o servidor (Ctrl+C)
# Depois inicie novamente:
npm run dev
```

### 2. **Limpar Cache do Frontend**

```bash
# No terminal do frontend:
# Pare o servidor (Ctrl+C)
# Limpe o cache e reinicie:
npm run dev
```

### 3. **Testar a Criação**

1. Abra o navegador
2. Abra o Console (F12)
3. Acesse a página de Salas
4. Tente criar uma sala
5. Veja os logs no console:
   - `Sending room data: { ... }` - Dados enviados
   - Mensagem de erro detalhada

### 4. **Verificar Logs do Backend**

No terminal do backend, você verá:
```
Creating room with data: { ... }
```

Se houver erro:
```
Error creating room: [detalhes do erro]
```

## 🔧 Possíveis Causas do Erro 500:

### Causa 1: `school_id` inválido ou vazio
**Como verificar:**
- Console do navegador: `localStorage.getItem('school_id')`
- Deve retornar um UUID válido

**Solução:**
- Faça logout e login novamente

### Causa 2: Escola não existe no banco
**Como verificar:**
```sql
SELECT * FROM schools WHERE id = 'SEU_SCHOOL_ID';
```

**Solução:**
- Cadastre uma escola primeiro
- Ou use o ID de uma escola existente

### Causa 3: Migração não executada
**Como verificar:**
```sql
\d rooms
```

**Solução:**
```bash
npm run migrate
```

### Causa 4: Campo obrigatório faltando
**Campos obrigatórios na tabela `rooms`:**
- `school_id` (UUID, NOT NULL)
- `name` (VARCHAR, NOT NULL)

**Campos opcionais:**
- `building` (VARCHAR)
- `capacity` (INT, default 40)
- `type` (VARCHAR, default 'classroom')
- `active` (BOOLEAN, default true)

## 📋 Checklist de Debugging:

- [ ] Backend reiniciado
- [ ] Frontend reiniciado
- [ ] Console do navegador aberto
- [ ] Logs do backend visíveis
- [ ] Tentativa de criar sala
- [ ] Logs capturados (frontend e backend)
- [ ] Mensagem de erro específica identificada

## 🎯 Ação Imediata:

1. **Reinicie o backend** (IMPORTANTE!)
2. **Tente criar uma sala**
3. **Copie a mensagem de erro completa** que aparecer no console
4. **Copie os logs do backend**
5. **Me envie essas informações**

Com os logs específicos, posso identificar exatamente o problema!

## 💡 Teste Rápido:

Abra o console do navegador e execute:

```javascript
console.log('School ID:', localStorage.getItem('school_id'));
console.log('Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
```

Se ambos estiverem presentes, o problema está no backend.
Se algum estiver ausente, faça login novamente.

---

**Após reiniciar o backend, tente novamente e me envie os logs!** 🚀

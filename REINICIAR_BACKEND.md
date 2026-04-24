# 🔄 Como Reiniciar o Backend

## ⚠️ Problema Atual

O backend está rodando com a configuração antiga de CORS. Precisa ser reiniciado para aplicar as mudanças.

## ✅ Solução - Reiniciar Backend

### Opção 1: Parar e Reiniciar Manualmente

**1. Encontrar o processo do backend:**
```powershell
# Listar processos Node.js
Get-Process -Name node | Select-Object Id, ProcessName, StartTime
```

**2. Parar o processo do backend:**
```powershell
# Substitua XXXX pelo ID do processo do backend (geralmente o mais recente)
Stop-Process -Id XXXX -Force
```

**3. Iniciar novamente:**
```bash
npm run dev
```

### Opção 2: Usar o Terminal Integrado

Se o backend está rodando em um terminal do VS Code:

1. Clique no terminal onde o backend está rodando
2. Pressione `Ctrl+C` para parar
3. Execute novamente: `npm run dev`

### Opção 3: Parar Todos os Processos Node

**⚠️ CUIDADO: Isso vai parar TODOS os processos Node.js, incluindo o frontend!**

```powershell
# Parar todos os processos Node
Get-Process -Name node | Stop-Process -Force

# Depois reinicie backend e frontend separadamente
```

## 🎯 Verificar se Funcionou

### 1. Verificar CORS no Backend

Após reiniciar, teste se o CORS está funcionando:

```bash
# Teste simples
curl -X GET http://localhost:3000/health -H "Origin: http://localhost:5173" -v
```

Deve mostrar nos headers:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

### 2. Testar no Frontend

1. Acesse: http://localhost:5173/documentos
2. Abra o DevTools (F12)
3. Vá para a aba "Console"
4. Não deve haver erros de CORS
5. A tabela deve carregar os dados

### 3. Testar os Botões

**Assiduidade:**
- Clique em "Registar Presença"
- Deve abrir um modal
- Preencha os campos e submeta

**Documentos:**
- Clique em "Solicitar Documento"
- Deve abrir um modal
- Preencha os campos e submeta

## 📝 Logs para Verificar

### Backend deve mostrar:
```
Server running on port 3000
Database connected
```

### Frontend deve mostrar:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## 🔍 Troubleshooting

### Erro: "Port 3000 is already in use"

```bash
# Encontrar o processo usando a porta 3000
netstat -ano | findstr :3000

# Parar o processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F

# Reiniciar
npm run dev
```

### Erro de CORS persiste

1. Limpe o cache do navegador (Ctrl+Shift+Del)
2. Faça hard refresh (Ctrl+Shift+R)
3. Verifique se o backend foi realmente reiniciado
4. Verifique os logs do backend

### Modais não abrem

1. Verifique o console do navegador (F12)
2. Pode haver erro de importação dos componentes
3. Certifique-se que os arquivos dos modais existem:
   - `frontend/src/components/RegistrarPresencaModal.tsx`
   - `frontend/src/components/SolicitarDocumentoModal.tsx`

## 📦 Arquivos Criados/Modificados

### Backend
- ✅ `src/app.ts` - CORS configurado

### Frontend
- ✅ `frontend/src/components/RegistrarPresencaModal.tsx` - Modal de presença
- ✅ `frontend/src/components/SolicitarDocumentoModal.tsx` - Modal de documento
- ✅ `frontend/src/pages/Assiduidade.tsx` - Botão conectado ao modal
- ✅ `frontend/src/pages/Documentos.tsx` - Botão conectado ao modal

## ✅ Checklist Final

- [ ] Backend parado
- [ ] Backend reiniciado
- [ ] Frontend rodando
- [ ] Sem erros de CORS no console
- [ ] Dados carregando nas tabelas
- [ ] Botão "Registar Presença" abre modal
- [ ] Botão "Solicitar Documento" abre modal
- [ ] Modais funcionam corretamente

---

**Próximos Passos:**
1. Reinicie o backend
2. Teste as páginas
3. Teste os modais
4. Se tudo funcionar, está pronto! 🎉

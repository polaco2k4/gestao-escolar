# ✅ CORS Corrigido

## 🔧 Problema Identificado

O erro de CORS ocorreu porque o backend não estava configurado corretamente para aceitar requisições do frontend rodando em `http://localhost:5173`.

```
Access to fetch at 'http://localhost:3000/api/documentos' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

## ✅ Solução Aplicada

### Arquivo Modificado: `src/app.ts`

**Antes:**
```typescript
app.use(helmet());
app.use(cors());
```

**Depois:**
```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 🎯 O que foi configurado:

### 1. Helmet
- ✅ `crossOriginResourcePolicy: "cross-origin"` - Permite recursos de outras origens

### 2. CORS
- ✅ **origin**: Permite `localhost:5173` (frontend) e `localhost:3000` (backend)
- ✅ **credentials**: `true` - Permite envio de cookies e headers de autenticação
- ✅ **methods**: GET, POST, PUT, DELETE, OPTIONS - Todos os métodos necessários
- ✅ **allowedHeaders**: Content-Type, Authorization - Headers necessários para API

## 🚀 Como Aplicar a Correção

### 1. Parar o servidor backend (se estiver rodando)
```bash
# Pressione Ctrl+C no terminal do backend
```

### 2. Reiniciar o servidor
```bash
npm run dev
```

### 3. Verificar se está funcionando
- Acesse `http://localhost:5173/documentos`
- Acesse `http://localhost:5173/assiduidade`
- As páginas devem carregar os dados sem erros de CORS

## 🧪 Testar CORS

### Teste 1: Health Check
```bash
curl -X GET http://localhost:3000/health \
  -H "Origin: http://localhost:5173" \
  -v
```

Deve retornar headers CORS:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

### Teste 2: API com Autenticação
```bash
curl -X GET http://localhost:3000/api/documentos \
  -H "Origin: http://localhost:5173" \
  -H "Authorization: Bearer seu-token" \
  -v
```

## 📝 Notas Importantes

### Desenvolvimento vs Produção

**Desenvolvimento (atual):**
```typescript
origin: ['http://localhost:5173', 'http://localhost:3000']
```

**Produção (futuro):**
```typescript
origin: process.env.FRONTEND_URL || 'https://seu-dominio.com'
```

### Variáveis de Ambiente

Adicione ao `.env`:
```env
# Frontend URL para CORS
FRONTEND_URL=http://localhost:5173

# Em produção
# FRONTEND_URL=https://seu-dominio.com
```

E modifique `app.ts`:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## ✅ Checklist de Verificação

- [x] CORS configurado com origens específicas
- [x] Credentials habilitado para autenticação
- [x] Métodos HTTP permitidos (GET, POST, PUT, DELETE, OPTIONS)
- [x] Headers necessários permitidos (Content-Type, Authorization)
- [x] Helmet configurado para permitir recursos cross-origin
- [ ] Servidor reiniciado
- [ ] Frontend testado

## 🔍 Troubleshooting

### Erro persiste após reiniciar?

1. **Limpar cache do navegador**
   - Pressione `Ctrl+Shift+R` (hard refresh)
   - Ou abra DevTools → Network → Disable cache

2. **Verificar se o servidor reiniciou**
   ```bash
   # Verificar logs do servidor
   # Deve mostrar: "Server running on port 3000"
   ```

3. **Verificar porta do frontend**
   ```bash
   # O frontend deve estar em http://localhost:5173
   # Se estiver em outra porta, adicione ao array de origins
   ```

4. **Verificar headers na requisição**
   - Abra DevTools → Network
   - Clique na requisição
   - Veja "Request Headers" e "Response Headers"
   - Deve ter `Access-Control-Allow-Origin: http://localhost:5173`

### Erro 401 (Unauthorized)?

Isso é diferente de CORS. Significa que:
- Token JWT expirou ou é inválido
- Faça login novamente para obter novo token

### Erro 404 (Not Found)?

- Verifique se a rota existe no backend
- Verifique se o endpoint está correto no frontend

---

**Status**: 🟢 **CORS CORRIGIDO**

Reinicie o servidor backend para aplicar as mudanças!

# 🚀 Como Iniciar o Frontend

## ✅ Configuração Completa

O frontend React está totalmente configurado com:
- ✅ Vite + React + TypeScript
- ✅ TailwindCSS v3.4.1
- ✅ React Router DOM
- ✅ Axios para API
- ✅ Lucide React para ícones
- ✅ Autenticação JWT
- ✅ Dashboard e Layout

## 📝 Passo a Passo

### 1. Criar arquivo .env

Crie o arquivo `.env` na pasta `frontend` com:

```env
VITE_API_URL=http://localhost:5000
```

### 2. Iniciar o servidor

Abra um terminal na pasta `frontend` e execute:

```bash
npm run dev
```

O servidor deve iniciar em: **http://localhost:5173** ou **http://localhost:5174**

### 3. Acessar o sistema

Abra o navegador em: **http://localhost:5173**

### 4. Fazer login

Use uma das credenciais de teste:

**Admin:**
```
Email: admin@escola.ao
Password: Admin@123
```

**Professor:**
```
Email: prof.matematica@escola.ao
Password: Prof@123
```

**Estudante:**
```
Email: aluno1@escola.ao
Password: Aluno@123
```

## 🔧 Resolução de Problemas

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Port already in use"
O Vite tentará automaticamente outra porta (5174, 5175, etc.)

### Erro: TailwindCSS
Se houver erros do Tailwind, execute:
```bash
rm -r node_modules/.vite
npm run dev
```

### Limpar cache completo
```bash
rm -r node_modules
npm install
npm run dev
```

## 📊 Estrutura do Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # Layout principal com sidebar
│   │   └── ProtectedRoute.tsx  # Proteção de rotas
│   ├── contexts/
│   │   └── AuthContext.tsx     # Contexto de autenticação
│   ├── pages/
│   │   ├── Login.tsx           # Página de login
│   │   └── Dashboard.tsx       # Dashboard principal
│   ├── config/
│   │   └── api.ts              # Configuração Axios
│   ├── App.tsx                 # Rotas principais
│   ├── main.tsx                # Entry point
│   └── index.css               # Estilos globais
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
└── package.json
```

## 🎯 Funcionalidades Implementadas

- ✅ Tela de login com validação
- ✅ Dashboard com estatísticas
- ✅ Sidebar responsiva
- ✅ Navegação entre módulos
- ✅ Logout
- ✅ Proteção de rotas
- ✅ Integração com API backend

## 📡 Conexão com Backend

O frontend está configurado para conectar com o backend em:
**http://localhost:5000**

Certifique-se de que o backend está rodando antes de usar o frontend.

## 🎨 Próximos Passos (Opcional)

Para expandir o sistema, você pode:
1. Implementar páginas completas para cada módulo
2. Criar tabelas com dados da API
3. Adicionar formulários de criação/edição
4. Implementar gráficos e relatórios
5. Adicionar filtros e pesquisa

## 💡 Dicas

- Use **Ctrl+C** no terminal para parar o servidor
- O hot reload está ativado - mudanças no código atualizam automaticamente
- Verifique o console do navegador (F12) para erros
- O backend deve estar rodando na porta 5000

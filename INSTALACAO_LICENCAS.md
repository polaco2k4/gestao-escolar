# 🚀 Guia Rápido - Instalação do Sistema de Licenças

## Passo 1: Executar Migration

```bash
# Conectar ao PostgreSQL
psql -U postgres -d gestao_escolar

# Executar migration
\i database/migrations/005_create_licenses.sql

# Verificar tabelas criadas
\dt license*

# Verificar planos criados
SELECT name, display_name, max_students, price_monthly FROM license_plans;

# Verificar licenças criadas (escolas existentes recebem trial)
SELECT s.name, lp.display_name, l.status, l.trial_ends_at 
FROM licenses l
JOIN schools s ON l.school_id = s.id
JOIN license_plans lp ON l.plan_id = lp.id;

# Sair
\q
```

## Passo 2: Reiniciar Backend

```bash
# Parar servidor se estiver rodando (Ctrl+C)

# Reiniciar
cd c:\Users\SDBD\Downloads\PROJECTOS\GESTÃO ESCOLAR
npm run dev
```

**Verificar logs:**
```
✓ Servidor rodando na porta 3000
✓ Conectado ao banco de dados
```

## Passo 3: Reiniciar Frontend

```bash
# Em outro terminal
cd c:\Users\SDBD\Downloads\PROJECTOS\GESTÃO ESCOLAR\frontend
npm run dev
```

## Passo 4: Testar Sistema

### 4.1 Login como Admin

1. Abrir `http://localhost:5173`
2. Login com credenciais de admin
3. Verificar menu lateral - deve aparecer:
   - ✅ **Painel Admin**
   - ✅ **Licenças**

### 4.2 Acessar Painel Admin

1. Clicar em **Painel Admin** no menu
2. Verificar estatísticas globais:
   - Total de escolas
   - Total de alunos
   - Total de professores
   - Licenças ativas/trial/expiradas

### 4.3 Gerir Licenças

1. Clicar em **Licenças** no menu
2. Ver lista de todas as licenças
3. Filtrar por status (Todas, Ativas, Trial, etc.)
4. Verificar limites de cada escola

### 4.4 Testar Verificação de Limites

**Como Gestor:**
1. Logout do admin
2. Login como gestor de uma escola com licença Trial
3. Ir para **Estudantes**
4. Tentar criar mais de 50 alunos
5. Deve aparecer erro: **"Limite de alunos atingido (50/50)"**

**Como Admin:**
1. Login como admin
2. Criar aluno em qualquer escola
3. Deve funcionar normalmente (admin bypassa limites)

## Passo 5: Verificar API

### Testar Endpoints (Postman/Thunder Client)

```bash
# 1. Login como admin
POST http://localhost:3000/api/auth/login
{
  "email": "admin@email.com",
  "password": "senha_admin"
}
# Copiar token do response

# 2. Listar planos
GET http://localhost:3000/api/licenses/plans
Authorization: Bearer {token}

# 3. Listar licenças
GET http://localhost:3000/api/licenses
Authorization: Bearer {token}

# 4. Estatísticas globais
GET http://localhost:3000/api/licenses/stats/global
Authorization: Bearer {token}

# 5. Verificar limites de uma escola
GET http://localhost:3000/api/licenses/check/{school_id}
Authorization: Bearer {token}
```

## ✅ Checklist de Verificação

- [ ] Migration executada com sucesso
- [ ] 4 planos criados (Trial, Básico, Premium, Enterprise)
- [ ] Escolas existentes receberam licença Trial
- [ ] Backend reiniciado sem erros
- [ ] Frontend reiniciado sem erros
- [ ] Menu mostra "Painel Admin" e "Licenças" para admin
- [ ] Painel Admin exibe estatísticas
- [ ] Página de Licenças lista todas as licenças
- [ ] Gestor é bloqueado ao atingir limite
- [ ] Admin bypassa verificação de limites

## 🐛 Troubleshooting

### Erro: "relation license_plans does not exist"
**Solução:** Migration não foi executada. Executar Passo 1.

### Erro: "Cannot GET /api/licenses"
**Solução:** Backend não reiniciado. Executar Passo 2.

### Menu não mostra "Painel Admin"
**Solução:** 
1. Verificar se está logado como admin
2. Limpar cache do navegador (Ctrl+Shift+R)
3. Verificar console do navegador para erros

### Erro ao criar aluno: "Limite atingido"
**Solução:** Isso é esperado! O sistema está funcionando.
- Se for gestor: Atualizar plano da escola
- Se for admin: Verificar se está realmente logado como admin

### Estatísticas não aparecem
**Solução:**
1. Verificar console do navegador
2. Verificar network tab - endpoint `/api/licenses/stats/global`
3. Verificar se token de admin é válido

## 📊 Dados de Teste

### Criar Escola de Teste com Licença Premium

```sql
-- 1. Criar escola
INSERT INTO schools (name, code, email, active)
VALUES ('Escola Premium Teste', 'EPT-001', 'premium@teste.com', true)
RETURNING id;

-- 2. Criar licença premium (copiar id da escola)
INSERT INTO licenses (school_id, plan_id, status, start_date, end_date)
VALUES (
  '{id_da_escola}',
  (SELECT id FROM license_plans WHERE name = 'premium'),
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year'
);

-- 3. Criar gestor para essa escola
INSERT INTO users (email, password_hash, first_name, last_name, role, school_id, active)
VALUES (
  'gestor.premium@teste.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxF6q4Hqe', -- senha: senha123
  'Gestor',
  'Premium',
  'gestor',
  '{id_da_escola}',
  true
);
```

Agora pode testar com:
- **Email:** gestor.premium@teste.com
- **Senha:** senha123
- **Limites:** 500 alunos, 50 professores, 50 turmas

## 🎉 Pronto!

O sistema de gestão centralizada está instalado e funcionando.

**Próximos passos:**
- Explorar painel de admin
- Criar/editar licenças
- Testar limites com diferentes planos
- Ver documentação completa em `GESTAO_ADMIN_CENTRALIZADA.md`

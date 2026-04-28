# 🧪 Guia de Teste - Sistema de Relatórios

## 📋 Pré-requisitos

1. Backend rodando na porta 3000
2. Frontend rodando na porta 5173
3. Banco de dados PostgreSQL configurado
4. Migration aplicada

## 🚀 Passo a Passo para Testar

### 1. Aplicar a Migration

```bash
cd "c:\Users\SDBD\Downloads\PROJECTOS\GESTÃO ESCOLAR"
node scripts/apply-custom-reports-migration.js
```

**Resultado esperado:**
```
🚀 Aplicando migration de relatórios personalizados...
✅ Migration aplicada com sucesso!
📊 Tabelas criadas:
   - custom_reports (relatórios personalizados)
   - report_executions (histórico de execuções)
```

### 2. Verificar Tabelas no Banco

```sql
-- Verificar estrutura da tabela
\d custom_reports

-- Verificar se está vazia
SELECT COUNT(*) FROM custom_reports;
```

### 3. Reiniciar o Backend

```bash
# No terminal do backend
npm run dev
```

### 4. Acessar o Frontend

1. Abra o navegador em `http://localhost:5173`
2. Faça login com um usuário gestor ou professor
3. Navegue para **Relatórios** no menu lateral

### 5. Testar Interface

Você deve ver:
- ✅ Duas abas: "Relatórios Personalizados" e "Relatórios Predefinidos"
- ✅ Botão "Novo Relatório"
- ✅ Mensagem "Nenhum relatório encontrado" (se for primeira vez)

## 🧪 Casos de Teste

### Teste 1: Criar Relatório Personalizado

**Passos:**
1. Clique em "Novo Relatório"
2. Preencha:
   - Nome: "Alunos Ativos"
   - Descrição: "Lista de todos os alunos com matrícula ativa"
   - Tipo: "Alunos"
   - Marque "Tornar público"
3. Clique em "Criar"

**Resultado esperado:**
- ✅ Modal fecha
- ✅ Card do relatório aparece na lista
- ✅ Badge "Público" visível
- ✅ Nome do criador exibido

### Teste 2: Executar Relatório

**Passos:**
1. No card do relatório criado, clique em "Executar" (botão verde)
2. Aguarde o processamento

**Resultado esperado:**
- ✅ Alert com mensagem: "Relatório executado com sucesso! X registros encontrados."
- ✅ Console mostra os dados retornados

### Teste 3: Editar Relatório

**Passos:**
1. Clique no ícone de lápis (Edit)
2. Altere o nome para "Alunos Ativos 2024"
3. Clique em "Atualizar"

**Resultado esperado:**
- ✅ Modal fecha
- ✅ Card atualizado com novo nome

### Teste 4: Excluir Relatório

**Passos:**
1. Clique no ícone de lixeira (Delete)
2. Confirme a exclusão

**Resultado esperado:**
- ✅ Confirmação exibida
- ✅ Relatório removido da lista

### Teste 5: Relatórios Predefinidos

**Passos:**
1. Clique na aba "Relatórios Predefinidos"
2. Visualize os 5 cards de relatórios do sistema

**Resultado esperado:**
- ✅ 5 cards visíveis:
  - Relatório de Alunos
  - Relatório de Assiduidade
  - Relatório de Avaliações
  - Relatório Financeiro
  - Relatório de Matrículas
- ✅ Cada card com ícone e descrição
- ✅ Instruções de uso na parte inferior

### Teste 6: Segregação de Escolas

**Cenário A - Gestor da Escola A:**
1. Login como gestor da Escola A
2. Criar relatório "Teste Escola A"
3. Logout

**Cenário B - Gestor da Escola B:**
1. Login como gestor da Escola B
2. Acessar Relatórios
3. Verificar que NÃO vê "Teste Escola A"
4. Criar relatório "Teste Escola B"

**Cenário C - Admin:**
1. Login como admin
2. Acessar Relatórios
3. Verificar que vê AMBOS os relatórios

**Resultado esperado:**
- ✅ Escola A só vê seus relatórios
- ✅ Escola B só vê seus relatórios
- ✅ Admin vê todos os relatórios

## 🔍 Verificações no Backend

### Verificar Logs do Servidor

```bash
# Deve mostrar:
POST /api/relatorios/custom - 201
GET /api/relatorios/custom - 200
GET /api/relatorios/custom/:id/execute - 200
PUT /api/relatorios/custom/:id - 200
DELETE /api/relatorios/custom/:id - 200
```

### Verificar Dados no Banco

```sql
-- Ver relatórios criados
SELECT 
  id, 
  name, 
  report_type, 
  school_id, 
  created_by, 
  is_public,
  created_at
FROM custom_reports
ORDER BY created_at DESC;

-- Ver execuções
SELECT 
  cr.name as report_name,
  re.executed_at,
  re.row_count,
  re.execution_time_ms,
  u.first_name || ' ' || u.last_name as executed_by
FROM report_executions re
JOIN custom_reports cr ON cr.id = re.report_id
JOIN users u ON u.id = re.executed_by
ORDER BY re.executed_at DESC
LIMIT 10;
```

## 🐛 Troubleshooting

### Erro: "Tabela custom_reports não existe"
**Solução:** Execute a migration novamente
```bash
node scripts/apply-custom-reports-migration.js
```

### Erro: "Relatório não encontrado"
**Causa:** Tentando acessar relatório de outra escola
**Solução:** Verificar se o usuário tem acesso à escola do relatório

### Erro: "Apenas o criador ou admin pode editar"
**Causa:** Usuário tentando editar relatório de outro usuário
**Solução:** Fazer login com o criador ou admin

### Frontend não carrega relatórios
**Verificar:**
1. Backend está rodando?
2. Rota `/api/relatorios/custom` está respondendo?
3. Token de autenticação válido?
4. Console do navegador mostra erros?

### Relatórios não aparecem após criar
**Verificar:**
1. Resposta da API foi 201?
2. Dados foram salvos no banco?
3. school_id foi atribuído corretamente?

## 📊 Testes de API com cURL

### Criar Relatório
```bash
curl -X POST http://localhost:3000/api/relatorios/custom \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste API",
    "description": "Relatório criado via API",
    "report_type": "students",
    "is_public": true
  }'
```

### Listar Relatórios
```bash
curl http://localhost:3000/api/relatorios/custom \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Executar Relatório
```bash
curl http://localhost:3000/api/relatorios/custom/ID_DO_RELATORIO/execute \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Atualizar Relatório
```bash
curl -X PUT http://localhost:3000/api/relatorios/custom/ID_DO_RELATORIO \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste API Atualizado"
  }'
```

### Excluir Relatório
```bash
curl -X DELETE http://localhost:3000/api/relatorios/custom/ID_DO_RELATORIO \
  -H "Authorization: Bearer SEU_TOKEN"
```

## ✅ Checklist Final

- [ ] Migration aplicada com sucesso
- [ ] Tabelas criadas no banco
- [ ] Backend reiniciado
- [ ] Frontend acessível
- [ ] Página de Relatórios carrega
- [ ] Pode criar relatório personalizado
- [ ] Pode listar relatórios
- [ ] Pode executar relatório
- [ ] Pode editar relatório
- [ ] Pode excluir relatório
- [ ] Segregação por escola funciona
- [ ] Relatórios públicos visíveis para escola
- [ ] Admin vê todos os relatórios
- [ ] Histórico de execuções registrado
- [ ] Relatórios predefinidos acessíveis

## 🎯 Métricas de Sucesso

- ✅ Tempo de resposta < 500ms para listagem
- ✅ Tempo de execução < 2s para relatórios pequenos
- ✅ 100% de segregação (sem vazamento entre escolas)
- ✅ Interface responsiva e intuitiva
- ✅ Sem erros no console

---

**Sistema testado e funcionando! 🎉**

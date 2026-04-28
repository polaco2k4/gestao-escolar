# ⚡ Quick Start - Relatórios

## 🚀 Comandos Rápidos

### 1. Aplicar Migration (Execute APENAS UMA VEZ)
```bash
cd "c:\Users\SDBD\Downloads\PROJECTOS\GESTÃO ESCOLAR"
node scripts/apply-custom-reports-migration.js
```

### 2. Verificar no Banco (Opcional)
```sql
-- Conectar ao PostgreSQL
psql -U postgres -d escola_db

-- Verificar tabelas
\dt custom_reports
\dt report_executions

-- Ver estrutura
\d custom_reports

-- Sair
\q
```

### 3. Reiniciar Backend
```bash
# No terminal do backend
# Pressione Ctrl+C para parar
# Depois execute:
npm run dev
```

### 4. Acessar Frontend
```
Abra o navegador em: http://localhost:5173
Login → Menu Lateral → Relatórios
```

## ✅ Checklist Rápido

- [ ] Migration aplicada (veja mensagem de sucesso)
- [ ] Backend reiniciado (sem erros no console)
- [ ] Frontend acessível
- [ ] Página "Relatórios" carrega
- [ ] Botão "Novo Relatório" visível
- [ ] Pode criar relatório
- [ ] Pode executar relatório
- [ ] Modal de resultados abre
- [ ] Pode exportar CSV/JSON

## 🧪 Teste Rápido (2 minutos)

### Passo 1: Criar Relatório
1. Clique "Novo Relatório"
2. Nome: `Teste Rápido`
3. Tipo: `Alunos`
4. Clique "Criar"

### Passo 2: Executar
1. Clique botão verde "Executar"
2. Veja modal com resultados
3. Clique "Exportar CSV"

### Passo 3: Editar
1. Clique ícone de lápis
2. Mude nome para `Teste Editado`
3. Clique "Atualizar"

### Passo 4: Excluir
1. Clique ícone de lixeira
2. Confirme
3. Relatório removido

## 🎯 Resultado Esperado

✅ Tudo funcionando = Sistema OK!  
❌ Algum erro = Consulte `TESTE_RELATORIOS.md`

## 📱 Acesso Rápido aos Arquivos

- **Guia Completo**: `RELATORIOS_CRUD_GUIA.md`
- **Testes Detalhados**: `TESTE_RELATORIOS.md`
- **Implementação**: `RELATORIOS_IMPLEMENTACAO_COMPLETA.md`
- **Quick Start**: `QUICK_START_RELATORIOS.md` (este arquivo)

## 🆘 Problemas Comuns

### Erro: "Tabela não existe"
```bash
# Execute novamente:
node scripts/apply-custom-reports-migration.js
```

### Erro: "Cannot read property 'data'"
```bash
# Verifique se backend está rodando:
# Deve mostrar: "Server running on port 3000"
```

### Página em branco
```bash
# Verifique console do navegador (F12)
# Verifique se está logado
# Verifique se tem permissão (gestor/professor)
```

## 🎉 Pronto!

Sistema de relatórios funcionando em **menos de 5 minutos**! 🚀

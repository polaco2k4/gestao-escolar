# 📚 Guia Rápido - Assiduidade e Documentos

## 🎯 Resumo

Implementação completa de CRUD para:
- ✅ **Assiduidade** (Registos de presença e justificações)
- ✅ **Documentos** (Templates e solicitações de documentos)

---

## 🚀 Como Usar

### 1. Iniciar o Servidor

```bash
# Backend
npm run dev

# Frontend (em outro terminal)
cd frontend
npm run dev
```

### 2. Obter Token de Autenticação

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@escola.com",
    "password": "sua-senha"
  }'

# Copie o token da resposta
export TOKEN="seu-token-aqui"
```

---

## 📋 Assiduidade - Casos de Uso

### Caso 1: Professor registra presença da turma

```bash
# Registar múltiplas presenças de uma vez
curl -X POST http://localhost:3000/api/assiduidade/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "student_id": "aluno-1-id",
        "schedule_id": "horario-id",
        "date": "2024-04-24",
        "status": "present",
        "recorded_by": "professor-id",
        "school_id": "escola-id"
      },
      {
        "student_id": "aluno-2-id",
        "schedule_id": "horario-id",
        "date": "2024-04-24",
        "status": "absent",
        "recorded_by": "professor-id",
        "school_id": "escola-id"
      }
    ]
  }'
```

### Caso 2: Consultar presenças de um aluno

```bash
# Ver todas as presenças de um aluno
curl -X GET "http://localhost:3000/api/assiduidade/student/aluno-id?date_from=2024-01-01&date_to=2024-04-24" \
  -H "Authorization: Bearer $TOKEN"

# Ver sumário de assiduidade
curl -X GET "http://localhost:3000/api/assiduidade/summary/student/aluno-id?academic_year_id=ano-id" \
  -H "Authorization: Bearer $TOKEN"
```

### Caso 3: Encarregado justifica falta

```bash
# Submeter justificação
curl -X POST http://localhost:3000/api/assiduidade/justifications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "attendance_id": "presenca-id",
    "reason": "Consulta médica de urgência",
    "supporting_document": "atestado-medico.pdf",
    "school_id": "escola-id"
  }'
```

### Caso 4: Professor aprova justificação

```bash
# Listar justificações pendentes
curl -X GET "http://localhost:3000/api/assiduidade/justifications?status=pending" \
  -H "Authorization: Bearer $TOKEN"

# Aprovar justificação
curl -X PUT http://localhost:3000/api/assiduidade/justifications/justificacao-id/review \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

### Caso 5: Corrigir registo de presença

```bash
# Atualizar status
curl -X PUT http://localhost:3000/api/assiduidade/presenca-id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "late",
    "notes": "Chegou às 8:15 (15 min atrasado)"
  }'
```

---

## 📄 Documentos - Casos de Uso

### Caso 1: Admin cria template de documento

```bash
# Criar template de declaração
curl -X POST http://localhost:3000/api/documentos/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Declaração de Matrícula",
    "type": "enrollment_certificate",
    "content_template": "Declaramos que {{student_name}}, portador do BI nº {{student_id_number}}, está matriculado na {{class_name}} no ano letivo {{academic_year}}.",
    "school_id": "escola-id",
    "active": true
  }'
```

### Caso 2: Aluno solicita documento

```bash
# Solicitar declaração de matrícula
curl -X POST http://localhost:3000/api/documentos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "certificate",
    "template_id": "template-id",
    "student_id": "aluno-id",
    "notes": "Necessário para candidatura a bolsa",
    "school_id": "escola-id"
  }'
```

### Caso 3: Admin processa e envia documento

```bash
# 1. Atualizar para "em processamento"
curl -X PUT http://localhost:3000/api/documentos/documento-id/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing",
    "notes": "Documento em preparação"
  }'

# 2. Upload do documento gerado
curl -X POST http://localhost:3000/api/documentos/documento-id/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@declaracao-matricula.pdf"

# 3. Marcar como pronto
curl -X PUT http://localhost:3000/api/documentos/documento-id/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ready",
    "notes": "Documento pronto para levantamento na secretaria"
  }'

# 4. Marcar como entregue
curl -X PUT http://localhost:3000/api/documentos/documento-id/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "delivered",
    "notes": "Entregue ao aluno em 24/04/2024"
  }'
```

### Caso 4: Consultar documentos solicitados

```bash
# Listar todos os documentos
curl -X GET "http://localhost:3000/api/documentos?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"

# Filtrar por status
curl -X GET "http://localhost:3000/api/documentos?status=pending" \
  -H "Authorization: Bearer $TOKEN"

# Filtrar por aluno
curl -X GET "http://localhost:3000/api/documentos?student_id=aluno-id" \
  -H "Authorization: Bearer $TOKEN"

# Ver detalhes de um documento
curl -X GET http://localhost:3000/api/documentos/documento-id \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Executar Testes

```bash
# Configurar token
export AUTH_TOKEN="seu-token-aqui"

# Executar testes
node scripts/test-assiduidade-documentos.js
```

---

## 📊 Status dos Documentos

| Status | Descrição |
|--------|-----------|
| `pending` | Solicitação recebida, aguardando processamento |
| `processing` | Documento em preparação |
| `ready` | Documento pronto para levantamento |
| `delivered` | Documento entregue ao solicitante |
| `cancelled` | Solicitação cancelada |

---

## 📊 Status de Presença

| Status | Descrição |
|--------|-----------|
| `present` | Aluno presente |
| `absent` | Aluno ausente |
| `late` | Aluno atrasado |
| `justified` | Falta justificada |

---

## 🔐 Permissões por Papel

### Admin
- ✅ Todas as operações em assiduidade
- ✅ Todas as operações em documentos
- ✅ Criar/editar/eliminar templates
- ✅ Aprovar/rejeitar justificações

### Professor
- ✅ Registar/atualizar/eliminar presenças
- ✅ Ver presenças da turma
- ✅ Aprovar/rejeitar justificações
- ✅ Ver sumários

### Encarregado/Estudante
- ✅ Ver próprias presenças
- ✅ Submeter justificações
- ✅ Solicitar documentos
- ✅ Ver próprios documentos

---

## 🗂️ Estrutura de Ficheiros

```
src/modules/
├── assiduidade/
│   ├── assiduidade.controller.ts  ✅ CRUD completo
│   ├── assiduidade.service.ts     ✅ CRUD completo
│   └── assiduidade.routes.ts      ✅ Rotas organizadas
│
└── documentos/
    ├── documentos.controller.ts   ✅ CRUD completo
    ├── documentos.service.ts      ✅ CRUD completo
    └── documentos.routes.ts       ✅ Rotas organizadas
```

---

## ✅ Checklist de Implementação

### Assiduidade
- [x] CREATE - Registar presença individual
- [x] CREATE - Registar presenças em lote
- [x] READ - Listar com paginação
- [x] READ - Obter por ID
- [x] READ - Filtrar por aluno/turma/data
- [x] UPDATE - Atualizar registo
- [x] DELETE - Eliminar registo
- [x] Justificações (CRUD completo)
- [x] Sumários estatísticos

### Documentos
- [x] Templates (CRUD completo)
- [x] CREATE - Solicitar documento
- [x] READ - Listar com filtros
- [x] READ - Obter por ID
- [x] UPDATE - Atualizar estado
- [x] UPDATE - Upload de ficheiro
- [x] DELETE - Eliminar documento

### Segurança
- [x] Autenticação em todas as rotas
- [x] Autorização por papel
- [x] Validação de dados
- [x] Upload seguro de ficheiros

---

## 📝 Próximos Passos (Opcional)

1. **Notificações**
   - Notificar encarregado quando falta é registada
   - Notificar quando documento está pronto

2. **Relatórios**
   - Relatório mensal de assiduidade
   - Estatísticas de documentos solicitados

3. **Frontend**
   - Interface para registar presenças
   - Dashboard de assiduidade
   - Formulário de solicitação de documentos

4. **Melhorias**
   - Exportar relatórios em PDF
   - Assinatura digital de documentos
   - Histórico de alterações

---

## 🆘 Resolução de Problemas

### Erro 401 (Não autorizado)
- Verifique se o token está correto
- Token pode ter expirado, faça login novamente

### Erro 403 (Proibido)
- Verifique se o papel do utilizador tem permissão
- Admin/Professor para operações administrativas

### Erro 404 (Não encontrado)
- Verifique se o ID está correto
- Registo pode ter sido eliminado

### Upload falha
- Verifique o tamanho do ficheiro (máx 10MB)
- Verifique o tipo de ficheiro (PDF, Word, Excel, Imagens)

---

## 📚 Documentação Adicional

- **API Completa:** `ASSIDUIDADE_DOCUMENTOS_API.md`
- **Script de Testes:** `scripts/test-assiduidade-documentos.js`
- **Configuração:** `.env.example`

---

**Desenvolvido com ❤️ para Sistema de Gestão Escolar**

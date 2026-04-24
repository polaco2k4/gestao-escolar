# API de Assiduidade e Documentos - CRUD Completo

## 📋 Assiduidade (Attendance)

### Endpoints Disponíveis

#### 1. Listar Registos de Presença
```http
GET /api/assiduidade?page=1&limit=20&class_id=xxx&date=2024-04-24&status=present&student_id=xxx
```
**Resposta:**
```json
{
  "success": true,
  "data": {
    "records": [...],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

#### 2. Obter Registo por ID
```http
GET /api/assiduidade/:id
```
**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "student_id": "xxx",
    "schedule_id": "xxx",
    "date": "2024-04-24",
    "status": "present",
    "first_name": "João",
    "last_name": "Silva",
    "student_number": "2024001",
    "subject_name": "Matemática",
    "class_name": "10ª A"
  }
}
```

#### 3. Obter Presenças por Estudante
```http
GET /api/assiduidade/student/:studentId?date_from=2024-01-01&date_to=2024-04-24
```

#### 4. Obter Presenças por Turma e Data
```http
GET /api/assiduidade/class/:classId/date/:date
```

#### 5. Registar Presença (Admin/Professor)
```http
POST /api/assiduidade
Authorization: Bearer <token>
Content-Type: application/json

{
  "student_id": "xxx",
  "schedule_id": "xxx",
  "date": "2024-04-24",
  "status": "present",
  "notes": "Opcional",
  "school_id": "xxx"
}
```
**Status:** `present`, `absent`, `late`, `justified`

#### 6. Registar Presenças em Lote (Admin/Professor)
```http
POST /api/assiduidade/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "records": [
    {
      "student_id": "xxx",
      "schedule_id": "xxx",
      "date": "2024-04-24",
      "status": "present",
      "recorded_by": "xxx",
      "school_id": "xxx"
    }
  ]
}
```

#### 7. Atualizar Registo (Admin/Professor)
```http
PUT /api/assiduidade/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "justified",
  "notes": "Justificado por atestado médico"
}
```

#### 8. Eliminar Registo (Admin/Professor)
```http
DELETE /api/assiduidade/:id
Authorization: Bearer <token>
```

### Justificações

#### 9. Listar Justificações (Admin/Professor)
```http
GET /api/assiduidade/justifications?status=pending
```

#### 10. Submeter Justificação (Encarregado/Estudante)
```http
POST /api/assiduidade/justifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "attendance_id": "xxx",
  "reason": "Consulta médica",
  "supporting_document": "url_do_documento",
  "school_id": "xxx"
}
```

#### 11. Rever Justificação (Admin/Professor)
```http
PUT /api/assiduidade/justifications/:id/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved"
}
```
**Status:** `approved`, `rejected`

#### 12. Eliminar Justificação (Admin/Professor)
```http
DELETE /api/assiduidade/justifications/:id
Authorization: Bearer <token>
```

### Sumários

#### 13. Sumário de Estudante
```http
GET /api/assiduidade/summary/student/:studentId?academic_year_id=xxx
```
**Resposta:**
```json
{
  "success": true,
  "data": {
    "present": 45,
    "absent": 3,
    "late": 2,
    "justified": 1,
    "total": 51,
    "attendance_rate": "90.2"
  }
}
```

#### 14. Sumário de Turma (Admin/Professor)
```http
GET /api/assiduidade/summary/class/:classId?date=2024-04-24
```

---

## 📄 Documentos

### Templates de Documentos

#### 1. Listar Templates
```http
GET /api/documentos/templates?school_id=xxx
```

#### 2. Obter Template por ID
```http
GET /api/documentos/templates/:id
```

#### 3. Criar Template (Admin)
```http
POST /api/documentos/templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Declaração de Matrícula",
  "type": "enrollment_certificate",
  "content_template": "Template HTML/texto",
  "school_id": "xxx",
  "active": true
}
```

#### 4. Atualizar Template (Admin)
```http
PUT /api/documentos/templates/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Declaração de Matrícula Atualizada",
  "content_template": "Novo template",
  "active": true
}
```

#### 5. Eliminar Template (Admin)
```http
DELETE /api/documentos/templates/:id
Authorization: Bearer <token>
```

### Documentos

#### 6. Listar Documentos
```http
GET /api/documentos?page=1&limit=20&status=pending&type=certificate&student_id=xxx&requested_by=xxx
```
**Resposta:**
```json
{
  "success": true,
  "data": {
    "documents": [...],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

#### 7. Obter Documento por ID
```http
GET /api/documentos/:id
```
**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "type": "certificate",
    "status": "ready",
    "student_id": "xxx",
    "template_id": "xxx",
    "first_name": "Maria",
    "last_name": "Santos",
    "template_name": "Declaração de Matrícula",
    "content_template": "...",
    "file_url": "/uploads/xxx.pdf",
    "generated_at": "2024-04-24T10:00:00Z",
    "delivered_at": null
  }
}
```

#### 8. Solicitar Documento
```http
POST /api/documentos
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "certificate",
  "template_id": "xxx",
  "student_id": "xxx",
  "notes": "Urgente",
  "school_id": "xxx"
}
```
**Tipos:** `certificate`, `transcript`, `enrollment_certificate`, `conduct_certificate`, `other`

#### 9. Atualizar Estado do Documento (Admin)
```http
PUT /api/documentos/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ready",
  "notes": "Documento pronto para levantamento"
}
```
**Status:** `pending`, `processing`, `ready`, `delivered`, `cancelled`

#### 10. Upload de Ficheiro (Admin)
```http
POST /api/documentos/:id/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <arquivo.pdf>
```
**Tipos aceites:** PDF, Word, Excel, Imagens (JPEG, PNG, GIF)
**Tamanho máximo:** 10MB

#### 11. Eliminar Documento (Admin)
```http
DELETE /api/documentos/:id
Authorization: Bearer <token>
```

---

## 🔐 Permissões

### Assiduidade
- **Listar/Visualizar:** Todos os autenticados
- **Criar/Atualizar/Eliminar:** Admin, Professor
- **Submeter Justificação:** Encarregado, Estudante
- **Rever/Eliminar Justificação:** Admin, Professor

### Documentos
- **Listar/Visualizar/Solicitar:** Todos os autenticados
- **Templates (CRUD):** Admin
- **Atualizar Estado/Upload/Eliminar:** Admin

---

## ✅ Status de Implementação

### Assiduidade ✅
- [x] CREATE - Registar presença individual
- [x] CREATE - Registar presenças em lote
- [x] READ - Listar com paginação e filtros
- [x] READ - Obter por ID
- [x] READ - Obter por estudante
- [x] READ - Obter por turma e data
- [x] UPDATE - Atualizar registo
- [x] DELETE - Eliminar registo
- [x] Justificações (CRUD completo)
- [x] Sumários (estudante e turma)

### Documentos ✅
- [x] Templates (CRUD completo)
- [x] CREATE - Solicitar documento
- [x] READ - Listar com paginação e filtros
- [x] READ - Obter por ID
- [x] UPDATE - Atualizar estado
- [x] UPDATE - Upload de ficheiro
- [x] DELETE - Eliminar documento

---

## 🧪 Exemplos de Teste

### Testar Assiduidade

```bash
# 1. Registar presença
curl -X POST http://localhost:3000/api/assiduidade \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "xxx",
    "schedule_id": "xxx",
    "date": "2024-04-24",
    "status": "present",
    "school_id": "xxx"
  }'

# 2. Listar presenças
curl -X GET "http://localhost:3000/api/assiduidade?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 3. Obter por ID
curl -X GET http://localhost:3000/api/assiduidade/:id \
  -H "Authorization: Bearer $TOKEN"

# 4. Atualizar
curl -X PUT http://localhost:3000/api/assiduidade/:id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "justified"}'

# 5. Eliminar
curl -X DELETE http://localhost:3000/api/assiduidade/:id \
  -H "Authorization: Bearer $TOKEN"
```

### Testar Documentos

```bash
# 1. Criar template
curl -X POST http://localhost:3000/api/documentos/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Declaração",
    "type": "certificate",
    "content_template": "Template...",
    "school_id": "xxx",
    "active": true
  }'

# 2. Solicitar documento
curl -X POST http://localhost:3000/api/documentos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "certificate",
    "template_id": "xxx",
    "student_id": "xxx",
    "school_id": "xxx"
  }'

# 3. Upload de ficheiro
curl -X POST http://localhost:3000/api/documentos/:id/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@documento.pdf"

# 4. Eliminar documento
curl -X DELETE http://localhost:3000/api/documentos/:id \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Notas Importantes

1. **Autenticação:** Todos os endpoints requerem token JWT válido
2. **Paginação:** Endpoints de listagem suportam `page` e `limit`
3. **Filtros:** Múltiplos filtros podem ser combinados
4. **Upload:** Ficheiros são salvos em `/uploads` e servidos estaticamente
5. **Validação:** Todos os dados são validados antes de serem processados
6. **Erros:** Respostas de erro incluem mensagem descritiva e código HTTP apropriado

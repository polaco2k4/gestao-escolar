# API de Avaliações - CRUD Completo

## Endpoints Disponíveis

### 1. Listar Avaliações
**GET** `/api/avaliacoes`

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20)
- `class_id` (opcional): Filtrar por turma
- `subject_id` (opcional): Filtrar por disciplina
- `trimester` (opcional): Filtrar por trimestre (1, 2 ou 3)
- `teacher_id` (opcional): Filtrar por professor

**Resposta:**
```json
{
  "success": true,
  "message": "Sucesso",
  "data": {
    "assessments": [...],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Obter Avaliação por ID
**GET** `/api/avaliacoes/:id`

**Resposta:**
```json
{
  "success": true,
  "message": "Sucesso",
  "data": {
    "id": "uuid",
    "name": "Teste de Matemática",
    "subject_name": "Matemática",
    "class_name": "10ª A",
    "type_name": "Prova",
    "max_score": 20,
    ...
  }
}
```

### 3. Criar Avaliação
**POST** `/api/avaliacoes`

**Permissões:** admin, professor

**Body:**
```json
{
  "school_id": "uuid",
  "academic_year_id": "uuid",
  "class_id": "uuid",
  "subject_id": "uuid",
  "teacher_id": "uuid",
  "assessment_type_id": "uuid",
  "name": "Teste de Matemática",
  "description": "Teste do 1º trimestre",
  "date": "2024-04-15",
  "trimester": 1
}
```

**Campos Obrigatórios:**
- school_id
- academic_year_id
- class_id
- subject_id
- teacher_id
- assessment_type_id
- name

### 4. Actualizar Avaliação
**PUT** `/api/avaliacoes/:id`

**Permissões:** admin, professor

**Body:**
```json
{
  "name": "Teste de Matemática - Actualizado",
  "description": "Nova descrição",
  "date": "2024-04-20",
  "trimester": 2
}
```

### 5. Eliminar Avaliação
**DELETE** `/api/avaliacoes/:id`

**Permissões:** admin, professor

**Resposta:**
```json
{
  "success": true,
  "message": "Avaliação eliminada",
  "data": null
}
```

## Gestão de Notas

### 6. Listar Notas de uma Avaliação
**GET** `/api/avaliacoes/:assessmentId/grades`

**Resposta:**
```json
{
  "success": true,
  "message": "Sucesso",
  "data": [
    {
      "id": "uuid",
      "assessment_id": "uuid",
      "student_id": "uuid",
      "score": 15.5,
      "remarks": "Bom desempenho",
      "first_name": "João",
      "last_name": "Silva",
      "student_number": "2024001"
    }
  ]
}
```

### 7. Guardar/Actualizar Notas
**POST** `/api/avaliacoes/:assessmentId/grades`

**Permissões:** admin, professor

**Body:**
```json
{
  "grades": [
    {
      "student_id": "uuid",
      "score": 15.5,
      "remarks": "Bom desempenho"
    },
    {
      "student_id": "uuid",
      "score": 18.0,
      "remarks": "Excelente"
    }
  ]
}
```

**Validações:**
- A nota deve estar entre 0 e o max_score do tipo de avaliação
- student_id é obrigatório
- Se a nota já existir, será actualizada; caso contrário, será criada

## Gestão de Pautas

### 8. Listar Pautas
**GET** `/api/avaliacoes/sheets/list`

**Permissões:** admin, professor

**Query Parameters:**
- `class_id` (opcional): Filtrar por turma
- `status` (opcional): Filtrar por status (draft, submitted, approved, published)

### 9. Criar Pauta
**POST** `/api/avaliacoes/sheets`

**Permissões:** admin, professor

**Body:**
```json
{
  "school_id": "uuid",
  "academic_year_id": "uuid",
  "class_id": "uuid",
  "subject_id": "uuid",
  "trimester": 1
}
```

### 10. Submeter Pauta
**PUT** `/api/avaliacoes/sheets/:id/submit`

**Permissões:** professor

Altera o status da pauta para "submitted"

### 11. Aprovar Pauta
**PUT** `/api/avaliacoes/sheets/:id/approve`

**Permissões:** admin

Altera o status da pauta para "approved"

## Autenticação

Todos os endpoints requerem autenticação via token JWT no header:
```
Authorization: Bearer <token>
```

## Códigos de Erro

- **400**: Dados inválidos ou campos obrigatórios em falta
- **401**: Não autenticado
- **403**: Sem permissão para aceder ao recurso
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

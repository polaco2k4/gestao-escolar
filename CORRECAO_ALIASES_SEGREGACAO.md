# Correção de Aliases para applySchoolFilter

## Problema
O `applySchoolFilter` estava falhando em queries com JOIN porque não especificava o alias da tabela.

## Solução
Adicionar o terceiro parâmetro `tableAlias` ao `applySchoolFilter` em todas as queries com JOIN.

## Serviços que Precisam de Correção

### ✅ 1. Classes (JÁ CORRIGIDO)
```typescript
query = applySchoolFilter(query, user, 'c');
```

### 2. Teachers
**Linha 13:**
```typescript
// ANTES:
query = applySchoolFilter(query, user);

// DEPOIS:
query = applySchoolFilter(query, user, 't');
```

### 3. Students  
**Linha 74:**
```typescript
// ANTES:
query = applySchoolFilter(query, user);

// DEPOIS:
query = applySchoolFilter(query, user, 's');
```

### 4. Guardians
**Linha 14:**
```typescript
// ANTES:
query = applySchoolFilter(query, user);

// DEPOIS:
query = applySchoolFilter(query, user, 'g');
```

### 5. Matriculas
**Linha 17:**
```typescript
// ANTES:
query = applySchoolFilter(query, user);

// DEPOIS:
query = applySchoolFilter(query, user, 'e');
```

### 6. Avaliacoes
**Linha 80:**
```typescript
// ANTES:
query = applySchoolFilter(query, user);

// DEPOIS:
query = applySchoolFilter(query, user, 'a');
```

### 7. Assiduidade
**Linha 17:**
```typescript
// ANTES:
query = applySchoolFilter(query, user);

// DEPOIS:
query = applySchoolFilter(query, user, 'ar');
```

### 8. Horarios
**Linha 18:**
```typescript
// ANTES:
query = applySchoolFilter(query, user);

// DEPOIS:
query = applySchoolFilter(query, user, 's');
```

### 9. Financeiro - listStudentFees
**Linha 56:**
```typescript
// ANTES:
query = applySchoolFilter(query, user);

// DEPOIS:
query = applySchoolFilter(query, user, 's');
```

### 10. Documentos - listDocuments
**Linha 56:**
```typescript
// ANTES:
query = applySchoolFilter(query, user);

// DEPOIS:
query = applySchoolFilter(query, user, 'd');
```

### 11. Comunicacao - listMessages
**Linha 14:**
```typescript
// ANTES:
query = applySchoolFilter(query, user);

// DEPOIS:
query = applySchoolFilter(query, user, 'm');
```

### 12. Relatorios
Tem 5 métodos que precisam de correção:

**getStudentsReport - Linha 12:**
```typescript
query = applySchoolFilter(query, user, 's');
```

**getAttendanceReport - Linha 29:**
```typescript
query = applySchoolFilter(query, user, 's');
```

**getGradesReport - Linha 50:**
```typescript
query = applySchoolFilter(query, user, 's');
```

**getFinancialReport - Linha 69:**
```typescript
query = applySchoolFilter(query, user, 's');
```

**getEnrollmentsReport - Linha 88:**
```typescript
query = applySchoolFilter(query, user, 'e');
```

## Serviços que NÃO Precisam de Alias (sem JOIN)

- Courses
- Subjects  
- Fee Types
- Assessment Types
- Rooms
- Document Templates
- Notifications

## Como Identificar o Alias Correto

Olhe para a primeira linha do query:
```typescript
db('table_name as ALIAS')
```

O ALIAS é o que deve ser passado para `applySchoolFilter`.

Exemplos:
- `db('classes as c')` → alias = `'c'`
- `db('students as s')` → alias = `'s'`
- `db('teachers as t')` → alias = `'t'`

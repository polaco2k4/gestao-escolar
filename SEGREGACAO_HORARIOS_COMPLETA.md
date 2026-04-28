# Segregação por Escola - Módulo de Horários

## Resumo das Alterações

Este documento descreve as alterações implementadas para garantir que o módulo de Horários exiba apenas dados relacionados à escola do usuário logado.

## Alterações no Backend

### 1. **horarios.service.ts**

#### `listClasses(filters, user)`
- **Antes**: Filtrava por `school_id` apenas se fornecido nos filtros
- **Depois**: Aplica automaticamente `applySchoolFilter(query, user, 'c')` para filtrar por escola do usuário
- **Impacto**: Usuários não-admin só veem turmas da sua escola

#### `listSubjects(filters, user)`
- **Antes**: Filtrava por `school_id` apenas se fornecido nos filtros
- **Depois**: Aplica automaticamente `applySchoolFilter(query, user)` para filtrar por escola do usuário
- **Impacto**: Usuários não-admin só veem disciplinas da sua escola

#### `createSchedule(data, user)`
- **Adicionado**: Validações completas para todos os campos obrigatórios:
  - `academic_year_id`
  - `class_id`
  - `subject_id`
  - `teacher_id`
  - `day_of_week`
  - `start_time`
  - `end_time`
- **Impacto**: Erros 400 com mensagens claras em vez de 500

### 2. **horarios.controller.ts**

#### `listClasses(req, res)`
- **Alterado**: Passa `req.user` para o service
- **Código**: `service.listClasses(req.query, req.user)`

#### `listSubjects(req, res)`
- **Alterado**: Passa `req.user` para o service
- **Código**: `service.listSubjects(req.query, req.user)`

## Alterações no Frontend

### 1. **Horarios.tsx**

#### Formulário de Criação/Edição
- **Adicionado**: Campo "Ano Académico" no formulário
- **Posição**: Primeiro campo do formulário (antes de Turma)
- **Validação**: Campo obrigatório com mensagem de erro específica

#### Validações Client-Side
- **Adicionadas**: Validações antes de submeter:
  - Ano académico (obrigatório)
  - Turma (obrigatório)
  - Disciplina (obrigatório)
  - Professor (obrigatório)
  - Horários de início e fim (obrigatórios)

#### Tratamento de Erros
- **Melhorado**: Exibe mensagens específicas do backend
- **Logs**: Console.log com contagem de dados carregados para debug
- **Proteção**: Arrays vazios em caso de dados inválidos

#### Função `handleEdit`
- **Corrigido**: Popula `academic_year_id` ao editar horário existente

### 2. **horarios.service.ts (Frontend)**

#### Interface `Schedule`
- **Adicionado**: Campo `academic_year_id: string`
- **Impacto**: TypeScript agora reconhece este campo

## Serviços Já Segregados

Os seguintes serviços JÁ aplicavam segregação por escola:

1. **teachers.service.ts**: Aplica `applySchoolFilter(query, user, 't')`
2. **academicYears.service.ts**: Filtra por `school_id` se usuário não for admin
3. **horarios.service.ts**:
   - `listSchedules()`: Aplica `applySchoolFilter(query, user, 's')`
   - `listRooms()`: Aplica `applySchoolFilter(query, user)`

## Como Funciona a Segregação

### Para Usuários Admin
- **Acesso**: Todos os dados de todas as escolas
- **Filtro**: Nenhum filtro automático aplicado

### Para Usuários Não-Admin (Gestor, Professor, etc.)
- **Acesso**: Apenas dados da escola associada ao usuário (`user.school_id`)
- **Filtro**: `applySchoolFilter` adiciona automaticamente `WHERE school_id = user.school_id`

## Fluxo de Dados

```
Frontend (Horarios.tsx)
  ↓
  Carrega dados via services
  ↓
Backend Controllers
  ↓
  Passa req.user para services
  ↓
Backend Services
  ↓
  Aplica applySchoolFilter(query, user)
  ↓
  Retorna apenas dados da escola do usuário
  ↓
Frontend
  ↓
  Exibe dados nos dropdowns
```

## Testes Recomendados

1. **Login como Admin**:
   - Deve ver todas as turmas, disciplinas, professores de todas as escolas

2. **Login como Gestor de Escola A**:
   - Deve ver apenas turmas, disciplinas, professores da Escola A
   - Não deve ver dados da Escola B

3. **Criar Horário**:
   - Todos os dropdowns devem mostrar apenas dados da escola do usuário
   - Validações devem impedir submissão com campos vazios

4. **Editar Horário**:
   - Formulário deve preencher todos os campos, incluindo ano académico

## Mensagens de Erro

### Backend (400 Bad Request)
- "Escola não especificada"
- "Ano académico não especificado"
- "Turma não especificada"
- "Disciplina não especificada"
- "Professor não especificado"
- "Dia da semana não especificado"
- "Hora de início não especificada"
- "Hora de fim não especificada"

### Frontend (Alerts)
- "Por favor, selecione um ano académico ou defina um ano académico como atual."
- "Por favor, selecione uma turma."
- "Por favor, selecione uma disciplina."
- "Por favor, selecione um professor."
- "Por favor, preencha os horários de início e fim."

## Debug

Para verificar se a segregação está funcionando:

1. Abra o Console do navegador (F12)
2. Vá para a página de Horários
3. Verifique o log: "Dados carregados: { schedules: X, classes: Y, ... }"
4. Se os números estiverem em 0, verifique:
   - Se o usuário tem `school_id` definido
   - Se há dados cadastrados para aquela escola
   - Se o token de autenticação está válido

## Próximos Passos

Se os dropdowns ainda estiverem vazios:

1. Verificar se o usuário logado tem `school_id` definido
2. Verificar se há dados cadastrados para aquela escola:
   - Anos académicos
   - Turmas
   - Disciplinas
   - Professores
   - Salas
3. Verificar logs do backend para erros de autenticação
4. Verificar se o token JWT está sendo enviado corretamente

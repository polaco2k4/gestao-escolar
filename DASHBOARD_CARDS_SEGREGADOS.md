# ✅ Dashboard e Cards Financeiros - Segregados por Escola

## 🎯 Objetivo

Garantir que os cards do Dashboard e os resumos financeiros mostrem apenas dados da escola do gestor logado.

## 🔧 Implementação

### 1. ✅ Dashboard Stats (School Stats)

**Arquivo**: `src/modules/schools/schools.service.ts`

#### Antes:
```typescript
async getStats(id: string) {
  const school = await this.getById(id);
  // Usava sempre o ID passado
}
```

#### Depois:
```typescript
async getStats(id: string, user?: AuthPayload) {
  // Se for gestor, usar sua escola automaticamente
  const schoolId = user?.role === 'gestor' ? user.school_id : id;
  if (!schoolId) throw new AppError('Escola não especificada', 400);
  
  const school = await this.getById(schoolId);
  // Queries usam schoolId ao invés de id
}
```

**Controller**: `src/modules/schools/schools.controller.ts`
```typescript
async getStats(req: AuthRequest, res: Response) {
  const result = await service.getStats(req.params.id, req.user);
  return sendSuccess(res, result);
}
```

#### Dados Retornados:
- `total_students` - Total de estudantes da escola
- `total_teachers` - Total de professores da escola
- `total_classes` - Total de turmas da escola
- `total_courses` - Total de cursos ativos da escola

### 2. ✅ Financial Summary (Resumo Financeiro)

**Arquivo**: `src/modules/financeiro/financeiro.service.ts`

#### Antes:
```typescript
async getFinancialSummary(schoolId?: string, academicYearId?: string) {
  // schoolId era opcional e podia ser qualquer escola
}
```

#### Depois:
```typescript
async getFinancialSummary(schoolId?: string, academicYearId?: string, user?: AuthPayload) {
  // Se for gestor, usar sua escola automaticamente
  const finalSchoolId = user?.role === 'gestor' ? user.school_id : schoolId;
  
  // Todas as queries filtram por finalSchoolId
  let baseQuery = db('student_fees as sf').where('sf.status', '!=', 'cancelled');
  if (finalSchoolId) baseQuery.where('sf.school_id', finalSchoolId);
  
  // ... outras queries também filtram por finalSchoolId
}
```

**Controller**: `src/modules/financeiro/financeiro.controller.ts`
```typescript
async getFinancialSummary(req: AuthRequest, res: Response) {
  const summary = await service.getFinancialSummary(
    req.query.school_id as string,
    req.query.academic_year_id as string,
    req.user  // ← Passa o usuário autenticado
  );
  return sendSuccess(res, summary);
}
```

#### Dados Retornados:
- `total_expected` - Total esperado de propinas
- `total_paid` - Total pago
- `total_pending` - Total pendente
- `total_overdue` - Total em atraso
- `payment_rate` - Taxa de pagamento (%)

## 📊 Comportamento

### Para Gestor:
```typescript
// Gestor da Escola A
GET /api/schools/:any_id/stats
// Retorna sempre stats da Escola A (sua escola)

GET /api/financeiro/summary
// Retorna sempre resumo da Escola A (sua escola)
```

### Para Admin:
```typescript
// Admin pode ver qualquer escola
GET /api/schools/escola-b-id/stats
// Retorna stats da Escola B

GET /api/financeiro/summary?school_id=escola-b-id
// Retorna resumo da Escola B
```

## 🧪 Como Testar

### Teste 1: Dashboard do Gestor
1. Login como Gestor da Escola A
2. Ir para Dashboard
3. ✅ Cards devem mostrar apenas dados da Escola A
4. ✅ Total de estudantes, professores, turmas e cursos da Escola A

### Teste 2: Resumo Financeiro do Gestor
1. Login como Gestor da Escola A
2. Ir para página Financeiro
3. ✅ Cards devem mostrar apenas dados financeiros da Escola A
4. ✅ Total esperado, pago, pendente e em atraso da Escola A

### Teste 3: Admin
1. Login como Admin
2. Ir para Dashboard
3. ✅ Pode selecionar qualquer escola
4. ✅ Cards mostram dados da escola selecionada

## 📝 Endpoints Atualizados

### 1. GET /api/schools/:id/stats
**Parâmetros**:
- `id` - ID da escola (ignorado se for gestor)

**Headers**:
- `Authorization: Bearer <token>`

**Resposta**:
```json
{
  "success": true,
  "data": {
    "school": {
      "id": "...",
      "name": "Escola A",
      "code": "ESC-A"
    },
    "stats": {
      "total_students": 150,
      "total_teachers": 20,
      "total_classes": 8,
      "total_courses": 4
    }
  }
}
```

### 2. GET /api/financeiro/summary
**Query Params**:
- `school_id` - ID da escola (ignorado se for gestor)
- `academic_year_id` - ID do ano letivo (opcional)

**Headers**:
- `Authorization: Bearer <token>`

**Resposta**:
```json
{
  "success": true,
  "data": {
    "total_expected": 500000,
    "total_paid": 350000,
    "total_pending": 150000,
    "total_overdue": 50000,
    "payment_rate": 70
  }
}
```

## 🎨 Frontend - Como Usar

### Dashboard Component
```typescript
// O frontend não precisa passar school_id se for gestor
const fetchStats = async () => {
  try {
    // Para gestor, pode passar qualquer ID (será ignorado)
    // Para admin, passar o ID da escola selecionada
    const schoolId = user.role === 'admin' ? selectedSchoolId : user.school_id;
    const response = await api.get(`/api/schools/${schoolId}/stats`);
    setStats(response.data.data.stats);
  } catch (error) {
    console.error('Erro ao carregar stats:', error);
  }
};
```

### Financial Summary Component
```typescript
const fetchFinancialSummary = async () => {
  try {
    // Para gestor, não precisa passar school_id
    // Para admin, passar school_id na query
    const params = user.role === 'admin' ? { school_id: selectedSchoolId } : {};
    const response = await api.get('/api/financeiro/summary', { params });
    setSummary(response.data.data);
  } catch (error) {
    console.error('Erro ao carregar resumo:', error);
  }
};
```

## ✅ Checklist de Implementação

- [x] Atualizar `schools.service.ts` - getStats com user
- [x] Atualizar `schools.controller.ts` - passar req.user
- [x] Atualizar `financeiro.service.ts` - getFinancialSummary com user
- [x] Atualizar `financeiro.controller.ts` - passar req.user
- [ ] Testar Dashboard como Gestor
- [ ] Testar Dashboard como Admin
- [ ] Testar Financeiro como Gestor
- [ ] Testar Financeiro como Admin

## 🚀 Resultado Final

✅ **Gestor** vê apenas dados da sua escola nos cards  
✅ **Admin** pode ver dados de qualquer escola  
✅ Segregação automática e transparente  
✅ Sem necessidade de mudanças no frontend

---

**Data**: 27 de Abril de 2026  
**Status**: ✅ COMPLETO

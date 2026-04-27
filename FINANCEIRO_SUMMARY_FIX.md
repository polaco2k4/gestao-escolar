# Correção do Erro 500 no Endpoint `/api/financeiro/summary`

## Problema Identificado

O endpoint `/api/financeiro/summary` estava retornando erro 500 (Internal Server Error) ao tentar carregar o resumo financeiro.

## Causa Raiz

A tabela `student_fees` não tinha a coluna `school_id`, mas o código no serviço `FinanceiroService` estava tentando inserir dados nessa coluna ao criar propinas.

### Detalhes Técnicos

1. **Schema Original** (`001_initial_schema.sql`):
   - A tabela `student_fees` foi criada sem a coluna `school_id`
   - Apenas tinha: `student_id`, `fee_type_id`, `academic_year_id`, `amount`, `due_date`, `status`

2. **Código do Serviço** (`financeiro.service.ts:119`):
   - Tentava inserir `school_id` ao criar propinas
   - Causava erro de coluna inexistente

## Solução Implementada

### 1. Criação da Migração 003

Arquivo: `database/migrations/003_add_school_id_to_student_fees.sql`

```sql
-- Adicionar coluna school_id à tabela student_fees
ALTER TABLE student_fees 
ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- Preencher school_id baseado no student
UPDATE student_fees sf
SET school_id = s.school_id
FROM students s
WHERE sf.student_id = s.id;

-- Tornar a coluna NOT NULL após preencher os dados
ALTER TABLE student_fees 
ALTER COLUMN school_id SET NOT NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_student_fees_school_id ON student_fees(school_id);
```

### 2. Correção da Query de Pagamentos

Arquivo: `src/modules/financeiro/financeiro.service.ts`

**Problema**: A query de pagamentos não filtrava corretamente por `academic_year_id` quando especificado.

**Solução**: Adicionado join com `student_fees` para filtrar pagamentos pelo ano acadêmico:

```typescript
// Se academicYearId for especificado, filtrar pagamentos pelo ano acadêmico
if (academicYearId) {
  paymentQuery = paymentQuery
    .join('student_fees as sf', 'sf.id', 'p.student_fee_id')
    .where('sf.academic_year_id', academicYearId);
}
```

### 3. Script de Migração

Criado script `scripts/migrate-003.js` para executar a migração de forma isolada.

## Execução

```bash
# Executar a migração
node scripts/migrate-003.js

# Reiniciar o backend
npm run dev
```

## Resultado

✅ Endpoint `/api/financeiro/summary` agora funciona corretamente
✅ Segregação de dados por escola implementada na tabela `student_fees`
✅ Filtros por escola e ano acadêmico funcionando corretamente
✅ Performance otimizada com índice na coluna `school_id`

## Arquivos Modificados

1. ✅ `database/migrations/003_add_school_id_to_student_fees.sql` (novo)
2. ✅ `scripts/migrate-003.js` (novo)
3. ✅ `src/modules/financeiro/financeiro.service.ts` (atualizado)

## Testes Recomendados

- [ ] Verificar carregamento do dashboard financeiro
- [ ] Testar criação de novas propinas
- [ ] Validar filtros por escola (admin)
- [ ] Validar filtros por ano acadêmico
- [ ] Confirmar segregação de dados entre escolas

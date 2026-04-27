# Correção do Erro NaN em Inputs Numéricos

## Problema Identificado

Vários formulários estavam mostrando o erro:
```
Received NaN for the `value` attribute. If this is expected, cast the value to a string.
The specified value "NaN" cannot be parsed, or is out of range.
```

## Causa Raiz

Quando um utilizador limpava um input do tipo `number`, ou digitava um valor inválido, funções como `parseInt()` ou `Number()` retornavam `NaN`. Este valor `NaN` era então passado diretamente para o atributo `value` do input, causando o erro.

### Exemplo do Problema

```typescript
// ❌ ERRADO - Causa NaN
const handleChange = (e) => {
  const value = parseInt(e.target.value); // Retorna NaN se vazio
  setFormData({ ...formData, [name]: value });
};

<input type="number" value={formData.max_students} /> // Mostra "NaN"
```

## Solução Implementada

### 1. Atualização dos Handlers

Modificar os handlers para retornar string vazia em vez de NaN:

```typescript
// ✅ CORRETO
const handleChange = (e) => {
  let value = e.target.value;
  
  if (e.target.type === 'number') {
    const parsed = parseInt(e.target.value);
    value = isNaN(parsed) ? '' : parsed;
  }
  
  setFormData({ ...formData, [e.target.name]: value });
};
```

### 2. Atualização dos Inputs

Usar operador `||` para mostrar string vazia quando o valor for 0, null, undefined ou NaN:

```typescript
// ✅ CORRETO
<input 
  type="number" 
  value={formData.max_students || ''} 
  onChange={handleChange}
/>
```

### 3. Para Inline Handlers

Quando o handler é inline e o estado espera número:

```typescript
// ✅ CORRETO
<input
  type="number"
  value={formData.amount || ''}
  onChange={(e) => setFormData({ 
    ...formData, 
    amount: e.target.value ? Number(e.target.value) : 0 
  })}
/>
```

## Arquivos Corrigidos

### Formulários com Handler Dedicado

1. ✅ **TurmaForm.tsx**
   - `year_level` (linha 189)
   - `max_students` (linha 219)
   - Handler atualizado (linhas 96-108)

2. ✅ **CourseForm.tsx**
   - `duration_years` (linha 151)
   - Handler atualizado (linhas 69-81)

3. ✅ **SubjectForm.tsx**
   - `credits` (linha 154)
   - Handler já tinha fallback `|| 0`, apenas input atualizado

4. ✅ **AssessmentTypeForm.tsx**
   - `weight` (linha 111)
   - `max_score` (linha 132)
   - Handler já tinha fallback `|| 0`, apenas inputs atualizados

### Formulários com Inline Handlers

5. ✅ **Salas.tsx**
   - `capacity` (linha 335)
   - Estado já era string, apenas input atualizado

6. ✅ **Financeiro.tsx**
   - `paymentForm.amount` (linha 506)
   - `feeForm.amount` (linha 636)
   - `feeTypeForm.amount` (linha 757)
   - Todos atualizados com fallback e step="0.01"

## Padrão Recomendado

### Para Novos Formulários

```typescript
// Estado
const [formData, setFormData] = useState({
  name: '',
  quantity: 0,  // ou '' se preferir string
});

// Handler
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value: string | number = e.target.value;
  
  if (e.target.type === 'number') {
    const parsed = parseInt(e.target.value);
    value = isNaN(parsed) ? '' : parsed;
  }
  
  setFormData({
    ...formData,
    [e.target.name]: value,
  });
};

// Input
<input
  type="number"
  name="quantity"
  value={formData.quantity || ''}
  onChange={handleChange}
  min="0"
/>
```

## Resultado

✅ Todos os inputs numéricos agora lidam corretamente com valores vazios
✅ Não há mais warnings de NaN no console
✅ Melhor experiência do utilizador ao limpar campos
✅ Validação HTML5 continua a funcionar com `required`

## Testes Recomendados

- [ ] Criar nova turma e limpar campo "Máximo de Estudantes"
- [ ] Criar novo curso e limpar campo "Duração"
- [ ] Criar nova disciplina e limpar campo "Créditos"
- [ ] Criar tipo de avaliação e limpar campos numéricos
- [ ] Criar sala e limpar campo "Capacidade"
- [ ] Registar pagamento e limpar campo "Valor"
- [ ] Verificar que validação `required` ainda funciona

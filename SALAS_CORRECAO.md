# 🔧 Correção: Erro ao Criar Sala

## ❌ Erro Original

```
POST http://localhost:5000/api/horarios/rooms 500 (Internal Server Error)
```

## 🔍 Causa

O formulário estava tentando enviar campos que **não existem** na tabela `rooms` do banco de dados:
- ❌ `code` (não existe)
- ❌ `floor` (não existe)

## ✅ Solução Aplicada

### 1. Atualização da Interface TypeScript

**Antes:**
```typescript
export interface Room {
  id: string;
  school_id: string;
  name: string;
  code: string;        // ❌ Não existe na BD
  capacity?: number;
  building?: string;
  floor?: string;      // ❌ Não existe na BD
  created_at: string;
}
```

**Depois:**
```typescript
export interface Room {
  id: string;
  school_id: string;
  name: string;
  building?: string;
  capacity?: number;
  type?: string;       // ✅ Existe na BD
  active?: boolean;    // ✅ Existe na BD
  created_at: string;
  updated_at: string;
}
```

### 2. Atualização do Formulário

**Campos Removidos:**
- ❌ Código (campo de texto)
- ❌ Piso (campo de texto)

**Campos Adicionados:**
- ✅ Tipo (dropdown com opções)

**Opções de Tipo:**
- Sala de Aula (classroom)
- Laboratório (lab)
- Auditório (auditorium)
- Biblioteca (library)
- Ginásio (gym)
- Outro (other)

### 3. Atualização da Tabela

**Colunas Antes:**
- Sala | Código | Capacidade | Edifício | Piso

**Colunas Depois:**
- Sala | Tipo | Capacidade | Edifício

### 4. Valores Padrão

Ao criar uma sala, os seguintes valores são definidos automaticamente:
- `type`: "classroom" (Sala de Aula)
- `capacity`: 40 (se não especificado)
- `active`: true

## 📋 Estrutura Real da Tabela `rooms`

```sql
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    building VARCHAR(100),
    capacity INT DEFAULT 40,
    type VARCHAR(50) DEFAULT 'classroom',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## ✅ Resultado

Agora o sistema está **100% funcional** e alinhado com a estrutura real do banco de dados:

1. ✅ Criar sala funciona corretamente
2. ✅ Editar sala funciona corretamente
3. ✅ Eliminar sala funciona corretamente
4. ✅ Listar salas funciona corretamente
5. ✅ Integração com horários funciona corretamente

## 🎯 Como Usar Agora

1. Acesse **Salas** no menu
2. Clique em **"Nova Sala"**
3. Preencha:
   - **Nome**: Ex: "Sala 101"
   - **Tipo**: Selecione da lista
   - **Capacidade**: Ex: 30 (opcional, padrão 40)
   - **Edifício**: Ex: "Bloco A" (opcional)
4. Clique em **"Criar"**
5. A sala aparecerá na lista e estará disponível nos horários! 🎉

## 📝 Arquivos Modificados

- ✅ `frontend/src/services/horarios.service.ts` - Interface Room corrigida
- ✅ `frontend/src/pages/Salas.tsx` - Formulário e tabela atualizados
- ✅ `SALAS_GUIA.md` - Documentação atualizada

---

**Status:** ✅ Problema resolvido e testado!

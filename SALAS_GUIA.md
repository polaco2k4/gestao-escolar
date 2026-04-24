# 🏫 Guia de Gestão de Salas

## ✅ Problema Resolvido

O sistema agora possui uma **página completa de gestão de salas** que permite criar, editar, visualizar e eliminar salas escolares.

## 📍 Como Acessar

1. Faça login como **administrador**
2. No menu lateral, clique em **"Salas"** (ícone de localização 📍)
3. Ou acesse diretamente: `/salas`

## 🎯 Funcionalidades

### 1. Criar Nova Sala

1. Clique no botão **"Nova Sala"** (canto superior direito)
2. Preencha os campos:
   - **Nome da Sala*** (obrigatório): Ex: "Sala 101", "Laboratório de Química"
   - **Tipo**: Selecione o tipo (Sala de Aula, Laboratório, Auditório, Biblioteca, Ginásio, Outro)
   - **Capacidade** (opcional): Número de alunos (padrão: 40)
   - **Edifício** (opcional): Ex: "Bloco A", "Edifício Principal"
3. Clique em **"Criar"**

### 2. Editar Sala

1. Na lista de salas, clique no ícone de **editar** (lápis) ✏️
2. Modifique os campos desejados
3. Clique em **"Actualizar"**

### 3. Eliminar Sala

1. Na lista de salas, clique no ícone de **eliminar** (lixeira) 🗑️
2. Confirme a eliminação
3. **Nota**: Não é possível eliminar salas que estão sendo usadas em horários

### 4. Visualizar Salas

A página mostra uma tabela com todas as salas cadastradas, incluindo:
- Nome da sala
- Tipo (Sala de Aula, Laboratório, etc.)
- Capacidade
- Edifício

### 5. Estatísticas

No final da página, você verá:
- **Total de Salas**: Quantidade total cadastrada
- **Edifícios**: Número de edifícios diferentes
- **Capacidade Total**: Soma da capacidade de todas as salas

## 🔗 Integração com Horários

Agora, ao criar um horário:
1. Acesse **Horários** no menu
2. Clique em **"Novo Horário"**
3. O campo **"Sala"** agora mostrará todas as salas cadastradas
4. Selecione a sala desejada (opcional)

## 📊 Exemplo de Uso

### Cadastrar Salas de uma Escola

```
Sala 101
- Tipo: Sala de Aula
- Capacidade: 30
- Edifício: Bloco A

Laboratório de Química
- Tipo: Laboratório
- Capacidade: 25
- Edifício: Bloco B

Auditório Principal
- Tipo: Auditório
- Capacidade: 200
- Edifício: Edifício Principal
```

## 🔒 Permissões

- **Criar/Editar/Eliminar**: Apenas administradores
- **Visualizar**: Todos os usuários podem ver as salas ao criar horários

## 🎨 Interface

A página possui:
- ✅ Design moderno e responsivo
- ✅ Tabela organizada com ícones
- ✅ Modal para criar/editar
- ✅ Confirmação antes de eliminar
- ✅ Estatísticas visuais
- ✅ Feedback de ações (sucesso/erro)

## 🚀 Próximos Passos

Agora você pode:
1. **Cadastrar todas as salas** da sua escola
2. **Criar horários** associando salas específicas
3. **Gerenciar conflitos** de uso de salas automaticamente

## 💡 Dicas

- Escolha o tipo correto de sala para melhor organização
- Preencha a capacidade para melhor planejamento (padrão é 40 alunos)
- Organize por edifício para facilitar a localização
- Salas são opcionais nos horários, mas recomendadas para melhor organização
- Use nomes descritivos como "Sala 101", "Lab. Química", "Auditório A"

## ✨ Implementação Técnica

### Backend
- ✅ CRUD completo em `/api/horarios/rooms`
- ✅ Validação de dados
- ✅ Proteção contra eliminação de salas em uso

### Frontend
- ✅ Página: `frontend/src/pages/Salas.tsx`
- ✅ Serviço: `frontend/src/services/horarios.service.ts`
- ✅ Rota: `/salas`
- ✅ Menu: Item "Salas" no menu lateral

---

**Problema resolvido!** 🎉 Agora você pode cadastrar salas e usá-las nos horários.

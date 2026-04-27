# Implementação do Perfil "Gestor"

## Resumo
Foi criado um novo perfil **"Gestor"** que tem permissões completas no sistema, **exceto para criar escolas**.

## Diferenças entre Admin e Gestor

| Funcionalidade | Admin | Gestor |
|----------------|-------|--------|
| **Criar Escolas** | ✅ Sim | ❌ Não |
| **Editar Escolas** | ✅ Sim | ✅ Sim |
| **Eliminar Escolas** | ✅ Sim | ✅ Sim |
| **Todas as outras operações** | ✅ Sim | ✅ Sim |

## Alterações Implementadas

### 1. Backend

#### Base de Dados
- **`database/migrations/001_initial_schema.sql`**: Atualizado constraint da coluna `role` para incluir 'gestor'
- **`database/migrations/002_add_gestor_role.sql`**: Nova migração para atualizar bases de dados existentes

#### Middleware e Tipos
- **`src/middleware/roles.ts`**: Adicionado 'gestor' ao tipo Role
- **`src/middleware/auth.ts`**: Adicionado 'gestor' ao AuthPayload
- **`src/modules/auth/auth.validation.ts`**: Adicionado 'gestor' ao schema de validação

#### Rotas (Permissões)
Todas as rotas foram atualizadas para incluir 'gestor', **exceto**:
- **`src/modules/schools/schools.routes.ts`**: 
  - `POST /` (criar escola) - **apenas admin**
  - `PUT /:id` (editar escola) - admin e gestor
  - `DELETE /:id` (eliminar escola) - admin e gestor

Rotas com acesso de gestor:
- ✅ Cursos (criar, editar, eliminar)
- ✅ Turmas (criar, editar, eliminar)
- ✅ Matrículas (criar, editar, eliminar, transferências)
- ✅ Estudantes (criar, editar, eliminar)
- ✅ Professores (criar, editar, eliminar)
- ✅ Encarregados (criar, editar, eliminar)
- ✅ Disciplinas (criar, editar, eliminar)
- ✅ Tipos de Avaliação (criar, editar, eliminar)
- ✅ Avaliações (criar, editar, eliminar, gerir notas)
- ✅ Horários (criar, editar, eliminar)
- ✅ Salas (criar, editar, eliminar)
- ✅ Financeiro (criar propinas, registar pagamentos, ver resumo)
- ✅ Assiduidade (registar, editar, eliminar, justificações)
- ✅ Documentos (criar templates, gerir documentos)
- ✅ Relatórios (acesso completo)

### 2. Frontend

#### Tipos e Serviços
- **`frontend/src/services/auth.service.ts`**: Adicionado 'gestor' ao RegisterData
- **`frontend/src/pages/Register.tsx`**: Adicionada opção "Gestor" no formulário de registo

#### Navegação e UI
- **`frontend/src/components/Layout.tsx`**: 
  - Gestor tem acesso ao Dashboard
  - Gestor vê todos os menus (incluindo Escolas)
  
#### Páginas Atualizadas
Todas as páginas foram atualizadas para permitir acesso de gestor:
- ✅ `Teachers.tsx` - Gerir professores
- ✅ `Subjects.tsx` - Gerir disciplinas
- ✅ `SubjectForm.tsx` - Formulário de disciplinas
- ✅ `Financeiro.tsx` - Gestão financeira
- ✅ `Encarregados.tsx` - Gerir encarregados
- ✅ `Documentos.tsx` - Gerir documentos e templates
- ✅ `Avaliacoes.tsx` - Gerir avaliações
- ✅ `AvaliacaoNotas.tsx` - Gerir notas
- ✅ `Assiduidade.tsx` - Gerir assiduidade

**Restrição Especial:**
- **`frontend/src/pages/Escolas.tsx`**: Botão "Nova Escola" **apenas visível para admin**
- **`frontend/src/pages/EscolaForm.tsx`**: Redireciona gestor se tentar aceder ao formulário de criação

## Como Aplicar as Alterações

### 1. Atualizar Base de Dados Existente
Execute a migração SQL:
```bash
psql -U seu_usuario -d sua_base_dados -f database/migrations/002_add_gestor_role.sql
```

Ou use o script de migração:
```bash
node scripts/migrate.js
```

### 2. Reiniciar o Backend
```bash
cd src
npm run dev
```

### 3. Reiniciar o Frontend
```bash
cd frontend
npm run dev
```

## Criar um Utilizador Gestor

### Opção 1: Ao Criar uma Escola (Recomendado)
1. Login como **admin**
2. Aceda a `/escolas/novo`
3. Preencha os dados da escola
4. **Marque a checkbox "Criar Gestor da Escola"**
5. Preencha os dados do gestor:
   - Nome e Apelido
   - Email (será usado para login)
   - Password (mínimo 6 caracteres)
   - Telefone (opcional)
6. Clique em "Criar"
7. ✅ A escola e o gestor serão criados automaticamente numa transação
8. O gestor já fica associado à escola criada

### Opção 2: Via Interface Web (Registo Manual)
1. Aceda a `/register`
2. Preencha os dados
3. Selecione "Gestor" no campo "Tipo de Utilizador"
4. Clique em "Criar Conta"

### Opção 2: Via Script (criar-gestor.js)
Crie um ficheiro `scripts/create-gestor.js`:
```javascript
const bcrypt = require('bcryptjs');
const db = require('../src/config/database').default;

async function createGestor() {
  const password_hash = await bcrypt.hash('senha123', 12);
  
  const [user] = await db('users')
    .insert({
      email: 'gestor@escola.com',
      password_hash,
      first_name: 'João',
      last_name: 'Gestor',
      role: 'gestor',
      phone: '+244 923 456 789',
      school_id: 'ID_DA_ESCOLA_AQUI'
    })
    .returning('*');
  
  console.log('Gestor criado:', user);
  process.exit(0);
}

createGestor().catch(console.error);
```

Execute:
```bash
node scripts/create-gestor.js
```

## Testar a Implementação

1. **Login como Gestor**
   - Email: gestor@escola.com
   - Password: senha123

2. **Verificar Permissões**
   - ✅ Pode aceder ao Dashboard
   - ✅ Pode ver lista de escolas
   - ✅ Pode editar escolas existentes
   - ❌ **NÃO** vê botão "Nova Escola"
   - ❌ **NÃO** consegue aceder a `/escolas/novo`
   - ✅ Pode gerir todas as outras funcionalidades

3. **Comparar com Admin**
   - Login como admin
   - Verificar que vê botão "Nova Escola"
   - Pode criar novas escolas

## Notas Importantes

- O perfil **Gestor** foi criado para permitir gestão completa da escola sem dar acesso à criação de novas escolas
- Esta separação é útil em cenários multi-escola onde apenas o super-admin deve criar escolas
- Todas as validações estão implementadas tanto no backend (rotas) quanto no frontend (UI)
- A migração é segura e não afeta dados existentes

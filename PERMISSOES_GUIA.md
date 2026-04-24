# 🔐 Sistema de Permissões - Guia Completo

## ✅ Controle de Acesso Implementado

O sistema possui **controle de acesso baseado em roles (funções)** que define o que cada tipo de usuário pode fazer.

---

## 👥 Tipos de Usuários (Roles)

### 1. **Admin (Administrador)**
- Acesso total ao sistema
- Pode criar, editar e eliminar todos os recursos
- Pode aprovar pautas e documentos
- Acesso a relatórios e estatísticas

### 2. **Professor**
- Acesso limitado a funcionalidades académicas
- Pode criar e gerir avaliações das suas disciplinas
- Pode registar assiduidade
- Pode submeter pautas (mas não aprovar)
- Visualização de dados

### 3. **Estudante**
- Acesso apenas para visualização
- Pode ver suas notas e avaliações
- Pode justificar faltas
- Não pode criar, editar ou eliminar nada

### 4. **Encarregado (Responsável)**
- Acesso similar ao estudante
- Pode ver dados dos estudantes sob sua responsabilidade
- Pode justificar faltas dos estudantes
- Não pode criar, editar ou eliminar nada

---

## 📊 Matriz de Permissões por Módulo

### 🏫 **Escolas (Schools)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar | ✅ | ✅ | ✅ | ✅ |
| Ver detalhes | ✅ | ✅ | ✅ | ✅ |
| Criar | ✅ | ❌ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |

### 👨‍🎓 **Estudantes (Students)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar | ✅ | ✅ | ✅ | ✅ |
| Ver detalhes | ✅ | ✅ | ✅ | ✅ |
| Criar | ✅ | ❌ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |

### 👨‍🏫 **Professores (Teachers)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar | ✅ | ✅ | ✅ | ✅ |
| Ver detalhes | ✅ | ✅ | ✅ | ✅ |
| Criar | ✅ | ❌ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |

### 📚 **Disciplinas (Subjects)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar | ✅ | ✅ | ✅ | ✅ |
| Ver detalhes | ✅ | ✅ | ✅ | ✅ |
| Criar | ✅ | ❌ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |

### 👥 **Turmas (Classes)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar | ✅ | ✅ | ✅ | ✅ |
| Ver detalhes | ✅ | ✅ | ✅ | ✅ |
| Ver estudantes | ✅ | ✅ | ✅ | ✅ |
| Criar | ✅ | ❌ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |

### 📝 **Matrículas (Enrollments)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar | ✅ | ✅ | ✅ | ✅ |
| Ver detalhes | ✅ | ✅ | ✅ | ✅ |
| Criar | ✅ | ❌ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |
| Transferências | ✅ | ❌ | ❌ | ❌ |

### 📋 **Tipos de Avaliação (Assessment Types)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar | ✅ | ✅ | ✅ | ✅ |
| Ver detalhes | ✅ | ✅ | ✅ | ✅ |
| Criar | ✅ | ❌ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |

### 📊 **Avaliações (Assessments)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar | ✅ | ✅ | ✅ | ✅ |
| Ver detalhes | ✅ | ✅ | ✅ | ✅ |
| Criar | ✅ | ✅ | ❌ | ❌ |
| Editar | ✅ | ✅ | ❌ | ❌ |
| Eliminar | ✅ | ✅ | ❌ | ❌ |
| Ver notas | ✅ | ✅ | ✅ | ✅ |
| Lançar notas | ✅ | ✅ | ❌ | ❌ |

### 📄 **Pautas (Grade Sheets)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar | ✅ | ✅ | ❌ | ❌ |
| Criar | ✅ | ✅ | ❌ | ❌ |
| Submeter | ❌ | ✅ | ❌ | ❌ |
| Aprovar | ✅ | ❌ | ❌ | ❌ |

### 📅 **Horários (Schedules)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar | ✅ | ✅ | ✅ | ✅ |
| Ver por turma | ✅ | ✅ | ✅ | ✅ |
| Ver por professor | ✅ | ✅ | ✅ | ✅ |
| Criar | ✅ | ❌ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |

### ✅ **Assiduidade (Attendance)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar | ✅ | ✅ | ✅ | ✅ |
| Ver por estudante | ✅ | ✅ | ✅ | ✅ |
| Registar | ✅ | ✅ | ❌ | ❌ |
| Registar em lote | ✅ | ✅ | ❌ | ❌ |
| Editar | ✅ | ✅ | ❌ | ❌ |
| Justificar falta | ❌ | ❌ | ✅ | ✅ |
| Rever justificação | ✅ | ✅ | ❌ | ❌ |
| Resumo da turma | ✅ | ✅ | ❌ | ❌ |

### 💰 **Financeiro (Finance)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar tipos de taxa | ✅ | ✅ | ✅ | ✅ |
| Criar tipo de taxa | ✅ | ❌ | ❌ | ❌ |
| Editar tipo de taxa | ✅ | ❌ | ❌ | ❌ |
| Listar taxas | ✅ | ✅ | ✅ | ✅ |
| Criar taxa | ✅ | ❌ | ❌ | ❌ |
| Criar taxas em lote | ✅ | ❌ | ❌ | ❌ |
| Listar pagamentos | ✅ | ✅ | ✅ | ✅ |
| Criar pagamento | ✅ | ❌ | ❌ | ❌ |
| Resumo financeiro | ✅ | ❌ | ❌ | ❌ |

### 📄 **Documentos (Documents)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Listar templates | ✅ | ✅ | ✅ | ✅ |
| Criar template | ✅ | ❌ | ❌ | ❌ |
| Editar template | ✅ | ❌ | ❌ | ❌ |
| Listar documentos | ✅ | ✅ | ✅ | ✅ |
| Solicitar documento | ✅ | ✅ | ✅ | ✅ |
| Actualizar status | ✅ | ❌ | ❌ | ❌ |
| Upload de arquivo | ✅ | ❌ | ❌ | ❌ |

### 📊 **Relatórios (Reports)**
| Ação | Admin | Professor | Estudante | Encarregado |
|------|-------|-----------|-----------|-------------|
| Relatório de estudantes | ✅ | ✅ | ❌ | ❌ |
| Relatório de assiduidade | ✅ | ✅ | ❌ | ❌ |

---

## 🔒 Como Funciona o Controle de Acesso

### 1. **Autenticação (authenticate)**
- Verifica se o usuário está logado
- Valida o token JWT
- Extrai informações do usuário (id, email, role)

### 2. **Autorização (authorize)**
- Verifica se o usuário tem a role necessária
- Bloqueia acesso se não tiver permissão
- Retorna erro 403 (Forbidden)

### Exemplo de Código:
```typescript
// Apenas admin pode criar disciplinas
router.post('/', authorize('admin'), controller.create);

// Admin e professor podem criar avaliações
router.post('/', authorize('admin', 'professor'), controller.create);

// Todos autenticados podem listar
router.get('/', controller.list);
```

---

## 🚨 Mensagens de Erro

### 401 - Não Autenticado
```json
{
  "success": false,
  "message": "Token de autenticação não fornecido"
}
```

### 403 - Sem Permissão
```json
{
  "success": false,
  "message": "Sem permissão para aceder a este recurso"
}
```

---

## 🎯 Boas Práticas

### Para Administradores
- ✅ Criar usuários com a role correta
- ✅ Não dar permissões de admin desnecessariamente
- ✅ Rever logs de acesso regularmente

### Para Professores
- ✅ Apenas gerir avaliações das suas disciplinas
- ✅ Registar assiduidade das suas turmas
- ✅ Submeter pautas para aprovação do admin

### Para Estudantes/Encarregados
- ✅ Visualizar informações académicas
- ✅ Justificar faltas quando necessário
- ✅ Solicitar documentos

---

## 🎨 Controle de Menu no Frontend

### Visibilidade do Menu por Role

O menu lateral é **filtrado automaticamente** baseado na role do usuário:

#### **Admin** vê:
- ✅ Dashboard
- ✅ Escolas
- ✅ Turmas
- ✅ Matrículas
- ✅ Estudantes
- ✅ Disciplinas
- ✅ Professores
- ✅ Tipos de Avaliação
- ✅ Avaliações
- ✅ Horários
- ✅ Financeiro
- ✅ Comunicação
- ✅ Assiduidade
- ✅ Documentos
- ✅ Relatórios

#### **Professor** vê:
- ✅ Turmas
- ✅ Estudantes
- ✅ Disciplinas
- ✅ Avaliações
- ✅ Horários
- ✅ Comunicação
- ✅ Assiduidade
- ✅ Documentos
- ✅ Relatórios

#### **Estudante** vê:
- ✅ Disciplinas
- ✅ Avaliações
- ✅ Horários
- ✅ Comunicação
- ✅ Assiduidade
- ✅ Documentos

#### **Encarregado** vê:
- ✅ Meus Educandos
- ✅ Disciplinas
- ✅ Avaliações
- ✅ Horários
- ✅ Financeiro
- ✅ Comunicação
- ✅ Assiduidade
- ✅ Documentos

**Arquivo:** `frontend/src/components/Layout.tsx`

```typescript
const allNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { name: 'Escolas', href: '/escolas', icon: School, roles: ['admin'] },
  // ... outros itens
];

// Filtrar navegação baseado na role do usuário
const navigation = allNavigation.filter(item => 
  item.roles.includes(user?.role || '')
);
```

---

## 🔧 Implementação Técnica

### Middleware de Autorização
**Arquivo:** `src/middleware/roles.ts`

```typescript
export function authorize(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Não autenticado', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Sem permissão para aceder a este recurso', 403);
    }

    next();
  };
}
```

### Uso nas Rotas
```typescript
import { authorize } from '../../middleware/roles';

// Apenas admin
router.post('/', authorize('admin'), controller.create);

// Admin ou professor
router.post('/', authorize('admin', 'professor'), controller.create);

// Todos autenticados (sem authorize)
router.get('/', controller.list);
```

---

## 📝 Alterações Recentes

### ✅ Módulos Atualizados com Permissões

1. **Disciplinas (Subjects)**
   - ✅ Criar: apenas admin
   - ✅ Editar: apenas admin
   - ✅ Eliminar: apenas admin
   - ✅ Listar/Ver: todos autenticados

2. **Professores (Teachers)**
   - ✅ Criar: apenas admin
   - ✅ Editar: apenas admin
   - ✅ Eliminar: apenas admin
   - ✅ Listar/Ver: todos autenticados

3. **Tipos de Avaliação (Assessment Types)**
   - ✅ Criar: apenas admin
   - ✅ Editar: apenas admin
   - ✅ Eliminar: apenas admin
   - ✅ Listar/Ver: todos autenticados

---

## 🧪 Testes de Permissões

### Testar como Admin
1. Login como admin
2. Tentar criar disciplina ✅
3. Tentar criar professor ✅
4. Tentar eliminar turma ✅

### Testar como Professor
1. Login como professor
2. Tentar criar disciplina ❌ (403)
3. Tentar criar avaliação ✅
4. Tentar aprovar pauta ❌ (403)

### Testar como Estudante
1. Login como estudante
2. Tentar criar qualquer coisa ❌ (403)
3. Ver suas notas ✅
4. Justificar falta ✅

---

## 📞 Suporte

Se encontrar problemas de permissão:
1. Verifique se está logado
2. Verifique sua role no perfil
3. Consulte esta documentação
4. Contacte o administrador do sistema

---

## ✨ Conclusão

O sistema de permissões garante que:
- ✅ **Admins** têm controle total
- ✅ **Professores** podem gerir aspectos académicos
- ✅ **Estudantes/Encarregados** apenas visualizam
- ✅ Dados sensíveis estão protegidos
- ✅ Operações críticas requerem permissões adequadas

**Status:** ✅ **SISTEMA DE PERMISSÕES COMPLETO E OPERACIONAL**

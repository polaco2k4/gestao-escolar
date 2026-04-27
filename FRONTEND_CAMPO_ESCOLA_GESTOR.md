# Frontend - Campo Escola para Gestor

## 🎯 Objetivo

Quando o usuário for **Gestor**, o campo "Escola" nos formulários deve:
1. ✅ Vir **pré-preenchido** com a escola do gestor
2. ✅ Estar **desabilitado** (não editável)
3. ✅ Não aparecer como dropdown (apenas mostrar o nome da escola)

Quando o usuário for **Admin**, o campo deve:
1. ✅ Aparecer como **dropdown** editável
2. ✅ Permitir selecionar qualquer escola

## 📋 Formulários que Precisam ser Atualizados

### 1. Novo Curso (`courses`)
- Arquivo: `frontend/src/pages/Courses/CourseForm.tsx` (ou similar)

### 2. Nova Turma (`classes`)
- Arquivo: `frontend/src/pages/Classes/ClassForm.tsx` (ou similar)

### 3. Novo Estudante (`students`)
- Arquivo: `frontend/src/pages/Students/StudentForm.tsx` (ou similar)

### 4. Novo Professor (`teachers`)
- Arquivo: `frontend/src/pages/Teachers/TeacherForm.tsx` (ou similar)

### 5. Nova Disciplina (`subjects`)
- Arquivo: `frontend/src/pages/Subjects/SubjectForm.tsx` (ou similar)

### 6. Novo Tipo de Avaliação (`assessment-types`)
- Arquivo: `frontend/src/pages/AssessmentTypes/AssessmentTypeForm.tsx` (ou similar)

### 7. Nova Sala (`rooms`)
- Arquivo: `frontend/src/pages/Rooms/RoomForm.tsx` (ou similar)

### 8. Novo Tipo de Propina (`fee-types`)
- Arquivo: `frontend/src/pages/Finance/FeeTypeForm.tsx` (ou similar)

## 🔧 Implementação

### Passo 1: Obter Dados do Usuário

Primeiro, você precisa ter acesso aos dados do usuário logado. Geralmente isso está em um contexto de autenticação:

```typescript
// Exemplo de hook para pegar usuário
import { useAuth } from '@/contexts/AuthContext';

function MyForm() {
  const { user } = useAuth();
  
  // user.role = 'admin' | 'gestor' | 'professor' | etc
  // user.school_id = id da escola do usuário
  // user.school_name = nome da escola (se disponível)
}
```

### Passo 2: Componente de Campo Escola

Crie um componente reutilizável para o campo escola:

```typescript
// frontend/src/components/SchoolField.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface SchoolFieldProps {
  value: string;
  onChange: (value: string) => void;
  schools: Array<{ id: string; name: string }>;
  required?: boolean;
}

export function SchoolField({ value, onChange, schools, required = true }: SchoolFieldProps) {
  const { user } = useAuth();
  const isGestor = user?.role === 'gestor';
  const isAdmin = user?.role === 'admin';

  // Se for gestor, pré-selecionar sua escola
  useEffect(() => {
    if (isGestor && user?.school_id && !value) {
      onChange(user.school_id);
    }
  }, [isGestor, user?.school_id, value, onChange]);

  // Se for gestor, mostrar apenas o nome da escola (não editável)
  if (isGestor) {
    const userSchool = schools.find(s => s.id === user?.school_id);
    
    return (
      <div className="form-group">
        <label>
          Escola {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={userSchool?.name || 'Carregando...'}
          disabled
          className="form-control bg-gray-100 cursor-not-allowed"
        />
        {/* Campo hidden para enviar o ID */}
        <input type="hidden" name="school_id" value={user?.school_id || ''} />
      </div>
    );
  }

  // Se for admin, mostrar dropdown normal
  return (
    <div className="form-group">
      <label>
        Escola {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control"
        required={required}
      >
        <option value="">Selecione uma escola</option>
        {schools.map((school) => (
          <option key={school.id} value={school.id}>
            {school.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Passo 3: Usar o Componente nos Formulários

#### Exemplo 1: Formulário de Curso

```typescript
// frontend/src/pages/Courses/CourseForm.tsx
import { useState, useEffect } from 'react';
import { SchoolField } from '@/components/SchoolField';
import { api } from '@/services/api';

export function CourseForm() {
  const [formData, setFormData] = useState({
    school_id: '',
    name: '',
    code: '',
    duration: 1,
  });
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    // Carregar escolas
    api.get('/schools').then(res => setSchools(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.post('/courses', formData);
      // Sucesso
    } catch (error) {
      // Erro
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Novo Curso</h2>

      {/* Campo Escola - Componente Reutilizável */}
      <SchoolField
        value={formData.school_id}
        onChange={(value) => setFormData({ ...formData, school_id: value })}
        schools={schools}
        required
      />

      {/* Nome do Curso */}
      <div className="form-group">
        <label>Nome do Curso *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Informática de Gestão"
          required
        />
      </div>

      {/* Código */}
      <div className="form-group">
        <label>Código *</label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="Ex: IG"
          required
        />
      </div>

      {/* Duração */}
      <div className="form-group">
        <label>Duração (anos)</label>
        <input
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
          min="1"
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={() => history.back()}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Criar
        </button>
      </div>
    </form>
  );
}
```

#### Exemplo 2: Formulário de Turma

```typescript
// frontend/src/pages/Classes/ClassForm.tsx
import { useState, useEffect } from 'react';
import { SchoolField } from '@/components/SchoolField';
import { api } from '@/services/api';

export function ClassForm() {
  const [formData, setFormData] = useState({
    school_id: '',
    academic_year_id: '',
    course_id: '',
    name: '',
    year_level: 1,
    section: '',
    max_students: 40,
  });
  const [schools, setSchools] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Carregar dados
    api.get('/schools').then(res => setSchools(res.data));
    api.get('/academic-years').then(res => setAcademicYears(res.data));
    api.get('/courses').then(res => setCourses(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.post('/classes', formData);
      // Sucesso
    } catch (error) {
      // Erro
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nova Turma</h2>

      {/* Campo Escola */}
      <SchoolField
        value={formData.school_id}
        onChange={(value) => setFormData({ ...formData, school_id: value })}
        schools={schools}
        required
      />

      {/* Ano Lectivo */}
      <div className="form-group">
        <label>Ano Lectivo *</label>
        <select
          value={formData.academic_year_id}
          onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
          required
        >
          <option value="">Selecione um ano lectivo</option>
          {academicYears.map((year: any) => (
            <option key={year.id} value={year.id}>
              {year.name}
            </option>
          ))}
        </select>
      </div>

      {/* Curso */}
      <div className="form-group">
        <label>Curso *</label>
        <select
          value={formData.course_id}
          onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
          required
        >
          <option value="">Selecione um curso</option>
          {courses.map((course: any) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      {/* Nome da Turma */}
      <div className="form-group">
        <label>Nome da Turma *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: 10ª A"
          required
        />
      </div>

      {/* Nível */}
      <div className="form-group">
        <label>Nível *</label>
        <input
          type="number"
          value={formData.year_level}
          onChange={(e) => setFormData({ ...formData, year_level: Number(e.target.value) })}
          min="1"
          required
        />
      </div>

      {/* Secção */}
      <div className="form-group">
        <label>Secção</label>
        <input
          type="text"
          value={formData.section}
          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
          placeholder="Ex: A, B, C"
        />
      </div>

      {/* Máximo de Estudantes */}
      <div className="form-group">
        <label>Máximo de Estudantes</label>
        <input
          type="number"
          value={formData.max_students}
          onChange={(e) => setFormData({ ...formData, max_students: Number(e.target.value) })}
          min="1"
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={() => history.back()}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Criar
        </button>
      </div>
    </form>
  );
}
```

## 🎨 Estilos CSS (Opcional)

```css
/* Estilo para campo desabilitado */
.form-control:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.text-red-500 {
  color: #ef4444;
}
```

## 📝 Checklist de Implementação

### Para cada formulário:

- [ ] Importar o componente `SchoolField`
- [ ] Substituir o campo escola manual pelo `SchoolField`
- [ ] Testar como **Admin** (deve ver dropdown)
- [ ] Testar como **Gestor** (deve ver campo desabilitado com sua escola)
- [ ] Verificar se o `school_id` está sendo enviado corretamente no submit

### Formulários a atualizar:

- [ ] Novo Curso
- [ ] Nova Turma
- [ ] Novo Estudante
- [ ] Novo Professor
- [ ] Nova Disciplina
- [ ] Novo Encarregado
- [ ] Novo Tipo de Avaliação
- [ ] Nova Sala
- [ ] Novo Tipo de Propina
- [ ] Novo Documento

## 🧪 Como Testar

### Teste 1: Como Gestor
1. Login como gestor
2. Ir para "Novo Curso"
3. ✅ Campo "Escola" deve estar **pré-preenchido** com o nome da escola do gestor
4. ✅ Campo "Escola" deve estar **desabilitado** (cinza)
5. Preencher outros campos e criar
6. ✅ Curso deve ser criado na escola do gestor

### Teste 2: Como Admin
1. Login como admin
2. Ir para "Novo Curso"
3. ✅ Campo "Escola" deve ser um **dropdown editável**
4. ✅ Deve listar todas as escolas
5. Selecionar uma escola, preencher e criar
6. ✅ Curso deve ser criado na escola selecionada

## 🚀 Resultado Final

### Como Gestor verá:
```
┌─────────────────────────────────────┐
│ Escola *                            │
│ ┌─────────────────────────────────┐ │
│ │ Escola A                    🔒  │ │ <- Desabilitado
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Como Admin verá:
```
┌─────────────────────────────────────┐
│ Escola *                            │
│ ┌─────────────────────────────────┐ │
│ │ Selecione uma escola        ▼  │ │ <- Dropdown
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 📖 Documentação Adicional

- O backend já está preparado para receber `school_id`
- O backend já valida que gestor só pode criar na sua escola
- Esta implementação é apenas visual (UX) para facilitar o uso
- O backend continua sendo a camada de segurança principal

---

**Implementação completa para melhorar a experiência do Gestor! 🎉**

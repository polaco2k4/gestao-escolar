import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import subjectsService from '../services/subjects.service';
import coursesService, { type Course } from '../services/courses.service';
import { useAuth } from '../contexts/AuthContext';

export default function SubjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = !!id;
  const canEdit = user?.role === 'admin' || user?.role === 'gestor';

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 1,
    year_level: 1,
    course_id: '',
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    coursesService.list().then(setCourses).catch(() => {});
    if (isEditing) {
      loadSubject();
    }
  }, [id]);

  const loadSubject = async () => {
    try {
      setLoading(true);
      const data = await subjectsService.getById(id!);
      setFormData({
        name: data.name,
        code: data.code,
        description: data.description || '',
        credits: data.credits,
        year_level: data.year_level,
        course_id: data.course_id || '',
      });
    } catch (error) {
      console.error('Erro ao carregar disciplina:', error);
      alert('Erro ao carregar disciplina');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const data = handleSubmitData();
      if (isEditing) {
        await subjectsService.update(id!, data);
      } else {
        await subjectsService.create(data as any);
      }
      navigate('/subjects');
    } catch (error: any) {
      console.error('Erro ao salvar disciplina:', error);
      alert(error.response?.data?.message || 'Erro ao salvar disciplina');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' || name === 'year_level' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmitData = () => {
    const { course_id, ...rest } = formData;
    return course_id ? formData : rest;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <LinkBack />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? (canEdit ? 'Editar Disciplina' : 'Visualizar Disciplina') : 'Nova Disciplina'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Disciplina
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              readOnly={!canEdit && isEditing}
              disabled={!canEdit && isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!canEdit && isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Ex: Matemática"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              readOnly={!canEdit && isEditing}
              disabled={!canEdit && isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!canEdit && isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Ex: MAT-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              readOnly={!canEdit && isEditing}
              disabled={!canEdit && isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!canEdit && isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Descrição da disciplina..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curso
            </label>
            <select
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              disabled={!canEdit && isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!canEdit && isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Sem curso associado</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Créditos
              </label>
              <input
                type="number"
                name="credits"
                value={formData.credits || ''}
                onChange={handleChange}
                min="1"
                max="10"
                required
                readOnly={!canEdit && isEditing}
                disabled={!canEdit && isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!canEdit && isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano
              </label>
              <select
                name="year_level"
                value={formData.year_level}
                onChange={handleChange}
                required
                disabled={!canEdit && isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!canEdit && isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((year) => (
                  <option key={year} value={year}>
                    {year}º Ano
                  </option>
                ))}
              </select>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'A salvar...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/subjects')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
          {!canEdit && isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/subjects')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function LinkBack() {
  return (
    <Link
      to="/subjects"
      className="inline-flex items-center text-gray-600 hover:text-gray-900"
    >
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Voltar
    </Link>
  );
}

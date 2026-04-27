import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import coursesService from '../services/courses.service';
import type { CourseFormData } from '../services/courses.service';
import { SchoolField } from '../components/SchoolField';

export default function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    school_id: '',
    name: '',
    code: '',
    level: '',
    duration_years: 1,
  });


  useEffect(() => {
    if (isEdit && id) {
      loadCourse(id);
    }
  }, [id, isEdit]);


  const loadCourse = async (courseId: string) => {
    try {
      const course = await coursesService.getById(courseId);
      setFormData({
        school_id: course.school_id,
        name: course.name,
        code: course.code,
        level: course.level || '',
        duration_years: course.duration_years || 1,
      });
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
      alert('Erro ao carregar dados do curso');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.school_id || !formData.name || !formData.code) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      if (isEdit && id) {
        await coursesService.update(id, formData);
      } else {
        await coursesService.create(formData);
      }
      navigate('/courses');
    } catch (error: any) {
      console.error('Erro ao salvar curso:', error);
      alert(error.response?.data?.message || 'Erro ao salvar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Editar Curso' : 'Novo Curso'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SchoolField
              value={formData.school_id}
              onChange={(value) => setFormData({ ...formData, school_id: value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Curso <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: Informática de Gestão"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Ex: IG"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível
              </label>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleChange}
                placeholder="Ex: Médio, Superior"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração (anos)
              </label>
              <input
                type="number"
                name="duration_years"
                value={formData.duration_years || ''}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'A guardar...' : isEdit ? 'Actualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

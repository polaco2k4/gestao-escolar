import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import academicYearsService from '../services/academicYears.service';
import { useAuth } from '../contexts/AuthContext';

export default function AnoLectivoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_current: false,
    school_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadAcademicYear();
    }
  }, [id]);

  const loadAcademicYear = async () => {
    try {
      setLoading(true);
      const data = await academicYearsService.getById(id!);
      setFormData({
        name: data.name,
        start_date: data.start_date.split('T')[0],
        end_date: data.end_date.split('T')[0],
        is_current: data.is_current,
        school_id: data.school_id,
      });
    } catch (error) {
      console.error('Erro ao carregar ano lectivo:', error);
      alert('Erro ao carregar ano lectivo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const payload = {
        ...formData,
        school_id: user?.role === 'admin' ? formData.school_id : undefined,
      };

      if (isEditing) {
        await academicYearsService.update(id!, payload);
      } else {
        await academicYearsService.create(payload);
      }
      navigate('/anos-lectivos');
    } catch (error: any) {
      console.error('Erro ao salvar ano lectivo:', error);
      alert(error.response?.data?.message || 'Erro ao salvar ano lectivo');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
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
          {isEditing ? 'Editar Ano Lectivo' : 'Novo Ano Lectivo'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Ano Lectivo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 2025-2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Fim <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_current"
              id="is_current"
              checked={formData.is_current}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_current" className="ml-2 block text-sm text-gray-900">
              Definir como ano lectivo activo
            </label>
          </div>

          <p className="text-sm text-gray-500">
            Nota: Apenas um ano lectivo pode estar activo por escola. Ao marcar esta opção, o ano activo anterior será desactivado automaticamente.
          </p>

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
              onClick={() => navigate('/anos-lectivos')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LinkBack() {
  return (
    <Link
      to="/anos-lectivos"
      className="inline-flex items-center text-gray-600 hover:text-gray-900"
    >
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Voltar
    </Link>
  );
}

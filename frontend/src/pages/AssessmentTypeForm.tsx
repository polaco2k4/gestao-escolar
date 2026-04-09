import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import assessmentTypesService from '../services/assessmentTypes.service';

export default function AssessmentTypeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    weight: 1,
    max_score: 100,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadAssessmentType();
    }
  }, [id]);

  const loadAssessmentType = async () => {
    try {
      setLoading(true);
      const data = await assessmentTypesService.getById(id!);
      setFormData({
        name: data.name,
        weight: data.weight,
        max_score: data.max_score,
      });
    } catch (error) {
      console.error('Erro ao carregar tipo de avaliação:', error);
      alert('Erro ao carregar tipo de avaliação');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      if (isEditing) {
        await assessmentTypesService.update(id!, formData);
      } else {
        await assessmentTypesService.create(formData);
      }
      navigate('/assessment-types');
    } catch (error: any) {
      console.error('Erro ao salvar tipo de avaliação:', error);
      alert(error.response?.data?.message || 'Erro ao salvar tipo de avaliação');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight' || name === 'max_score' ? parseFloat(value) || 0 : value,
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
          {isEditing ? 'Editar Tipo de Avaliação' : 'Novo Tipo de Avaliação'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Tipo de Avaliação
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Teste, Exame, Trabalho..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0.1"
              max="10"
              step="0.1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 1.0"
            />
            <p className="mt-1 text-sm text-gray-500">
              Fator de multiplicação para a nota final
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pontuação Máxima
            </label>
            <input
              type="number"
              name="max_score"
              value={formData.max_score}
              onChange={handleChange}
              min="1"
              max="1000"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 100"
            />
          </div>

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
              onClick={() => navigate('/assessment-types')}
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
      to="/assessment-types"
      className="inline-flex items-center text-gray-600 hover:text-gray-900"
    >
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Voltar
    </Link>
  );
}

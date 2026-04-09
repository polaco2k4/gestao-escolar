import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import matriculasService from '../services/matriculas.service';
import type { Enrollment } from '../services/matriculas.service';

export default function MatriculaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEnrollment(id);
    }
  }, [id]);

  const loadEnrollment = async (enrollmentId: string) => {
    try {
      setLoading(true);
      const data = await matriculasService.getById(enrollmentId);
      setEnrollment(data);
    } catch (error) {
      console.error('Erro ao carregar matrícula:', error);
      alert('Erro ao carregar matrícula');
      navigate('/matriculas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Tem certeza que deseja eliminar esta matrícula?')) return;
    
    try {
      await matriculasService.delete(id);
      alert('Matrícula eliminada com sucesso!');
      navigate('/matriculas');
    } catch (error) {
      console.error('Erro ao eliminar matrícula:', error);
      alert('Erro ao eliminar matrícula');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      transferred: 'bg-blue-100 text-blue-800',
      concluded: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      active: 'Activa',
      suspended: 'Suspensa',
      transferred: 'Transferida',
      concluded: 'Concluída',
      cancelled: 'Cancelada',
    };
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">A carregar...</p>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Matrícula não encontrada</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detalhes da Matrícula</h1>
          <p className="text-gray-600 mt-2">Informações completas da matrícula</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/matriculas/${id}/editar`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Informações da Matrícula</h2>
        </div>
        
        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Número de Matrícula
              </label>
              <p className="text-lg font-semibold text-gray-900">{enrollment.enrollment_number}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Estado
              </label>
              <div>{getStatusBadge(enrollment.status)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Data de Matrícula
              </label>
              <p className="text-lg text-gray-900">
                {new Date(enrollment.enrollment_date).toLocaleDateString('pt-PT')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Ano Lectivo
              </label>
              <p className="text-lg text-gray-900">{enrollment.academic_year_name}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Estudante</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Nome Completo
                </label>
                <p className="text-lg text-gray-900">
                  {enrollment.first_name} {enrollment.last_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Número de Estudante
                </label>
                <p className="text-lg text-gray-900">{enrollment.student_number}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email
                </label>
                <p className="text-lg text-gray-900">{enrollment.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Turma
                </label>
                <p className="text-lg text-gray-900">{enrollment.class_name}</p>
              </div>
            </div>
          </div>

          {enrollment.notes && (
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Observações
              </label>
              <p className="text-gray-900 whitespace-pre-wrap">{enrollment.notes}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500">
              <div>
                <label className="block font-medium mb-1">Criado em</label>
                <p>{new Date(enrollment.created_at).toLocaleString('pt-PT')}</p>
              </div>
              <div>
                <label className="block font-medium mb-1">Actualizado em</label>
                <p>{new Date(enrollment.updated_at).toLocaleString('pt-PT')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <Link
            to="/matriculas"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
          >
            Voltar à Lista
          </Link>
        </div>
      </div>
    </div>
  );
}

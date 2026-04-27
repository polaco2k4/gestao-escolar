import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import studentsService from '../services/students.service';
import type { Student } from '../services/students.service';

export default function EstudanteDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadStudent(id);
    }
  }, [id]);

  const loadStudent = async (studentId: string) => {
    try {
      setLoading(true);
      const data = await studentsService.getById(studentId);
      setStudent(data);
    } catch (error) {
      console.error('Erro ao carregar estudante:', error);
      alert('Erro ao carregar estudante');
      navigate('/estudantes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Tem certeza que deseja eliminar este estudante?')) return;
    
    try {
      await studentsService.delete(id);
      alert('Estudante eliminado com sucesso!');
      navigate('/estudantes');
    } catch (error: any) {
      console.error('Erro ao eliminar estudante:', error);
      alert(error.response?.data?.message || 'Erro ao eliminar estudante');
    }
  };

  const getGenderLabel = (gender?: string) => {
    if (gender === 'M') return 'Masculino';
    if (gender === 'F') return 'Feminino';
    return '-';
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
        Activo
      </span>
    ) : (
      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
        Inactivo
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

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Estudante não encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detalhes do Estudante</h1>
          <p className="text-gray-600 mt-2">Informações completas do estudante</p>
        </div>
        {user?.role !== 'professor' && (
          <div className="flex space-x-3">
            <Link
              to={`/estudantes/${id}/editar`}
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
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Informações Pessoais</h2>
        </div>
        
        <div className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Número de Estudante
              </label>
              <p className="text-lg font-semibold text-gray-900">{student.student_number}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Estado
              </label>
              <div>{getStatusBadge(student.active)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nome Completo
              </label>
              <p className="text-lg text-gray-900">
                {student.first_name} {student.last_name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-lg text-gray-900">{student.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Telefone
              </label>
              <p className="text-lg text-gray-900">{student.phone || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Data de Nascimento
              </label>
              <p className="text-lg text-gray-900">
                {student.birth_date ? new Date(student.birth_date).toLocaleDateString('pt-PT') : '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Género
              </label>
              <p className="text-lg text-gray-900">{getGenderLabel(student.gender)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nacionalidade
              </label>
              <p className="text-lg text-gray-900">{student.nationality || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Tipo Sanguíneo
              </label>
              <p className="text-lg text-gray-900">{student.blood_type || '-'}</p>
            </div>
          </div>

          {student.address && (
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Endereço
              </label>
              <p className="text-gray-900">{student.address}</p>
            </div>
          )}

          {student.guardian_name && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Encarregado de Educação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Nome
                  </label>
                  <p className="text-lg text-gray-900">{student.guardian_name}</p>
                </div>

                {student.guardian_relationship && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Parentesco
                    </label>
                    <p className="text-lg text-gray-900">{student.guardian_relationship}</p>
                  </div>
                )}

                {student.guardian_email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <p className="text-lg text-gray-900">{student.guardian_email}</p>
                  </div>
                )}

                {student.guardian_phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Telefone
                    </label>
                    <p className="text-lg text-gray-900">{student.guardian_phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {student.medical_notes && (
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Observações Médicas
              </label>
              <p className="text-gray-900 whitespace-pre-wrap">{student.medical_notes}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500">
              <div>
                <label className="block font-medium mb-1">Criado em</label>
                <p>{new Date(student.created_at).toLocaleString('pt-PT')}</p>
              </div>
              <div>
                <label className="block font-medium mb-1">Actualizado em</label>
                <p>{new Date(student.updated_at).toLocaleString('pt-PT')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <Link
            to="/estudantes"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
          >
            Voltar à Lista
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import classesService from '../services/classes.service';

interface Student {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  enrollment_date: string;
}

export default function TurmaEstudantes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (classId: string) => {
    try {
      setLoading(true);
      const data = await classesService.getStudents(classId);
      setClassData(data.class);
      setStudents(data.students || []);
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error);
      alert('Erro ao carregar estudantes da turma');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      active: { label: 'Activo', color: 'bg-green-100 text-green-800' },
      suspended: { label: 'Suspenso', color: 'bg-yellow-100 text-yellow-800' },
      transferred: { label: 'Transferido', color: 'bg-blue-100 text-blue-800' },
      concluded: { label: 'Concluído', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/turmas')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
          >
            ← Voltar para Turmas
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Estudantes da Turma {classData?.name}
          </h1>
          {classData && (
            <p className="text-gray-600 mt-2">
              {classData.course_name} - {classData.academic_year_name}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">A carregar...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum estudante matriculado nesta turma</p>
            <Link
              to="/matriculas/nova"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              Criar nova matrícula
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total de estudantes: <span className="font-semibold">{students.length}</span>
                {classData?.max_students && (
                  <span> / {classData.max_students}</span>
                )}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nº Estudante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Matrícula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acções
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.student_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(student.enrollment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/estudantes/${student.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

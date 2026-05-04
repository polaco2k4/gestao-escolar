import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye } from 'lucide-react';
import subjectsService, { type Subject } from '../services/subjects.service';
import coursesService, { type Course } from '../services/courses.service';

export default function Subjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadData();
  }, [courseFilter]);

  const loadCourses = async () => {
    try {
      const data = await coursesService.list();
      setCourses(data);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await subjectsService.list(courseFilter ? { course_id: courseFilter } : undefined);
      setSubjects(data);
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta disciplina?')) return;

    try {
      await subjectsService.delete(id);
      loadData();
    } catch (error: any) {
      console.error('Erro ao eliminar disciplina:', error);
      alert(error.response?.data?.message || 'Erro ao eliminar disciplina');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Disciplinas</h1>
        {(user?.role === 'admin' || user?.role === 'gestor') && (
          <Link
            to="/subjects/novo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Nova Disciplina
          </Link>
        )}
      </div>

      {/* Filtro por Curso — apenas admin e gestor */}
      {(user?.role === 'admin' || user?.role === 'gestor') && <div className="bg-white rounded-lg shadow px-6 py-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filtrar por Curso</label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os cursos</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          {courseFilter && (
            <button
              onClick={() => setCourseFilter('')}
              className="text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Limpar filtro
            </button>
          )}
          <span className="ml-auto text-sm text-gray-500">
            {subjects.length} disciplina{subjects.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>}

      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">A carregar...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {courseFilter ? 'Nenhuma disciplina encontrada para este curso' : 'Nenhuma disciplina encontrada'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créditos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acções
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.course_name ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {subject.course_name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                          Transversal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.year_level}º Ano
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user?.role === 'admin' ? (
                        <>
                          <Link
                            to={`/subjects/${subject.id}/editar`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </>
                      ) : (
                        <Link
                          to={`/subjects/${subject.id}/editar`}
                          className="inline-flex items-center text-green-600 hover:text-green-900"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

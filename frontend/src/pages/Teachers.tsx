import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import teachersService, { type Teacher } from '../services/teachers.service';

export default function Teachers() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await teachersService.list();
      setTeachers(data);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const action = currentActive ? 'desactivar' : 'activar';
    if (!confirm(`Tem certeza que deseja ${action} este professor?`)) return;

    try {
      await teachersService.toggleActive(id);
      loadData();
    } catch (error: any) {
      console.error('Erro ao alterar estado do professor:', error);
      alert(error.response?.data?.message || 'Erro ao alterar estado do professor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este professor?')) return;

    try {
      await teachersService.delete(id);
      loadData();
    } catch (error: any) {
      console.error('Erro ao eliminar professor:', error);
      alert(error.response?.data?.message || 'Erro ao eliminar professor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Professores</h1>
        {(user?.role === 'admin' || user?.role === 'gestor') && (
          <Link
            to="/teachers/novo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Novo Professor
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">A carregar...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum professor encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
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
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {teacher.first_name} {teacher.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.specialization || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {teacher.active !== false ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {(user?.role === 'admin' || user?.role === 'gestor') ? (
                        <>
                          <Link
                            to={`/teachers/${teacher.id}/editar`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleToggleActive(teacher.id, teacher.active !== false)}
                            className={teacher.active !== false ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'}
                          >
                            {teacher.active !== false ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Visualização</span>
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

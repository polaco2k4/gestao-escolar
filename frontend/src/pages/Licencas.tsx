import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import licensesService, { type License } from '../services/licenses.service';

export default function Licencas() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const response = await licensesService.listLicenses();
      setLicenses(response.data.licenses || []);
    } catch (error) {
      console.error('Erro ao carregar licenças:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta licença?')) return;

    try {
      await licensesService.deleteLicense(id);
      loadLicenses();
    } catch (error) {
      console.error('Erro ao eliminar licença:', error);
      alert('Erro ao eliminar licença');
    }
  };

  const filteredLicenses = licenses.filter((license) => {
    if (filter === 'all') return true;
    return license.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Licenças</h1>
        <Link
          to="/licencas/nova"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Nova Licença
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({licenses.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ativas ({licenses.filter((l) => l.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('trial')}
            className={`px-4 py-2 rounded ${
              filter === 'trial'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Trial ({licenses.filter((l) => l.status === 'trial').length})
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-4 py-2 rounded ${
              filter === 'expired'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expiradas ({licenses.filter((l) => l.status === 'expired').length})
          </button>
          <button
            onClick={() => setFilter('suspended')}
            className={`px-4 py-2 rounded ${
              filter === 'suspended'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Suspensas ({licenses.filter((l) => l.status === 'suspended').length})
          </button>
        </div>
      </div>

      {/* Lista de Licenças */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Escola
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plano
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Limites
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Validade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLicenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Nenhuma licença encontrada
                </td>
              </tr>
            ) : (
              filteredLicenses.map((license) => (
                <tr key={license.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{license.school_name}</div>
                      <div className="text-sm text-gray-500">{license.school_code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{license.plan_display_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(license.status)}`}>
                      {getStatusLabel(license.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div>👨‍🎓 {license.max_students || '∞'} alunos</div>
                      <div>👨‍🏫 {license.max_teachers || '∞'} professores</div>
                      <div>📚 {license.max_classes || '∞'} turmas</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {license.status === 'trial' && license.trial_ends_at ? (
                      <div>
                        <div className="font-medium">Trial até:</div>
                        <div>{new Date(license.trial_ends_at).toLocaleDateString()}</div>
                      </div>
                    ) : license.end_date ? (
                      <div>
                        <div className="font-medium">Expira em:</div>
                        <div>{new Date(license.end_date).toLocaleDateString()}</div>
                      </div>
                    ) : (
                      <div className="text-green-600 font-medium">Sem expiração</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Link
                        to={`/licencas/${license.id}/editar`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </Link>
                      <Link
                        to={`/licencas/${license.id}/uso`}
                        className="text-green-600 hover:text-green-800"
                      >
                        Ver Uso
                      </Link>
                      <button
                        onClick={() => handleDelete(license.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatusBadge(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'trial':
      return 'bg-blue-100 text-blue-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'suspended':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Ativa';
    case 'trial':
      return 'Trial';
    case 'expired':
      return 'Expirada';
    case 'suspended':
      return 'Suspensa';
    default:
      return status;
  }
}

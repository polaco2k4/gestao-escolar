import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import licensesService, { type GlobalStats } from '../services/licenses.service';

export default function AdminDashboard() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await licensesService.getGlobalStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erro ao carregar estatísticas</p>
      </div>
    );
  }

  const { summary, licenses_by_plan, expiring_soon } = stats;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
        <div className="flex gap-3">
          <Link
            to="/escolas"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Gerir Escolas
          </Link>
          <Link
            to="/licencas"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Gerir Licenças
          </Link>
        </div>
      </div>

      {/* Estatísticas Globais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Escolas"
          value={summary.total_schools}
          icon="🏫"
          color="blue"
        />
        <StatCard
          title="Total de Alunos"
          value={summary.total_students}
          icon="👨‍🎓"
          color="green"
        />
        <StatCard
          title="Total de Professores"
          value={summary.total_teachers}
          icon="👨‍🏫"
          color="purple"
        />
        <StatCard
          title="Total de Turmas"
          value={summary.total_classes}
          icon="📚"
          color="orange"
        />
      </div>

      {/* Estatísticas de Licenças */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Licenças Ativas"
          value={summary.active_licenses}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Licenças Trial"
          value={summary.trial_licenses}
          icon="🆓"
          color="blue"
        />
        <StatCard
          title="Licenças Expiradas"
          value={summary.expired_licenses}
          icon="⏰"
          color="red"
        />
        <StatCard
          title="Licenças Suspensas"
          value={summary.suspended_licenses}
          icon="⛔"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Licenças por Plano */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Licenças por Plano</h2>
          <div className="space-y-3">
            {licenses_by_plan.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">{item.plan_name}</span>
                <span className="text-2xl font-bold text-blue-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Licenças a Expirar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Licenças a Expirar (30 dias)
          </h2>
          {expiring_soon.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma licença próxima de expirar</p>
          ) : (
            <div className="space-y-3">
              {expiring_soon.map((license) => (
                <div key={license.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{license.school_name}</p>
                      <p className="text-sm text-gray-600">{license.plan_name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(license.status)}`}>
                      {getStatusLabel(license.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Expira em:{' '}
                    {license.trial_ends_at
                      ? new Date(license.trial_ends_at).toLocaleDateString()
                      : license.end_date
                      ? new Date(license.end_date).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/escolas/novo"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
          >
            <div className="text-3xl mb-2">➕</div>
            <div className="font-medium text-gray-700">Criar Nova Escola</div>
          </Link>
          <Link
            to="/licencas/nova"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center"
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="font-medium text-gray-700">Atribuir Licença</div>
          </Link>
          <Link
            to="/licencas/planos"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="font-medium text-gray-700">Gerir Planos</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
  };

  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${textColorClasses[color]}`}>{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
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

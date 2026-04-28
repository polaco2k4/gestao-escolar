import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import licensesService, { type LicenseUsage } from '../services/licenses.service';

export default function LicencaUso() {
  const { id } = useParams();
  const [license, setLicense] = useState<any>(null);
  const [usage, setUsage] = useState<LicenseUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const licRes = await licensesService.getLicenseById(id!);
      setLicense(licRes.data);

      const usageRes = await licensesService.getUsage(licRes.data.school_id);
      setUsage(usageRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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

  if (!license || !usage) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Dados não encontrados</p>
        <Link to="/licencas" className="text-blue-600 hover:underline mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Uso da Licença</h1>
        <Link to="/licencas" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
          Voltar
        </Link>
      </div>

      {/* Info da Escola */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{license.school_name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Plano:</span>
            <p className="font-medium">{license.plan_display_name}</p>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <p>
              <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(license.status)}`}>
                {getStatusLabel(license.status)}
              </span>
            </p>
          </div>
          <div>
            <span className="text-gray-500">Início:</span>
            <p className="font-medium">{new Date(license.start_date).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-gray-500">Expiração:</span>
            <p className="font-medium">
              {license.end_date ? new Date(license.end_date).toLocaleDateString() : 
               license.trial_ends_at ? new Date(license.trial_ends_at).toLocaleDateString() : 'Sem expiração'}
            </p>
          </div>
        </div>
      </div>

      {/* Barras de Uso */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Consumo de Recursos</h2>

        <UsageBar
          label="Alunos"
          icon="👨‍🎓"
          current={usage.current_students}
          max={usage.max_students}
          percentage={usage.students_percentage}
        />

        <UsageBar
          label="Professores"
          icon="👨‍🏫"
          current={usage.current_teachers}
          max={usage.max_teachers}
          percentage={usage.teachers_percentage}
        />

        <UsageBar
          label="Turmas"
          icon="📚"
          current={usage.current_classes}
          max={usage.max_classes}
          percentage={usage.classes_percentage}
        />
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <Link
          to={`/licencas/${id}/editar`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Editar Licença
        </Link>
        <Link
          to="/licencas/planos"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Ver Planos
        </Link>
      </div>
    </div>
  );
}

function UsageBar({ label, icon, current, max, percentage }: {
  label: string;
  icon: string;
  current: number;
  max?: number;
  percentage: number;
}) {
  const getBarColor = (pct: number) => {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const isUnlimited = !max;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {icon} {label}
        </span>
        <span className="text-sm text-gray-600">
          {current} / {isUnlimited ? '∞' : max}
          {!isUnlimited && <span className="ml-2 text-xs">({percentage}%)</span>}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${isUnlimited ? 'bg-blue-400' : getBarColor(percentage)}`}
          style={{ width: `${isUnlimited ? 10 : Math.min(percentage, 100)}%` }}
        />
      </div>
      {percentage >= 90 && !isUnlimited && (
        <p className="text-xs text-red-600 mt-1 font-medium">
          Limite quase atingido! Considere atualizar o plano.
        </p>
      )}
    </div>
  );
}

function getStatusBadge(status: string): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'trial': return 'bg-blue-100 text-blue-800';
    case 'expired': return 'bg-red-100 text-red-800';
    case 'suspended': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active': return 'Ativa';
    case 'trial': return 'Trial';
    case 'expired': return 'Expirada';
    case 'suspended': return 'Suspensa';
    default: return status;
  }
}

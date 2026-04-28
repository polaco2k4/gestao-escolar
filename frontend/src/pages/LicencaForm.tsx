import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import licensesService, { type LicensePlan } from '../services/licenses.service';
import schoolsService, { type School } from '../services/schools.service';

export default function LicencaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [schools, setSchools] = useState<School[]>([]);
  const [plans, setPlans] = useState<LicensePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    school_id: '',
    plan_id: '',
    status: 'active' as string,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    trial_ends_at: '',
    auto_renew: true,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schoolsRes, plansRes] = await Promise.all([
        schoolsService.list(),
        licensesService.listPlans(),
      ]);
      setSchools(schoolsRes);
      setPlans(plansRes.data?.plans || []);

      if (isEditing && id) {
        const licenseRes = await licensesService.getLicenseById(id);
        const license = licenseRes.data;
        setForm({
          school_id: license.school_id || '',
          plan_id: license.plan_id || '',
          status: license.status || 'active',
          start_date: license.start_date ? license.start_date.split('T')[0] : '',
          end_date: license.end_date ? license.end_date.split('T')[0] : '',
          trial_ends_at: license.trial_ends_at ? license.trial_ends_at.split('T')[0] : '',
          auto_renew: license.auto_renew ?? true,
          notes: license.notes || '',
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.school_id || !form.plan_id) {
      setError('Selecione a escola e o plano');
      return;
    }

    try {
      setSaving(true);
      const data: any = {
        school_id: form.school_id,
        plan_id: form.plan_id,
        status: form.status,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
        trial_ends_at: form.trial_ends_at || undefined,
        auto_renew: form.auto_renew,
        notes: form.notes || undefined,
      };

      if (isEditing && id) {
        await licensesService.updateLicense(id, data);
      } else {
        await licensesService.createLicense(data);
      }
      navigate('/licencas');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Erro ao salvar';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Editar Licença' : 'Nova Licença'}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Escola */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Escola *</label>
          <select
            value={form.school_id}
            onChange={(e) => setForm({ ...form, school_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isEditing}
          >
            <option value="">Selecione uma escola</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name} ({school.code})
              </option>
            ))}
          </select>
        </div>

        {/* Plano */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plano *</label>
          <select
            value={form.plan_id}
            onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione um plano</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.display_name} - {plan.max_students || '∞'} alunos, {plan.max_teachers || '∞'} prof. ({plan.price_monthly > 0 ? `Kz${plan.price_monthly}/mês` : 'Grátis'})
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Ativa</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspensa</option>
            <option value="expired">Expirada</option>
          </select>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Expiração</label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Trial */}
        {form.status === 'trial' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fim do Trial</label>
            <input
              type="date"
              value={form.trial_ends_at}
              onChange={(e) => setForm({ ...form, trial_ends_at: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Auto Renew */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="auto_renew"
            checked={form.auto_renew}
            onChange={(e) => setForm({ ...form, auto_renew: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="auto_renew" className="text-sm text-gray-700">Renovação automática</label>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observações sobre esta licença..."
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'A guardar...' : isEditing ? 'Atualizar' : 'Criar Licença'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/licencas')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

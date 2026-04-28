import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import licensesService, { type LicensePlan } from '../services/licenses.service';

export default function LicencaPlanos() {
  const [plans, setPlans] = useState<LicensePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<LicensePlan>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    display_name: '',
    description: '',
    max_students: '',
    max_teachers: '',
    max_classes: '',
    max_storage_mb: '',
    price_monthly: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await licensesService.listPlans();
      setPlans(res.data?.plans || []);
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: LicensePlan) => {
    setEditingId(plan.id);
    setEditForm({
      display_name: plan.display_name,
      description: plan.description,
      max_students: plan.max_students,
      max_teachers: plan.max_teachers,
      max_classes: plan.max_classes,
      price_monthly: plan.price_monthly,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      setSaving(true);
      setError('');
      await licensesService.updatePlan(editingId, editForm);
      setEditingId(null);
      loadPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.display_name) {
      setError('Nome e nome de exibição são obrigatórios');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await licensesService.createPlan({
        name: createForm.name,
        display_name: createForm.display_name,
        description: createForm.description || undefined,
        max_students: createForm.max_students ? parseInt(createForm.max_students) : undefined,
        max_teachers: createForm.max_teachers ? parseInt(createForm.max_teachers) : undefined,
        max_classes: createForm.max_classes ? parseInt(createForm.max_classes) : undefined,
        max_storage_mb: createForm.max_storage_mb ? parseInt(createForm.max_storage_mb) : undefined,
        price_monthly: createForm.price_monthly ? parseFloat(createForm.price_monthly) : 0,
      });
      setShowCreate(false);
      setCreateForm({ name: '', display_name: '', description: '', max_students: '', max_teachers: '', max_classes: '', max_storage_mb: '', price_monthly: '' });
      loadPlans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar plano');
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Planos de Licença</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showCreate ? 'Cancelar' : '+ Novo Plano'}
          </button>
          <Link to="/licencas" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            Voltar
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
      )}

      {/* Formulário de Criação */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Criar Novo Plano</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identificador *</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="ex: custom_plan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Exibição *</label>
              <input
                type="text"
                value={createForm.display_name}
                onChange={(e) => setCreateForm({ ...createForm, display_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="ex: Plano Personalizado"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                type="text"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Descrição do plano"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Alunos</label>
              <input
                type="number"
                value={createForm.max_students}
                onChange={(e) => setCreateForm({ ...createForm, max_students: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Vazio = ilimitado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Professores</label>
              <input
                type="number"
                value={createForm.max_teachers}
                onChange={(e) => setCreateForm({ ...createForm, max_teachers: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Vazio = ilimitado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Turmas</label>
              <input
                type="number"
                value={createForm.max_classes}
                onChange={(e) => setCreateForm({ ...createForm, max_classes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Vazio = ilimitado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Mensal (Kz)</label>
              <input
                type="number"
                step="0.01"
                value={createForm.price_monthly}
                onChange={(e) => setCreateForm({ ...createForm, price_monthly: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="0.00"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? 'A criar...' : 'Criar Plano'}
          </button>
        </form>
      )}

      {/* Lista de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
            {editingId === plan.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.display_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-bold"
                />
                <input
                  type="text"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Descrição"
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Alunos</label>
                    <input
                      type="number"
                      value={editForm.max_students || ''}
                      onChange={(e) => setEditForm({ ...editForm, max_students: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Professores</label>
                    <input
                      type="number"
                      value={editForm.max_teachers || ''}
                      onChange={(e) => setEditForm({ ...editForm, max_teachers: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Turmas</label>
                    <input
                      type="number"
                      value={editForm.max_classes || ''}
                      onChange={(e) => setEditForm({ ...editForm, max_classes: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Preço (Kz/mês)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price_monthly || ''}
                    onChange={(e) => setEditForm({ ...editForm, price_monthly: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveEdit} disabled={saving} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50">
                    {saving ? 'A guardar...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.display_name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Editar
                  </button>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  {plan.price_monthly > 0 ? `Kz${plan.price_monthly}` : 'Grátis'}
                  {plan.price_monthly > 0 && <span className="text-sm text-gray-500 font-normal">/mês</span>}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>👨‍🎓 Alunos</span>
                    <span className="font-medium">{plan.max_students || 'Ilimitado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>👨‍🏫 Professores</span>
                    <span className="font-medium">{plan.max_teachers || 'Ilimitado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📚 Turmas</span>
                    <span className="font-medium">{plan.max_classes || 'Ilimitado'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

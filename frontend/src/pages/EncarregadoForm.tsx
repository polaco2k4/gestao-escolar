import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { guardiansService, type Guardian } from '../services/guardians.service';
import schoolsService from '../services/schools.service';

export default function EncarregadoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    school_id: '',
    occupation: '',
    address: '',
    relationship: 'Pai/Mãe',
  });
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchools();
    if (isEditing) {
      loadGuardian();
    }
  }, [id]);

  const loadSchools = async () => {
    try {
      const data = await schoolsService.list();
      setSchools(data);
      if (data.length > 0 && !formData.school_id) {
        setFormData(prev => ({ ...prev, school_id: data[0].id }));
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
    }
  };

  const loadGuardian = async () => {
    try {
      setLoading(true);
      const data: Guardian = await guardiansService.getById(id!);
      setFormData({
        email: data.email || '',
        password: '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        school_id: data.school_id || '',
        occupation: data.occupation || '',
        address: data.address || '',
        relationship: data.relationship || 'Pai/Mãe',
      });
    } catch (error) {
      console.error('Erro ao carregar encarregado:', error);
      alert('Erro ao carregar encarregado');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      if (isEditing) {
        await guardiansService.update(id!, {
          occupation: formData.occupation,
          address: formData.address,
          relationship: formData.relationship,
        });
      } else {
        await guardiansService.create({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          school_id: formData.school_id,
          occupation: formData.occupation,
          address: formData.address,
          relationship: formData.relationship,
        });
      }
      navigate('/encarregados');
    } catch (error: any) {
      console.error('Erro ao salvar encarregado:', error);
      alert(error.response?.data?.message || 'Erro ao salvar encarregado');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <LinkBack />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Editar Encarregado' : 'Novo Encarregado'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primeiro Nome *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required={!isEditing}
                readOnly={isEditing}
                disabled={isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Ex: João"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apelido *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required={!isEditing}
                readOnly={isEditing}
                disabled={isEditing}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Ex: Santos"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required={!isEditing}
              readOnly={isEditing}
              disabled={isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="encarregado@escola.com"
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              readOnly={isEditing}
              disabled={isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="+244 923 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Escola *
            </label>
            <select
              name="school_id"
              value={formData.school_id}
              onChange={handleChange}
              required={!isEditing}
              disabled={isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profissão
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Engenheiro, Professor..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Rua Principal, Luanda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parentesco *
            </label>
            <select
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Pai">Pai</option>
              <option value="Mãe">Mãe</option>
              <option value="Pai/Mãe">Pai/Mãe</option>
              <option value="Tutor">Tutor</option>
              <option value="Avô/Avó">Avô/Avó</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'A salvar...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/encarregados')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LinkBack() {
  return (
    <Link
      to="/encarregados"
      className="inline-flex items-center text-gray-600 hover:text-gray-900"
    >
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Voltar
    </Link>
  );
}

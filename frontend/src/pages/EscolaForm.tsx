import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import schoolsService from '../services/schools.service';
import type { SchoolFormData } from '../services/schools.service';
import { useAuth } from '../contexts/AuthContext';

export default function EscolaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    logo_url: '',
  });

  const [createGestor, setCreateGestor] = useState(false);
  const [gestorData, setGestorData] = useState({
    gestor_email: '',
    gestor_password: '',
    gestor_first_name: '',
    gestor_last_name: '',
    gestor_phone: '',
  });

  useEffect(() => {
    // Only admin can create schools
    if (!isEdit && user?.role !== 'admin') {
      alert('Apenas administradores podem criar escolas');
      navigate('/escolas');
      return;
    }
    
    if (isEdit && id) {
      loadSchool(id);
    }
  }, [id, isEdit, user, navigate]);

  const loadSchool = async (schoolId: string) => {
    try {
      const school = await schoolsService.getById(schoolId);
      setFormData({
        name: school.name,
        code: school.code,
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        logo_url: school.logo_url || '',
      });
    } catch (error) {
      console.error('Erro ao carregar escola:', error);
      alert('Erro ao carregar dados da escola');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      if (isEdit && id) {
        await schoolsService.update(id, formData);
      } else {
        // Ao criar, incluir dados do gestor se checkbox marcado
        const dataToSend = createGestor 
          ? { ...formData, ...gestorData }
          : formData;
        await schoolsService.create(dataToSend);
      }
      navigate('/escolas');
    } catch (error: any) {
      console.error('Erro ao salvar escola:', error);
      alert(error.response?.data?.message || 'Erro ao salvar escola');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGestorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGestorData({
      ...gestorData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Editar Escola' : 'Nova Escola'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Escola <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Logotipo
              </label>
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {!isEdit && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="createGestor"
                  checked={createGestor}
                  onChange={(e) => setCreateGestor(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="createGestor" className="ml-2 block text-sm font-medium text-gray-700">
                  Criar Gestor da Escola
                </label>
              </div>

              {createGestor && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3">Dados do Gestor</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="gestor_first_name"
                        value={gestorData.gestor_first_name}
                        onChange={handleGestorChange}
                        required={createGestor}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apelido <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="gestor_last_name"
                        value={gestorData.gestor_last_name}
                        onChange={handleGestorChange}
                        required={createGestor}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="gestor_email"
                        value={gestorData.gestor_email}
                        onChange={handleGestorChange}
                        required={createGestor}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="gestor_password"
                        value={gestorData.gestor_password}
                        onChange={handleGestorChange}
                        required={createGestor}
                        minLength={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        name="gestor_phone"
                        value={gestorData.gestor_phone}
                        onChange={handleGestorChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/escolas')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'A guardar...' : isEdit ? 'Actualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

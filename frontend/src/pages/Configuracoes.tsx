import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import schoolsService from '../services/schools.service';
import type { School } from '../services/schools.service';
import { Upload, Save, School as SchoolIcon, X, ImagePlus } from 'lucide-react';

export default function Configuracoes() {
  const { user, refreshUser } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (user?.school_id) {
      loadSchool(user.school_id);
    } else {
      setLoading(false);
    }
  }, [user?.school_id]);

  const loadSchool = async (id: string) => {
    try {
      const data = await schoolsService.getById(id);
      setSchool(data);
      setForm({
        name: data.name || '',
        code: data.code || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
      });
    } catch {
      setError('Erro ao carregar dados da escola.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!school) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await schoolsService.update(school.id, form);
      setSchool(updated);
      setSuccess('Informações guardadas com sucesso.');
      await refreshUser();
    } catch {
      setError('Erro ao guardar informações.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleUploadLogo = async () => {
    if (!school || !logoFile) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const updated = await schoolsService.uploadLogo(school.id, logoFile);
      setSchool(updated);
      setLogoFile(null);
      setLogoPreview(null);
      setSuccess('Logotipo actualizado com sucesso.');
      await refreshUser();
    } catch {
      setError('Erro ao carregar logotipo.');
    } finally {
      setUploading(false);
    }
  };

  const cancelLogoPreview = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user?.school_id) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-800">
          Esta conta não está associada a uma escola. Gerencie as escolas em <strong>Administração → Escolas</strong>.
        </div>
      </div>
    );
  }

  const currentLogo = school?.logo_url
    ? school.logo_url.startsWith('http')
      ? school.logo_url
      : school.logo_url
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <SchoolIcon className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Configurações da Escola</h1>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Logotipo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Logotipo</h2>

        <div className="flex items-start gap-6">
          {/* Preview actual ou existente */}
          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 flex-shrink-0 overflow-hidden">
            {logoPreview ? (
              <img src={logoPreview} alt="Pré-visualização" className="w-full h-full object-contain" />
            ) : currentLogo ? (
              <img src={currentLogo} alt="Logotipo actual" className="w-full h-full object-contain" />
            ) : (
              <ImagePlus className="w-8 h-8 text-gray-400" />
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-3">
              Formatos aceites: JPG, PNG, GIF. Tamanho máximo: 10 MB.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            {!logoFile ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <Upload className="w-4 h-4" />
                Escolher ficheiro
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUploadLogo}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'A carregar...' : 'Guardar logotipo'}
                </button>
                <button
                  onClick={cancelLogoPreview}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informações da escola */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Informações da Escola</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={user?.role !== 'admin'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Morada</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'A guardar...' : 'Guardar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

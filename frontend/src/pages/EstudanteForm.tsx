import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import studentsService from '../services/students.service';
import type { StudentFormData } from '../services/students.service';
import { guardiansService } from '../services/guardians.service';

export default function EstudanteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [guardians, setGuardians] = useState<any[]>([]);
  const [guardianSearch, setGuardianSearch] = useState('');
  const [selectedGuardian, setSelectedGuardian] = useState<any>(null);
  const [showGuardianDropdown, setShowGuardianDropdown] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    student_number: '',
    birth_date: '',
    gender: undefined,
    nationality: '',
    address: '',
    blood_type: '',
    medical_notes: '',
    password: '',
    guardian_id: '',
  });

  useEffect(() => {
    loadGuardians();
    if (isEdit && id) {
      loadStudent(id);
    }
  }, [id, isEdit]);

  const loadGuardians = async () => {
    try {
      const data = await guardiansService.list();
      setGuardians(data);
    } catch (error) {
      console.error('Erro ao carregar encarregados:', error);
    }
  };

  const loadStudent = async (studentId: string) => {
    try {
      const student = await studentsService.getById(studentId);
      
      // Carregar encarregado associado se existir
      if (student.guardian_id) {
        const guardian = await guardiansService.getById(student.guardian_id);
        setSelectedGuardian(guardian);
        setGuardianSearch(`${guardian.first_name} ${guardian.last_name}`);
      }
      
      setFormData({
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        phone: student.phone || '',
        student_number: student.student_number,
        birth_date: student.birth_date ? student.birth_date.split('T')[0] : '',
        gender: student.gender,
        nationality: student.nationality || '',
        address: student.address || '',
        blood_type: student.blood_type || '',
        medical_notes: student.medical_notes || '',
        guardian_id: student.guardian_id || '',
      });
    } catch (error) {
      console.error('Erro ao carregar estudante:', error);
      alert('Erro ao carregar estudante');
      navigate('/estudantes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.email) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      if (isEdit && id) {
        await studentsService.update(id, formData);
        alert('Estudante actualizado com sucesso!');
      } else {
        await studentsService.create(formData);
        alert('Estudante criado com sucesso!');
      }
      navigate('/estudantes');
    } catch (error: any) {
      console.error('Erro ao salvar estudante:', error);
      console.error('Response data:', error.response?.data);
      
      let errorMessage = 'Erro ao salvar estudante';
      
      if (error.response?.status === 409) {
        errorMessage = error.response?.data?.message || 'Email ou número de estudante já existe';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardianSelect = (guardian: any) => {
    setSelectedGuardian(guardian);
    setGuardianSearch(`${guardian.first_name} ${guardian.last_name}`);
    setFormData(prev => ({ ...prev, guardian_id: guardian.id }));
    setShowGuardianDropdown(false);
  };

  const handleGuardianClear = () => {
    setSelectedGuardian(null);
    setGuardianSearch('');
    setFormData(prev => ({ ...prev, guardian_id: '' }));
  };

  const filteredGuardians = guardians.filter(g =>
    `${g.first_name} ${g.last_name} ${g.email || ''}`.toLowerCase().includes(guardianSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Editar Estudante' : 'Novo Estudante'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEdit ? 'Actualize os dados do estudante' : 'Preencha os dados para criar um novo estudante'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Primeiro Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Apelido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="student_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Estudante
                </label>
                <input
                  type="text"
                  id="student_number"
                  name="student_number"
                  value={formData.student_number}
                  onChange={handleChange}
                  disabled={isEdit}
                  placeholder="Gerado automaticamente se vazio"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Género
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>

              <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
                  Nacionalidade
                </label>
                <input
                  type="text"
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="blood_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo Sanguíneo
                </label>
                <input
                  type="text"
                  id="blood_type"
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleChange}
                  placeholder="Ex: A+, O-, AB+"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {!isEdit && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password Inicial
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Deixe vazio para usar 'estudante123'"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Se deixar vazio, a password padrão será 'estudante123'
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Encarregado de Educação</h2>
            <div className="relative">
              <label htmlFor="guardian_search" className="block text-sm font-medium text-gray-700 mb-2">
                Encarregado Responsável
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="guardian_search"
                  value={guardianSearch}
                  onChange={(e) => {
                    setGuardianSearch(e.target.value);
                    setShowGuardianDropdown(true);
                  }}
                  onFocus={() => setShowGuardianDropdown(true)}
                  placeholder="Buscar encarregado por nome ou email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {selectedGuardian && (
                  <button
                    type="button"
                    onClick={handleGuardianClear}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {showGuardianDropdown && filteredGuardians.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredGuardians.map((guardian) => (
                    <button
                      type="button"
                      key={guardian.id}
                      onClick={() => handleGuardianSelect(guardian)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {guardian.first_name} {guardian.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {guardian.email || ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {showGuardianDropdown && filteredGuardians.length === 0 && guardianSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3 text-gray-500">
                  Nenhum encarregado encontrado
                </div>
              )}
              
              {selectedGuardian && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-900">
                    Encarregado: {selectedGuardian.first_name} {selectedGuardian.last_name}
                  </span>
                  <button
                    type="button"
                    onClick={handleGuardianClear}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Alterar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Morada</h2>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Endereço Completo
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Médicas</h2>
            <div>
              <label htmlFor="medical_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Observações Médicas
              </label>
              <textarea
                id="medical_notes"
                name="medical_notes"
                value={formData.medical_notes}
                onChange={handleChange}
                rows={4}
                placeholder="Alergias, condições médicas, medicamentos, etc..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/estudantes')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'A guardar...' : isEdit ? 'Actualizar' : 'Criar Estudante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

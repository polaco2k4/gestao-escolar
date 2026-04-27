import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface School {
  id: string;
  name: string;
}

interface SchoolFieldProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

export function SchoolField({ value, onChange, required = true, error }: SchoolFieldProps) {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSchoolName, setUserSchoolName] = useState<string>('');

  const isGestor = user?.role === 'gestor';

  // Debug temporário
  useEffect(() => {
    console.log('SchoolField - User:', user);
    console.log('SchoolField - Is Gestor:', isGestor);
    console.log('SchoolField - School ID:', user?.school_id);
  }, [user, isGestor]);

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    // Se for gestor, pré-selecionar sua escola quando as escolas forem carregadas
    if (isGestor && user?.school_id && !value && schools.length > 0) {
      onChange(user.school_id);
    }
  }, [isGestor, user?.school_id, value, onChange, schools]);

  const loadSchools = async () => {
    try {
      const response = await api.get('/api/schools');
      let schoolsData = response.data.data || response.data;
      
      // Se schoolsData for um objeto com propriedade schools, extrair o array
      if (schoolsData && typeof schoolsData === 'object' && !Array.isArray(schoolsData)) {
        if (schoolsData.schools) {
          schoolsData = schoolsData.schools;
        } else if (schoolsData.data) {
          schoolsData = schoolsData.data;
        }
      }
      
      console.log('SchoolField - Schools loaded:', schoolsData);
      console.log('SchoolField - Is Array:', Array.isArray(schoolsData));
      
      // Garantir que é um array
      const schoolsArray = Array.isArray(schoolsData) ? schoolsData : [];
      setSchools(schoolsArray);

      // Se for gestor, encontrar o nome da sua escola
      if (isGestor && user?.school_id) {
        console.log('SchoolField - Looking for school with ID:', user.school_id);
        const userSchool = schoolsArray.find((s: School) => s.id === user.school_id);
        console.log('SchoolField - Found school:', userSchool);
        
        if (userSchool) {
          setUserSchoolName(userSchool.name);
        } else {
          // Tentar buscar a escola diretamente
          try {
            const schoolResponse = await api.get(`/api/schools/${user.school_id}`);
            const schoolData = schoolResponse.data.data || schoolResponse.data;
            console.log('SchoolField - School fetched directly:', schoolData);
            setUserSchoolName(schoolData.name);
          } catch (err) {
            console.error('SchoolField - Error fetching school:', err);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Se for gestor, mostrar campo desabilitado
  if (isGestor) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Escola {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={loading ? 'Carregando...' : (userSchoolName || 'Escola não encontrada')}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
        />
        {/* Campo hidden para enviar o ID */}
        <input type="hidden" name="school_id" value={user?.school_id || ''} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // Se for admin, mostrar dropdown normal
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Escola {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        required={required}
        disabled={loading}
      >
        <option value="">{loading ? 'Carregando...' : 'Selecione uma escola'}</option>
        {schools.map((school) => (
          <option key={school.id} value={school.id}>
            {school.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

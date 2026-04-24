import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import avaliacoesService from '../services/avaliacoes.service';
import type { Assessment, SaveGradeDTO } from '../services/avaliacoes.service';
import { useAuth } from '../contexts/AuthContext';

interface GradeInput extends SaveGradeDTO {
  first_name?: string;
  last_name?: string;
  student_number?: string;
  id?: string;
}

export default function AvaliacaoNotas() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [grades, setGrades] = useState<GradeInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assessmentData, gradesData] = await Promise.all([
        avaliacoesService.getById(id!),
        user?.role === 'encarregado' 
          ? avaliacoesService.listGradesByGuardian(id!)
          : avaliacoesService.listGrades(id!),
      ]);
      
      setAssessment(assessmentData);
      
      // Filter grades: show all for admin/professor, only own for student
      let filteredGrades = gradesData;
      if (user?.role === 'estudante') {
        // For students, we need to get their student_id from the grades data
        // The user.id is the user_id, not student_id
        // We'll filter by matching the user's info with the grade's student info
        filteredGrades = gradesData.filter(g => 
          g.first_name === user.first_name && 
          g.last_name === user.last_name
        );
      }
      
      setGrades(filteredGrades.map(g => ({
        id: g.id,
        student_id: g.student_id,
        score: g.score,
        remarks: g.remarks || '',
        first_name: g.first_name,
        last_name: g.last_name,
        student_number: g.student_number,
      })));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados da avaliação');
      navigate('/avaliacoes');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId: string, value: string) => {
    const score = parseFloat(value);
    if (isNaN(score)) return;

    if (assessment && (score < 0 || score > (assessment.max_score || 20))) {
      alert(`A nota deve estar entre 0 e ${assessment.max_score || 20}`);
      return;
    }

    setGrades(prev => prev.map(g => 
      g.student_id === studentId ? { ...g, score } : g
    ));
  };

  const handleRemarksChange = (studentId: string, value: string) => {
    setGrades(prev => prev.map(g => 
      g.student_id === studentId ? { ...g, remarks: value } : g
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const gradesToSave: SaveGradeDTO[] = grades.map(g => ({
        student_id: g.student_id,
        score: g.score,
        remarks: g.remarks,
      }));

      await avaliacoesService.saveGrades(id!, gradesToSave);
      alert('Notas guardadas com sucesso!');
      navigate('/avaliacoes');
    } catch (error: any) {
      console.error('Erro ao guardar notas:', error);
      alert(error.response?.data?.message || 'Erro ao guardar notas');
    } finally {
      setSaving(false);
    }
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + (g.score || 0), 0);
    return (sum / grades.length).toFixed(2);
  };

  const getGradeColor = (score: number, maxScore: number = 20) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return 'text-green-600 font-semibold';
    if (percentage >= 50) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Avaliação não encontrada</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/avaliacoes')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Notas</h1>
          <p className="mt-2 text-sm text-gray-700">
            {assessment.name} - {assessment.class_name} - {assessment.subject_name}
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'professor') && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'A guardar...' : 'Guardar Notas'}
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Tipo de Avaliação</p>
              <p className="mt-1 text-lg font-semibold text-blue-600">{assessment.type_name}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-900">Nota Máxima</p>
              <p className="mt-1 text-lg font-semibold text-green-600">{assessment.max_score || 20}</p>
            </div>
            {(user?.role === 'admin' || user?.role === 'professor') && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-purple-900">Média da Turma</p>
                <p className="mt-1 text-lg font-semibold text-purple-600">{calculateAverage()}</p>
              </div>
            )}
          </div>

          {grades.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum estudante encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Não há estudantes matriculados nesta turma
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nº
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((grade, index) => (
                    <tr key={grade.student_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {grade.first_name} {grade.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {grade.student_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max={assessment.max_score || 20}
                          step="0.5"
                          value={grade.score || ''}
                          onChange={(e) => handleScoreChange(grade.student_id, e.target.value)}
                          readOnly={user?.role === 'estudante' || user?.role === 'encarregado'}
                          disabled={user?.role === 'estudante' || user?.role === 'encarregado'}
                          className={`w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                            grade.score !== undefined ? getGradeColor(grade.score, assessment.max_score) : ''
                          } ${(user?.role === 'estudante' || user?.role === 'encarregado') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          placeholder="0.0"
                        />
                        <span className="ml-2 text-sm text-gray-500">
                          / {assessment.max_score || 20}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={grade.remarks || ''}
                          onChange={(e) => handleRemarksChange(grade.student_id, e.target.value)}
                          readOnly={user?.role === 'estudante' || user?.role === 'encarregado'}
                          disabled={user?.role === 'estudante' || user?.role === 'encarregado'}
                          className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                            (user?.role === 'estudante' || user?.role === 'encarregado') ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          placeholder="Observações opcionais"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {(user?.role === 'admin' || user?.role === 'professor') && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Dica:</strong> As notas são guardadas automaticamente quando clica em "Guardar Notas". 
                Pode editar as notas a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, FileText } from 'lucide-react';
import api from '../config/api';
import RelatorioResultModal from './RelatorioResultModal';

interface CustomReport {
  id: string;
  school_id: string;
  name: string;
  description?: string;
  report_type: string;
  filters?: any;
  columns?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  created_by: string;
  is_public: boolean;
  creator_first_name?: string;
  creator_last_name?: string;
  school_name?: string;
  created_at: string;
  updated_at: string;
}

const REPORT_TYPES = [
  { value: 'students', label: 'Alunos' },
  { value: 'attendance', label: 'Assiduidade' },
  { value: 'grades', label: 'Avaliações' },
  { value: 'financial', label: 'Financeiro' },
  { value: 'enrollments', label: 'Matrículas' },
  { value: 'teachers', label: 'Professores' },
  { value: 'classes', label: 'Turmas' },
  { value: 'subjects', label: 'Disciplinas' },
  { value: 'courses', label: 'Cursos' },
  { value: 'academic_years', label: 'Anos Lectivos' },
  { value: 'rooms', label: 'Salas' },
  { value: 'schedules', label: 'Horários' },
  { value: 'guardians', label: 'Encarregados' },
  { value: 'documents', label: 'Documentos' },
];

const RelatoriosPersonalizados: React.FC = () => {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    report_type: 'students',
    is_public: false
  });
  const [showResultModal, setShowResultModal] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/relatorios/custom');
      setReports(response.data.data);
    } catch (error: any) {
      console.error('Erro ao carregar relatórios:', error);
      setError(error.response?.data?.message || 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReport) {
        await api.put(`/relatorios/custom/${editingReport.id}`, formData);
      } else {
        await api.post('/relatorios/custom', formData);
      }
      fetchReports();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este relatório?')) return;
    
    try {
      await api.delete(`/relatorios/custom/${id}`);
      fetchReports();
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
    }
  };

  const handleExecute = async (id: string) => {
    try {
      const response = await api.get(`/relatorios/custom/${id}/execute`);
      setReportResult(response.data.data);
      setShowResultModal(true);
    } catch (error) {
      console.error('Erro ao executar relatório:', error);
      alert('Erro ao executar relatório. Verifique o console para mais detalhes.');
    }
  };

  const handleEdit = (report: CustomReport) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      description: report.description || '',
      report_type: report.report_type,
      is_public: report.is_public
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReport(null);
    setFormData({
      name: '',
      description: '',
      report_type: 'students',
      is_public: false
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">Erro ao carregar relatórios</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchReports}
              className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios Personalizados</h2>
          <p className="text-gray-600 mt-1">Crie e gerencie seus relatórios customizados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports && reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">
                      {REPORT_TYPES.find(t => t.value === report.report_type)?.label}
                    </p>
                  </div>
                </div>
              </div>

              {report.description && (
                <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <span>Criado por: {report.creator_first_name} {report.creator_last_name}</span>
                {report.is_public && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Público</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleExecute(report.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                >
                  <Play className="w-4 h-4" />
                  Executar
                </button>
                <button
                  onClick={() => handleEdit(report)}
                  className="flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório encontrado</h3>
            <p className="text-gray-600 mb-4">Crie seu primeiro relatório personalizado</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Criar Relatório
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingReport ? 'Editar Relatório' : 'Novo Relatório'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Relatório
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Relatório
                </label>
                <select
                  value={formData.report_type}
                  onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {REPORT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_public" className="text-sm text-gray-700">
                  Tornar público para outros usuários da escola
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingReport ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResultModal && reportResult && (
        <RelatorioResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          reportInfo={reportResult.report_info}
          data={reportResult.data}
          metadata={reportResult.metadata}
        />
      )}
    </div>
  );
};

export default RelatoriosPersonalizados;

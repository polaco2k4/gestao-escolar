import React, { useState } from 'react';
import { FileText, TrendingUp, Users, Calendar, DollarSign, GraduationCap, Loader2 } from 'lucide-react';
import api from '../config/api';
import RelatoriosPersonalizados from '../components/RelatoriosPersonalizados';
import RelatorioResultModal from '../components/RelatorioResultModal';

interface ReportResult {
  reportInfo: { name: string; report_type: string };
  data: any[];
  metadata: { row_count: number; execution_time_ms: number; executed_at: string };
}

const Relatorios: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'custom' | 'predefined'>('custom');
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);

  const predefinedReports = [
    {
      id: 'students',
      name: 'Relatório de Alunos',
      description: 'Lista completa de alunos com informações de matrícula',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      endpoint: '/relatorios/students'
    },
    {
      id: 'attendance',
      name: 'Relatório de Assiduidade',
      description: 'Presenças e faltas por período',
      icon: Calendar,
      color: 'bg-green-50 text-green-600',
      endpoint: '/relatorios/attendance'
    },
    {
      id: 'grades',
      name: 'Relatório de Avaliações',
      description: 'Notas e desempenho acadêmico',
      icon: GraduationCap,
      color: 'bg-purple-50 text-purple-600',
      endpoint: '/relatorios/grades'
    },
    {
      id: 'financial',
      name: 'Relatório Financeiro',
      description: 'Mensalidades, pagamentos e pendências',
      icon: DollarSign,
      color: 'bg-yellow-50 text-yellow-600',
      endpoint: '/relatorios/financial'
    },
    {
      id: 'enrollments',
      name: 'Relatório de Matrículas',
      description: 'Status e histórico de matrículas',
      icon: TrendingUp,
      color: 'bg-pink-50 text-pink-600',
      endpoint: '/relatorios/enrollments'
    }
  ];

  const handlePredefinedReport = async (report: typeof predefinedReports[0]) => {
    setLoadingReport(report.id);
    const startTime = Date.now();
    try {
      const response = await api.get(report.endpoint);
      const data = response.data.data ?? [];
      const executionTime = Date.now() - startTime;
      setReportResult({
        reportInfo: { name: report.name, report_type: report.id },
        data,
        metadata: {
          row_count: data.length,
          execution_time_ms: executionTime,
          executed_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Verifique o console para mais detalhes.');
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-2">Gerencie e execute relatórios do sistema</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('custom')}
            className={`${
              activeTab === 'custom'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Relatórios Personalizados
            </div>
          </button>
          <button
            onClick={() => setActiveTab('predefined')}
            className={`${
              activeTab === 'predefined'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Relatórios Predefinidos
            </div>
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'custom' ? (
          <RelatoriosPersonalizados />
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Relatórios do Sistema</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Estes são relatórios padrão do sistema. Para relatórios customizados, use a aba "Relatórios Personalizados".
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {predefinedReports.map((report) => {
                const Icon = report.icon;
                const isLoading = loadingReport === report.id;
                return (
                  <div
                    key={report.id}
                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
                    onClick={() => handlePredefinedReport(report)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${report.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {isLoading ? (
                        <span className="flex items-center gap-2 text-sm text-blue-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          A carregar...
                        </span>
                      ) : (
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Gerar Relatório →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {reportResult && (
        <RelatorioResultModal
          isOpen={true}
          onClose={() => setReportResult(null)}
          reportInfo={reportResult.reportInfo}
          data={reportResult.data}
          metadata={reportResult.metadata}
        />
      )}
    </div>
  );
};

export default Relatorios;
